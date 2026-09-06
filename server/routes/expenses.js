const express = require('express');
const router = express.Router();
const dataStore = require('../utils/dataStore');

// GET /api/expenses?month=YYYY-MM&buildingId=xxx
router.get('/', async (req, res) => {
  try {
    const { month, buildingId } = req.query;
    if (!month) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tham số month (YYYY-MM)' });
    }

    const expenses = await dataStore.getExpenses(month, buildingId);
    let totalFixed = 0;
    let totalVariable = 0;

    for (const exp of expenses) {
      const amt = Number(exp.amount) || 0;
      if (exp.type === 'fixed') {
        totalFixed += amt;
      } else {
        totalVariable += amt;
      }
    }

    res.json({
      month,
      buildingId,
      expenses,
      totalFixed,
      totalVariable,
      totalExpenses: totalFixed + totalVariable
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses - Tạo khoản chi phí mới
router.post('/', async (req, res) => {
  try {
    const { buildingId, month, title, amount } = req.body;
    if (!buildingId) {
      return res.status(400).json({ error: 'buildingId là bắt buộc' });
    }
    if (!month) {
      return res.status(400).json({ error: 'month (YYYY-MM) là bắt buộc' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Tên khoản chi không được để trống' });
    }
    if (amount === undefined || isNaN(amount) || Number(amount) < 0) {
      return res.status(400).json({ error: 'Số tiền chi không hợp lệ' });
    }

    const newExpense = await dataStore.createExpense(buildingId, req.body);

    const io = req.app.get('socketio');
    if (io) {
      io.emit('expenseUpdated', { action: 'created', expense: newExpense });
    }

    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/expenses/:id - Cập nhật khoản chi phí
router.put('/:id', async (req, res) => {
  try {
    const updated = await dataStore.updateExpense(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Không tìm thấy khoản chi phí' });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('expenseUpdated', { action: 'updated', expense: updated });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id - Xóa khoản chi phí
router.delete('/:id', async (req, res) => {
  try {
    await dataStore.deleteExpense(req.params.id);

    const io = req.app.get('socketio');
    if (io) {
      io.emit('expenseUpdated', { action: 'deleted', id: req.params.id });
    }

    res.json({ message: 'Đã xóa khoản chi phí thành công', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses/copy-recurring - Sao chép các chi phí cố định từ tháng trước
router.post('/copy-recurring', async (req, res) => {
  try {
    const { buildingId, fromMonth, toMonth } = req.body;
    if (!buildingId || !fromMonth || !toMonth) {
      return res.status(400).json({ error: 'Thiếu buildingId, fromMonth hoặc toMonth' });
    }

    const copied = await dataStore.copyRecurringExpenses(buildingId, fromMonth, toMonth);

    const io = req.app.get('socketio');
    if (io) {
      io.emit('expenseUpdated', { action: 'copied_recurring', count: copied.length });
    }

    res.json({ copiedCount: copied.length, expenses: copied });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
