import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import RoomsManager from './components/RoomsManager';
import InvoiceManager from './components/InvoiceManager';
import Settings from './components/Settings';
import RoomModal from './components/RoomModal';
import ExtraFeesModal from './components/ExtraFeesModal';
import InvoiceReceiptModal from './components/InvoiceReceiptModal';

import {
  fetchRooms,
  updateRoom,
  fetchConfig,
  updateConfig,
  fetchInvoices,
  patchInvoice,
  fetchDashboard
} from './services/api';
import { subscribeToEvents } from './services/socket';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const [rooms, setRooms] = useState([]);
  const [config, setConfig] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [dashboardData, setDashboardData] = useState({});

  // Modals state
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingInvoiceFees, setEditingInvoiceFees] = useState(null);
  const [viewingReceiptInvoice, setViewingReceiptInvoice] = useState(null);

  // Loaders
  const loadData = useCallback(async () => {
    try {
      const [roomsData, configData, invoicesData, dashData] = await Promise.all([
        fetchRooms(),
        fetchConfig(),
        fetchInvoices(selectedMonth),
        fetchDashboard(selectedMonth)
      ]);

      setRooms(roomsData);
      setConfig(configData);
      setInvoices(invoicesData);
      setDashboardData(dashData);
    } catch (err) {
      console.error('Error loading app data:', err);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Subscribe to real-time socket events
  useEffect(() => {
    const unsubscribe = subscribeToEvents({
      onRoomUpdated: (updatedRoom) => {
        setRooms((prev) =>
          prev.map((r) => (r._id === updatedRoom._id ? updatedRoom : r))
        );
        fetchDashboard(selectedMonth).then(setDashboardData).catch(console.error);
        fetchInvoices(selectedMonth).then(setInvoices).catch(console.error);
      },
      onInvoiceUpdated: (updatedCalculatedInvoice) => {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv._id === updatedCalculatedInvoice._id || inv.room?._id === updatedCalculatedInvoice.room?._id
              ? updatedCalculatedInvoice
              : inv
          )
        );
        fetchDashboard(selectedMonth).then(setDashboardData).catch(console.error);
      },
      onConfigUpdated: (updatedConfig) => {
        setConfig(updatedConfig);
        fetchInvoices(selectedMonth).then(setInvoices).catch(console.error);
        fetchDashboard(selectedMonth).then(setDashboardData).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [selectedMonth]);

  // Handlers
  const handleSaveRoom = async (id, roomData) => {
    try {
      const updated = await updateRoom(id, roomData);
      setRooms((prev) => prev.map((r) => (r._id === id ? updated : r)));
      setEditingRoom(null);
    } catch (err) {
      alert('Không thể lưu thông tin phòng: ' + err.message);
    }
  };

  const handlePatchInvoice = async (month, roomId, patchData) => {
    try {
      const updated = await patchInvoice(month, roomId, patchData);
      setInvoices((prev) =>
        prev.map((inv) => (inv.room?._id === roomId ? updated : inv))
      );
    } catch (err) {
      console.error('Failed to patch invoice:', err);
    }
  };

  const handleSaveExtraFees = async (feesList) => {
    if (!editingInvoiceFees) return;
    try {
      const roomId = editingInvoiceFees.room?._id;
      const updated = await patchInvoice(selectedMonth, roomId, { extraFees: feesList });
      setInvoices((prev) =>
        prev.map((inv) => (inv.room?._id === roomId ? updated : inv))
      );
      setEditingInvoiceFees(null);
    } catch (err) {
      alert('Lỗi cập nhật phí phụ thu: ' + err.message);
    }
  };

  const handleSaveConfig = async (newConfig) => {
    try {
      const updated = await updateConfig(newConfig);
      setConfig(updated);
    } catch (err) {
      alert('Lỗi cập nhật cấu hình: ' + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="app-container" style={{ flex: 1, paddingBottom: '40px' }}>
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
          />
        )}

        {activeTab === 'rooms' && (
          <RoomsManager
            rooms={rooms}
            onEditRoom={(room) => setEditingRoom(room)}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoiceManager
            invoices={invoices}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            config={config}
            onPatchInvoice={handlePatchInvoice}
            onOpenExtraFeesModal={(inv) => setEditingInvoiceFees(inv)}
            onOpenReceiptModal={(inv) => setViewingReceiptInvoice(inv)}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            config={config}
            onSaveConfig={handleSaveConfig}
          />
        )}
      </main>

      {/* Modals */}
      {editingRoom && (
        <RoomModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSave={handleSaveRoom}
        />
      )}

      {editingInvoiceFees && (
        <ExtraFeesModal
          invoice={editingInvoiceFees}
          onClose={() => setEditingInvoiceFees(null)}
          onSave={handleSaveExtraFees}
        />
      )}

      {viewingReceiptInvoice && (
        <InvoiceReceiptModal
          invoice={viewingReceiptInvoice}
          onClose={() => setViewingReceiptInvoice(null)}
        />
      )}
    </div>
  );
}

