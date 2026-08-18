const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    month: { type: String, required: true }, // "YYYY-MM"
    oldReading: { type: Number, default: 0, min: 0 },
    newReading: { type: Number, default: 0, min: 0 },
    extraFees: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 }
      }
    ],
    paid: { type: Boolean, default: false },
    paidDate: { type: Date, default: null }
  },
  { timestamps: true }
);

// Ensure only 1 invoice per room per month
invoiceSchema.index({ roomId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
