import React, { useState, useEffect } from 'react';
import { X, Save, Key } from 'lucide-react';
import { formatVNMoney } from '../utils/formatters';

export default function RoomModal({ room, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    tenantName: '',
    tenantPhone: '',
    soNguoi: 0,
    baseRent: 2000000,
    waterMode: 'perPerson',
    waterAmount: 100000,
    status: 'vacant',
    contractStart: '',
    contractEnd: '',
    deposit: 0,
    depositNote: '',
    parkingMode: 'perVehicle',
    parkingAmount: 150000,
    soXe: 1
  });

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || '',
        tenantName: room.tenantName || '',
        tenantPhone: room.tenantPhone || '',
        soNguoi: room.soNguoi || 0,
        baseRent: room.baseRent || 0,
        waterMode: room.waterMode || 'perPerson',
        waterAmount: room.waterAmount || 0,
        status: room.status || 'vacant',
        contractStart: room.contractStart || '',
        contractEnd: room.contractEnd || '',
        deposit: room.deposit || 0,
        depositNote: room.depositNote || '',
        parkingMode: room.parkingMode || 'perVehicle',
        parkingAmount: room.parkingAmount !== undefined ? room.parkingAmount : 150000,
        soXe: room.soXe !== undefined ? room.soXe : (room.status === 'occupied' ? 1 : 0)
      });
    }
  }, [room]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(room._id, formData);
  };

  if (!room) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-paper)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key color="var(--teal-primary)" size={22} />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Cập Nhật Thông Tin {room.name}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Tên phòng</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trạng thái phòng</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="occupied">🟢 Đang ở (Occupied)</option>
                <option value="vacant">⚪ Phòng trống (Vacant)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tên người thuê</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Nguyễn Văn An"
              value={formData.tenantName}
              onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                type="text"
                className="form-input"
                placeholder="090XXXXXXX"
                value={formData.tenantPhone}
                onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số người ở</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.soNguoi}
                onChange={(e) => setFormData({ ...formData, soNguoi: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Giá thuê cố định / tháng (VNĐ)</span>
              <span className="font-mono" style={{ color: 'var(--teal-primary)', fontWeight: 600 }}>
                {formatVNMoney(formData.baseRent)}
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="50000"
              className="form-input font-mono"
              value={formData.baseRent}
              onChange={(e) => setFormData({ ...formData, baseRent: Number(e.target.value) })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Cách tính tiền nước</label>
              <select
                className="form-select"
                value={formData.waterMode}
                onChange={(e) => setFormData({ ...formData, waterMode: e.target.value })}
              >
                <option value="perPerson">Theo đầu người (/người)</option>
                <option value="fixed">Cố định cả phòng (/tháng)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Đơn giá nước (VNĐ)</span>
                <span className="font-mono" style={{ color: 'var(--teal-primary)', fontWeight: 600 }}>
                  {formatVNMoney(formData.waterAmount)}
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                className="form-input font-mono"
                value={formData.waterAmount}
                onChange={(e) => setFormData({ ...formData, waterAmount: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: formData.parkingMode !== 'none' ? '1fr 1fr' : '1fr', gap: '12px', marginTop: '8px' }}>
            <div className="form-group">
              <label className="form-label">Cách tính tiền giữ xe</label>
              <select
                className="form-select"
                value={formData.parkingMode}
                onChange={(e) => setFormData({ ...formData, parkingMode: e.target.value })}
              >
                <option value="perVehicle">Theo số xe (/chiếc xe)</option>
                <option value="perPerson">Theo đầu người (/người)</option>
                <option value="fixed">Cố định cả phòng (/tháng)</option>
                <option value="none">Miễn phí (0đ)</option>
              </select>
            </div>

            {formData.parkingMode !== 'none' && (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Đơn giá xe (VNĐ)</span>
                  <span className="font-mono" style={{ color: 'var(--teal-primary)', fontWeight: 600 }}>
                    {formatVNMoney(formData.parkingAmount)}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  className="form-input font-mono"
                  value={formData.parkingAmount}
                  onChange={(e) => setFormData({ ...formData, parkingAmount: Number(e.target.value) })}
                />
              </div>
            )}
          </div>

          {formData.parkingMode !== 'none' && (
            <div className="form-group" style={{ marginTop: '4px' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Số lượng xe</span>
                {formData.parkingMode === 'perVehicle' && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--teal-primary)', fontWeight: 600 }}>
                    (Tính tiền: {formData.soXe} xe x {formatVNMoney(formData.parkingAmount)})
                  </span>
                )}
              </label>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`btn btn-sm ${formData.soXe === num ? 'btn-primary' : 'btn-outline'}`}
                    style={{
                      flex: 1,
                      padding: '4px 0',
                      fontSize: '0.85rem',
                      fontWeight: formData.soXe === num ? 700 : 400
                    }}
                    onClick={() => setFormData({ ...formData, soXe: num })}
                  >
                    {num} xe
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="0"
                className="form-input font-mono"
                value={formData.soXe}
                onChange={(e) => setFormData({ ...formData, soXe: Number(e.target.value) })}
                placeholder="Nhập số lượng xe khác (nếu > 5)"
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <div className="form-group">
              <label className="form-label">Ngày bắt đầu hợp đồng</label>
              <input
                type="date"
                className="form-input"
                value={formData.contractStart}
                onChange={(e) => setFormData({ ...formData, contractStart: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ngày kết thúc hợp đồng</label>
              <input
                type="date"
                className="form-input"
                value={formData.contractEnd}
                onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tiền cọc (VNĐ)</span>
                <span className="font-mono" style={{ color: 'var(--amber-primary)', fontWeight: 600 }}>
                  {formatVNMoney(formData.deposit)}
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="100000"
                className="form-input font-mono"
                placeholder="0"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ghi chú tiền cọc / Phòng</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: Cọc 1 tháng, giữ xe, chìa khóa..."
                value={formData.depositNote}
                onChange={(e) => setFormData({ ...formData, depositNote: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
