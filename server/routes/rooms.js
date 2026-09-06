const express = require('express');
const router = express.Router();
const dataStore = require('../utils/dataStore');

// GET /api/rooms?buildingId=xxx
router.get('/', async (req, res) => {
  try {
    const { buildingId } = req.query;
    const rooms = await dataStore.getRooms(buildingId);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rooms - Tạo phòng mới
router.post('/', async (req, res) => {
  try {
    const { buildingId, ...roomData } = req.body;
    if (!buildingId) {
      return res.status(400).json({ error: 'Cần truyền buildingId' });
    }
    const newRoom = await dataStore.createRoom(buildingId, roomData);
    
    const io = req.app.get('socketio');
    if (io) {
      io.emit('room:created', newRoom);
    }

    res.status(201).json(newRoom);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/rooms/:id - Cập nhật phòng
router.put('/:id', async (req, res) => {
  try {
    const updatedRoom = await dataStore.updateRoom(req.params.id, req.body);
    if (!updatedRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Emit real-time socket event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('room:updated', updatedRoom);
    }

    res.json(updatedRoom);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/rooms/:id - Xóa phòng
router.delete('/:id', async (req, res) => {
  try {
    await dataStore.deleteRoom(req.params.id);
    const io = req.app.get('socketio');
    if (io) {
      io.emit('room:deleted', { _id: req.params.id });
    }
    res.json({ message: 'Đã xóa phòng' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

