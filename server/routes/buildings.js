const express = require('express');
const router = express.Router();
const Building = require('../models/Building');
const Room = require('../models/Room');
const Invoice = require('../models/Invoice');
const Config = require('../models/Config');

// GET /api/buildings - Lấy tất cả căn nhà
router.get('/', async (req, res) => {
  try {
    const buildings = await Building.find().sort({ orderIndex: 1, createdAt: 1 });
    res.json(buildings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/buildings - Tạo căn nhà mới
router.post('/', async (req, res) => {
  try {
    const { name, address, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tên căn nhà không được để trống' });
    }

    const count = await Building.countDocuments();
    const newBuilding = await Building.create({
      name: name.trim(),
      address: address ? address.trim() : '',
      description: description ? description.trim() : '',
      orderIndex: count + 1
    });

    // Tạo config mặc định cho căn nhà mới
    await Config.create({
      buildingId: newBuilding._id,
      giaDien: 3800,
      extraFeesDefault: [
        { name: 'Phí sinh hoạt', amount: 150000 }
      ]
    });

    // Phát socket event nếu có
    const io = req.app.get('socketio');
    if (io) {
      io.emit('building:created', newBuilding);
    }

    res.status(201).json(newBuilding);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/buildings/:id - Cập nhật căn nhà
router.put('/:id', async (req, res) => {
  try {
    const { name, address, description } = req.body;
    const updatedBuilding = await Building.findByIdAndUpdate(
      req.params.id,
      {
        ...(name !== undefined && { name: name.trim() }),
        ...(address !== undefined && { address: address.trim() }),
        ...(description !== undefined && { description: description.trim() })
      },
      { new: true, runValidators: true }
    );

    if (!updatedBuilding) {
      return res.status(404).json({ error: 'Không tìm thấy căn nhà' });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('building:updated', updatedBuilding);
    }

    res.json(updatedBuilding);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/buildings/:id - Xóa căn nhà cùng các phòng & hóa đơn của nó
router.delete('/:id', async (req, res) => {
  try {
    const buildingId = req.params.id;
    const building = await Building.findByIdAndDelete(buildingId);

    if (!building) {
      return res.status(404).json({ error: 'Không tìm thấy căn nhà' });
    }

    // Xóa liên hoàn các dữ liệu liên quan
    await Room.deleteMany({ buildingId });
    await Invoice.deleteMany({ buildingId });
    await Config.deleteMany({ buildingId });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('building:deleted', { _id: buildingId });
    }

    res.json({ message: 'Đã xóa căn nhà và các dữ liệu liên quan thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
