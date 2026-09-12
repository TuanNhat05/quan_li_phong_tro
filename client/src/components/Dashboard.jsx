import React, { useState } from 'react';
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Users,
  Home,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
  Wrench,
  ArrowDownRight,
  TrendingUp,
  Sparkles,
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import { formatVNMoney } from '../utils/formatters';
import ConfirmModal from './ConfirmModal';

export default function Dashboard({
  data,
  rooms,
  selectedMonth,
  setSelectedMonth,
  onSelectRoom,
  onGoToInvoices,
  onPatchInvoice,
  onOpenAddExpense,
  onGoToExpenses,
  onExportExcel,
  isExportingExcel = false
}) {
  const {
    tongCanThu = 0,
    daThu = 0,
    conThieu = 0,
    chiPhiCoDinh = 0,
    chiPhiPhatSinh = 0,
    tongChiPhi = 0,
    loiNhuanDuKien = 0,
    loiNhuanThucTe = 0,
    tySuatLoiNhuan = 0,
    expenses = [],
    danhSachPhongNo = [],
    roomStats = {}
  } = data || {};

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

          <div className="dashboard-month-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
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

            {onExportExcel && (
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  backgroundColor: '#059669',
                  borderColor: '#059669',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)'
                }}
                onClick={onExportExcel}
                disabled={isExportingExcel}
                title="Xuất bảng thu tiền & chi phí ra file Excel theo mẫu chuẩn"
              >
                <FileSpreadsheet size={16} />
                <span>{isExportingExcel ? 'Đang xuất...' : 'Xuất File Excel'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="dashboard-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Card 1: Tổng Cần Thu */}
        <div className="paper-card" style={{ borderLeft: '5px solid var(--teal-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              TỔNG CẦN THU (DOANH THU)
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--teal-bg)', color: 'var(--teal-primary)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.45rem)', fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-word' }}>
            {formatMoney(tongCanThu)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
            <span>Đã thu: <strong style={{ color: 'var(--emerald-primary)' }}>{formatMoney(daThu)}</strong></span>
            <span>Nợ: <strong style={{ color: 'var(--rose-primary)' }}>{formatMoney(conThieu)}</strong></span>
          </div>
        </div>

        {/* Card 2: Chi Phí Cố Định */}
        <div className="paper-card" style={{ borderLeft: '5px solid var(--amber-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              CHI PHÍ CỐ ĐỊNH
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--amber-bg)', color: 'var(--amber-primary)' }}>
              <Layers size={20} />
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.45rem)', fontWeight: 700, color: 'var(--amber-primary)', wordBreak: 'break-word' }}>
            − {formatMoney(chiPhiCoDinh)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Mặt bằng, Internet, Rác...
          </div>
        </div>

        {/* Card 3: Chi Phí Phát Sinh */}
        <div className="paper-card" style={{ borderLeft: '5px solid #7C3AED' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              CHI PHÍ PHÁT SINH
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED' }}>
              <Wrench size={20} />
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.45rem)', fontWeight: 700, color: '#7C3AED', wordBreak: 'break-word' }}>
            − {formatMoney(chiPhiPhatSinh)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sửa điện nước, bóng đèn...
          </div>
        </div>

        {/* Card 4: Lợi Nhuận Ròng Dự Kiến */}
        <div
          className="paper-card"
          style={{
            borderLeft: `5px solid ${loiNhuanDuKien >= 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)'}`,
            background: loiNhuanDuKien >= 0 ? 'rgba(5, 150, 105, 0.05)' : 'rgba(225, 29, 72, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: loiNhuanDuKien >= 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)', textTransform: 'uppercase' }}>
              LỢI NHUẬN RÒNG DỰ KIẾN
            </span>
            <div
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: loiNhuanDuKien >= 0 ? 'var(--emerald-bg)' : 'var(--rose-bg)',
                color: loiNhuanDuKien >= 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)'
              }}
            >
              <DollarSign size={20} />
            </div>
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 'clamp(1.15rem, 3.5vw, 1.45rem)',
              fontWeight: 800,
              color: loiNhuanDuKien >= 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)',
              wordBreak: 'break-word'
            }}
          >
            {formatMoney(loiNhuanDuKien)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Thực tế đã cầm: <strong style={{ color: loiNhuanThucTe >= 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)' }}>{formatMoney(loiNhuanThucTe)}</strong>
          </div>
        </div>
      </div>

      {/* Visual Cashflow Ledger & Expense Formula Section */}
      <div className="paper-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--teal-primary)" />
              <span>Cân Đối Dòng Tiền & Tự Động Khấu Trừ Chi Phí</span>
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Công thức hạch toán tự động lấy Tổng Cần Thu trừ đi Chi Phí Cố Định và Chi Phí Phát Sinh
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {onOpenAddExpense && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: 'var(--teal-primary)', borderColor: 'var(--teal-primary)' }}
                onClick={onOpenAddExpense}
              >
                <Plus size={15} />
                <span>Thêm Khoản Chi</span>
              </button>
            )}

            {onGoToExpenses && (
              <button type="button" className="btn btn-outline btn-sm" onClick={onGoToExpenses}>
                <span>Chi tiết chi phí</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Visual Deduction Formula Banner */}
        <div
          className="dashboard-formula-banner"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '14px 18px',
            backgroundColor: 'var(--bg-paper-alt)',
            borderRadius: '12px',
            border: '1px solid var(--border-paper)',
            marginBottom: '16px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Tổng Thu */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>TỔNG CẦN THU</span>
            <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--teal-primary)' }}>
              {formatMoney(tongCanThu)}
            </span>
          </div>

          <span className="formula-operator" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>−</span>

          {/* Chi Cố Định */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>CHI CỐ ĐỊNH</span>
            <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--amber-primary)' }}>
              {formatMoney(chiPhiCoDinh)}
            </span>
          </div>

          <span className="formula-operator" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>−</span>

          {/* Chi Phát Sinh */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>CHI PHÁT SINH</span>
            <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#7C3AED' }}>
              {formatMoney(chiPhiPhatSinh)}
            </span>
          </div>

          <span className="formula-operator" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>=</span>

          {/* Lợi Nhuận Ròng */}
          <div
            style={{
              textAlign: 'center',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: loiNhuanDuKien >= 0 ? 'var(--emerald-bg)' : 'var(--rose-bg)',
              border: `1px solid ${loiNhuanDuKien >= 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)'}`
            }}
          >
            <span style={{ fontSize: '0.75rem', color: loiNhuanDuKien >= 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)', display: 'block', fontWeight: 700 }}>
              LỢI NHUẬN RÒNG
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: loiNhuanDuKien >= 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)'
              }}
            >
              {formatMoney(loiNhuanDuKien)}
            </span>
          </div>
        </div>

        {/* Visual Progress Breakdown Bar */}
        {tongCanThu > 0 && (
          <div>
            <div
              style={{
                height: '18px',
                width: '100%',
                backgroundColor: 'var(--bg-paper-alt)',
                borderRadius: '9px',
                overflow: 'hidden',
                display: 'flex',
                marginBottom: '10px'
              }}
            >
              {chiPhiCoDinh > 0 && (
                <div
                  style={{
                    width: `${Math.min(100, Math.round((chiPhiCoDinh / tongCanThu) * 100))}%`,
                    backgroundColor: 'var(--amber-primary)',
                    height: '100%'
                  }}
                  title={`Chi phí cố định: ${formatMoney(chiPhiCoDinh)}`}
                />
              )}
              {chiPhiPhatSinh > 0 && (
                <div
                  style={{
                    width: `${Math.min(100, Math.round((chiPhiPhatSinh / tongCanThu) * 100))}%`,
                    backgroundColor: '#7C3AED',
                    height: '100%'
                  }}
                  title={`Chi phí phát sinh: ${formatMoney(chiPhiPhatSinh)}`}
                />
              )}
              {loiNhuanDuKien > 0 && (
                <div
                  style={{
                    width: `${Math.max(0, 100 - Math.min(100, Math.round((tongChiPhi / tongCanThu) * 100)))}%`,
                    backgroundColor: 'var(--emerald-primary)',
                    height: '100%'
                  }}
                  title={`Lợi nhuận ròng: ${formatMoney(loiNhuanDuKien)}`}
                />
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--amber-primary)', display: 'inline-block' }} />
                <span>Chi phí cố định: <strong>{formatMoney(chiPhiCoDinh)}</strong> ({Math.round((chiPhiCoDinh / tongCanThu) * 100)}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#7C3AED', display: 'inline-block' }} />
                <span>Chi phí phát sinh: <strong>{formatMoney(chiPhiPhatSinh)}</strong> ({Math.round((chiPhiPhatSinh / tongCanThu) * 100)}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--emerald-primary)', display: 'inline-block' }} />
                <span>Lợi nhuận thuần: <strong>{formatMoney(loiNhuanDuKien)}</strong> ({tySuatLoiNhuan}%)</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Recent Expenses List */}
        {expenses && expenses.length > 0 && (
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-paper)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Các khoản chi trong tháng ({expenses.length}):
              </span>
              {onGoToExpenses && (
                <button
                  type="button"
                  onClick={onGoToExpenses}
                  style={{ background: 'none', border: 'none', color: 'var(--teal-primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Xem tất cả ({expenses.length}) ➔
                </button>
              )}
            </div>

            <div className="dashboard-quick-expenses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
              {expenses.slice(0, 4).map((exp) => (
                <div
                  key={exp._id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-paper-alt)',
                    border: '1px solid var(--border-paper)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ overflow: 'hidden', paddingRight: '8px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {exp.title}
                    </div>
                    <span
                      className={`badge ${exp.type === 'fixed' ? 'badge-amber' : ''}`}
                      style={{
                        fontSize: '0.65rem',
                        padding: '1px 5px',
                        backgroundColor: exp.type === 'fixed' ? undefined : 'rgba(124, 58, 237, 0.12)',
                        color: exp.type === 'fixed' ? undefined : '#7C3AED'
                      }}
                    >
                      {exp.type === 'fixed' ? 'Cố định' : 'Phát sinh'}
                    </span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--rose-primary)', whiteSpace: 'nowrap' }}>
                    − {formatMoney(exp.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid of 12 Rooms Status Map */}
      <div className="paper-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Home size={20} color="var(--teal-primary)" />
            <span>Sơ Đồ {rooms.length} Phòng Trọ</span>
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-teal">● Đang ở ({roomStats.occupiedCount || 0})</span>
            <span className="badge badge-gray">○ Trống ({roomStats.vacantCount || 0})</span>
          </div>
        </div>

        <div className="rooms-status-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
          {rooms.map((room) => {
            const isOccupied = room.status === 'occupied';
            const unpaidInfo = danhSachPhongNo.find((item) =>
              item.roomId === room._id || item.roomId?.toString() === room._id?.toString()
            );

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
