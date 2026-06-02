const router = require('express').Router();
const Invoice = require('../models/Invoice');
const { amountInWords } = require('../utils/numberToWords');

function computeTotals(payload) {
  const items = (payload.items || []).map((it) => {
    const qty = Number(it.qty) || 0;
    const rate = Number(it.rate) || 0;
    return { ...it, qty, rate, amount: +(qty * rate).toFixed(2) };
  });

  const totalTaxable = +items.reduce((s, it) => s + it.amount, 0).toFixed(2);
  const cgstPercent = Number(payload.cgstPercent) || 0;
  const sgstPercent = Number(payload.sgstPercent) || 0;
  const igstPercent = Number(payload.igstPercent) || 0;
  const cgstAmount = +((totalTaxable * cgstPercent) / 100).toFixed(2);
  const sgstAmount = +((totalTaxable * sgstPercent) / 100).toFixed(2);
  const igstAmount = +((totalTaxable * igstPercent) / 100).toFixed(2);
  const transportCharges = Number(payload.transportCharges) || 0;
  const otherCharges = Number(payload.otherCharges) || 0;

  const rawTotal = totalTaxable + cgstAmount + sgstAmount + igstAmount + transportCharges + otherCharges;
  const grandTotal = Math.round(rawTotal);
  const roundOff = +(grandTotal - rawTotal).toFixed(2);

  return {
    ...payload,
    items,
    totalTaxable,
    cgstPercent,
    sgstPercent,
    igstPercent,
    cgstAmount,
    sgstAmount,
    igstAmount,
    transportCharges,
    otherCharges,
    roundOff,
    grandTotal,
    amountInWords: amountInWords(grandTotal),
  };
}

router.get('/', async (req, res) => {
  const { q, status, from, to, limit = 100 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) filter.$or = [
    { invoiceNo: new RegExp(q, 'i') },
    { 'billTo.name': new RegExp(q, 'i') },
  ];
  if (from || to) {
    filter.invoiceDate = {};
    if (from) filter.invoiceDate.$gte = new Date(from);
    if (to) filter.invoiceDate.$lte = new Date(to);
  }
  const rows = await Invoice.find(filter).sort({ invoiceDate: -1, createdAt: -1 }).limit(Number(limit));
  res.json(rows);
});

router.get('/next-number', async (req, res) => {
  const prefix = req.query.prefix || 'AT';
  const year = new Date().getFullYear();
  const re = new RegExp(`^${prefix}/${year}/(\\d+)$`);
  const last = await Invoice.find({ invoiceNo: re }).sort({ invoiceNo: -1 }).limit(1);
  let next = 1;
  if (last.length) {
    const m = last[0].invoiceNo.match(re);
    if (m) next = parseInt(m[1], 10) + 1;
  }
  res.json({ invoiceNo: `${prefix}/${year}/${String(next).padStart(4, '0')}` });
});

router.get('/:id', async (req, res) => {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) return res.status(404).json({ error: 'not found' });
  res.json(inv);
});

router.post('/', async (req, res) => {
  try {
    const payload = computeTotals(req.body);
    if (payload.sameAsBillTo) payload.shipTo = payload.billTo;
    const inv = await Invoice.create(payload);
    res.status(201).json(inv);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payload = computeTotals(req.body);
    if (payload.sameAsBillTo) payload.shipTo = payload.billTo;
    const inv = await Invoice.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!inv) return res.status(404).json({ error: 'not found' });
    res.json(inv);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const inv = await Invoice.findByIdAndDelete(req.params.id);
  if (!inv) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

module.exports = router;
