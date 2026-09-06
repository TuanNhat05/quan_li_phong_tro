import React, { useState } from 'react';
import { X, Maximize2, Minimize2, Home, Zap, Droplet, Car, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { formatVNMoney } from '../utils/formatters';

export default function InvoiceReceiptModal({ invoice, onClose }) {
  if (!invoice) return null;

  const [isFullscreen, setIsFullscreen] = useState(false);

  const room = invoice.room || {};
  const extraFees = Array.isArray(invoice.extraFees) ? invoice.extraFees : [];

  const parts = (invoice.month || '').split('-');
  const yearStr = parts[0] || '';
  const monthStr = parts[1] || '';
  const monthNum = parseInt(monthStr, 10) || '';
  const displayMonth = monthNum ? `Tháng ${monthNum}/${yearStr}` : invoice.month;

  const oldRead = Number(invoice.oldReading) || 0;
  const newRead = Number(invoice.newReading) || 0;
  const kwhUsed = invoice.kwhUsed != null ? invoice.kwhUsed : Math.max(0, (newRead - oldRead) / 10);
  const giaDien = Number(invoice.giaDien) || 3800;

  const lineItems = [
    {
      icon: Home,
      color: '#0d9488',
      label: 'Tiền thuê phòng',
      detail: 'Cố định / tháng',
      amount: invoice.baseRent || 0
    },
    {
      icon: Zap,
      color: '#d97706',
      label: 'Tiền điện',
      detail: `${oldRead} -> ${newRead} (${kwhUsed} kWh x ${formatVNMoney(giaDien)})`,
      amount: invoice.electricityAmount || 0
    },
    {
      icon: Droplet,
      color: '#2563eb',
      label: 'Tiền nước',
      detail: room.waterMode === 'fixed'
        ? 'Cố định cả phòng'
        : `${room.soNguoi || 0} người x ${formatVNMoney(room.waterAmount)}`,
      amount: invoice.waterAmountTotal || 0
    },
    {
      icon: Car,
      color: '#7c3aed',
      label: 'Tiền xe',
      detail: room.parkingMode === 'none'
        ? 'Miễn phí'
        : room.parkingMode === 'fixed'
        ? 'Cố định cả phòng'
        : room.parkingMode === 'perPerson'
        ? `${room.soNguoi || 0} người x ${formatVNMoney(room.parkingAmount != null ? room.parkingAmount : 150000)}`
        : `${room.soXe != null ? room.soXe : 1} xe x ${formatVNMoney(room.parkingAmount != null ? room.parkingAmount : 150000)}`,
      amount: invoice.parkingAmountTotal || 0
    },
    ...(extraFees.length > 0 ? [{
      icon: Tag,
      color: '#db2777',
      label: 'Phí dịch vụ',
      detail: extraFees.map(f => f.name).join(', '),
      amount: extraFees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
    }] : [])
  ];

  const overlayStyle = isFullscreen
    ? {
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: '#ffffff',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto'
      }
    : {
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px'
      };

  const cardStyle = isFullscreen
    ? {
        width: '100%', maxWidth: '520px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        flex: 1
      }
    : {
        width: '100%', maxWidth: '500px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
      };

  return (
    <div style={overlayStyle} onClick={!isFullscreen ? onClose : undefined}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>

        {/* HEADER GRADIENT */}
        <div style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #14b8a6 100%)',
          padding: isFullscreen ? '32px 24px 24px' : '24px 20px 18px',
          color: '#ffffff',
          position: 'relative'
        }}>
          {/* Buttons top right */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nho' : 'Toan man hinh de chup'}
              style={{
                background: 'rgba(255,255,255,0.2)', border: 'none',
                borderRadius: '8px', color: '#fff', cursor: 'pointer',
                padding: '6px 10px', display: 'flex', alignItems: 'center',
                gap: '4px', fontSize: '0.75rem', fontWeight: 600
              }}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
            </button>
            {!isFullscreen && (
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  borderRadius: '8px', color: '#fff', cursor: 'pointer',
                  padding: '6px 8px', display: 'flex', alignItems: 'center'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.8, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
            PHIẾU THU TIỀN THUÊ PHÒNG
          </div>
          <div style={{ fontSize: isFullscreen ? '1.8rem' : '1.5rem', fontWeight: 900, lineHeight: 1.15 }}>
            {room.name || 'Phòng ---'}
          </div>
          <div style={{ fontSize: '0.92rem', opacity: 0.88, marginTop: '6px', fontWeight: 500 }}>
            Kỳ thanh toán: <strong>{displayMonth}</strong>
          </div>

          {/* Badge trạng thái */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginTop: '14px', padding: '5px 14px', borderRadius: '20px',
            fontSize: '0.78rem', fontWeight: 700,
            backgroundColor: invoice.paid ? 'rgba(255,255,255,0.25)' : 'rgba(254,202,202,0.35)',
            border: invoice.paid ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(254,202,202,0.6)'
          }}>
            {invoice.paid
              ? <><CheckCircle2 size={13} /> ĐÃ THANH TOÁN</>
              : <><XCircle size={13} /> CHƯA THANH TOÁN</>
            }
          </div>
        </div>

        {/* THÔNG TIN KHÁCH THUÊ */}
        <div style={{
          padding: '14px 20px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex', gap: '28px', flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Khách thuê</div>
            <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.97rem', fontWeight: 700, color: '#1e293b', marginTop: '3px' }}>
              {room.tenantName || 'Chưa có tên'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Số điện thoại</div>
            <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.97rem', fontWeight: 600, color: '#1e293b', marginTop: '3px' }}>
              {room.tenantPhone || '---'}
            </div>
          </div>
          {room.soNguoi > 0 && (
            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Số người</div>
              <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.97rem', fontWeight: 600, color: '#1e293b', marginTop: '3px' }}>
                {room.soNguoi} người
              </div>
            </div>
          )}
        </div>

        {/* DANH SÁCH CÁC KHOẢN */}
        <div style={{ padding: '6px 0' }}>
          {lineItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'flex-start',
                padding: isFullscreen ? '14px 20px' : '11px 20px',
                borderBottom: idx < lineItems.length - 1 ? '1px solid #f1f5f9' : 'none',
                gap: '12px'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
                  backgroundColor: item.color + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={17} color={item.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: isFullscreen ? '0.95rem' : '0.875rem', color: '#1e293b' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                    {item.detail}
                  </div>
                </div>
                <div style={{
                  fontWeight: 800, fontSize: isFullscreen ? '1.05rem' : '0.95rem',
                  color: '#1e293b', whiteSpace: 'nowrap', fontFamily: 'monospace'
                }}>
                  {formatVNMoney(item.amount)}
                </div>
              </div>
            );
          })}
        </div>

        {/* TỔNG CỘNG */}
        <div style={{
          margin: '8px 16px 12px',
          padding: isFullscreen ? '20px 22px' : '15px 20px',
          background: 'linear-gradient(135deg, #0f766e, #0d9488)',
          borderRadius: '12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.78)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tổng cộng thanh toán
            </div>
            {invoice.paid && invoice.paidDate && (
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '3px' }}>
                Đã thu ngày: {new Date(invoice.paidDate).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
          <div style={{
            fontSize: isFullscreen ? '2rem' : '1.6rem',
            fontWeight: 900, color: '#ffffff', fontFamily: 'monospace'
          }}>
            {formatVNMoney(invoice.totalAmount)}
          </div>
        </div>



        {/* NÚT HÀNH ĐỘNG — chỉ hiện khi không fullscreen */}
        {!isFullscreen && (
          <div style={{
            padding: '10px 20px 18px',
            display: 'flex', gap: '10px', justifyContent: 'flex-end',
            borderTop: '1px solid #f1f5f9'
          }}>
            <button
              style={{
                padding: '9px 16px', borderRadius: '8px',
                border: '1px solid #e2e8f0', background: '#f8fafc',
                color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem'
              }}
              onClick={onClose}
            >
              Đóng
            </button>
            <button
              onClick={() => setIsFullscreen(true)}
              style={{
                padding: '9px 18px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #0f766e, #0d9488)',
                border: 'none', color: '#ffffff', fontWeight: 700,
                cursor: 'pointer', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.35)'
              }}
            >
              <Maximize2 size={15} />
              <span>Toàn màn hình để chụp</span>
            </button>
          </div>
        )}

        {/* Hướng dẫn khi fullscreen */}
        {isFullscreen && (
          <div style={{
            padding: '8px 20px 28px', textAlign: 'center',
            fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic'
          }}>
            📸 Dùng điện thoại chụp màn hình này rồi gửi cho khách qua Zalo
          </div>
        )}
      </div>
    </div>
  );
}
