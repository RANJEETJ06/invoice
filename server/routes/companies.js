const router = require('express').Router();
const Company = require('../models/Company');

const DEFAULT_COMPANY = {
  name: 'ADIJA TRADEX',
  gstin: '21RDWPS5990H1ZD',
  address: 'Ground Floor, NH 20, Plot No. 439, Kirtipur, Main Road, Sahajpada, Mayurbhanj, District Ganjam, Odisha - 761103, India',
  email: 'info@adijatradex.com',
  phone: '+91 9920035315 / +91 9920053315',
  bankAccountName: 'Kuni Swain',
  bankFirmName: 'Adija Tradex',
  bankAccountNo: '44955157119',
  bankIfsc: '',
  bankName: '',
  paymentTerms: '40% Advance, Balance 8-15 Days',
  isDefault: true,
};

router.get('/default', async (req, res) => {
  let c = await Company.findOne({ isDefault: true });
  if (!c) c = await Company.create(DEFAULT_COMPANY);
  res.json(c);
});

router.put('/default', async (req, res) => {
  const update = { ...req.body, isDefault: true };
  const c = await Company.findOneAndUpdate({ isDefault: true }, update, { new: true, upsert: true });
  res.json(c);
});

router.get('/', async (req, res) => {
  const rows = await Company.find().sort({ name: 1 });
  res.json(rows);
});

module.exports = router;
