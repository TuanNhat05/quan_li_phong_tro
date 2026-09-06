const express = require('express');
const router = express.Router();
const dataStore = require('../utils/dataStore');

// GET /api/dashboard/:month?buildingId=xxx
router.get('/:month', async (req, res) => {
  try {
    const { buildingId } = req.query;
    const dashData = await dataStore.getDashboard(req.params.month, buildingId);
    res.json(dashData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

