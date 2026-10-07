#!/usr/bin/env node

/**
 * ============================================================================
 * TERRANOVA DESIGN SNAPSHOT SUITE
 * Automated Full-App Visual Crawler & Design Asset Generator
 * ============================================================================
 * Captures high-resolution, pixel-perfect screenshots of all routes, states,
 * viewports (Desktop & Mobile), themes (Light & Dark), and languages (FR & AR RTL).
 * Also auto-generates an interactive HTML Visual Gallery (screenshots/gallery.html).
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Resolve Playwright
let playwright;
const playwrightPaths = [
  'playwright',
  '/usr/local/lib/node_modules/@playwright/mcp/node_modules/playwright',
  '../node_modules/playwright'
];

for (const p of playwrightPaths) {
  try {
    playwright = require(p);
    break;
  } catch (e) {
    // continue searching
  }
}

if (!playwright) {
  console.error('[ERROR] Playwright could not be resolved. Please run: npm install -D playwright');
  process.exit(1);
}

const { chromium } = playwright;

// Configuration & CLI Args
const args = process.argv.slice(2);
const modeArg = args.find(a => a.startsWith('--mode='))?.split('=')[1] || 'standard';
const scaleArg = parseInt(args.find(a => a.startsWith('--scale='))?.split('=')[1] || '2', 10);
const fullPageArg = args.includes('--full-page');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:5000';

const OUTPUT_DIR = path.resolve(__dirname, '../screenshots');

// Target Views Definition
const VIEWS = [
  { id: '01_home', name: 'Accueil (Hero & Sections)', path: '/' },
  { id: '02_services', name: 'Services Écologiques', path: '/services' },
  { id: '03_products', name: 'Boutique & Filtres', path: '/products' },
  { id: '04_product_detail', name: 'Fiche Détail Produit', path: '/products/1' },
  { id: '05_appointment', name: 'Réservation & Devis', path: '/appointment' },
  { id: '06_contact', name: 'Contact & Support', path: '/contact' },
  { id: '07_checkout', name: 'Commande Directe', path: '/checkout' },
  {
    id: '08_cart_drawer',
    name: 'Panier Actif (Modal)',
    path: '/products/1',
    action: async (page) => {
      try {
        const addBtn = page.locator('.btn-detail-cart, .btn-primary').first();
        if (await addBtn.isVisible({ timeout: 1500 })) {
          await addBtn.click();
          await page.waitForTimeout(350);
        }
        const cartBtn = page.locator('.cart-trigger-btn').first();
        if (await cartBtn.isVisible({ timeout: 1500 })) {
          await cartBtn.click();
          await page.waitForTimeout(400);
        }
      } catch (e) {
        console.warn('   [Notice] Could not trigger cart modal:', e.message);
      }
    }
  },
  {
    id: '09_mobile_drawer',
    name: 'Menu Navigation Plein Écran',
    path: '/',
    mobileOnly: true,
    action: async (page) => {
      try {
        const menuBtn = page.locator('.mobile-hamburger-btn').first();
        if (await menuBtn.isVisible({ timeout: 1500 })) {
          await menuBtn.click();
          await page.waitForTimeout(400);
        }
      } catch (e) {
        console.warn('   [Notice] Could not trigger mobile drawer:', e.message);
      }
    }
  },
  { id: '10_admin_dashboard', name: 'Admin — Tableau de Bord', path: '/admin?tab=dashboard', requiresAuth: true },
  { id: '11_admin_products', name: 'Admin — Gestion Produits', path: '/admin?tab=products', requiresAuth: true },
  { id: '12_admin_orders', name: 'Admin — Commandes & Statuts', path: '/admin?tab=orders', requiresAuth: true },
  { id: '13_admin_appointments', name: 'Admin — Rendez-vous', path: '/admin?tab=appointments', requiresAuth: true },
  { id: '14_admin_contacts', name: 'Admin — Messages Clients', path: '/admin?tab=contacts', requiresAuth: true }
];

// Presets Matrix
const PRESETS = [];

if (modeArg === 'all' || modeArg === 'standard' || modeArg === 'desktop') {
  PRESETS.push({
    key: 'desktop_light_fr',
    label: 'Desktop — Thème Clair (FR)',
    viewport: { width: 1440, height: 900 },
    theme: 'light',
    lang: 'fr',
    dir: 'ltr',
    isMobile: false
  });
}

if (modeArg === 'all' || modeArg === 'standard' || modeArg === 'mobile') {
  PRESETS.push({
    key: 'mobile_light_fr',
    label: 'Mobile — iPhone (FR)',
    viewport: { width: 390, height: 844 },
    theme: 'light',
    lang: 'fr',
    dir: 'ltr',
    isMobile: true
  });
}

if (modeArg === 'all' || modeArg === 'standard' || modeArg === 'mobile') {
  PRESETS.push({
    key: 'mobile_light_ar',
    label: 'Mobile — RTL Arabe (AR)',
    viewport: { width: 390, height: 844 },
    theme: 'light',
    lang: 'ar',
    dir: 'rtl',
    isMobile: true
  });
}

if (modeArg === 'all' || modeArg === 'standard' || modeArg === 'desktop') {
  PRESETS.push({
    key: 'desktop_dark_fr',
    label: 'Desktop — Thème Sombre (FR)',
    viewport: { width: 1440, height: 900 },
    theme: 'dark',
    lang: 'fr',
    dir: 'ltr',
    isMobile: false
  });
}

if (modeArg === 'all') {
  PRESETS.push({
    key: 'desktop_light_ar',
    label: 'Desktop — RTL Arabe (AR)',
    viewport: { width: 1440, height: 900 },
    theme: 'light',
    lang: 'ar',
    dir: 'rtl',
    isMobile: false
  });
  PRESETS.push({
    key: 'mobile_dark_fr',
    label: 'Mobile — Thème Sombre (FR)',
    viewport: { width: 390, height: 844 },
    theme: 'dark',
    lang: 'fr',
    dir: 'ltr',
    isMobile: true
  });
}

// Helper: Fetch or Generate Admin Token
async function fetchAdminToken() {
  try {
    const jwt = require('jsonwebtoken');
    const dotenvPath = path.join(__dirname, '../backend/.env');
    if (fs.existsSync(dotenvPath)) {
      const dotenvContent = fs.readFileSync(dotenvPath, 'utf8');
      const match = dotenvContent.match(/JWT_SECRET=(.+)/);
      if (match) {
        const secret = match[1].trim();
        return jwt.sign({ id: 1, role: 'super_admin' }, secret, { expiresIn: '12h', algorithm: 'HS256' });
      }
    }
    const secret = process.env.JWT_SECRET || 'terranova_secure_fallback_key_2026_super_strong_min32chars';
    return jwt.sign({ id: 1, role: 'super_admin' }, secret, { expiresIn: '12h', algorithm: 'HS256' });
  } catch (e) {
    // Fallback to HTTP login
  }

  return new Promise((resolve) => {
    const postData = JSON.stringify({ username: 'admin', password: 'admin123' });
    const req = http.request(
      `${API_URL}/api/admin/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 2500
      },
      (res) => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.token) resolve(data.token);
            else resolve(null);
          } catch (e) {
            resolve(null);
          }
        });
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.write(postData);
    req.end();
  });
}


// Generate Gallery HTML
function generateGalleryHtml(manifest) {
  return `<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TerraNova — Galerie Design & Screenshots</title>
  <style>
    :root {
      --bg: #0F1410;
      --card-bg: #18221A;
      --card-border: #28372B;
      --accent: #52B756;
      --accent-hover: #67CB6B;
      --text: #F4F7EE;
      --text-muted: #8E9E8E;
      --font: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font);
      background-color: var(--bg);
      color: var(--text);
      padding: 36px 28px 80px;
      line-height: 1.5;
    }
    header {
      max-width: 1400px;
      margin: 0 auto 36px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 20px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 24px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text);
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      background: rgba(82, 183, 86, 0.15);
      color: var(--accent);
      border: 1px solid rgba(82, 183, 86, 0.3);
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 14px;
      margin-top: 6px;
    }
    .filter-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 14px;
    }
    .filter-btn {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 8px 16px;
      border-radius: 9999px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .filter-btn:hover, .filter-btn.active {
      background: var(--accent);
      color: #0E150F;
      border-color: var(--accent);
    }
    .stats-info {
      font-size: 13px;
      color: var(--text-muted);
      align-self: center;
    }
    .grid {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover {
      transform: translateY(-4px);
      border-color: var(--accent);
    }
    .img-wrap {
      width: 100%;
      height: 220px;
      background: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      cursor: pointer;
      position: relative;
    }
    .img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
      transition: transform 0.3s;
    }
    .img-wrap:hover img {
      transform: scale(1.03);
    }
    .card.is-mobile .img-wrap img {
      object-fit: contain;
      padding: 8px;
    }
    .card-body {
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .card-meta {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      font-size: 11px;
      margin-bottom: 12px;
    }
    .meta-tag {
      padding: 2px 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      color: var(--text-muted);
    }
    .card-actions {
      margin-top: auto;
      display: flex;
      gap: 8px;
    }
    .btn-action {
      flex: 1;
      padding: 7px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
      border: 1px solid var(--card-border);
      background: rgba(255, 255, 255, 0.03);
      color: var(--text);
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-action:hover {
      background: var(--accent);
      color: #0E150F;
      border-color: var(--accent);
    }

    /* Lightbox Modal */
    #modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.88);
      z-index: 9999;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    #modal.open {
      display: flex;
    }
    #modal img {
      max-width: 90vw;
      max-height: 88vh;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8);
      object-fit: contain;
    }
    #modal-close {
      position: absolute;
      top: 20px;
      right: 28px;
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>🌿 TerraNova UI Showcase <span class="badge">${manifest.length} captures</span></h1>
      <p class="subtitle">Catalogue visuel automatisé haute résolution (Figma Ready / 2x Retina)</p>
      <div class="filter-bar">
        <button class="filter-btn active" data-filter="all">Tous</button>
        <button class="filter-btn" data-filter="desktop">Desktop</button>
        <button class="filter-btn" data-filter="mobile">Mobile</button>
        <button class="filter-btn" data-filter="light">Thème Clair</button>
        <button class="filter-btn" data-filter="dark">Thème Sombre</button>
        <button class="filter-btn" data-filter="rtl">Arabe (RTL)</button>
      </div>
    </div>
    <div class="stats-info">
      Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
    </div>
  </header>

  <main class="grid" id="galleryGrid">
    ${manifest.map(item => `
      <div class="card ${item.isMobile ? 'is-mobile' : 'is-desktop'}"
           data-type="${item.isMobile ? 'mobile' : 'desktop'}"
           data-theme="${item.theme}"
           data-dir="${item.dir}">
        <div class="img-wrap">
          <img src="${item.relPath}" alt="${item.viewName}" loading="lazy" />
        </div>
        <div class="card-body">
          <h3 class="card-title">${item.viewName}</h3>
          <div class="card-meta">
            <span class="meta-tag">${item.isMobile ? '📱 Mobile 390px' : '💻 Desktop 1440px'}</span>
            <span class="meta-tag">${item.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
            <span class="meta-tag">${item.lang.toUpperCase()} ${item.dir.toUpperCase()}</span>
          </div>
          <div class="card-actions">
            <a href="${item.relPath}" target="_blank" class="btn-action">Ouvrir plein écran</a>
            <button class="btn-action btn-copy-path" data-path="${item.relPath}">Copier le chemin</button>
          </div>
        </div>
      </div>
    `).join('')}
  </main>

  <div id="modal">
    <span id="modal-close">&times;</span>
    <img id="modalImg" src="" alt="Agrandissement" />
  </div>


  <script src="gallery.js"></script>
