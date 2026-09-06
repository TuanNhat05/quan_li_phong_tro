const mongoose = require('mongoose');
require('dotenv').config();

const Building = require('./models/Building');
const Room = require('./models/Room');
const Config = require('./models/Config');
const Invoice = require('./models/Invoice');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

async function migrateData() {
  try {
    console.log('📡 Đang kết nối tới MongoDB Atlas để migrate...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Kết nối thành công!');

    // 1. Tạo căn nhà mặc định "702/30 Xô Viết Nghệ Tĩnh" nếu chưa có
    let defaultBuilding = await Building.findOne({ name: '702/30 Xô Viết Nghệ Tĩnh' });
    if (!defaultBuilding) {
      defaultBuilding = await Building.create({
        name: '702/30 Xô Viết Nghệ Tĩnh',
        address: '702/30 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM',
        description: 'Tòa nhà chính',
        orderIndex: 1
      });
      console.log('✅ Đã tạo căn nhà mặc định: 702/30 Xô Viết Nghệ Tĩnh');
    } else {
      console.log('ℹ️ Căn nhà mặc định đã tồn tại.');
    }

    const buildingId = defaultBuilding._id;

    // 2. Cập nhật buildingId cho các Room chưa có buildingId
    const roomResult = await Room.updateMany(
      { buildingId: { $exists: false } },
      { $set: { buildingId: buildingId } }
    );
    console.log(`✅ Đã gán buildingId cho ${roomResult.modifiedCount} phòng trọ.`);

    // 3. Cập nhật buildingId cho các Invoice chưa có buildingId
    const invoiceResult = await Invoice.updateMany(
      { buildingId: { $exists: false } },
      { $set: { buildingId: buildingId } }
    );
    console.log(`✅ Đã gán buildingId cho ${invoiceResult.modifiedCount} hóa đơn.`);

    // 4. Cập nhật buildingId cho Config chưa có buildingId
    const configResult = await Config.updateMany(
      { buildingId: { $exists: false } },
      { $set: { buildingId: buildingId } }
    );
    console.log(`✅ Đã gán buildingId cho ${configResult.modifiedCount} cấu hình.`);

    console.log('🎉 MIGRATION HOÀN TẤT THÀNH CÔNG!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration thất bại:', err);
    process.exit(1);
  }
}

migrateData();
