const express = require('express');
const router = express.Router();
const controller = require('../controllers/appointmentController');

// Public appointment booking
router.post('/', controller.createAppointment);

// Deletions and status changes are strictly restricted to /api/admin/appointments
module.exports = router;