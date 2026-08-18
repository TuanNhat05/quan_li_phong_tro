import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, isPaidTarget, onConfirm, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-paper)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isPaidTarget ? (
              <CheckCircle2 color="var(--emerald-primary)" size={24} />
            ) : (
              <AlertTriangle color="var(--rose-primary)" size={24} />
            )}
            <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>
              {title || 'Xác Nhận Thay Đổi Trạng Thái'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '24px', lineHeight: '1.5' }}>
          {message}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Hủy bỏ
          </button>
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: isPaidTarget ? 'var(--emerald-primary)' : 'var(--rose-primary)',
              borderColor: 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              padding: '8px 16px'
            }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {isPaidTarget ? '✅ Xác Nhận Đã Thu' : '⚠️ Chuyển Thành Chưa Thu'}
          </button>
        </div>
      </div>
    </div>
  );
}
