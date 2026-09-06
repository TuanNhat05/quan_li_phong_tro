import React, { useState, useEffect } from 'react';
import { X, DollarSign, Wrench, Shield, Wifi, Trash, Home, Tag, Calendar, Sparkles, Layers, FileText } from 'lucide-react';
import { formatVNMoney, formatVNNumber } from '../utils/formatters';

const CATEGORIES = [
  { id: 'rent', label: 'Tiền thuê mặt bằng/nhà gốc', icon: Home, color: 'var(--amber-primary)' },
  { id: 'utilities', label: 'Điện/Nước tổng tòa nhà', icon: Sparkles, color: 'var(--teal-primary)' },
  { id: 'internet', label: 'Internet / Wifi tòa nhà', icon: Wifi, color: '#2563EB' },
  { id: 'maintenance', label: 'Sửa chữa & Bảo trì', icon: Wrench, color: 'var(--rose-primary)' },
  { id: 'cleaning', label: 'Rác & Vệ sinh môi trường', icon: Trash, color: 'var(--emerald-primary)' },
  { id: 'security', label: 'An ninh / Bảo vệ / Khóa', icon: Shield, color: '#7C3AED' },
  { id: 'other', label: 'Chi phí khác', icon: Tag, color: 'var(--text-muted)' }
];

const SUGGESTIONS = {
  fixed: [
    { title: 'Tiền thuê nhà nguyên căn', category: 'rent' },
    { title: 'Tiền Internet / Wifi toàn nhà', category: 'internet' },
    { title: 'Tiền thu gom rác định kỳ', category: 'cleaning' },
    { title: 'Bảo trì thang máy / máy bơm', category: 'maintenance' },
    { title: 'Dịch vụ bảo vệ / an ninh', category: 'security' }
  ],
  variable: [
    { title: 'Sửa chữa đường ống nước', category: 'maintenance' },
    { title: 'Thay bóng đèn chiếu sáng hành lang', category: 'maintenance' },
    { title: 'Sửa khóa cổng / làm chìa mới', category: 'security' },
    { title: 'Mua sắm dụng cụ vệ sinh chung', category: 'cleaning' },
    { title: 'Hút hầm cầu / thông tắc cống', category: 'maintenance' },
    { title: 'Sơn dọn / sửa chữa phòng', category: 'maintenance' }
  ]
};

