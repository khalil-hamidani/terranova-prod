const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const { verifyToken, isAdmin, isSuperAdmin } = require('../middleware/auth');

// Public routes
router.post('/login', adminController.login);

// Protected routes (require authentication)
router.use(verifyToken);
router.use(isAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Appointments Management
router.get('/appointments', adminController.getAppointments);
router.patch('/appointments/:id/status', adminController.updateAppointmentStatus);
router.delete('/appointments/:id', adminController.deleteAppointment);

// Products Management
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Orders Management
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// Contacts Management
router.get('/contacts', adminController.getContacts);
router.patch('/contacts/:id/status', adminController.updateContactStatus);

// Admin Users Management (super admin only)
router.post('/users', isSuperAdmin, adminController.createAdminUser);


module.exports = router;
