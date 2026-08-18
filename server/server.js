const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const roomsRouter = require('./routes/rooms');
const configRouter = require('./routes/config');
const invoicesRouter = require('./routes/invoices');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors());
app.use(express.json());

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Store socketio in app context for route handlers
app.set('socketio', io);

io.on('connection', (socket) => {
  console.log(`⚡ Client connected real-time: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

let dbMode = 'local_file_store';

// Register REST API Routes
app.use('/api/rooms', roomsRouter);
app.use('/api/config', configRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: dbMode, timestamp: new Date() });
});

const { runSeed } = require('./seed');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

async function startServer() {
  if (MONGODB_URI) {
    try {
      console.log(`📡 Đang thử kết nối MongoDB...`);
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2500 });
      dbMode = 'mongodb';
      console.log('✅ Đã kết nối MongoDB Cloud thành công.');
      await runSeed();
    } catch (err) {
      console.log('💡 Không kết nối được MongoDB Cloud. Tự động chuyển sang Database Local (Lưu file).');
      try { await mongoose.disconnect(); } catch (e) {}
    }
  }

  if (dbMode === 'local_file_store') {
    console.log('📁 Ứng dụng đang chạy ở chế độ Database Local (Lưu tại thư mục server/database/)');
  }

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();





