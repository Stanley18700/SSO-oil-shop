// Oil routes
const express = require('express');
const router = express.Router();
const oilController = require('../controllers/oilController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public route - anyone can view oils
router.get('/', oilController.getAllOils);

// Admin route - list all oils (active + inactive)
router.get('/admin/all', authenticateToken, requireAdmin, oilController.getAllOilsAdmin);

// Protected admin routes - require authentication and admin role
router.post('/', authenticateToken, requireAdmin, oilController.createOil);
router.put('/:id', authenticateToken, requireAdmin, oilController.updateOil);
router.delete('/:id', authenticateToken, requireAdmin, oilController.deleteOil);

module.exports = router;

