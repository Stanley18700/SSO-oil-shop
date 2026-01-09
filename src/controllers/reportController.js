const prisma = require('../services/prisma');

const MYANMAR_TZ = 'Asia/Yangon';
const MYANMAR_UTC_OFFSET_MINUTES = 390; // UTC+06:30

const pad2 = (n) => String(n).padStart(2, '0');

const getMyanmarMonthBounds = (year, month) => {
  // Local Myanmar time (UTC+06:30) boundaries:
  // startLocal = YYYY-MM-01 00:00:00 +06:30
  // endLocalExclusive = next month YYYY-(MM+1)-01 00:00:00 +06:30
  const startLocalYear = year;
  const startLocalMonth = month;

  const endLocalMonth = month === 12 ? 1 : month + 1;
  const endLocalYear = month === 12 ? year + 1 : year;

  const offsetMs = MYANMAR_UTC_OFFSET_MINUTES * 60 * 1000;

  // Convert local midnight to UTC by subtracting the fixed offset
  const startUtc = new Date(Date.UTC(startLocalYear, startLocalMonth - 1, 1, 0, 0, 0) - offsetMs);
  const endUtcExclusive = new Date(Date.UTC(endLocalYear, endLocalMonth - 1, 1, 0, 0, 0) - offsetMs);

  const startLocal = `${startLocalYear}-${pad2(startLocalMonth)}-01T00:00:00+06:30`;
  const endLocalExclusiveStr = `${endLocalYear}-${pad2(endLocalMonth)}-01T00:00:00+06:30`;

  return {
    startUtc,
    endUtcExclusive,
    startLocal,
    endLocalExclusive: endLocalExclusiveStr,
  };
};

/**
 * GET /api/reports/monthly/details?year=2026&month=1
 * Returns aggregate sales analytics for the requested calendar month.
 * - No recalculation on the frontend: all totals returned already aggregated.
 */
const getMonthlyDetails = async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10); // 1-12

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing year/month',
      });
    }

    const { startUtc, endUtcExclusive, startLocal, endLocalExclusive } = getMyanmarMonthBounds(year, month);

    const [salesAggregate, oilBreakdown] = await prisma.$transaction([
      prisma.sale.aggregate({
        where: {
          created_at: {
            gte: startUtc,
            lt: endUtcExclusive,
          },
        },
        _sum: {
          total_amount: true,
        },
        _count: {
          _all: true,
        },
      }),
      prisma.saleItem.groupBy({
        by: ['oil_id'],
        where: {
          sale: {
            created_at: {
              gte: startUtc,
              lt: endUtcExclusive,
            },
          },
        },
        _count: {
          _all: true,
        },
        _sum: {
          quantity: true,
          line_amount: true,
        },
        _max: {
          oil_name_snapshot: true,
        },
      }),
    ]);

    const oilIds = oilBreakdown.map((row) => row.oil_id);
    let oilMetadata = [];
    if (oilIds.length > 0) {
      oilMetadata = await prisma.oil.findMany({
        where: { id: { in: oilIds } },
        select: {
          id: true,
          unit: true,
        },
      });
    }

    const oilMetaById = new Map(oilMetadata.map((oil) => [oil.id, oil]));

    const byOil = oilBreakdown
      .map((group) => {
        const meta = oilMetaById.get(group.oil_id);
        return {
          oilId: group.oil_id,
          oilNameSnapshot: group?._max?.oil_name_snapshot || null,
          unitAtSale: meta?.unit || null,
          quantitySold: Number(group._sum.quantity || 0),
          revenue: Number(group._sum.line_amount || 0),
          lineCount: group?._count?._all || 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    return res.json({
      success: true,
      data: {
        period: {
          year,
          month,
          timezone: MYANMAR_TZ,
          utcOffsetMinutes: MYANMAR_UTC_OFFSET_MINUTES,
          startLocal,
          endLocalExclusive,
          startUtc: startUtc.toISOString(),
          endUtcExclusive: endUtcExclusive.toISOString(),
          label: `${year}-${pad2(month)}`,
        },
        currency: {
          code: 'MMK',
          minorUnit: 0,
        },
        quantityDefinition: {
          baseUnit: 'viss_equivalent',
          displayUnit: 'viss',
          conversion: '1 viss = 100 ticals',
          precision: 3,
          meaning: 'All quantities are standardized to viss-equivalent at time of sale. They are not raw entered units.',
        },
        totals: {
          totalSalesAmount: Number(salesAggregate._sum.total_amount || 0),
          transactions: salesAggregate._count._all || 0,
        },
        byOil,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error generating monthly report details:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate monthly report details',
    });
  }
};

module.exports = {
  getMonthlyDetails,
};
