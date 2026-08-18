const mongoose = require('mongoose');
require('dotenv').config();

async function testDatabaseConnections() {
  console.log('--------------------------------------------------');
  console.log('🔍 BẮT ĐẦU KIỂM TRA KẾT NỐI DATABASE MONGODB');
  console.log('--------------------------------------------------');

  const uri = process.env.MONGODB_URI;
  const srv = process.env.MONGO_SRV;
  const localUri = 'mongodb://127.0.0.1:27017/quan_li_phong_tro';

  console.log(`\n1. Kiểm tra MONGODB_URI (Atlas Direct):`);
  if (!uri) {
    console.log('❌ MONGODB_URI chưa được khai báo trong server/.env');
  } else {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
      console.log('✅ KẾT NỐI THÀNH CÔNG TỚI MONGODB ATLAS!');
      await mongoose.disconnect();
      return;
    } catch (err) {
      console.log('❌ Lỗi kết nối MONGODB_URI:', err.message);
      if (err.message.includes('authentication failed') || err.message.includes('bad auth')) {
        console.log('👉 NGUYÊN NHÂN: Sai Username hoặc Password trong chuỗi kết nối MONGODB_URI.');
        console.log('👉 HƯỚNG XỬ LÝ: Đăng nhập https://cloud.mongodb.com -> Database Access -> Cập nhật lại mật khẩu user.');
      } else if (err.message.includes('selection timed out')) {
        console.log('👉 NGUYÊN NHÂN: Bị chặn IP bởi MongoDB Atlas Whitelist hoặc mạng bị chập chờn.');
        console.log('👉 HƯỚNG XỬ LÝ: Vào cloud.mongodb.com -> Network Access -> Add IP Address -> Chọn 0.0.0.0/0 (Allow Access from Anywhere).');
      }
    }
  }

  console.log(`\n2. Kiểm tra MONGO_SRV (Atlas SRV):`);
  if (!srv) {
    console.log('❌ MONGO_SRV chưa được khai báo trong server/.env');
  } else {
    try {
      await mongoose.disconnect();
      await mongoose.connect(srv, { serverSelectionTimeoutMS: 4000 });
      console.log('✅ KẾT NỐI THÀNH CÔNG QUA MONGO_SRV!');
      await mongoose.disconnect();
      return;
    } catch (err) {
      console.log('❌ Lỗi kết nối MONGO_SRV:', err.message);
    }
  }

  console.log(`\n3. Kiểm tra Local MongoDB (127.0.0.1:27017):`);
  try {
    await mongoose.disconnect();
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ KẾT NỐI THÀNH CÔNG TỚI MONGODB LOCAL!');
    await mongoose.disconnect();
    return;
  } catch (err) {
    console.log('❌ Lỗi kết nối MongoDB Local:', err.message);
    console.log('👉 NGUYÊN NHÂN: Dịch vụ MongoDB chưa được cài đặt hoặc chưa bật trên máy (Service stopped).');
  }

  console.log('\n--------------------------------------------------');
  console.log('❌ TỔNG KẾT: Tất cả các phương thức kết nối Database đều thất bại.');
  console.log('👉 Vui lòng kiểm tra lại Username/Password trên MongoDB Atlas hoặc bật MongoDB Local.');
  console.log('--------------------------------------------------\n');
}

testDatabaseConnections().then(() => process.exit(0));
