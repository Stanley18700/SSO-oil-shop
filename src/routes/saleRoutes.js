// Sale routes - owner-only confirmation of completed sales
const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Confirm a sale
// Protected: only logged-in owner (admin) can record sales
router.post('/confirm', authenticateToken, requireAdmin, saleController.confirmSale);

// Monthly summary
router.get('/summary', authenticateToken, requireAdmin, saleController.getMonthlySummary);

module.exports = router;
