const { mongoose } = require('../db');

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gstin: String,
    address: String,
    city: String,
    state: String,
    email: String,
    phone: String,
    notes: String,
  },
  { timestamps: true }
);

CustomerSchema.index({ name: 'text', gstin: 'text' });

module.exports = mongoose.model('Customer', CustomerSchema);
