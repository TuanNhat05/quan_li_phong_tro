import React, { useState } from 'react';
import { DollarSign, CheckCircle2, AlertCircle, Users, Home, ArrowRight, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatVNMoney } from '../utils/formatters';
import ConfirmModal from './ConfirmModal';

export default function Dashboard({ data, rooms, selectedMonth, setSelectedMonth, onSelectRoom, onGoToInvoices, onPatchInvoice }) {
  const { tongCanThu = 0, daThu = 0, conThieu = 0, danhSachPhongNo = [], roomStats = {} } = data || {};

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    isPaidTarget: false,
    roomId: ''
  });

  const formatMoney = formatVNMoney;

  const handlePrevMonth = () => {
    const [yearStr, mStr] = selectedMonth.split('-');
    let year = parseInt(yearStr, 10);
    let m = parseInt(mStr, 10);
    if (m === 1) {
      year -= 1;
      m = 12;
    } else {
      m -= 1;
    }
    setSelectedMonth(`${year}-${m < 10 ? '0' + m : m}`);
  };

  const handleNextMonth = () => {
    const [yearStr, mStr] = selectedMonth.split('-');
    let year = parseInt(yearStr, 10);
    let m = parseInt(mStr, 10);
    if (m === 12) {
      year += 1;
      m = 1;
    } else {
      m += 1;
    }
    setSelectedMonth(`${year}-${m < 10 ? '0' + m : m}`);
  };

  const handleCurrentMonth = () => {
    const today = new Date().toISOString().slice(0, 7);
    setSelectedMonth(today);
  };

  const triggerPaymentToggle = (roomName, roomId, currentUnpaid) => {
    const isPaidTarget = !!currentUnpaid;
    setConfirmModal({
      isOpen: true,
      title: isPaidTarget ? `Xác Nhận Thu Tiền ${roomName}` : `Xác Nhận Đổi Sang Chưa Thu - ${roomName}`,
      message: isPaidTarget
        ? `Bạn có chắc chắn muốn chuyển trạng thái phòng ${roomName} (Tháng ${selectedMonth}) từ "Chưa thu" sang "ĐÃ THU TIỀN"?`
        : `Bạn có chắc chắn muốn chuyển trạng thái phòng ${roomName} (Tháng ${selectedMonth}) từ "Đã đóng" sang "CHƯA THU TIỀN"?`,
      isPaidTarget,
      roomId
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Month Header Banner */}
      <div className="paper-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={22} color="var(--teal-primary)" />
            <span>Báo Cáo Tổng Quan - Tháng {selectedMonth}</span>
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Cập nhật tự động thời gian thực từ dữ liệu hóa đơn và phòng</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div className="badge badge-teal" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
            <Users size={15} />
            <span>{roomStats.occupiedCount || 0}/{roomStats.totalRooms || 12} Phòng có người ở</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button className="btn btn-outline btn-sm" onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
              <span>Tháng trước</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleCurrentMonth}>
              Tháng hiện tại
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleNextMonth}>
              <span>Tháng sau</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="paper-card" style={{ borderLeft: '5px solid var(--teal-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TỔNG CẦN THU</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--teal-bg)', color: 'var(--teal-primary)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {formatMoney(tongCanThu)}
          </div>
        </div>

        <div className="paper-card" style={{ borderLeft: '5px solid var(--emerald-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ĐÃ THU TỔNG CỘNG</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--emerald-bg)', color: 'var(--emerald-primary)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--emerald-primary)' }}>
            {formatMoney(daThu)}
          </div>
        </div>

        <div className="paper-card" style={{ borderLeft: '5px solid var(--rose-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CÒN THIẾU (CHƯA THU)</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--rose-bg)', color: 'var(--rose-primary)' }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--rose-primary)' }}>
            {formatMoney(conThieu)}
          </div>
        </div>
      </div>

      {/* Grid of 12 Rooms Status Map */}
      <div className="paper-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Home size={20} color="var(--teal-primary)" />
            <span>Sơ Đồ 12 Phòng Trọ</span>
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-teal">● Đang ở ({roomStats.occupiedCount || 0})</span>
            <span className="badge badge-gray">○ Trống ({roomStats.vacantCount || 0})</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {rooms.map((room) => {
            const isOccupied = room.status === 'occupied';
            const unpaidInfo = danhSachPhongNo.find((item) => item.roomId === room._id);

            return (
              <div
                key={room._id}
                onClick={() => onSelectRoom(room)}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: `1px solid ${isOccupied ? 'var(--border-paper-dark)' : 'var(--border-paper)'}`,
                  backgroundColor: isOccupied ? 'var(--bg-paper-card)' : 'var(--bg-paper-alt)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem' }}>{room.name}</span>
                  <span style={{ fontSize: '0.75rem' }}>{isOccupied ? '🟢' : '⚪'}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {room.tenantName || 'Chưa có khách'}
                </div>
                {isOccupied && (
                  <div style={{ marginTop: '8px' }}>
                    {unpaidInfo ? (
                      <span
                        className="badge badge-rose"
                        style={{ fontSize: '0.7rem', width: '100%', justifyContent: 'center', cursor: 'pointer' }}
                        title="Bấm để xác nhận Thu Tiền"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerPaymentToggle(room.name, room._id, true);
                        }}
                      >
                        Chưa thu
                      </span>
                    ) : (
                      <span
                        className="badge badge-emerald"
                        style={{ fontSize: '0.7rem', width: '100%', justifyContent: 'center', cursor: 'pointer' }}
                        title="Bấm để đổi sang Chưa Thu"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerPaymentToggle(room.name, room._id, false);
                        }}
                      >
                        Đã đóng
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Unpaid Rooms Table */}
      <div className="paper-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--rose-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            <span>Danh Sách Phòng Chưa Thu Tiền ({danhSachPhongNo.length})</span>
          </h3>
          <button className="btn btn-outline btn-sm" onClick={onGoToInvoices}>
            <span>Đến trang hóa đơn</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {danhSachPhongNo.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--emerald-primary)', background: 'var(--emerald-bg)', borderRadius: '8px' }}>
            🎉 Tất cả các phòng đã hoàn tất đóng tiền cho tháng này!
          </div>
        ) : (
          <div className="ledger-table-container">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Tên phòng</th>
                  <th>Người thuê</th>
                  <th>Số điện thoại</th>
                  <th>Số tiền cần thu</th>
                  <th>Trạng thái (Bấm để thu)</th>
                </tr>
              </thead>
              <tbody>
                {danhSachPhongNo.map((item) => (
                  <tr key={item.roomId}>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{item.roomName}</td>
                    <td>{item.tenantName}</td>
                    <td>{item.tenantPhone || '---'}</td>
                    <td className="font-mono" style={{ fontWeight: 700, color: 'var(--rose-primary)' }}>
                      {formatMoney(item.totalAmount)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        style={{
                          backgroundColor: 'var(--rose-bg)',
                          color: 'var(--rose-primary)',
                          borderColor: 'var(--rose-primary)',
                          fontSize: '0.775rem',
                          padding: '4px 10px'
                        }}
                        title="Bấm để chuyển sang Đã Thu Tiền"
                        onClick={() => triggerPaymentToggle(item.roomName, item.roomId, true)}
                      >
                        <AlertCircle size={13} />
                        <span>Chưa thu ➔ Đã thu</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isPaidTarget={confirmModal.isPaidTarget}
        onConfirm={() => {
          if (onPatchInvoice && confirmModal.roomId) {
            onPatchInvoice(selectedMonth, confirmModal.roomId, { paid: confirmModal.isPaidTarget });
          }
        }}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

