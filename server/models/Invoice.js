const { mongoose } = require('../db');

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hsnCode: String,
    qty: { type: Number, default: 0 },
    unit: { type: String, default: 'Kg' },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const PartySnapshotSchema = new mongoose.Schema(
  {
    name: String,
    gstin: String,
    address: String,
    email: String,
    phone: String,
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, default: Date.now },
    placeOfSupply: { type: String, default: 'Maharashtra' },
    paymentTerms: { type: String, default: '40% Advance, Balance 8-15 Days' },

    seller: PartySnapshotSchema,
    billTo: PartySnapshotSchema,
    shipTo: PartySnapshotSchema,
    sameAsBillTo: { type: Boolean, default: true },

    vehicleNumber: String,
    driverName: String,
    driverContact: String,

    items: [ItemSchema],

    totalTaxable: { type: Number, default: 0 },
    cgstPercent: { type: Number, default: 2.5 },
    sgstPercent: { type: Number, default: 2.5 },
    igstPercent: { type: Number, default: 0 },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    transportCharges: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    roundOff: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    amountInWords: String,

    bankAccountName: String,
    bankFirmName: String,
    bankAccountNo: String,
    bankIfsc: String,
    bankName: String,

    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'partial', 'cancelled'],
      default: 'draft',
    },
    amountPaid: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true }
);

InvoiceSchema.index({ invoiceNo: 1 });
InvoiceSchema.index({ invoiceDate: -1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
