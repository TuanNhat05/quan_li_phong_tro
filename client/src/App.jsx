import React, { useState, useEffect, useCallback } from 'react';
import AIBackground from './components/AIBackground';
import useRipple from './utils/useRipple';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import RoomsManager from './components/RoomsManager';
import InvoiceManager from './components/InvoiceManager';
import ExpensesManager from './components/ExpensesManager';
import Settings from './components/Settings';
import RoomModal from './components/RoomModal';
import ExtraFeesModal from './components/ExtraFeesModal';
import InvoiceReceiptModal from './components/InvoiceReceiptModal';
import BuildingModal from './components/BuildingModal';
import ExpenseModal from './components/ExpenseModal';
import { exportMonthlyReportToExcel } from './utils/excelExporter';

import {
  fetchBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  fetchRooms,
  createRoom,
  updateRoom,
  fetchConfig,
  updateConfig,
  fetchInvoices,
  patchInvoice,
  fetchDashboard,
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  copyRecurringExpenses
} from './services/api';
import { subscribeToEvents } from './services/socket';

export default function App() {
  useRipple(); // 🌊 Global ripple animation for all .btn clicks
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  // Buildings state
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');

  const [rooms, setRooms] = useState([]);
  const [config, setConfig] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dashboardData, setDashboardData] = useState({});

  // Modals state
  const [editingBuilding, setEditingBuilding] = useState(null); // null = close, {} = create, obj = edit
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);

  const [editingRoom, setEditingRoom] = useState(null);
  const [editingInvoiceFees, setEditingInvoiceFees] = useState(null);
  const [viewingReceiptInvoice, setViewingReceiptInvoice] = useState(null);

  const [editingExpense, setEditingExpense] = useState(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Load buildings list on mount
  useEffect(() => {
    fetchBuildings()
      .then((data) => {
        setBuildings(data);
        if (data.length > 0 && !selectedBuildingId) {
          setSelectedBuildingId(data[0]._id);
        }
      })
      .catch(console.error);
  }, []);

  // Load data according to selectedBuildingId and selectedMonth
  const loadData = useCallback(async () => {
    if (!selectedBuildingId) return;
    try {
      const [roomsData, configData, invoicesData, dashData, expensesRes] = await Promise.all([
        fetchRooms(selectedBuildingId),
        fetchConfig(selectedBuildingId),
        fetchInvoices(selectedMonth, selectedBuildingId),
        fetchDashboard(selectedMonth, selectedBuildingId),
        fetchExpenses(selectedMonth, selectedBuildingId).catch(() => ({ expenses: [] }))
      ]);

      setRooms(roomsData);
      setConfig(configData);
      setInvoices(invoicesData);
      setDashboardData(dashData);
      setExpenses(expensesRes?.expenses || dashData?.expenses || []);
    } catch (err) {
      console.error('Error loading app data:', err);
    }
  }, [selectedBuildingId, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Subscribe to real-time socket events
  useEffect(() => {
    const unsubscribe = subscribeToEvents({
      onRoomUpdated: () => {
        loadData();
      },
      onInvoiceUpdated: () => {
        loadData();
      },
      onConfigUpdated: () => {
        loadData();
      },
      onExpenseUpdated: () => {
        loadData();
      }
    });

    return () => unsubscribe();
  }, [loadData]);

  // Building Handlers
  const handleSaveBuilding = async (buildingData) => {
    try {
      if (editingBuilding && editingBuilding._id) {
        const updated = await updateBuilding(editingBuilding._id, buildingData);
        setBuildings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
      } else {
        const created = await createBuilding(buildingData);
        setBuildings((prev) => [...prev, created]);
        setSelectedBuildingId(created._id);
      }
      setIsBuildingModalOpen(false);
      setEditingBuilding(null);
    } catch (err) {
      alert('Không thể lưu thông tin căn nhà: ' + err.message);
    }
  };

  const handleDeleteBuilding = async (building) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa căn nhà "${building.name}" và toàn bộ phòng, hóa đơn của căn này?`)) {
      return;
    }
    try {
      await deleteBuilding(building._id);
      const remaining = buildings.filter((b) => b._id !== building._id);
      setBuildings(remaining);
      if (remaining.length > 0) {
        setSelectedBuildingId(remaining[0]._id);
      } else {
        setSelectedBuildingId('');
      }
    } catch (err) {
      alert('Không thể xóa căn nhà: ' + err.message);
    }
  };

  // Room Handlers
  const handleAddRoom = async () => {
    if (!selectedBuildingId) {
      alert('Vui lòng chọn hoặc tạo căn nhà trước!');
      return;
    }
    const nextRoomNum = rooms.length + 1;
    const roomData = {
      name: `Phòng ${nextRoomNum}`,
      tenantName: '',
      tenantPhone: '',
      soNguoi: 0,
      baseRent: 2500000,
      waterMode: 'perPerson',
      waterAmount: 100000,
      status: 'vacant',
      contractStart: '',
      contractEnd: '',
      deposit: 0,
      depositNote: '',
      parkingMode: 'perVehicle',
      parkingAmount: 150000,
      soXe: 0
    };
    try {
      const created = await createRoom(selectedBuildingId, roomData);
      setRooms((prev) => [...prev, created]);
      setEditingRoom(created);
    } catch (err) {
      alert('Lỗi tạo phòng mới: ' + err.message);
    }
  };

  const handleSaveRoom = async (id, roomData) => {
    try {
      const updated = await updateRoom(id, roomData);
      setRooms((prev) => prev.map((r) => (r._id === id ? updated : r)));
      setEditingRoom(null);
      loadData();
    } catch (err) {
      alert('Không thể lưu thông tin phòng: ' + err.message);
    }
  };

  const handlePatchInvoice = async (month, roomId, patchData) => {
    try {
      const updated = await patchInvoice(month, roomId, patchData, selectedBuildingId);
      setInvoices((prev) =>
        prev.map((inv) => (inv.room?._id === roomId ? updated : inv))
      );
      fetchDashboard(selectedMonth, selectedBuildingId).then(setDashboardData).catch(console.error);
    } catch (err) {
      console.error('Failed to patch invoice:', err);
    }
  };

  const handleSaveExtraFees = async (feesList) => {
    if (!editingInvoiceFees) return;
    try {
      const roomId = editingInvoiceFees.room?._id;
      const updated = await patchInvoice(selectedMonth, roomId, { extraFees: feesList }, selectedBuildingId);
      setInvoices((prev) =>
        prev.map((inv) => (inv.room?._id === roomId ? updated : inv))
      );
      setEditingInvoiceFees(null);
      fetchDashboard(selectedMonth, selectedBuildingId).then(setDashboardData).catch(console.error);
    } catch (err) {
      alert('Lỗi cập nhật phí phụ thu: ' + err.message);
    }
  };

  const handleSaveConfig = async (newConfig) => {
    try {
      const updated = await updateConfig(selectedBuildingId, newConfig);
      setConfig(updated);
      loadData();
    } catch (err) {
      alert('Lỗi cập nhật cấu hình: ' + err.message);
    }
  };

  // Expenses Handlers
  const handleSaveExpense = async (expenseData) => {
    try {
      if (editingExpense && editingExpense._id) {
        await updateExpense(editingExpense._id, expenseData);
      } else {
        await createExpense({ ...expenseData, buildingId: selectedBuildingId });
      }
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
      loadData();
    } catch (err) {
      alert('Lỗi lưu khoản chi phí: ' + err.message);
    }
  };

  const handleDeleteExpense = async (expense) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khoản chi "${expense.title}"?`)) {
      return;
    }
    try {
      await deleteExpense(expense._id);
      loadData();
    } catch (err) {
      alert('Lỗi xóa khoản chi phí: ' + err.message);
    }
  };

  const handleCopyRecurringExpenses = async () => {
    const [yearStr, mStr] = selectedMonth.split('-');
    let year = parseInt(yearStr, 10);
    let m = parseInt(mStr, 10);
    if (m === 1) {
      year -= 1;
      m = 12;
    } else {
      m -= 1;
    }
    const prevMonthStr = `${year}-${m < 10 ? '0' + m : m}`;

    if (!window.confirm(`Sao chép các khoản chi phí cố định (như tiền nhà gốc, mạng, rác...) từ tháng ${prevMonthStr} sang tháng ${selectedMonth}?`)) {
      return;
    }

    try {
      const res = await copyRecurringExpenses(selectedBuildingId, prevMonthStr, selectedMonth);
      alert(`Đã sao chép thành công ${res.copiedCount} khoản chi phí cố định!`);
      loadData();
    } catch (err) {
      alert('Lỗi sao chép chi phí: ' + err.message);
    }
  };

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const currentBuilding = buildings.find((b) => b._id === selectedBuildingId) || buildings[0];
      await exportMonthlyReportToExcel({
        building: currentBuilding,
        selectedMonth,
        invoices,
        expenses,
        config
      });
    } catch (err) {
      console.error('Lỗi khi xuất file Excel:', err);
      alert('Có lỗi khi xuất file Excel: ' + err.message);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: 'transparent', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* AI Neural Network Background Animation */}
      <AIBackground />
      {/* Content Layer - above canvas */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        buildings={buildings}
        selectedBuildingId={selectedBuildingId}
        setSelectedBuildingId={setSelectedBuildingId}
        onOpenAddBuilding={() => {
          setEditingBuilding(null);
          setIsBuildingModalOpen(true);
        }}
        onOpenEditBuilding={(b) => {
          setEditingBuilding(b);
          setIsBuildingModalOpen(true);
        }}
        onDeleteBuilding={handleDeleteBuilding}
      />

      <main className="app-container" style={{ flex: 1, paddingBottom: '40px', marginTop: '20px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0, overflowX: 'hidden' }}>
        {activeTab === 'dashboard' && (
          <Dashboard
            data={dashboardData}
            rooms={rooms}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onSelectRoom={(room) => {
              setEditingRoom(room);
            }}
            onGoToInvoices={() => setActiveTab('invoices')}
            onPatchInvoice={handlePatchInvoice}
            onOpenAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onGoToExpenses={() => setActiveTab('expenses')}
            onExportExcel={handleExportExcel}
            isExportingExcel={isExportingExcel}
          />
        )}

        {activeTab === 'rooms' && (
          <RoomsManager
            rooms={rooms}
            onEditRoom={(room) => setEditingRoom(room)}
            onAddRoom={handleAddRoom}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoiceManager
            invoices={invoices}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            config={config}
            onPatchInvoice={handlePatchInvoice}
            onOpenExtraFeesModal={(invoice) => setEditingInvoiceFees(invoice)}
            onOpenReceiptModal={(invoice) => setViewingReceiptInvoice(invoice)}
            onExportExcel={handleExportExcel}
            isExportingExcel={isExportingExcel}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesManager
            expenses={expenses}
            rooms={rooms}
            dashboardData={dashboardData}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onAddCommission={() => {
              setEditingExpense({
                type: 'variable',
                title: '',
                category: 'other',
                amount: '',
                date: `${selectedMonth}-01`,
                note: 'đã chuyển',
                isRecurring: false
              });
              setIsExpenseModalOpen(true);
            }}
            onEditExpense={(exp) => {
              setEditingExpense(exp);
              setIsExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onCopyRecurring={handleCopyRecurringExpenses}
            onExportExcel={handleExportExcel}
            isExportingExcel={isExportingExcel}
          />
        )}

        {activeTab === 'settings' && (
          <Settings config={config} onSaveConfig={handleSaveConfig} />
        )}
      </main>

      {/* Modals */}
      <RoomModal
        room={editingRoom}
        onClose={() => setEditingRoom(null)}
        onSave={handleSaveRoom}
      />

      <ExtraFeesModal
        invoice={editingInvoiceFees}
        onClose={() => setEditingInvoiceFees(null)}
        onSave={handleSaveExtraFees}
      />

      <InvoiceReceiptModal
        invoice={viewingReceiptInvoice}
        onClose={() => setViewingReceiptInvoice(null)}
      />

      <BuildingModal
        isOpen={isBuildingModalOpen}
        building={editingBuilding}
        onClose={() => {
          setIsBuildingModalOpen(false);
          setEditingBuilding(null);
        }}
        onSave={handleSaveBuilding}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        expense={editingExpense}
        rooms={rooms}
        selectedMonth={selectedMonth}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
      />
    </div>
    </div>
  );
}
