import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, FileSpreadsheet } from 'lucide-react';
import { formatVNMoney } from '../utils/formatters';

export default function ExtraFeesModal({ invoice, onClose, onSave }) {
  const [fees, setFees] = useState([]);

  useEffect(() => {
    if (invoice && Array.isArray(invoice.extraFees)) {
      setFees(invoice.extraFees.map((f) => ({ name: f.name || '', amount: f.amount || 0 })));
    } else {
      setFees([]);
    }
  }, [invoice]);

  const handleAddFee = () => {
    setFees([...fees, { name: '', amount: 0 }]);
  };

  const handleRemoveFee = (index) => {
    setFees(fees.filter((_, idx) => idx !== index));
  };

  const handleFeeChange = (index, field, value) => {
    const updated = [...fees];
    updated[index][field] = field === 'amount' ? Number(value) : value;
    setFees(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(fees);
  };

  if (!invoice) return null;

  const totalExtra = fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + 'đ';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-paper)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet color="var(--teal-primary)" size={22} />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Phụ Thu - {invoice.room?.name}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {fees.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px', fontSize: '0.875rem' }}>
                Chưa có khoản phí phụ thu nào. Bấm nút bên dưới để thêm!
              </div>
            ) : (
              fees.map((fee, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Tên khoản phí (VD: Wifi, Rác...)"
                    value={fee.name}
                    onChange={(e) => handleFeeChange(idx, 'name', e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', width: '140px' }}>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      className="form-input font-mono"
                      placeholder="Số tiền (VNĐ)"
                      value={fee.amount}
                      onChange={(e) => handleFeeChange(idx, 'amount', e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--teal-primary)', fontWeight: 600, textAlign: 'right' }}>
                      {formatVNMoney(fee.amount)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFee(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--rose-primary)',
                      cursor: 'pointer',
                      padding: '8px'
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          <button type="button" className="btn btn-outline btn-sm" onClick={handleAddFee} style={{ width: '100%', marginBottom: '20px' }}>
            <Plus size={16} />
            <span>Thêm khoản phí mới</span>
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-paper-alt)', borderRadius: '8px', marginBottom: '20px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Tổng phí phụ thu:</span>
            <span className="font-mono" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--teal-primary)' }}>
              {formatMoney(totalExtra)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Lưu danh sách phí</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
