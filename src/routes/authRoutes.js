// Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Login route
router.post('/login', authController.login);

// Change password (admin only)
router.post('/change-password', authenticateToken, requireAdmin, authController.changePassword);

// Logout (stateless JWT; client clears token)
router.post('/logout', authenticateToken, requireAdmin, authController.logout);

module.exports = router;

