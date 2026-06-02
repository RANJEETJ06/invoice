const router = require('express').Router();
const Customer = require('../models/Customer');

router.get('/', async (req, res) => {
  const { q } = req.query;
  const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { gstin: new RegExp(q, 'i') }] } : {};
  const rows = await Customer.find(filter).sort({ name: 1 }).limit(500);
  res.json(rows);
});

router.post('/', async (req, res) => {
  try {
    const row = await Customer.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const row = await Customer.findById(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

router.put('/:id', async (req, res) => {
  const row = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

router.delete('/:id', async (req, res) => {
  const row = await Customer.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

module.exports = router;
