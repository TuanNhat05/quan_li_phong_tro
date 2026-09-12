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
const buildingsRouter = require('./routes/buildings');
const expensesRouter = require('./routes/expenses');

const app = express();
const server = http.createServer(app);

// Enable CORS - allow all origins dynamically (Cloudflare tunnel, LAN, Render, Vercel, Localhost)
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
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
app.use('/api/buildings', buildingsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/config', configRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/expenses', expensesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: dbMode, timestamp: new Date() });
});



// Serve static client build if dist folder exists (e.g. combined deployment)
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

async function startServer() {
  if (!MONGODB_URI) {
    console.error('❌ Lỗi: Thiếu MONGODB_URI trong file .env');
    process.exit(1);
  }

  try {
    console.log(`📡 Đang kết nối MongoDB Cloud...`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    dbMode = 'mongodb';
    console.log('✅ ĐÃ KẾT NỐI MONGODB CLOUD THÀNH CÔNG!');
  } catch (err) {
    console.error('❌ Không thể kết nối MongoDB Cloud:', err.message);
    process.exit(1);
  }

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (process.platform === 'win32') {
        console.error(`❌ Cổng ${PORT} đang bị chiếm dụng. Đang thử kill tiến trình cũ...`);
        const { exec } = require('child_process');
        exec(`netstat -ano | findstr :${PORT}`, (error, stdout) => {
          if (stdout) {
            const lines = stdout.trim().split('\n');
            const pids = new Set();
            lines.forEach(line => {
              const parts = line.trim().split(/\s+/);
              const pid = parts[parts.length - 1];
              if (pid && !isNaN(pid) && pid !== '0' && pid !== process.pid.toString()) {
                pids.add(pid);
              }
            });

            if (pids.size > 0) {
              let killedCount = 0;
              pids.forEach(pid => {
                exec(`taskkill /PID ${pid} /F`, (killErr) => {
                  killedCount++;
                  if (!killErr) {
                    console.log(`✅ Đã kill tiến trình PID ${pid}.`);
                  }
                  if (killedCount === pids.size) {
                    console.log('Khởi động lại server...');
                    setTimeout(() => {
                      server.listen(PORT);
                    }, 1000);
                  }
                });
              });
            } else {
              console.error(`❌ Không thể kill tiến trình đang chiếm cổng ${PORT}.`);
              process.exit(1);
            }
          } else {
            console.error(`❌ Không thể xác định tiến trình đang dùng cổng ${PORT}.`);
            process.exit(1);
          }
        });
      } else {
        console.error(`❌ Cổng ${PORT} đang bị chiếm dụng trên server.`);
        process.exit(1);
      }
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();





