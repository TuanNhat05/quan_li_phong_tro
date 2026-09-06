import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Layers,
  Wrench,
  TrendingUp,
  ArrowDownRight,
  Copy,
  Sparkles,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { formatVNMoney } from '../utils/formatters';

const CATEGORY_NAMES = {
  rent: 'Mặt bằng / Nhà gốc',
  utilities: 'Điện / Nước tổng',
  internet: 'Internet / Wifi',
  maintenance: 'Sửa chữa & Bảo trì',
  cleaning: 'Rác & Vệ sinh',
  security: 'An ninh / Bảo vệ',
  other: 'Chi phí khác'
};

export default function ExpensesManager({
  expenses = [],
  rooms = [],
  dashboardData = {},
  selectedMonth,
  setSelectedMonth,
  onAddExpense,
  onAddCommission,
  onEditExpense,
  onDeleteExpense,
  onCopyRecurring,
  onExportExcel,
  isExportingExcel = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'fixed' | 'variable'
  const [filterCategory, setFilterCategory] = useState('all');

  const {
    tongCanThu = 0,
    daThu = 0,
    conThieu = 0,
    chiPhiCoDinh = 0,
    chiPhiPhatSinh = 0,
    tongChiPhi = 0,
    loiNhuanDuKien = 0,
    loiNhuanThucTe = 0,
    tySuatLoiNhuan = 0
  } = dashboardData || {};

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

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchSearch =
        !searchTerm ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.note?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'all' || item.type === filterType;
      const matchCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchSearch && matchType && matchCategory;
    });
  }, [expenses, searchTerm, filterType, filterCategory]);

  // Breakdown percentages relative to tongCanThu
  const fixedPercent = tongCanThu > 0 ? Math.min(100, Math.round((chiPhiCoDinh / tongCanThu) * 100)) : 0;
  const variablePercent = tongCanThu > 0 ? Math.min(100, Math.round((chiPhiPhatSinh / tongCanThu) * 100)) : 0;
  const profitPercent = tongCanThu > 0 ? Math.max(0, 100 - fixedPercent - variablePercent) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Navigation */}
      <div
        className="paper-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={22} color="var(--amber-primary)" />
            <span>Quản Lý Chi Phí & Lợi Nhuận — Tháng {selectedMonth}</span>
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Tự động khấu trừ chi phí cố định & phát sinh vào tổng doanh thu để tính lợi nhuận ròng
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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

          <button
            className="btn btn-primary btn-sm"
            style={{ backgroundColor: 'var(--teal-primary)', borderColor: 'var(--teal-primary)' }}
            onClick={onAddExpense}
          >
            <Plus size={16} />
            <span>Thêm Khoản Chi</span>
          </button>
        </div>
      </div>

      {/* 5 Financial Summary Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* 1. Tổng Cần Thu */}
        <div className="paper-card" style={{ borderLeft: '5px solid var(--teal-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              1. TỔNG CẦN THU
            </span>
            <div style={{ padding: '7px', borderRadius: '8px', background: 'var(--teal-bg)', color: 'var(--teal-primary)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {formatVNMoney(tongCanThu)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--emerald-primary)', marginTop: '4px' }}>
            Đã thu thực tế: {formatVNMoney(daThu)}
          </div>
        </div>

        {/* 2. Chi Phí Cố Định */}
        <div className="paper-card" style={{ borderLeft: '5px solid var(--amber-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              2. CHI PHÍ CỐ ĐỊNH
            </span>
            <div style={{ padding: '7px', borderRadius: '8px', background: 'var(--amber-bg)', color: 'var(--amber-primary)' }}>
              <Layers size={18} />
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--amber-primary)' }}>
            {formatVNMoney(chiPhiCoDinh)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Mặt bằng, Internet, Rác...
          </div>
        </div>

        {/* 3. Chi Phí Phát Sinh */}
        <div className="paper-card" style={{ borderLeft: '5px solid #7C3AED' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              3. CHI PHÍ PHÁT SINH
            </span>
            <div style={{ padding: '7px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED' }}>
              <Wrench size={18} />
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 700, color: '#7C3AED' }}>
            {formatVNMoney(chiPhiPhatSinh)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sửa điện nước, thay bóng đèn...
          </div>
        </div>

        {/* 4. Tổng Chi Phí */}
        <div className="paper-card" style={{ borderLeft: '5px solid var(--rose-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              4. TỔNG CHI PHÍ (2+3)
            </span>
            <div style={{ padding: '7px', borderRadius: '8px', background: 'var(--rose-bg)', color: 'var(--rose-primary)' }}>
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--rose-primary)' }}>
            {formatVNMoney(tongChiPhi)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Chiếm {tongCanThu > 0 ? Math.round((tongChiPhi / tongCanThu) * 100) : 0}% tổng thu
          </div>
        </div>

        {/* 5. Lợi Nhuận Ròng Dự Kiến */}
        <div
          className="paper-card"
          style={{
            borderLeft: `5px solid ${loiNhuanDuKien >= 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)'}`,
            background: loiNhuanDuKien >= 0 ? 'rgba(5, 150, 105, 0.05)' : 'rgba(225, 29, 72, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: loiNhuanDuKien >= 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)', textTransform: 'uppercase' }}>
              5. LỢI NHUẬN RÒNG (1 − 4)
            </span>
            <div
              style={{
                padding: '7px',
                borderRadius: '8px',
                background: loiNhuanDuKien >= 0 ? 'var(--emerald-bg)' : 'var(--rose-bg)',
                color: loiNhuanDuKien >= 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)'
              }}
            >
              <DollarSign size={18} />
            </div>
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: '1.55rem',
              fontWeight: 800,
              color: loiNhuanDuKien >= 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)'
            }}
          >
            {formatVNMoney(loiNhuanDuKien)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Thực tế đã cầm: <strong style={{ color: loiNhuanThucTe >= 0 ? 'var(--emerald-primary)' : 'var(--rose-primary)' }}>{formatVNMoney(loiNhuanThucTe)}</strong>
          </div>
        </div>
      </div>

      {/* Visual Cashflow Breakdown Progress Bar */}
      <div className="paper-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--teal-primary)" />
              <span>Cơ Cấu Dòng Tiền & Tỷ Lệ Lợi Nhuận Tháng {selectedMonth}</span>
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Trực quan hóa mức độ phân bổ của chi phí cố định, chi phí phát sinh so với tổng doanh thu
            </p>
          </div>

          <div className="badge badge-teal" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            Tỷ suất lợi nhuận: <strong style={{ marginLeft: '4px' }}>{tySuatLoiNhuan}%</strong>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div
          style={{
            height: '24px',
            width: '100%',
            backgroundColor: 'var(--bg-paper-alt)',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          {fixedPercent > 0 && (
            <div
              style={{
                width: `${fixedPercent}%`,
                backgroundColor: 'var(--amber-primary)',
                height: '100%',
                transition: 'width 0.4s ease'
              }}
              title={`Chi phí cố định: ${formatVNMoney(chiPhiCoDinh)} (${fixedPercent}%)`}
            />
          )}
          {variablePercent > 0 && (
            <div
              style={{
                width: `${variablePercent}%`,
                backgroundColor: '#7C3AED',
                height: '100%',
                transition: 'width 0.4s ease'
              }}
              title={`Chi phí phát sinh: ${formatVNMoney(chiPhiPhatSinh)} (${variablePercent}%)`}
            />
          )}
          {profitPercent > 0 && (
            <div
              style={{
                width: `${profitPercent}%`,
                backgroundColor: 'var(--emerald-primary)',
                height: '100%',
                transition: 'width 0.4s ease'
              }}
              title={`Lợi nhuận ròng: ${formatVNMoney(loiNhuanDuKien)} (${profitPercent}%)`}
            />
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '14px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--amber-primary)' }} />
            <span>Chi phí cố định: <strong>{formatVNMoney(chiPhiCoDinh)}</strong> ({fixedPercent}%)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#7C3AED' }} />
            <span>Chi phí phát sinh: <strong>{formatVNMoney(chiPhiPhatSinh)}</strong> ({variablePercent}%)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--emerald-primary)' }} />
            <span>Lợi nhuận ròng giữ lại: <strong>{formatVNMoney(loiNhuanDuKien)}</strong> ({profitPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Action & Filter Controls */}
      <div className="paper-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.875rem' }}
                placeholder="Tìm khoản chi theo tên hoặc ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter Buttons */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterType('all')}
              >
                Tất cả ({expenses.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filterType === 'fixed' ? 'btn-primary' : 'btn-outline'}`}
                style={filterType === 'fixed' ? { backgroundColor: 'var(--amber-primary)', borderColor: 'var(--amber-primary)' } : {}}
                onClick={() => setFilterType('fixed')}
              >
                Cố định
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filterType === 'variable' ? 'btn-primary' : 'btn-outline'}`}
                style={filterType === 'variable' ? { backgroundColor: '#7C3AED', borderColor: '#7C3AED' } : {}}
                onClick={() => setFilterType('variable')}
              >
                Phát sinh
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onCopyRecurring && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={onCopyRecurring}
                title="Sao chép các chi phí cố định (như tiền nhà, mạng, rác...) từ tháng trước sang tháng này"
              >
                <Copy size={15} />
                <span>Sao chép cố định từ tháng trước</span>
              </button>
            )}

            {onAddCommission && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{
                  color: '#7C3AED',
                  borderColor: 'rgba(124, 58, 237, 0.45)',
                  backgroundColor: 'rgba(124, 58, 237, 0.08)',
                  fontWeight: 600
                }}
                onClick={onAddCommission}
                title="Tự động tính hoa hồng môi giới = 80% tiền phòng cố định"
              >
                <Sparkles size={15} />
                <span>+ Hoa hồng phòng (80%)</span>
              </button>
            )}

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

            <button type="button" className="btn btn-primary btn-sm" onClick={onAddExpense}>
              <Plus size={16} />
              <span>+ Thêm Khoản Chi</span>
            </button>
          </div>
        </div>

        {/* Expenses List Table */}
        {filteredExpenses.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
              background: 'var(--bg-paper-alt)',
              borderRadius: '10px'
            }}
          >
            <Layers size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Chưa có khoản chi phí nào trong tháng {selectedMonth}
            </p>
            <p style={{ fontSize: '0.825rem', marginTop: '4px' }}>
              Bấm nút "Thêm Khoản Chi" hoặc "Sao chép cố định từ tháng trước" để bắt đầu hạch toán.
            </p>
          </div>
        ) : (
          <div className="ledger-table-container">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Tên Khoản Chi</th>
                  <th>Loại Chi Phí</th>
                  <th>Danh Mục</th>
                  <th>Ngày Chi</th>
                  <th>Ghi Chú</th>
                  <th>Số Tiền Chi</th>
                  <th style={{ textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => {
                  const isFixed = exp.type === 'fixed';
                  return (
                    <tr key={exp._id}>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{exp.title}</span>
                          {exp.isRecurring && (
                            <span
                              className="badge"
                              style={{
                                fontSize: '0.68rem',
                                backgroundColor: 'var(--teal-bg)',
                                color: 'var(--teal-primary)',
                                padding: '2px 6px'
                              }}
                              title="Tự động lặp lại hàng tháng"
                            >
                              Lặp lại
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {isFixed ? (
                          <span
                            className="badge badge-amber"
                            style={{ fontSize: '0.725rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Layers size={12} />
                            <span>Cố định</span>
                          </span>
                        ) : (
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.725rem',
                              backgroundColor: 'rgba(124, 58, 237, 0.12)',
                              color: '#7C3AED',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Wrench size={12} />
                            <span>Phát sinh</span>
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          {CATEGORY_NAMES[exp.category] || exp.category || 'Khác'}
                        </span>
                      </td>
                      <td className="font-mono" style={{ fontSize: '0.85rem' }}>
                        {exp.date || '---'}
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exp.note || '---'}
                      </td>
                      <td className="font-mono" style={{ fontWeight: 700, color: 'var(--rose-primary)', fontSize: '0.95rem' }}>
                        − {formatVNMoney(exp.amount)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 8px' }}
                            title="Chỉnh sửa khoản chi này"
                            onClick={() => onEditExpense(exp)}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 8px', color: 'var(--rose-primary)', borderColor: 'rgba(225, 29, 72, 0.3)' }}
                            title="Xóa khoản chi này"
                            onClick={() => onDeleteExpense(exp)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: 'var(--bg-paper-alt)', fontWeight: 700 }}>
                  <td colSpan={5} style={{ textAlign: 'right' }}>
                    TỔNG CHI PHÍ THÁNG {selectedMonth}:
                  </td>
                  <td className="font-mono" style={{ color: 'var(--rose-primary)', fontSize: '1.05rem' }}>
                    − {formatVNMoney(tongChiPhi)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
