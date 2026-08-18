const express = require('express');
const router = express.Router();
const dataStore = require('../utils/dataStore');

// GET /api/rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await dataStore.getRooms();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rooms/:id
router.post('/:id', async (req, res) => {
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

module.exports = router;