export default function ExpenseModal({ isOpen, expense, rooms = [], selectedMonth, onClose, onSave }) {
  if (!isOpen) return null;

  const isEditing = !!(expense && expense._id);

  const [type, setType] = useState('fixed');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);

  useEffect(() => {
    if (expense) {
      setType(expense.type || 'fixed');
      setTitle(expense.title || '');
      setCategory(expense.category || 'other');
      setAmount(expense.amount ? String(expense.amount) : '');
      setDate(expense.date || (selectedMonth ? `${selectedMonth}-01` : new Date().toISOString().slice(0, 10)));
      setNote(expense.note || '');
      setIsRecurring(expense.isRecurring !== undefined ? expense.isRecurring : expense.type === 'fixed');
    } else {
      setType('fixed');
      setTitle('');
      setCategory('rent');
      setAmount('');
      const defaultDate = selectedMonth ? `${selectedMonth}-01` : new Date().toISOString().slice(0, 10);
      setDate(defaultDate);
      setNote('');
      setIsRecurring(true);
    }
  }, [expense, selectedMonth]);

  const handleApplySuggestion = (sug) => {
    setTitle(sug.title);
    setCategory(sug.category);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên hoặc nội dung khoản chi');
      return;
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Vui lòng nhập số tiền chi phí lớn hơn 0');
      return;
    }

    onSave({
      ...(expense && expense._id ? { _id: expense._id } : {}),
      month: selectedMonth,
      type,
      title: title.trim(),
      category,
      amount: numAmount,
      date: date || `${selectedMonth}-01`,
      note: note.trim(),
      isRecurring: type === 'fixed' ? isRecurring : false
    });
  };

  const currentSuggestions = SUGGESTIONS[type] || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-paper)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: type === 'fixed' ? 'var(--amber-bg)' : 'var(--rose-bg)',
                color: type === 'fixed' ? 'var(--amber-primary)' : 'var(--rose-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DollarSign size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                {isEditing ? 'Chỉnh Sửa Khoản Chi Phí' : 'Thêm Khoản Chi Phí Mới'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Tháng {selectedMonth} — Tự động trừ vào Tổng Cần Thu
              </p>
            </div>
          </div>
          <button
            type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Phân loại Chi phí: Cố định vs Phát sinh */}
            <div>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                Loại Chi Phí <span style={{ color: 'var(--rose-primary)' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setType('fixed');
                    if (!isEditing) setIsRecurring(true);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: type === 'fixed' ? '2px solid var(--amber-primary)' : '1px solid var(--border-paper)',
                    backgroundColor: type === 'fixed' ? 'var(--amber-bg)' : 'var(--bg-paper-alt)',
                    color: type === 'fixed' ? 'var(--amber-primary)' : 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.95rem' }}>
                    <Layers size={18} />
                    <span>Chi Phí Cố Định</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                    Mặt bằng, Internet, Rác... lặp lại hàng tháng
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('variable');
                    setIsRecurring(false);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: type === 'variable' ? '2px solid var(--rose-primary)' : '1px solid var(--border-paper)',
                    backgroundColor: type === 'variable' ? 'var(--rose-bg)' : 'var(--bg-paper-alt)',
                    color: type === 'variable' ? 'var(--rose-primary)' : 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.95rem' }}>
                    <Wrench size={18} />
                    <span>Chi Phí Phát Sinh</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                    Sửa điện nước, thay bóng đèn, dọn dẹp...
                  </span>
                </button>
              </div>
            </div>

            {/* Tính nhanh Hoa Hồng Môi Giới (80% giá thuê phòng cố định) */}
            {rooms && rooms.length > 0 && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(124, 58, 237, 0.08)',
                  border: '1px solid rgba(124, 58, 237, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', color: '#7C3AED' }}>
                    <Sparkles size={16} />
                    <span>⚡ Tính nhanh Hoa Hồng Phòng (Tiền phòng × 0.8)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600 }}>
                    Phát sinh • 80% giá phòng
                  </span>
                </div>
                <div>
                  <select
                    className="form-input"
                    style={{ fontSize: '0.85rem', borderColor: 'rgba(124, 58, 237, 0.35)', backgroundColor: 'var(--bg-paper-card)' }}
                    defaultValue=""
                    onChange={(e) => {
                      const roomId = e.target.value;
                      if (!roomId) return;
                      const selectedRoom = rooms.find(r => r._id === roomId);
                      if (selectedRoom) {
                        const roomNumMatch = selectedRoom.name.match(/\d+/);
                        const roomNum = roomNumMatch ? roomNumMatch[0] : selectedRoom.name;
                        const commAmount = Math.round(Number(selectedRoom.baseRent || 0) * 0.8);
                        setType('variable');
                        setCategory('other');
                        setTitle(`hoa hồng p${roomNum}`);
                        setAmount(String(commAmount));
                        setNote('đã chuyển');
                        if (selectedMonth) setDate(`${selectedMonth}-01`);
                      }
                      e.target.value = '';
                    }}
                  >
                    <option value="">-- Chọn phòng để tự động tính hoa hồng 80% --</option>
                    {rooms.map((r) => {
                      const comm = Math.round(Number(r.baseRent || 0) * 0.8);
                      const roomNumMatch = r.name.match(/\d+/);
                      const roomNum = roomNumMatch ? roomNumMatch[0] : r.name;
                      return (
                        <option key={r._id} value={r._id}>
                          {r.name} (p{roomNum}) — Tiền phòng: {formatVNMoney(r.baseRent)} ➔ Hoa hồng: {formatVNMoney(comm)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}

            {/* Quick Suggestion Chips */}
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                💡 Gợi ý nhanh cho {type === 'fixed' ? 'Chi phí Cố định' : 'Chi phí Phát sinh'}:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {currentSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplySuggestion(sug)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      backgroundColor: 'var(--bg-paper-card)',
                      border: '1px solid var(--border-paper)',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    + {sug.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Tên khoản chi */}
            <div className="form-group">
              <label className="form-label">
                Tên / Nội Dung Khoản Chi <span style={{ color: 'var(--rose-primary)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Tiền thuê mặt bằng tháng 9, Sửa ống nước P.102..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Danh mục chi phí & Ngày chi */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Danh Mục</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ngày Chi Tiền</label>
                <input
                  type="date"
                  className="form-input font-mono"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {/* Số tiền chi */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Số Tiền Chi (VNĐ) <span style={{ color: 'var(--rose-primary)' }}>*</span></span>
                {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                  <span className="font-mono" style={{ color: 'var(--rose-primary)', fontWeight: 700 }}>
                    {formatVNMoney(amount)}
                  </span>
                )}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  className="form-input font-mono"
                  style={{ fontSize: '1.1rem', fontWeight: 700, paddingRight: '40px' }}
                  placeholder="Nhập số tiền chi..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: 'var(--text-muted)'
                  }}
                >
                  đ
                </span>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="form-group">
              <label className="form-label">Ghi Chú Thêm (Nếu có)</label>
              <textarea
                className="form-input"
                rows="2"
                style={{ resize: 'vertical' }}
                placeholder="Ví dụ: Đã chuyển khoản qua Vietcombank, thanh toán cho thợ sửa..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>

            {/* Lặp lại định kỳ (cho chi phí cố định) */}
            {type === 'fixed' && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-paper-alt)',
                  border: '1px solid var(--border-paper)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer'
                }}
                onClick={() => setIsRecurring(!isRecurring)}
              >
                <input
                  type="checkbox"
                  id="recurringCheck"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--teal-primary)' }}
                />
                <label
                  htmlFor="recurringCheck"
                  style={{ cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)', userSelect: 'none' }}
                >
                  <strong>Lặp lại chi phí này vào các tháng tiếp theo</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Hệ thống sẽ gợi ý tự động sao chép khoản chi này sang các tháng sau.
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '22px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-paper)'
            }}
          >
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Lưu Khoản Chi' : 'Xác Nhận Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
