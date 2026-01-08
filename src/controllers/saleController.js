// Sale controller - records completed sales
// Uses Prisma transaction to persist sale header and items together

const prisma = require('../services/prisma');

/**
 * POST /api/sales/confirm
 * Body shape (example):
 * {
 *   "totalAmount": 12000.0,
 *   "totalQuantity": 3.5,
 *   "saleType": "SINGLE_OIL" | "MIX",
 *   "note": "optional note",
 *   "items": [
 *     { "oilId": 1, "quantity": 2.0, "lineAmount": 7000.0 },
 *     { "oilId": 2, "quantity": 1.5, "lineAmount": 5000.0 }
 *   ]
 * }
 */
const confirmSale = async (req, res) => {
  try {
    const { totalAmount, totalQuantity, saleType, note, items } = req.body;

    // Basic validation - keep it minimal for V1
    if (!totalAmount || !totalQuantity || !saleType || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required sale fields or items',
      });
    }

    // Ensure saleType is one of allowed enum values
    if (!['SINGLE_OIL', 'MIX'].includes(saleType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sale type',
      });
    }

    // Prisma transaction: create Sale and SaleItem rows atomically
    const result = await prisma.$transaction(async (tx) => {
      // Fetch oil data to snapshot names and validate IDs
      const oilIds = items.map((item) => item.oilId);
      const oils = await tx.oil.findMany({
        where: { id: { in: oilIds } },
      });

      const oilById = new Map(oils.map((oil) => [oil.id, oil]));

      // Build sale record (we trust totals from caller – no recalculation on read)
      const sale = await tx.sale.create({
        data: {
          total_amount: totalAmount,
          total_quantity: totalQuantity,
          sale_type: saleType,
          note: note || null,
        },
      });

      // Build line items
      const itemData = items.map((item) => {
        const oil = oilById.get(item.oilId);
        if (!oil) {
          throw new Error(`Oil not found for id ${item.oilId}`);
        }

        return {
          sale_id: sale.id,
          oil_id: oil.id,
          oil_name_snapshot: oil.name_en, // snapshot English name; summaries can still join for full data
          quantity: item.quantity,
          line_amount: item.lineAmount,
        };
      });

      // Create all items in a single query
      await tx.saleItem.createMany({ data: itemData });

      return sale;
    });

    return res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error confirming sale:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to record sale',
    });
  }
};
// GET /api/sales/summary?year=2026&month=1
// Returns total sales value for the given month
const getMonthlySummary = async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10); // 1-12

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing year/month',
      });
    }

    // Calculate date range [start, end) in UTC
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const aggregate = await prisma.sale.aggregate({
      where: {
        created_at: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        total_amount: true,
      },
    });

    const totalSalesValue = aggregate._sum.total_amount || 0;

    return res.json({
      success: true,
      data: {
        year,
        month,
        totalSalesValue,
      },
    });
  } catch (error) {
    console.error('Error getting monthly sales summary:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve monthly sales summary',
    });
  }
};

module.exports = {
  confirmSale,
  getMonthlySummary,
};