</body>
</html>`;
}

}

// Main Runner
async function main() {
  console.log('================================================================');
  console.log(' 🚀 TERRANOVA VISUAL DESIGN CRAWLER');
  console.log(` Mode: ${modeArg.toUpperCase()} | Scale: ${scaleArg}x | FullPage: ${fullPageArg}`);
  console.log(` Target: ${BASE_URL}`);
  console.log('================================================================\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. Fetch Admin token if available
  console.log('🔑 Verification de l\'accès administrateur...');
  const adminToken = await fetchAdminToken();
  if (adminToken) {
    console.log('   ✓ Jeton Admin obtenu avec succès (Accès aux routes protégées actif)');
  } else {
    console.log('   ⚠️ Serveur backend non disponible ou identifiants par défaut modifiés.');
    console.log('   (Les vues admin seront capturées en mode public/login)');
  }

  // 2. Launch Chromium Browser
  console.log('\n🌐 Lancement du moteur Chromium haute résolution...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const manifest = [];
  let totalCaptured = 0;

  for (const preset of PRESETS) {
    console.log(`\n📸 Configuration : ${preset.label} [${preset.viewport.width}x${preset.viewport.height}]`);

    const presetDir = path.join(OUTPUT_DIR, preset.isMobile ? 'mobile' : 'desktop', preset.key);
    if (!fs.existsSync(presetDir)) {
      fs.mkdirSync(presetDir, { recursive: true });
    }

    const context = await browser.newContext({
      viewport: preset.viewport,
      deviceScaleFactor: scaleArg,
      isMobile: preset.isMobile,
      hasTouch: preset.isMobile
    });

    const page = await context.newPage();

    // Configure Theme, Language & Admin Token
    await page.addInitScript(({ theme, lang, token }) => {
      localStorage.setItem('terranova_theme', theme);
      localStorage.setItem('terranova_lang', lang);
      if (token) {
        localStorage.setItem('adminToken', token);
      }
    }, { theme: preset.theme, lang: preset.lang, token: adminToken });

    for (const view of VIEWS) {
      if (view.mobileOnly && !preset.isMobile) continue;

      const targetUrl = `${BASE_URL}${view.path}`;
      const fileName = `${view.id}_${preset.lang}_${preset.theme}.png`;
      const filePath = path.join(presetDir, fileName);
      const relPath = path.relative(OUTPUT_DIR, filePath);

      process.stdout.write(`   ↳ Capturant : ${view.name.padEnd(35)} ... `);

      try {
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 12000 });

        // Ensure theme & dir applied
        await page.evaluate(({ theme, lang, dir }) => {
          document.documentElement.setAttribute('data-theme', theme);
          document.documentElement.setAttribute('lang', lang);
          document.documentElement.setAttribute('dir', dir);
        }, { theme: preset.theme, lang: preset.lang, dir: preset.dir });

        await page.waitForTimeout(300);

        // Perform custom action (e.g. open cart modal or mobile drawer)
        if (view.action) {
          await view.action(page);
          await page.waitForTimeout(300);
        }

        await page.screenshot({
          path: filePath,
          fullPage: fullPageArg
        });

        manifest.push({
          presetKey: preset.key,
          viewId: view.id,
          viewName: view.name,
          filePath,
          relPath,
          isMobile: preset.isMobile,
          theme: preset.theme,
          lang: preset.lang,
          dir: preset.dir
        });

        totalCaptured++;
        console.log('✓ OK');
      } catch (err) {
        console.log(`❌ Erreur (${err.message.slice(0, 40)})`);
      }
    }

    await context.close();
  }

  await browser.close();

  // 3. Write HTML Gallery
  const galleryHtml = generateGalleryHtml(manifest);
  const galleryPath = path.join(OUTPUT_DIR, 'gallery.html');
  fs.writeFileSync(galleryPath, galleryHtml, 'utf8');

  console.log('\n================================================================');
  console.log(` 🎉 SUCCÈS : ${totalCaptured} screenshots haute résolution générés !`);
  console.log(` 📁 Dossier : ${OUTPUT_DIR}`);
  console.log(` 🖼️ Galerie Interactive : file://${galleryPath}`);
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});
