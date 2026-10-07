# TERRA NOVA ECO-SERVICE

Application web complète avec React (frontend) et Node.js/Express (backend) pour la gestion de services écologiques et d'une boutique de produits.

## 📚 Documentation disponible

- **README.md** (ce fichier) : procédure générale, configuration backend et schéma de données.

Les notes doublons et anciens fichiers statiques ont été supprimés pour éviter la dispersion. La base de connaissances est donc concentrée ici.

## 🚀 Installation rapide

### 1. Préparer la base de données via phpMyAdmin

1. Créez une base (ex. `terranova_db`).
2. Créez les tables ci-dessous dans l'ordre. Vous pouvez utiliser le SQL fourni ou l'éditeur graphique de phpMyAdmin.

```
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    imageURL VARCHAR(255),
    stock INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serviceType ENUM('jardinage','nettoyage') NOT NULL,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(30),
    wilaya VARCHAR(100),
    commune VARCHAR(100),
    surface VARCHAR(100),
    servicesSpecifiques TEXT,
    datePreferee DATE NOT NULL,
    heurePreferee TIME NOT NULL,
    notes TEXT,
    status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomComplet VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(30),
    sujet VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new','read','responded') DEFAULT 'new',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderNumber VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    telephone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,
    wilaya VARCHAR(100) NOT NULL,
    commune VARCHAR(100) NOT NULL,
    adresse TEXT NOT NULL,
    totalAmount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','paid','processing','shipped','delivered','cancelled') DEFAULT 'pending',
    paymentStatus ENUM('pending','paid','failed') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId INT NOT NULL,
    productId INT NOT NULL,
    productName VARCHAR(255) NOT NULL,
    productPrice DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id)
);

CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    fullName VARCHAR(255),
    role ENUM('admin','super_admin') DEFAULT 'admin',
    isActive BOOLEAN DEFAULT TRUE,
    lastLogin TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

> ℹ️ Pour créer un administrateur de départ : insérez une ligne dans `admin_users` avec `username = 'admin'`, `email = 'admin@terranova.dz'`, `role = 'super_admin'`, `password = '$2a$10$rOZjJqDDqwKmXzCfqYvGr.h5aMQZJ9k5dIQgRLVJwXz3yGgJNqG4q'` (hash pour `admin123`). Changez ce mot de passe après la première connexion via l'API.

### 2. Configurer les variables d'environnement backend

Créer `backend/.env` (pas de `.env.example` dans le repo) :

```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=terranova_db
PORT=5000
JWT_SECRET=change-me
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
WHATSAPP_NUMBER=213784472366
```

### 3. Installer et lancer les services

```bash
# Backend
cd backend
npm install
npm start

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

## 📁 Structure du projet

```
TeraNova/
├── backend/
│   ├── config/          # connexion MySQL
│   ├── controllers/     # logique métier
│   ├── middleware/      # auth + gestion d'erreurs
│   ├── routes/          # routes Express
│   └── server.js        # point d'entrée API
└── frontend/
        ├── src/components/
        ├── src/context/
        ├── src/pages/
        ├── src/services/    # appels Axios vers l'API
        └── vite.config.js
```

## 🔗 API principale

- `GET /api/products` : liste des produits (toujours issus de MySQL)
- `POST /api/appointments` : créer un rendez-vous
- `POST /api/contact` : enregistrer un message
- `POST /api/payment/create-order` : créer une commande et préparer le message WhatsApp
- `GET /api/payment/order/:orderNumber` : récupérer une commande enregistrée
- `POST /api/admin/login` + routes `/api/admin/*` protégées par JWT

## ⚠️ Données et stockage

- Aucun fichier `.sql`, `.json` ou tableau JavaScript n'est utilisé pour simuler des données.
- Le frontend (`Products.jsx`) lit uniquement les produits renvoyés par `/api/products`.
- Si la base est vide ou inaccessible, l'interface affiche un message d'erreur plutôt qu'une liste fictive.

## 📞 Support

contact@terranova-eco.dz
