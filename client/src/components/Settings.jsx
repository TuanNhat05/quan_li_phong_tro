import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Zap, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';
import { formatVNMoney } from '../utils/formatters';

export default function Settings({ config, onSaveConfig }) {
  const [giaDien, setGiaDien] = useState(3500);
  const [defaultFees, setDefaultFees] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setGiaDien(config.giaDien || 3500);
      setDefaultFees(config.extraFeesDefault || []);
    }
  }, [config]);

  const handleAddFee = () => {
    setDefaultFees([...defaultFees, { name: '', amount: 0 }]);
  };

  const handleRemoveFee = (index) => {
    setDefaultFees(defaultFees.filter((_, idx) => idx !== index));
  };

  const handleFeeChange = (index, field, value) => {
    const updated = [...defaultFees];
    updated[index][field] = field === 'amount' ? Number(value) : value;
    setDefaultFees(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSaveConfig({ giaDien: Number(giaDien), extraFeesDefault: defaultFees });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const formatMoney = formatVNMoney;

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="paper-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-paper)' }}>
          <SettingsIcon color="var(--teal-primary)" size={24} />
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Cấu Hình Hệ Thống</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Cài đặt đơn giá điện và các khoản phí phụ thu mặc định cho hóa đơn tạo mới
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'var(--emerald-bg)',
            color: 'var(--emerald-primary)',
            border: '1px solid var(--emerald-primary)',
            marginBottom: '20px',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            <CheckCircle2 size={18} />
            <span>Đã lưu cấu hình mới thành công! Dữ liệu đã được đồng bộ real-time.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Electricity price */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} color="var(--amber-primary)" />
              <span>Đơn giá điện (VNĐ / kWh)</span>
            </label>
            <input
              type="number"
              min="0"
              step="100"
              className="form-input font-mono"
              style={{ fontSize: '1.1rem', fontWeight: 700, width: '100%' }}
              value={giaDien}
              onChange={(e) => setGiaDien(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Mức giá mặc định hiện tại: <strong style={{ color: 'var(--teal-primary)' }}>{formatMoney(giaDien)} / kWh</strong>
            </span>
          </div>

          {/* Default Extra Fees */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
              Danh sách phí mặc định (Gán tự động khi tạo hóa đơn tháng mới)
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              {defaultFees.map((fee, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Tên khoản phí (Rác, Wifi, Vệ sinh...)"
                    value={fee.name}
                    onChange={(e) => handleFeeChange(idx, 'name', e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', width: '150px' }}>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      className="form-input font-mono"
                      placeholder="Đơn giá (VNĐ)"
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
              ))}
            </div>

            <button type="button" className="btn btn-outline btn-sm" onClick={handleAddFee} style={{ width: '100%', marginBottom: '10px' }}>
              <Plus size={16} />
              <span>Thêm phí mặc định</span>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid var(--border-paper)' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              <Save size={18} />
              <span>Lưu Cài Đặt Cấu Hình</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
