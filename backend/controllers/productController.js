const db = require('../config/db');

const normalizeProduct = (product) => ({
    ...product,
    name_ar: product.name_ar || '',
    category_ar: product.category_ar || '',
    type_ar: product.type_ar || '',
    description_ar: product.description_ar || '',
    features_ar: product.features_ar || '',
    usageInstructions_ar: product.usageInstructions_ar || '',
    imageURL: product.imageURL || product.imageUrl || product.image || '',
    type: product.type || '',
    stock: product.stock ?? 0,
    price: product.price ?? product.amount ?? 0,
    amount: product.price ?? product.amount ?? 0,
});

exports.getProducts = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM products ORDER BY createdAt DESC');
        res.json(rows.map(normalizeProduct));
    } catch (err) { next(err); }
};
exports.getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(normalizeProduct(rows[0]));
    } catch (err) { next(err); }
};
exports.createProduct = async (req, res, next) => {
    try {
        const {
            name, name_ar,
            category, category_ar,
            type, type_ar,
            stock, price, amount,
            imageURL, imageUrl, image,
            description, description_ar,
            features, features_ar,
            usageInstructions, usageInstructions_ar
        } = req.body;
        const resolvedPrice = price ?? amount;
        const resolvedImage = imageURL || imageUrl || image || '';

        if (!name || resolvedPrice === undefined || resolvedPrice === null || resolvedPrice === '') {
            return res.status(400).json({ error: 'Required fields' });
        }

        await db.query(
            'INSERT INTO products (name, name_ar, category, category_ar, type, type_ar, stock, price, imageURL, description, description_ar, features, features_ar, usageInstructions, usageInstructions_ar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                name, name_ar || null,
                category || null, category_ar || null,
                type || null, type_ar || null,
                stock ?? 0, resolvedPrice, resolvedImage,
                description || null, description_ar || null,
                features || null, features_ar || null,
                usageInstructions || null, usageInstructions_ar || null
            ]
        );
        res.status(201).json({ success: true });
    } catch (err) { next(err); }
};
exports.updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name, name_ar,
            category, category_ar,
            type, type_ar,
            stock, price, amount,
            imageURL, imageUrl, image,
            description, description_ar,
            features, features_ar,
            usageInstructions, usageInstructions_ar
        } = req.body;
        const resolvedPrice = price ?? amount;
        const resolvedImage = imageURL || imageUrl || image || '';

        await db.query(
            'UPDATE products SET name=?, name_ar=?, category=?, category_ar=?, type=?, type_ar=?, stock=?, price=?, imageURL=?, description=?, description_ar=?, features=?, features_ar=?, usageInstructions=?, usageInstructions_ar=? WHERE id=?',
            [
                name, name_ar || null,
                category || null, category_ar || null,
                type || null, type_ar || null,
                stock ?? 0, resolvedPrice, resolvedImage,
                description || null, description_ar || null,
                features || null, features_ar || null,
                usageInstructions || null, usageInstructions_ar || null,
                id
            ]
        );
        res.json({ success: true });
    } catch (err) { next(err); }
};
exports.deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM products WHERE id=?', [id]);
        res.json({ success: true });
    } catch (err) { next(err); }
};