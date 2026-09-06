const currentMonth = new Date().toISOString().slice(0, 7);

let configStore = {
  giaDien: 3800,
  extraFeesDefault: [
    { name: 'Phí sinh hoạt mỗi phòng', amount: 150000 }
  ]
};

let roomsStore = [
  { _id: '66b000000000000000000001', name: 'Phòng 1', tenantName: 'Nguyễn Văn An', tenantPhone: '0901234567', soNguoi: 2, baseRent: 2500000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', orderIndex: 1 },
  { _id: '66b000000000000000000002', name: 'Phòng 2', tenantName: 'Trần Thị Bình', tenantPhone: '0912345678', soNguoi: 1, baseRent: 2200000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', orderIndex: 2 },
  { _id: '66b000000000000000000003', name: 'Phòng 3', tenantName: 'Lê Minh Cường', tenantPhone: '0923456789', soNguoi: 3, baseRent: 2800000, waterMode: 'fixed', waterAmount: 150000, status: 'occupied', orderIndex: 3 },
  { _id: '66b000000000000000000004', name: 'Phòng 4', tenantName: 'Phạm Hồng Dũng', tenantPhone: '0934567890', soNguoi: 2, baseRent: 2500000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', orderIndex: 4 },
  { _id: '66b000000000000000000005', name: 'Phòng 5', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', orderIndex: 5 },
  { _id: '66b000000000000000000006', name: 'Phòng 6', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', orderIndex: 6 },
  { _id: '66b000000000000000000007', name: 'Phòng 7', tenantName: 'Vũ Hoàng Em', tenantPhone: '0945678901', soNguoi: 2, baseRent: 2600000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', orderIndex: 7 },
  { _id: '66b000000000000000000008', name: 'Phòng 8', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', orderIndex: 8 },
  { _id: '66b000000000000000000009', name: 'Phòng 9', tenantName: 'Đặng Quốc Giang', tenantPhone: '0956789012', soNguoi: 1, baseRent: 2300000, waterMode: 'perPerson', waterAmount: 100000, status: 'occupied', orderIndex: 9 },
  { _id: '66b000000000000000010', name: 'Phòng 10', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', orderIndex: 10 },
  { _id: '66b000000000000000011', name: 'Phòng 11', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', orderIndex: 11 },
  { _id: '66b000000000000000012', name: 'Phòng 12', tenantName: '', tenantPhone: '', soNguoi: 0, baseRent: 2000000, waterMode: 'perPerson', waterAmount: 100000, status: 'vacant', orderIndex: 12 }
];

let invoicesStore = roomsStore.map((room, idx) => ({
  _id: `66b00000000000000000100${idx + 1}`,
  roomId: room._id,
  month: currentMonth,
  oldReading: room.status === 'occupied' ? 100 * (idx + 1) : 0,
  newReading: room.status === 'occupied' ? 100 * (idx + 1) + 45 : 0,
  extraFees: [
    { name: 'Phí sinh hoạt mỗi phòng', amount: 150000 }
  ],
  paid: idx === 0 || idx === 1,
  paidDate: idx === 0 || idx === 1 ? new Date() : null
}));

module.exports = {
  configStore,
  roomsStore,
  invoicesStore
};
