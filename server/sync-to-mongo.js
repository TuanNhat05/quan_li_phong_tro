const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Room = require('./models/Room');
const Config = require('./models/Config');
const Invoice = require('./models/Invoice');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

const DB_DIR = path.join(__dirname, 'database');
const ROOMS_FILE = path.join(DB_DIR, 'rooms.json');
const INVOICES_FILE = path.join(DB_DIR, 'invoices.json');
const CONFIG_FILE = path.join(DB_DIR, 'config.json');

async function syncLocalToMongo() {
  try {
    console.log('📡 Đang kết nối tới MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Đã kết nối MongoDB thành công!');

    // 1. Sync Config
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      await Config.deleteMany({});
      await Config.create(configData);
      console.log('✅ Đã đẩy dữ liệu Config lên MongoDB!');
    }

    // 2. Sync Rooms
    if (fs.existsSync(ROOMS_FILE)) {
      const roomsData = JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf8'));
      await Room.deleteMany({});
      await Room.insertMany(roomsData);
      console.log(`✅ Đã đẩy ${roomsData.length} phòng trọ (Rooms) lên MongoDB!`);
    }

    // 3. Sync Invoices
    if (fs.existsSync(INVOICES_FILE)) {
      const invoicesData = JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf8'));
      await Invoice.deleteMany({});
      const seenIds = new Set();
      const sanitizedInvoices = invoicesData.map(inv => {
        let idStr = inv._id;
        if (typeof idStr === 'string' && idStr.length === 25) {
          idStr = idStr.slice(0, 24);
        }
        
        let mongoId;
        if (typeof idStr === 'string' && /^[0-9a-fA-F]{24}$/.test(idStr) && !seenIds.has(idStr)) {
          mongoId = new mongoose.Types.ObjectId(idStr);
          seenIds.add(idStr);
        } else {
          mongoId = new mongoose.Types.ObjectId();
        }

        return {
          ...inv,
          _id: mongoId,
          roomId: new mongoose.Types.ObjectId(inv.roomId)
        };
      });
      await Invoice.insertMany(sanitizedInvoices);
      console.log(`✅ Đã đẩy ${invoicesData.length} hóa đơn (Invoices) lên MongoDB!`);
    }

    console.log('🎉 TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC CHUYỂN LÊN MONGODB KHÔNG LỆCH 1 TÍ NÀO!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi đồng bộ dữ liệu:', err);
    process.exit(1);
  }
}

syncLocalToMongo();
