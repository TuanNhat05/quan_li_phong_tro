const express = require('express');
const router = express.Router();
const dataStore = require('../utils/dataStore');

// GET /api/dashboard/:month
router.get('/:month', async (req, res) => {
  try {
    const dashData = await dataStore.getDashboard(req.params.month);
    res.json(dashData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

