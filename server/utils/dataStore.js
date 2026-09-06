const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Room = require('../models/Room');
const Config = require('../models/Config');
const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const { calculateInvoiceDetails } = require('./calculator');

const DB_DIR = path.join(__dirname, '..', 'database');
const ROOMS_FILE = path.join(DB_DIR, 'rooms.json');
const INVOICES_FILE = path.join(DB_DIR, 'invoices.json');
const CONFIG_FILE = path.join(DB_DIR, 'config.json');
const EXPENSES_FILE = path.join(DB_DIR, 'expenses.json');

const OLD_DATA_FILE = path.join(__dirname, '..', 'data', 'store.json');

const currentMonthStr = new Date().toISOString().slice(0, 7);

const initialRooms = [
  { _id: '66b000000000000000000001', name: 'Phòng 1', tenantName: 'Nguyễn Văn An', tenantPhone: '0901234567', soNguoi: 2, baseRent: 2500000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', contractStart: '2026-01-01', contractEnd: '2026-12-31', orderIndex: 1 },
  { _id: '66b000000000000000000002', name: 'Phòng 2', tenantName: 'Trần Thị Bình', tenantPhone: '0912345678', soNguoi: 1, baseRent: 2200000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', contractStart: '2026-02-01', contractEnd: '2027-01-31', orderIndex: 2 },
  { _id: '66b000000000000000000003', name: 'Phòng 3', tenantName: 'Lê Minh Cường', tenantPhone: '0923456789', soNguoi: 3, baseRent: 2800000, waterMode: 'fixed', waterAmount: 150000, status: 'occupied', contractStart: '2026-01-15', contractEnd: '2027-01-14', orderIndex: 3 },
  { _id: '66b000000000000000000004', name: 'Phòng 4', tenantName: 'Phạm Hồng Dũng', tenantPhone: '0934567890', soNguoi: 2, baseRent: 2500000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', contractStart: '2026-03-01', contractEnd: '2027-02-28', orderIndex: 4 },
  { _id: '66b000000000000000000005', name: 'Phòng 5', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', contractStart: '', contractEnd: '', orderIndex: 5 },
  { _id: '66b000000000000000000006', name: 'Phòng 6', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', contractStart: '', contractEnd: '', orderIndex: 6 },
  { _id: '66b000000000000000000007', name: 'Phòng 7', tenantName: 'Vũ Hoàng Em', tenantPhone: '0945678901', soNguoi: 2, baseRent: 2600000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', contractStart: '2026-04-01', contractEnd: '2027-03-31', orderIndex: 7 },
  { _id: '66b000000000000000000008', name: 'Phòng 8', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', contractStart: '', contractEnd: '', orderIndex: 8 },
  { _id: '66b000000000000000000009', name: 'Phòng 9', tenantName: 'Đặng Quốc Giang', tenantPhone: '0956789012', soNguoi: 1, baseRent: 2300000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', contractStart: '2026-05-01', contractEnd: '2027-04-30', orderIndex: 9 },
  { _id: '66b000000000000000000010', name: 'Phòng 10', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', contractStart: '', contractEnd: '', orderIndex: 10 },
  { _id: '66b000000000000000000011', name: 'Phòng 11', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', contractStart: '', contractEnd: '', orderIndex: 11 },
  { _id: '66b000000000000000000012', name: 'Phòng 12', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', contractStart: '', contractEnd: '', orderIndex: 12 }
];

const FIXED_SERVICE_FEE = 150000;

const initialConfig = {
  giaDien: 3800,
  extraFeesDefault: [
    { name: 'Phí sinh hoạt mỗi phòng', amount: FIXED_SERVICE_FEE }
  ]
};

let storeData = {
  config: initialConfig,
  rooms: initialRooms,
  invoices: [],
  expenses: []
};

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function loadFromFile() {
  try {
    if (fs.existsSync(OLD_DATA_FILE) && !fs.existsSync(ROOMS_FILE)) {
      try {
        const oldContent = JSON.parse(fs.readFileSync(OLD_DATA_FILE, 'utf8'));
        storeData = {
          config: oldContent.config || initialConfig,
          rooms: Array.isArray(oldContent.rooms) && oldContent.rooms.length > 0 ? oldContent.rooms : initialRooms,
          invoices: Array.isArray(oldContent.invoices) ? oldContent.invoices : [],
          expenses: Array.isArray(oldContent.expenses) ? oldContent.expenses : []
        };
        saveToFile();
        return;
      } catch (e) {}
    }

    if (fs.existsSync(ROOMS_FILE)) {
      storeData.rooms = JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf8'));
    } else {
      storeData.rooms = initialRooms;
    }

    if (fs.existsSync(INVOICES_FILE)) {
      storeData.invoices = JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf8'));
    } else {
      storeData.invoices = [];
    }

    if (fs.existsSync(CONFIG_FILE)) {
      storeData.config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } else {
      storeData.config = initialConfig;
    }

    if (fs.existsSync(EXPENSES_FILE)) {
      storeData.expenses = JSON.parse(fs.readFileSync(EXPENSES_FILE, 'utf8'));
    } else {
      storeData.expenses = [];
    }

    saveToFile();
  } catch (err) {
    console.error('Error loading collections from database directory:', err.message);
  }
}

function saveToFile() {
  try {
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(storeData.rooms, null, 2), 'utf8');
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(storeData.invoices, null, 2), 'utf8');
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(storeData.config, null, 2), 'utf8');
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(storeData.expenses, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving collections:', err.message);
  }
}

loadFromFile();

function getPreviousMonth(monthStr) {
  const [yearStr, mStr] = monthStr.split('-');
  let year = parseInt(yearStr, 10);
  let m = parseInt(mStr, 10);
  if (m === 1) {
    year -= 1;
    m = 12;
  } else {
    m -= 1;
  }
  const paddedMonth = m < 10 ? `0${m}` : `${m}`;
  return `${year}-${paddedMonth}`;
}

function getNextMonth(monthStr) {
  const [yearStr, mStr] = monthStr.split('-');
  let year = parseInt(yearStr, 10);
  let m = parseInt(mStr, 10);
  if (m === 12) {
    year += 1;
    m = 1;
  } else {
    m += 1;
  }
  const paddedMonth = m < 10 ? `0${m}` : `${m}`;
  return `${year}-${paddedMonth}`;
}

// Ensure initial sample invoices for current month if empty
if (storeData.invoices.length === 0) {
  storeData.invoices = storeData.rooms.map((room, idx) => ({
    _id: `66b00000000000000000100${idx + 1}`,
    roomId: room._id,
    month: currentMonthStr,
    oldReading: room.status === 'occupied' ? 100 * (idx + 1) : 0,
    newReading: room.status === 'occupied' ? 100 * (idx + 1) + 45 : 0,
    extraFees: [
      { name: 'Phí sinh hoạt mỗi phòng', amount: FIXED_SERVICE_FEE }
    ],
    paid: idx === 0 || idx === 1,
    paidDate: idx === 0 || idx === 1 ? new Date().toISOString() : null
  }));
  saveToFile();
}

async function getRooms(buildingId) {
  if (mongoose.connection.readyState === 1) {
    try {
      const query = buildingId ? { buildingId } : {};
      const dbRooms = await Room.find(query).sort({ orderIndex: 1, name: 1 });
      if (dbRooms) return dbRooms.map(r => r.toObject ? r.toObject() : r);
    } catch (e) {}
  }
  return storeData.rooms.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
}

async function createRoom(buildingId, roomData) {
  if (mongoose.connection.readyState === 1) {
    const count = await Room.countDocuments({ buildingId });
    const newRoom = await Room.create({
      ...roomData,
      buildingId,
      orderIndex: count + 1
    });
    return newRoom.toObject();
  }
  const newLocalRoom = {
    _id: `room_${Date.now()}`,
    buildingId,
    ...roomData,
    orderIndex: storeData.rooms.length + 1
  };
  storeData.rooms.push(newLocalRoom);
  saveToFile();
  return newLocalRoom;
}

async function deleteRoom(id) {
  if (mongoose.connection.readyState === 1) {
    await Room.findByIdAndDelete(id);
    await Invoice.deleteMany({ roomId: id });
    return true;
  }
  storeData.rooms = storeData.rooms.filter(r => r._id !== id);
  saveToFile();
  return true;
}

async function updateRoom(id, roomData) {
  let updatedRoom = null;

  // MongoDB update if connected (ưu tiên MongoDB)
  if (mongoose.connection.readyState === 1) {
    try {
      const dbUpdated = await Room.findByIdAndUpdate(id, roomData, { new: true, runValidators: true });
      if (dbUpdated) updatedRoom = dbUpdated.toObject();
    } catch (e) {
      console.warn('MongoDB updateRoom error:', e.message);
    }
  }

  // Local update (fallback hoặc sync)
  const index = storeData.rooms.findIndex(r => r._id === id || r._id?.toString() === id);
  if (index !== -1) {
    storeData.rooms[index] = {
      ...storeData.rooms[index],
      ...(roomData.name !== undefined && { name: roomData.name }),
      ...(roomData.tenantName !== undefined && { tenantName: roomData.tenantName }),
      ...(roomData.tenantPhone !== undefined && { tenantPhone: roomData.tenantPhone }),
      ...(roomData.soNguoi !== undefined && { soNguoi: Number(roomData.soNguoi) }),
      ...(roomData.baseRent !== undefined && { baseRent: Number(roomData.baseRent) }),
      ...(roomData.waterMode !== undefined && { waterMode: roomData.waterMode }),
      ...(roomData.waterAmount !== undefined && { waterAmount: Number(roomData.waterAmount) }),
      ...(roomData.status !== undefined && { status: roomData.status }),
      ...(roomData.contractStart !== undefined && { contractStart: roomData.contractStart }),
      ...(roomData.contractEnd !== undefined && { contractEnd: roomData.contractEnd }),
      ...(roomData.deposit !== undefined && { deposit: Number(roomData.deposit) }),
      ...(roomData.depositNote !== undefined && { depositNote: roomData.depositNote }),
      ...(roomData.parkingMode !== undefined && { parkingMode: roomData.parkingMode }),
      ...(roomData.parkingAmount !== undefined && { parkingAmount: Number(roomData.parkingAmount) }),
      ...(roomData.soXe !== undefined && { soXe: Number(roomData.soXe) })
    };
    if (!updatedRoom) updatedRoom = storeData.rooms[index];
    saveToFile();
  }

  return updatedRoom;
}

async function getConfig(buildingId) {
  if (mongoose.connection.readyState === 1 && buildingId) {
    try {
      let dbConfig = await Config.findOne({ buildingId });
      if (!dbConfig) {
        dbConfig = await Config.create({
          buildingId,
          giaDien: 3800,
          extraFeesDefault: [{ name: 'Phí sinh hoạt', amount: 150000 }]
        });
      }
      return dbConfig.toObject ? dbConfig.toObject() : dbConfig;
    } catch (e) {}
  }
  return storeData.config;
}

async function updateConfig(buildingId, configData) {
  const { giaDien, extraFeesDefault } = configData;

  if (giaDien !== undefined) storeData.config.giaDien = Number(giaDien);
  if (Array.isArray(extraFeesDefault)) storeData.config.extraFeesDefault = extraFeesDefault;
  saveToFile();

  if (mongoose.connection.readyState === 1 && buildingId) {
    try {
      let dbConfig = await Config.findOne({ buildingId });
      if (!dbConfig) dbConfig = new Config({ buildingId });
      if (giaDien !== undefined) dbConfig.giaDien = Number(giaDien);
      if (Array.isArray(extraFeesDefault)) dbConfig.extraFeesDefault = extraFeesDefault;
      await dbConfig.save();
      return dbConfig.toObject();
    } catch (e) {}
  }

  return storeData.config;
}

async function getInvoices(month, buildingId) {
  const rooms = await getRooms(buildingId);
  const config = await getConfig(buildingId);

  if (mongoose.connection.readyState === 1 && buildingId) {
    try {
      const prevMonthStr = getPreviousMonth(month);
      let invoices = await Invoice.find({ month, buildingId }).populate('roomId');
      const existingRoomIds = new Set(invoices.map((inv) => inv.roomId?._id?.toString() || inv.roomId?.toString()));

      const newInvoicesToCreate = [];
      for (const room of rooms) {
        const roomIdStr = room._id.toString();
        if (!existingRoomIds.has(roomIdStr)) {
          const prevInvoice = await Invoice.findOne({ buildingId, roomId: room._id, month: prevMonthStr });
          const oldReading = prevInvoice ? prevInvoice.newReading : 0;
          const defaultFees = config.extraFeesDefault ? config.extraFeesDefault.map(f => ({ name: f.name, amount: f.amount })) : [];

          newInvoicesToCreate.push({
            buildingId,
            roomId: room._id,
            month,
            oldReading,
            newReading: oldReading,
            extraFees: defaultFees,
            paid: false,
            paidDate: null
          });
        }
      }

      if (newInvoicesToCreate.length > 0) {
        await Invoice.insertMany(newInvoicesToCreate);
      }

      invoices = await Invoice.find({ month, buildingId }).populate('roomId');
      return invoices
        .map((inv) => {
          if (!inv.roomId) return null;
          return calculateInvoiceDetails(inv, inv.roomId, config);
        })
        .filter(Boolean)
        .sort((a, b) => (a.room.orderIndex || 0) - (b.room.orderIndex || 0));
    } catch (e) {
      console.warn('Fallback to local invoices storage:', e.message);
    }
  }

  // Fallback
  const prevMonthStr = getPreviousMonth(month);
  const existingRoomIds = new Set(
    storeData.invoices.filter(i => i.month === month).map(i => i.roomId)
  );

  let updated = false;
  for (const room of rooms) {
    if (!existingRoomIds.has(room._id)) {
      const prevInvoice = storeData.invoices.find(i => i.roomId === room._id && i.month === prevMonthStr);
      const oldReading = prevInvoice ? (prevInvoice.newReading || 0) : 0;
      const defaultFees = (config.extraFeesDefault || []).map(f => ({ name: f.name, amount: f.amount }));

      storeData.invoices.push({
        _id: `inv_${room._id}_${month}`,
        roomId: room._id,
        month,
        oldReading,
        newReading: oldReading,
        extraFees: defaultFees,
        paid: false,
        paidDate: null
      });
      updated = true;
    }
  }

  if (updated) saveToFile();

  const monthInvoices = storeData.invoices.filter(i => i.month === month);
  return monthInvoices
    .map((inv) => {
      const roomObj = rooms.find(r => r._id === inv.roomId);
      if (!roomObj) return null;
      return calculateInvoiceDetails(inv, roomObj, config);
    })
    .filter(Boolean)
    .sort((a, b) => (a.room.orderIndex || 0) - (b.room.orderIndex || 0));
}

async function patchInvoice(month, roomId, patchData, buildingId) {
  const { oldReading, newReading, extraFees, paid, soXe } = patchData;
  const config = await getConfig(buildingId);
  let updatedInv = null;

  if (soXe !== undefined) {
    await updateRoom(roomId, { soXe: Number(soXe) });
  }

  // MongoDB Patch if connected
  if (mongoose.connection.readyState === 1) {
    try {
      let dbInv = await Invoice.findOne({ month, roomId });
      if (!dbInv) {
        const prevMonthStr = getPreviousMonth(month);
        const prevInvoice = await Invoice.findOne({ roomId, month: prevMonthStr });
        const roomObj = await Room.findById(roomId);
        dbInv = new Invoice({
          buildingId: buildingId || roomObj?.buildingId,
          roomId,
          month,
          oldReading: prevInvoice ? prevInvoice.newReading : 0,
          newReading: prevInvoice ? prevInvoice.newReading : 0,
          extraFees: config.extraFeesDefault || [],
          paid: false
        });
      }
      if (oldReading !== undefined) dbInv.oldReading = Math.max(0, Number(oldReading));
      if (newReading !== undefined) dbInv.newReading = Math.max(0, Number(newReading));
      if (Array.isArray(extraFees)) dbInv.extraFees = extraFees;
      if (paid !== undefined) {
        dbInv.paid = Boolean(paid);
        dbInv.paidDate = dbInv.paid ? new Date() : null;
      }
      await dbInv.save();
      await dbInv.populate('roomId');

      if (newReading !== undefined) {
        const nextMonthStr = getNextMonth(month);
        const nextDbInv = await Invoice.findOne({ roomId, month: nextMonthStr });
        if (nextDbInv) {
          nextDbInv.oldReading = Math.max(0, Number(newReading));
          await nextDbInv.save();
        }
      }

      return calculateInvoiceDetails(dbInv, dbInv.roomId, config);
    } catch (e) {
      console.warn('MongoDB patchInvoice error:', e.message);
    }
  }

  // Local fallback
  let invIndex = storeData.invoices.findIndex(i => i.month === month && i.roomId === roomId);
  if (invIndex !== -1) {
    const targetInv = storeData.invoices[invIndex];
    if (oldReading !== undefined) targetInv.oldReading = Math.max(0, Number(oldReading));
    if (newReading !== undefined) targetInv.newReading = Math.max(0, Number(newReading));
    if (Array.isArray(extraFees)) targetInv.extraFees = extraFees;
    if (paid !== undefined) {
      targetInv.paid = Boolean(paid);
      targetInv.paidDate = targetInv.paid ? new Date().toISOString() : null;
    }

    // Tự động cập nhật số điện cũ của tháng SAU = số điện mới của tháng này
    if (newReading !== undefined) {
      const nextMonthStr = getNextMonth(month);
      const nextInvIndex = storeData.invoices.findIndex(
        i => i.month === nextMonthStr && i.roomId === roomId
      );
      if (nextInvIndex !== -1) {
        storeData.invoices[nextInvIndex].oldReading = Math.max(0, Number(newReading));
      }
    }

    saveToFile();
    updatedInv = targetInv;
  }

  const rooms = await getRooms(buildingId);
  const roomObj = rooms.find(r => r._id === roomId);
  return calculateInvoiceDetails(updatedInv, roomObj, config);
}

async function getExpenses(month, buildingId) {
  if (mongoose.connection.readyState === 1 && buildingId) {
    try {
      const query = { month, buildingId };
      const dbExpenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });
      if (dbExpenses) return dbExpenses.map(e => (e.toObject ? e.toObject() : e));
    } catch (e) {
      console.warn('MongoDB getExpenses fallback to local:', e.message);
    }
  }
  return storeData.expenses
    .filter(e => e.month === month && (!buildingId || !e.buildingId || e.buildingId.toString() === buildingId.toString()))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

async function createExpense(buildingId, expenseData) {
  const payload = {
    ...expenseData,
    buildingId,
    amount: Math.max(0, Number(expenseData.amount) || 0),
    type: expenseData.type === 'variable' ? 'variable' : 'fixed',
    category: expenseData.category || 'other',
    date: expenseData.date || new Date().toISOString().slice(0, 10),
    isRecurring: Boolean(expenseData.isRecurring)
  };

  if (mongoose.connection.readyState === 1 && buildingId) {
    try {
      const created = await Expense.create(payload);
      return created.toObject ? created.toObject() : created;
    } catch (e) {
      console.warn('MongoDB createExpense error:', e.message);
    }
  }

  const newLocal = {
    _id: `exp_${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  storeData.expenses.push(newLocal);
  saveToFile();
  return newLocal;
}

async function updateExpense(id, expenseData) {
  let updated = null;
  if (mongoose.connection.readyState === 1) {
    try {
      const dbUpdated = await Expense.findByIdAndUpdate(id, expenseData, { new: true, runValidators: true });
      if (dbUpdated) updated = dbUpdated.toObject ? dbUpdated.toObject() : dbUpdated;
    } catch (e) {
      console.warn('MongoDB updateExpense error:', e.message);
    }
  }

  const idx = storeData.expenses.findIndex(e => e._id === id || e._id?.toString() === id?.toString());
  if (idx !== -1) {
    storeData.expenses[idx] = {
      ...storeData.expenses[idx],
      ...expenseData,
      amount: expenseData.amount !== undefined ? Math.max(0, Number(expenseData.amount) || 0) : storeData.expenses[idx].amount,
      updatedAt: new Date().toISOString()
    };
    if (!updated) updated = storeData.expenses[idx];
    saveToFile();
  }

  return updated;
}

async function deleteExpense(id) {
  if (mongoose.connection.readyState === 1) {
    try {
      await Expense.findByIdAndDelete(id);
    } catch (e) {
      console.warn('MongoDB deleteExpense error:', e.message);
    }
  }
  storeData.expenses = storeData.expenses.filter(e => e._id !== id && e._id?.toString() !== id?.toString());
  saveToFile();
  return true;
}

async function copyRecurringExpenses(buildingId, fromMonth, toMonth) {
  const prevExpenses = await getExpenses(fromMonth, buildingId);
  const recurring = prevExpenses.filter(e => e.type === 'fixed' || e.isRecurring);
  const currentExpenses = await getExpenses(toMonth, buildingId);
  const existingTitles = new Set(currentExpenses.map(e => e.title?.trim().toLowerCase()));

  const copied = [];
  for (const item of recurring) {
    if (!existingTitles.has(item.title?.trim().toLowerCase())) {
      const newExp = await createExpense(buildingId, {
        month: toMonth,
        type: 'fixed',
        title: item.title,
        category: item.category,
        amount: item.amount,
        date: `${toMonth}-01`,
        note: item.note || '',
        isRecurring: true
      });
      copied.push(newExp);
    }
  }
  return copied;
}

async function getDashboard(month, buildingId) {
  const rooms = await getRooms(buildingId);
  const invoices = await getInvoices(month, buildingId);
  const expenses = await getExpenses(month, buildingId);

  let tongCanThu = 0;
  let daThu = 0;
  const danhSachPhongNo = [];

  for (const item of invoices) {
    tongCanThu += item.totalAmount;
    if (item.paid) {
      daThu += item.totalAmount;
    } else {
      danhSachPhongNo.push({
        roomId: item.room._id,
        roomName: item.room.name,
        tenantName: item.room.tenantName || 'Trống',
        tenantPhone: item.room.tenantPhone || '',
        totalAmount: item.totalAmount,
        status: item.room.status
      });
    }
  }

  const conThieu = Math.max(0, tongCanThu - daThu);

  // Tính chi phí cố định & chi phí phát sinh
  let chiPhiCoDinh = 0;
  let chiPhiPhatSinh = 0;
  for (const exp of expenses) {
    const amt = Number(exp.amount) || 0;
    if (exp.type === 'fixed') {
      chiPhiCoDinh += amt;
    } else {
      chiPhiPhatSinh += amt;
    }
  }
  const tongChiPhi = chiPhiCoDinh + chiPhiPhatSinh;

  // Lợi nhuận ròng dự kiến (khi thu đủ tiền phòng) và Lợi nhuận thực tế (tiền mặt đã cầm)
  const loiNhuanDuKien = tongCanThu - tongChiPhi;
  const loiNhuanThucTe = daThu - tongChiPhi;
  const tySuatLoiNhuan = tongCanThu > 0 ? Math.round((loiNhuanDuKien / tongCanThu) * 100) : 0;

  const roomStats = {
    totalRooms: rooms.length,
    occupiedCount: rooms.filter((r) => r.status === 'occupied').length,
    vacantCount: rooms.filter((r) => r.status === 'vacant').length
  };

  return {
    month,
    tongCanThu,
    daThu,
    conThieu,
    chiPhiCoDinh,
    chiPhiPhatSinh,
    tongChiPhi,
    loiNhuanDuKien,
    loiNhuanThucTe,
    tySuatLoiNhuan,
    expenses,
    danhSachPhongNo,
    roomStats
  };
}

module.exports = {
  getRooms,
  createRoom,
  deleteRoom,
  updateRoom,
  getConfig,
  updateConfig,
  getInvoices,
  patchInvoice,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  copyRecurringExpenses,
  getDashboard
};
