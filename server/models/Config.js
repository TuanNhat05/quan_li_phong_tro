const mongoose = require('mongoose');

const configSchema = new mongoose.Schema(
  {
    giaDien: { type: Number, default: 3500, min: 0 },
    extraFeesDefault: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Config', configSchema);
