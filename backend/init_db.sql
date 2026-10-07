-- =============================================================================
-- TERRANOVA DATABASE INITIALIZATION SCRIPT
-- =============================================================================

CREATE DATABASE IF NOT EXISTS terranova_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create dedicated database user for application
CREATE USER IF NOT EXISTS 'terranova_user'@'localhost' IDENTIFIED BY 'terranova_secure_pass123';
GRANT ALL PRIVILEGES ON terranova_db.* TO 'terranova_user'@'localhost';
CREATE USER IF NOT EXISTS 'terranova_user'@'127.0.0.1' IDENTIFIED BY 'terranova_secure_pass123';
GRANT ALL PRIVILEGES ON terranova_db.* TO 'terranova_user'@'127.0.0.1';
FLUSH PRIVILEGES;

USE terranova_db;

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    features TEXT,
    features_ar TEXT,
    usageInstructions TEXT,
    usageInstructions_ar TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    category_ar VARCHAR(100),
    type VARCHAR(100),
    type_ar VARCHAR(100),
    imageURL VARCHAR(500),
    stock INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
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

-- 3. Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomComplet VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(30),
    sujet VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new','read','responded') DEFAULT 'new',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
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
    status ENUM('pending','confirmed','processing','shipped','delivered','paid','cancelled') DEFAULT 'pending',
    paymentMethod VARCHAR(50) DEFAULT 'whatsapp',
    paymentStatus ENUM('pending','paid','failed') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
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

-- 6. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
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

-- Default Admin User (admin / admin123)
INSERT INTO admin_users (username, email, role, fullName, password)
VALUES (
    'admin',
    'admin@terranova.dz',
    'super_admin',
    'Administrateur Principal',
    '$2a$10$rOZjJqDDqwKmXzCfqYvGr.h5aMQZJ9k5dIQgRLVJwXz3yGgJNqG4q'
) ON DUPLICATE KEY UPDATE fullName='Administrateur Principal';

-- Seed Catalog Products (LeafLife aesthetic matching)
INSERT INTO products (name, name_ar, description, description_ar, price, category, category_ar, type, type_ar, imageURL, stock, isActive)
VALUES
(
    'Biofertilisant Végétal Liquide 5L',
    'سماد حيوي نباتي سائل 5 لتر',
    'Formulation biologique liquide concentrée, riche en azote organique et oligo-éléments pour stimuler la photosynthèse et la croissance foliaire.',
    'تركيبة حيوية سائلة مركزة غنية بالنيتروجين العضوي والعناصر الصغرى لتحفيز التركيب الضوئي والنمو الخضري للنباتات.',
    2800.00,
    'Biofertilisant',
    'أسمدة حيوية',
    'Liquide',
    'سائل',
    '/products/biofertilisant_liquide_5l.jpg',
    35,
    TRUE
),
(
    'Compost Organique Pur Enrichi 25kg',
    'كمبوست عضوي نقي مخصب 25 كغ',
    'Compost 100% naturel issu de notre filière de valorisation des déchets verts. Améliore la rétention d eau et régénère les micro-organismes du sol.',
    'سماد عضوي طبيعي 100% مستخلص من معالجة وتثمين المخلفات الخضراء. يحسن احتباس الماء ويجدد الكائنات الحية الدقيقة في التربة.',
    1600.00,
    'Compost',
    'سماد عضوي (كمبوست)',
    'Solide',
    'صلب / حبيبات',
    'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=600&auto=format&fit=crop&q=80',
    50,
    TRUE
),
(
    'Engrais NPK Biologique Granulé 10kg',
    'سماد حبيبي NPK عضوي بيولوجي 10 كغ',
    'Nutriments équilibrés à libération lente pour gazons, arbustes ornementaux et potagers écologiques.',
    'عناصر غذائية متوازنة بطيئة التحلل للمسطحات العشبية والشجيرات التزيينية والمزارع البيئية.',
    2200.00,
    'Engrais',
    'أسمدة عضوية',
    'Solide',
    'حبيبات صلبة',
    '/products/npk_fertilizer.jpg',
    28,
    TRUE
),
(
    'Biostimulant Racinaire Algues Brunes 1L',
    'منشط جذور حيوي بمستخلص الطحالب البنية 1 لتر',
    'Extrait naturel d ascophyllum nodosum pour fortifier les racines contre le stress hydrique et les chaleurs extrêmes.',
    'مستخلص طبيعي من طحالب أسكوفيلوم نودوسوم لتقوية الجذور وزيادة مقاومتها للإجهاد المائي والحراري.',
    1950.00,
    'Biofertilisant',
    'أسمدة حيوية',
    'Liquide',
    'سائل',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&auto=format&fit=crop&q=80',
    42,
    TRUE
),
(
    'Terreau Universel Pro Ph-Neutre 50L',
    'تربة زراعية ممتازة متوازنة الحموضة 50 لتر',
    'Mélange premium de tourbe brune, fibre de coco et compost TerraNova, idéal pour rempotage et massifs fleuris.',
    'خليط فاخر من الخث الأسود وألياف جوز الهند وكمبوست تيرا نوفا، مثالي للغرس في الأصص وتزيين الأحواض.',
    1450.00,
    'Compost',
    'سماد عضوي (كمبوست)',
    'Solide',
    'صلب',
    'https://images.unsplash.com/photo-1585314062604-1a357de8b000?w=600&auto=format&fit=crop&q=80',
    60,
    TRUE
),
(
    'Composteur Électromécanique Compact TN-100',
    'جهاز تحويل السماد الكهروميكانيكي المدمج TN-100',
    'Machine innovante 100% automatisée pour transformer 50 à 100 kg/jour de biodéchets en compost hygiénisé sous 24 heures.',
    'آلة مبتكرة ومؤتمتة بالكامل لتحويل 50 إلى 100 كغ/يوم من المخلفات العضوية إلى كمبوست صحي عالي الجودة خلال 24 ساعة.',
    185000.00,
    'Machine',
    'آلات ومعدات زراعية',
    'Machine',
    'آلة أوتوماتيكية',
    '/products/composteur_compact.jpg',
    5,
    TRUE
)
ON DUPLICATE KEY UPDATE name=VALUES(name);
