import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, XCircle, Edit, Zap, Droplet, PlusCircle, Printer, FileSpreadsheet } from 'lucide-react';
import { formatVNMoney } from '../utils/formatters';
import ConfirmModal from './ConfirmModal';

function formatMeterDisplay(rawValue) {
  const num = Number(rawValue) || 0;
  const str = String(num).padStart(6, '0');
  return str.slice(0, 5) + '.' + str.slice(5);
}

function ReadingInput({ value, onSave }) {
  const [val, setVal] = useState(() => String(value ?? 0).padStart(6, '0'));

  useEffect(() => {
    setVal(String(value ?? 0).padStart(6, '0'));
  }, [value]);

  const handleBlur = () => {
    const numericVal = parseInt(val, 10) || 0;
    if (numericVal !== Number(value)) {
      onSave(numericVal);
    }
  };

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVal(raw);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      className="form-input font-mono"
      style={{ width: '75px', padding: '4px 6px', fontSize: '0.85rem', textAlign: 'center', letterSpacing: '1px' }}
      value={val}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleBlur();
      }}
      placeholder="000000"
    />
  );
}

export default function InvoiceManager({
  invoices,
  selectedMonth,
  setSelectedMonth,
  config,
  onPatchInvoice,
  onOpenExtraFeesModal,
  onOpenReceiptModal,
  onExportExcel,
  isExportingExcel = false
}) {
  const formatMoney = formatVNMoney;

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    isPaidTarget: false,
    roomId: ''
  });

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Month Selection Bar */}
      <div className="paper-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={22} color="var(--teal-primary)" />
            <span>Sổ Hóa Đơn Tháng: {selectedMonth}</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Đơn giá điện đang áp dụng: <strong style={{ color: 'var(--teal-primary)' }}>{formatMoney(config?.giaDien || 3500)}/kWh</strong>
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

      {/* Invoice Table */}
      <div className="ledger-table-container" style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
        <table className="ledger-table">
          <thead>
            <tr>
              <th style={{ width: '85px' }}>Phòng</th>
              <th style={{ width: '120px' }}>Người thuê</th>
              <th style={{ width: '100px' }}>Tiền phòng</th>
              <th style={{ width: '170px' }}>Chỉ số điện (Cũ ➔ Mới)</th>
              <th style={{ width: '95px' }}>Tiền điện</th>
              <th style={{ width: '95px' }}>Tiền nước</th>
              <th style={{ width: '95px' }}>Tiền xe</th>
              <th style={{ width: '95px' }}>Phí dịch vụ</th>
              <th style={{ width: '110px' }}>TỔNG CỘNG</th>
              <th style={{ width: '150px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Không có hóa đơn nào cho tháng {selectedMonth}. Vui lòng chọn căn nhà hoặc kiểm tra lại.
                </td>
              </tr>
            ) : (
              invoices.map((item) => {
                const isPaid = item.paid;
                const roomId = item.room?._id;

                return (
                  <tr key={item._id || roomId} style={{ backgroundColor: isPaid ? 'rgba(5, 150, 105, 0.03)' : 'inherit' }}>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                      {item.room?.name || 'Phòng'}
                    </td>

                    <td style={{ fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: 600 }}>{item.room?.tenantName || 'Trống'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.room?.status === 'occupied' ? `${item.room?.soNguoi} người` : 'Chưa có khách'}
                      </div>
                    </td>

                    <td className="font-mono" style={{ fontSize: '0.85rem' }}>
                      {formatMoney(item.baseRent)}
                    </td>

                    {/* Old Reading & New Reading Inputs */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ReadingInput
                          value={item.oldReading}
                          onSave={(newVal) => onPatchInvoice(selectedMonth, roomId, { oldReading: newVal })}
                        />
                        <span>➔</span>
                        <ReadingInput
                          value={item.newReading}
                          onSave={(newVal) => onPatchInvoice(selectedMonth, roomId, { newReading: newVal })}
                        />
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {formatMeterDisplay(item.oldReading)} ➔ {formatMeterDisplay(item.newReading)} = <strong>{item.kwhUsed} kWh</strong>
                      </div>
                    </td>

                    {/* Calculated Electric Cost */}
                    <td className="font-mono" style={{ fontSize: '0.85rem' }}>
                      {formatMoney(item.electricityAmount)}
                    </td>

                    {/* Water Cost */}
                    <td className="font-mono" style={{ fontSize: '0.85rem' }}>
                      {formatMoney(item.waterAmountTotal)}
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {item.room?.waterMode === 'fixed' ? 'Cố định' : `${(item.room?.waterAmount || 0) / 1000}k/người`}
                      </div>
                    </td>

                    {/* Parking Cost */}
                    <td className="font-mono" style={{ fontSize: '0.85rem' }}>
                      {formatMoney(item.parkingAmountTotal || 0)}
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {item.room?.parkingMode === 'none'
                          ? 'Miễn phí'
                          : item.room?.parkingMode === 'fixed'
                          ? 'Cố định'
                          : item.room?.parkingMode === 'perPerson'
                          ? `${(item.room?.parkingAmount !== undefined ? item.room.parkingAmount : 150000) / 1000}k/người`
                          : `${item.room?.soXe !== undefined ? item.room.soXe : (item.room?.status === 'occupied' ? 1 : 0)} xe`}
                      </div>
                    </td>

                    {/* Extra Fees Button/Cell */}
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenExtraFeesModal(item)}
                        style={{ padding: '4px 8px', fontSize: '0.775rem' }}
                      >
                        <PlusCircle size={13} />
                        <span>{formatMoney(item.extraFeesTotal)}</span>
                      </button>
                    </td>

                    {/* Grand Total Amount */}
                    <td className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: isPaid ? 'var(--emerald-primary)' : 'var(--rose-primary)' }}>
                      {formatMoney(item.totalAmount)}
                    </td>

                    {/* Action Buttons */}
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          className={`btn btn-sm ${isPaid ? 'btn-outline' : 'btn-primary'}`}
                          style={{
                            backgroundColor: isPaid ? 'var(--emerald-bg)' : 'var(--rose-primary)',
                            borderColor: isPaid ? 'var(--emerald-primary)' : 'transparent',
                            color: isPaid ? 'var(--emerald-primary)' : '#ffffff',
                            flex: 1,
                            justifyContent: 'center',
                            padding: '6px 8px',
                            fontSize: '0.775rem'
                          }}
                          onClick={() => {
                            const isPaidTarget = !isPaid;
                            const roomName = item.room?.name || 'Phòng';
                            setConfirmModal({
                              isOpen: true,
                              title: isPaidTarget ? `Xác Nhận Thu Tiền - ${roomName}` : `Xác Nhận Chưa Thu - ${roomName}`,
                              message: isPaidTarget
                                ? `Bạn có chắc chắn muốn chuyển trạng thái hóa đơn của ${roomName} (Tháng ${selectedMonth}) sang "ĐÃ THU TIỀN"?`
                                : `Bạn có chắc chắn muốn chuyển trạng thái hóa đơn của ${roomName} (Tháng ${selectedMonth}) sang "CHƯA THU TIỀN"?`,
                              isPaidTarget,
                              roomId
                            });
                          }}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Đã thu</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={14} />
                              <span>Thu tiền</span>
                            </>
                          )}
                        </button>

                        <button
                          className="btn btn-outline btn-sm"
                          title="In phiếu thu"
                          style={{ padding: '6px 8px' }}
                          onClick={() => onOpenReceiptModal(item)}
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
