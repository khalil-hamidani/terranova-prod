const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create order and prepare WhatsApp handoff
router.post('/create-order', paymentController.createOrder);

// Get order status
router.get('/order/:orderNumber', paymentController.getOrderStatus);

module.exports = router;
