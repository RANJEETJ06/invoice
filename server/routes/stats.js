const router = require('express').Router();
const Invoice = require('../models/Invoice');

router.get('/dashboard', async (req, res) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totals, monthly, recent, byStatus] = await Promise.all([
    Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalInvoiced: { $sum: '$grandTotal' },
          totalPaid: { $sum: '$amountPaid' },
          count: { $sum: 1 },
        },
      },
    ]),
    Invoice.aggregate([
      { $match: { invoiceDate: { $gte: startOfYear } } },
      {
        $group: {
          _id: { y: { $year: '$invoiceDate' }, m: { $month: '$invoiceDate' } },
          total: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
    Invoice.find().sort({ createdAt: -1 }).limit(5).select('invoiceNo invoiceDate billTo.name grandTotal status'),
    Invoice.aggregate([
      { $group: { _id: '$status', total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
    ]),
  ]);

  const monthCount = await Invoice.countDocuments({ invoiceDate: { $gte: startOfMonth } });
  const monthTotalAgg = await Invoice.aggregate([
    { $match: { invoiceDate: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$grandTotal' } } },
  ]);

  res.json({
    totalInvoiced: totals[0]?.totalInvoiced || 0,
    totalPaid: totals[0]?.totalPaid || 0,
    totalOutstanding: (totals[0]?.totalInvoiced || 0) - (totals[0]?.totalPaid || 0),
    count: totals[0]?.count || 0,
    monthInvoiced: monthTotalAgg[0]?.total || 0,
    monthCount,
    monthly: monthly.map((m) => ({
      year: m._id.y,
      month: m._id.m,
      total: m.total,
      count: m.count,
    })),
    byStatus,
    recent,
  });
});

module.exports = router;
