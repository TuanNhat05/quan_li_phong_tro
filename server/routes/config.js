const express = require('express');
const router = express.Router();
const dataStore = require('../utils/dataStore');

// GET /api/config?buildingId=xxx
router.get('/', async (req, res) => {
  try {
    const { buildingId } = req.query;
    const config = await dataStore.getConfig(buildingId);
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/config?buildingId=xxx
router.put('/', async (req, res) => {
  try {
    const { buildingId } = req.query;
    const updatedConfig = await dataStore.updateConfig(buildingId, req.body);

    // Emit real-time socket event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('config:updated', updatedConfig);
    }

    res.json(updatedConfig);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

