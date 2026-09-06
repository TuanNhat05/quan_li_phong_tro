const express = require('express');
const router = express.Router();
const dataStore = require('../utils/dataStore');

// GET /api/invoices/:month?buildingId=xxx
router.get('/:month', async (req, res) => {
  try {
    const { buildingId } = req.query;
    const invoices = await dataStore.getInvoices(req.params.month, buildingId);
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/invoices/:month/:roomId
router.patch('/:month/:roomId', async (req, res) => {
  try {
    const { month, roomId } = req.params;
    const { buildingId } = req.query;
    const calculatedInvoice = await dataStore.patchInvoice(month, roomId, req.body, buildingId);

    // Emit real-time socket event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('invoice:updated', calculatedInvoice);
    }

    res.json(calculatedInvoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

