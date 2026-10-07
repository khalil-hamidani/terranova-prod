#!/usr/bin/env bash
# ==============================================================================
# TerraNova - Full Application Startup Script
# Automatically manages:
#   1. Database (MariaDB/MySQL daemon check & auto-start)
#   2. Backend API (Node/Express :5000)
#   3. Frontend UI (Vite/React :3000)
# Handles graceful shutdown (Ctrl+C) and port cleanup.
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${GREEN}"
echo "=========================================================="
echo "          🌿 TerraNova Eco-Service Platform 🌿           "
echo "=========================================================="
echo -e "${NC}"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo -e "${RED}[ERROR] Node.js is not installed.${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}[ERROR] npm is not installed.${NC}"; exit 1; }

# Step 0: Ensure MariaDB / MySQL is running
echo -e "${BLUE}[1/3] Checking Database Service...${NC}"
DB_STARTED_BY_SCRIPT=false

is_db_running() {
    pgrep -x mariadbd >/dev/null || pgrep -x mysqld >/dev/null
}

if ! is_db_running; then
    echo -e "${YELLOW}MariaDB/MySQL is not running. Starting database service...${NC}"
    if command -v systemctl >/dev/null 2>&1; then
        if sudo -n true 2>/dev/null; then
            sudo systemctl start mariadb 2>/dev/null || sudo systemctl start mysql 2>/dev/null || true
        else
            echo -e "${YELLOW}Requesting sudo permissions to start MariaDB service:${NC}"
            sudo systemctl start mariadb || sudo systemctl start mysql || true
        fi
    fi
fi

# Wait for DB port 3306 and test authentication
DB_OK=false
for i in {1..15}; do
    if is_db_running; then
        # Verify connectivity using node db script
        if (cd "$BACKEND_DIR" && node -e "const db=require('./config/db'); db.getConnection().then(c=>{c.release();process.exit(0)}).catch(()=>process.exit(1));" 2>/dev/null); then
            DB_OK=true
            break
        fi
    fi
    sleep 0.5
done

if [ "$DB_OK" = true ]; then
    echo -e "${GREEN}[✔] Database is running and authenticated successfully (Port 3306).${NC}"
else
    echo -e "${RED}[WARNING] Database could not be reached on 127.0.0.1:3306.${NC}"
    echo -e "${RED}Please verify credentials in backend/.env or run: sudo systemctl start mariadb${NC}"
fi

# Check node_modules
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}[!] Installing backend dependencies...${NC}"
    (cd "$BACKEND_DIR" && npm install)
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}[!] Installing frontend dependencies...${NC}"
    (cd "$FRONTEND_DIR" && npm install)
fi

# Handle process shutdown gracefully
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo -e "\n${YELLOW}[!] Stopping TerraNova application...${NC}"
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo -e "${CYAN}Stopping Backend (PID: $BACKEND_PID)...${NC}"
        kill -SIGINT "$BACKEND_PID" 2>/dev/null || kill -SIGTERM "$BACKEND_PID" 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        echo -e "${CYAN}Stopping Frontend (PID: $FRONTEND_PID)...${NC}"
        kill -SIGINT "$FRONTEND_PID" 2>/dev/null || kill -SIGTERM "$FRONTEND_PID" 2>/dev/null
    fi
    # Also release ports if still occupied
    fuser -k 5000/tcp >/dev/null 2>&1 || true
    fuser -k 3000/tcp >/dev/null 2>&1 || true
    echo -e "${GREEN}[✔] TerraNova stopped cleanly.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Free up ports if already occupied
fuser -k 5000/tcp >/dev/null 2>&1 || true
fuser -k 3000/tcp >/dev/null 2>&1 || true

# Start Backend
echo -e "${BLUE}[2/3] Starting Backend Server (Port 5000)...${NC}"
cd "$BACKEND_DIR"
npm start &
BACKEND_PID=$!

# Wait for backend to be ready
echo -e "${CYAN}Waiting for backend to bind to port 5000...${NC}"
for i in {1..20}; do
    if nc -z 127.0.0.1 5000 2>/dev/null || curl -s http://localhost:5000/api/health >/dev/null 2>&1 || curl -s http://localhost:5000 >/dev/null 2>&1; then
        break
    fi
    sleep 0.5
done
echo -e "${GREEN}[✔] Backend is live at http://localhost:5000${NC}"

# Start Frontend
echo -e "${BLUE}[3/3] Starting Frontend Vite Server (Port 3000)...${NC}"
cd "$FRONTEND_DIR"
npm run dev -- --host &
FRONTEND_PID=$!

# Wait for frontend to be ready
for i in {1..20}; do
    if nc -z 127.0.0.1 3000 2>/dev/null || curl -s http://localhost:3000 >/dev/null 2>&1; then
        break
    fi
    sleep 0.5
done
echo -e "${GREEN}[✔] Frontend is live at http://localhost:3000${NC}"

echo -e "\n${BOLD}${GREEN}🚀 Full application stack is running successfully!${NC}"
echo -e "   - ${BOLD}Database:${NC}     MariaDB (127.0.0.1:3306 - terranova_db)"
echo -e "   - ${BOLD}Frontend:${NC}     http://localhost:3000"
echo -e "   - ${BOLD}Backend API:${NC}  http://localhost:5000"
echo -e "   - ${BOLD}Admin Portal:${NC} http://localhost:3000/admin"
echo -e "   - ${BOLD}Gallery:${NC}      http://localhost:5000/screenshots/gallery.html"
echo -e "\n${YELLOW}Press Ctrl+C to stop all services.${NC}\n"

# Wait for background processes
wait "$BACKEND_PID" "$FRONTEND_PID"
