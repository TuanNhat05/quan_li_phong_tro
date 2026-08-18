import React from 'react';
import { X, Printer, CheckCircle2, XCircle, Calendar, User, Home, Zap, Droplet, FileText } from 'lucide-react';
import { formatVNMoney } from '../utils/formatters';

export default function InvoiceReceiptModal({ invoice, onClose }) {
  if (!invoice) return null;

  const formatMoney = formatVNMoney;

  const handlePrint = () => {
    window.print();
  };

  const room = invoice.room || {};
  const extraFees = Array.isArray(invoice.extraFees) ? invoice.extraFees : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px', backgroundColor: '#fff', color: '#1f2937' }}
      >
        {/* Printable Area Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid var(--border-paper)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText color="var(--teal-primary)" size={24} />
            <h3 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              PHIẾU THU TIỀN TRỌ
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Invoice Printable Slip */}
        <div id="receipt-slip" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: '#fdfbf7', marginBottom: '20px' }}>
          <div style={{ textTransform: 'uppercase', textAlign: 'center', fontWeight: 700, fontSize: '1.25rem', color: 'var(--teal-primary)', marginBottom: '4px' }}>
            HÓA ĐƠN TIỀN THUÊ PHÒNG
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginBottom: '16px' }}>
            Kỳ thanh toán: <strong>Tháng {invoice.month}</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', padding: '12px', background: '#ffffff', borderRadius: '6px', border: '1px solid #f3f4f6' }}>
            <div>
              <span style={{ fontSize: '0.775rem', color: '#6b7280' }}>Phòng trọ:</span>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>{room.name || '---'}</div>
              {room.deposit ? (
                <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600, marginTop: '2px' }}>
                  Cọc đã giữ: {formatMoney(room.deposit)}
                </div>
              ) : null}
            </div>
            <div>
              <span style={{ fontSize: '0.775rem', color: '#6b7280' }}>Khách thuê:</span>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: '#111827' }}>{room.tenantName || 'Chưa có tên'}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>SĐT: {room.tenantPhone || '---'}</div>
              {room.depositNote && (
                <div style={{ fontSize: '0.775rem', color: '#4b5563', fontStyle: 'italic', marginTop: '2px' }}>
                  Ghi chú: {room.depositNote}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Item List Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginBottom: '16px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px' }}>Khoản mục</th>
                <th style={{ padding: '8px 10px' }}>Chi tiết / Chỉ số</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {/* Base Rent */}
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 10px', fontWeight: 600 }}>1. Tiền thuê phòng</td>
                <td style={{ padding: '8px 10px', color: '#6b7280' }}>Cố định / tháng</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }} className="font-mono">
                  {formatMoney(invoice.baseRent)}
                </td>
              </tr>

              {/* Electricity */}
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 10px', fontWeight: 600 }}>2. Tiền điện</td>
                <td style={{ padding: '8px 10px', color: '#6b7280' }}>
                  {invoice.oldReadingDisplay || invoice.oldReading} ➔ {invoice.newReadingDisplay || invoice.newReading} ({invoice.kwhUsed} kWh x {formatMoney(invoice.giaDien)})
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }} className="font-mono">
                  {formatMoney(invoice.electricityAmount)}
                </td>
              </tr>

              {/* Water */}
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 10px', fontWeight: 600 }}>3. Tiền nước</td>
                <td style={{ padding: '8px 10px', color: '#6b7280' }}>
                  {room.waterMode === 'fixed'
                    ? 'Cố định cả phòng'
                    : `${room.soNguoi || 0} người x ${formatMoney(room.waterAmount)}`}
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }} className="font-mono">
                  {formatMoney(invoice.waterAmountTotal)}
                </td>
              </tr>

              {/* Parking Fee */}
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 10px', fontWeight: 600 }}>4. Tiền xe</td>
                <td style={{ padding: '8px 10px', color: '#6b7280' }}>
                  {room.parkingMode === 'none'
                    ? 'Miễn phí'
                    : room.parkingMode === 'fixed'
                    ? 'Cố định cả phòng'
                    : room.parkingMode === 'perPerson'
                    ? `${room.soNguoi || 0} người x ${formatMoney(room.parkingAmount !== undefined ? room.parkingAmount : 150000)}`
                    : `${room.soXe !== undefined ? room.soXe : (room.status === 'occupied' ? 1 : 0)} xe x ${formatMoney(room.parkingAmount !== undefined ? room.parkingAmount : 150000)}`}
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }} className="font-mono">
                  {formatMoney(invoice.parkingAmountTotal || 0)}
                </td>
              </tr>

              {/* Extra Fees */}
              {extraFees.map((fee, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>{idx + 5}. Phụ thu: {fee.name}</td>
                  <td style={{ padding: '8px 10px', color: '#6b7280' }}>Phí phát sinh</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }} className="font-mono">
                    {formatMoney(fee.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Grand Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#166534' }}>TỔNG CỘNG THANH TOÁN:</span>
            <span className="font-mono" style={{ fontWeight: 800, fontSize: '1.3rem', color: '#15803d' }}>
              {formatMoney(invoice.totalAmount)}
            </span>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <div>
              Trạng thái: {' '}
              {invoice.paid ? (
                <span style={{ color: '#15803d', fontWeight: 700 }}>● Đã thu tiền ({new Date(invoice.paidDate || Date.now()).toLocaleDateString('vi-VN')})</span>
              ) : (
                <span style={{ color: '#b91c1c', fontWeight: 700 }}>○ Chưa thanh toán</span>
              )}
            </div>
            <div style={{ color: '#6b7280' }}>Cảm ơn quý khách!</div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>In Phiếu Thu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
