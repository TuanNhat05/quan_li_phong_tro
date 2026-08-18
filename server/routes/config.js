const express = require('express');
const router = express.Router();
const dataStore = require('../utils/dataStore');

// GET /api/config
router.get('/', async (req, res) => {
  try {
    const config = await dataStore.getConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/config
router.put('/', async (req, res) => {
  try {
    const updatedConfig = await dataStore.updateConfig(req.body);

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

