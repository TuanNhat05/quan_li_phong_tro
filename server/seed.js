const mongoose = require('mongoose');
require('dotenv').config();

const Room = require('./models/Room');
const Config = require('./models/Config');
const Invoice = require('./models/Invoice');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/quan_li_phong_tro';

async function runSeed() {
  // 1. Seed Config
  let config = await Config.findOne();
  if (!config) {
    config = await Config.create({
      giaDien: 3500,
      extraFeesDefault: [
        { name: 'Rác sinh hoạt', amount: 30000 },
        { name: 'Internet / Wifi', amount: 100000 }
      ]
    });
    console.log('Default config created successfully.');
  }

  // 2. Seed 12 Rooms if empty
  const existingRoomsCount = await Room.countDocuments();
  if (existingRoomsCount === 0) {
    const initialRooms = [
      { name: 'Phòng 1', tenantName: 'Nguyễn Văn An', tenantPhone: '0901234567', soNguoi: 2, baseRent: 2500000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', orderIndex: 1 },
      { name: 'Phòng 2', tenantName: 'Trần Thị Bình', tenantPhone: '0912345678', soNguoi: 1, baseRent: 2200000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', orderIndex: 2 },
      { name: 'Phòng 3', tenantName: 'Lê Minh Cường', tenantPhone: '0923456789', soNguoi: 3, baseRent: 2800000, waterMode: 'fixed', waterAmount: 150000, status: 'occupied', orderIndex: 3 },
      { name: 'Phòng 4', tenantName: 'Phạm Hồng Dũng', tenantPhone: '0934567890', soNguoi: 2, baseRent: 2500000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', orderIndex: 4 },
      { name: 'Phòng 5', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', orderIndex: 5 },
      { name: 'Phòng 6', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', orderIndex: 6 },
      { name: 'Phòng 7', tenantName: 'Vũ Hoàng Em', tenantPhone: '0945678901', soNguoi: 2, baseRent: 2600000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', orderIndex: 7 },
      { name: 'Phòng 8', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', orderIndex: 8 },
      { name: 'Phòng 9', tenantName: 'Đặng Quốc Giang', tenantPhone: '0956789012', soNguoi: 1, baseRent: 2300000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', orderIndex: 9 },
      { name: 'Phòng 10', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', orderIndex: 10 },
      { name: 'Phòng 11', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', orderIndex: 11 },
      { name: 'Phòng 12', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', orderIndex: 12 }
    ];

    const createdRooms = await Room.insertMany(initialRooms);
    console.log(`Successfully created ${createdRooms.length} initial rooms.`);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const sampleInvoices = createdRooms.map((room, idx) => ({
      roomId: room._id,
      month: currentMonth,
      oldReading: room.status === 'occupied' ? 100 * (idx + 1) : 0,
      newReading: room.status === 'occupied' ? 100 * (idx + 1) + 45 : 0,
      extraFees: [
        { name: 'Rác sinh hoạt', amount: 30000 },
        { name: 'Internet / Wifi', amount: 100000 }
      ],
      paid: idx === 0 || idx === 1,
      paidDate: idx === 0 || idx === 1 ? new Date() : null
    }));

    await Invoice.insertMany(sampleInvoices);
    console.log(`Created sample invoices for month ${currentMonth}`);
  } else {
    console.log(`Rooms already exist in database (${existingRoomsCount} rooms found).`);
  }
  console.log('Seeding process completed!');
}

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');
    await runSeed();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedData();
}

module.exports = { runSeed };

