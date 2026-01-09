const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/reports/monthly/details?year=2026&month=1
// Owner-only analytics endpoint
router.get('/monthly/details', authenticateToken, requireAdmin, reportController.getMonthlyDetails);

// GET /api/reports/daily?date=YYYY-MM-DD
// Owner-only analytics endpoint
router.get('/daily', authenticateToken, requireAdmin, reportController.getDailySummary);

module.exports = router;
