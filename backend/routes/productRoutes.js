const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');

// Public catalog browsing (read-only)
router.get('/', controller.getProducts);
router.get('/:id', controller.getProductById);

// All mutations (POST, PUT, DELETE) are strictly protected under /api/admin/products
module.exports = router;