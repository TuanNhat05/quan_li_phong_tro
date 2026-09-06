import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';

export default function BuildingModal({ isOpen, building, onClose, onSave }) {
  if (!isOpen) return null;

  const [name, setName] = useState(building ? building.name : '');
  const [address, setAddress] = useState(building ? building.address : '');
  const [description, setDescription] = useState(building ? building.description : '');

  // Reset form khi building prop thay đổi
  useEffect(() => {
    setName(building ? building.name : '');
    setAddress(building ? building.address || '' : '');
    setDescription(building ? building.description || '' : '');
  }, [building]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên căn nhà');
      return;
    }
    onSave({ name: name.trim(), address: address.trim(), description: description.trim() });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-paper)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--teal-bg)',
              color: 'var(--teal-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
              {building ? 'Chỉnh Sửa Thông Tin Căn Nhà' : 'Thêm Căn Nhà Mới'}
            </h3>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Tên Căn Nhà / Tòa Nhà <span style={{ color: 'var(--rose-primary)' }}>*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Bùi Đình Túy, Chu Văn An..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Địa Chỉ Chi Tiết</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: 123 Bùi Đình Túy, Phường 12, Bình Thạnh"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ghi Chú</label>
              <textarea
                className="form-input"
                rows="3"
                style={{ resize: 'vertical', minHeight: '80px' }}
                placeholder="Ghi chú về tòa nhà (nếu có)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-paper)' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {building ? 'Lưu Thay Đổi' : 'Tạo Căn Nhà Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
