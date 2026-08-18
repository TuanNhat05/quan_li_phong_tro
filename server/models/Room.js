const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tenantName: { type: String, default: '' },
    tenantPhone: { type: String, default: '' },
    soNguoi: { type: Number, default: 0, min: 0 },
    baseRent: { type: Number, default: 2000000, min: 0 },
    waterMode: { type: String, enum: ['fixed', 'perPerson'], default: 'perPerson' },
    waterAmount: { type: Number, default: 100000, min: 0 },
    status: { type: String, enum: ['occupied', 'vacant'], default: 'vacant' },
    contractStart: { type: String, default: '' },
    contractEnd: { type: String, default: '' },
    deposit: { type: Number, default: 0, min: 0 },
    depositNote: { type: String, default: '' },
    parkingMode: { type: String, enum: ['perPerson', 'fixed', 'perVehicle', 'none'], default: 'perVehicle' },
    parkingAmount: { type: Number, default: 150000, min: 0 },
    soXe: { type: Number, default: 0, min: 0 },
    orderIndex: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
