const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    orderIndex: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Building', buildingSchema);
