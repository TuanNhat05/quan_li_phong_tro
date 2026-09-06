const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true, index: true },
    month: { type: String, required: true, index: true }, // Định dạng 'YYYY-MM'
    type: { type: String, enum: ['fixed', 'variable'], default: 'fixed', required: true }, // 'fixed': Chi phí cố định, 'variable': Chi phí phát sinh
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['rent', 'utilities', 'internet', 'maintenance', 'cleaning', 'security', 'other'],
      default: 'other'
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, default: () => new Date().toISOString().slice(0, 10) }, // 'YYYY-MM-DD'
    note: { type: String, default: '', trim: true },
    isRecurring: { type: Boolean, default: false } // Đánh dấu chi phí cố định lặp lại các tháng sau
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
