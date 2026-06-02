const { mongoose } = require('../db');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hsnCode: String,
    unit: { type: String, default: 'Kg' },
    rate: { type: Number, default: 0 },
    description: String,
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', hsnCode: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
