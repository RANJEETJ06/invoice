const { mongoose } = require('../db');

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gstin: String,
    address: String,
    email: String,
    phone: String,
    bankAccountName: String,
    bankFirmName: String,
    bankAccountNo: String,
    bankIfsc: String,
    bankName: String,
    paymentTerms: String,
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', CompanySchema);
