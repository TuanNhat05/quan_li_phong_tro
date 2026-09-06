import React from 'react';
import { Key, User, Phone, Users, DollarSign, Droplet, Edit3, Calendar, ShieldCheck, FileText, Bike } from 'lucide-react';
import { formatVNMoney } from '../utils/formatters';

export default function RoomsManager({ rooms, onEditRoom, onAddRoom }) {
  const formatMoney = formatVNMoney;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="paper-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Quản Lý {rooms.length} Phòng & Người Thuê</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Chạm vào bất kỳ thẻ chìa khóa nào để chỉnh sửa thông tin người thuê, đơn giá, tiền xe và tiền cọc
          </p>
        </div>
        {onAddRoom && (
          <button className="btn btn-primary" onClick={onAddRoom}>
            + Thêm Phòng Mới
          </button>
        )}
      </div>

      <div className="rooms-grid-4col">
        {rooms.map((room) => {
          const isOccupied = room.status === 'occupied';

          return (
            <div
              key={room._id}
              className={`key-card ${isOccupied ? 'occupied' : 'vacant'}`}
              onClick={() => onEditRoom(room)}
            >
              {/* Header: Room Name & Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', paddingRight: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={18} color="var(--teal-primary)" />
                  <h3 style={{ fontSize: '1.15rem', margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{room.name}</h3>
                </div>

                <span className={`badge ${isOccupied ? 'badge-teal' : 'badge-gray'}`}>
                  {isOccupied ? 'Đang ở' : 'Phòng trống'}
                </span>
              </div>

              {/* Body Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
                  <User size={15} color="var(--text-muted)" />
                  <span>{room.tenantName || 'Chưa có người thuê'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <Phone size={15} />
                  <span>{room.tenantPhone || '---'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <Users size={15} />
                  <span>{room.soNguoi || 0} người ở</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={15} color="var(--teal-primary)" />
                  <span style={{ color: 'var(--text-muted)' }}>Tiền phòng: </span>
                  <span className="font-mono" style={{ fontWeight: 700, color: 'var(--teal-primary)' }}>
                    {formatMoney(room.baseRent)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <Droplet size={15} color="var(--teal-primary)" />
                  <span>Nước: </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {room.waterMode === 'fixed'
                      ? `${formatMoney(room.waterAmount)}/tháng`
                      : `${formatMoney(room.waterAmount)}/người`}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <Bike size={15} color="var(--teal-primary)" />
                  <span>Tiền xe: </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {room.parkingMode === 'none'
                      ? 'Miễn phí'
                      : room.parkingMode === 'fixed'
                      ? `${formatMoney(room.parkingAmount !== undefined ? room.parkingAmount : 150000)}/tháng`
                      : room.parkingMode === 'perPerson'
                      ? `${formatMoney(room.parkingAmount !== undefined ? room.parkingAmount : 150000)}/người`
                      : `${formatMoney(room.parkingAmount !== undefined ? room.parkingAmount : 150000)} x ${room.soXe !== undefined ? room.soXe : (room.status === 'occupied' ? 1 : 0)} xe`}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={15} color="var(--amber-primary)" />
                  <span style={{ color: 'var(--text-muted)' }}>Tiền cọc: </span>
                  <span className="font-mono" style={{ fontWeight: 700, color: room.deposit ? 'var(--amber-primary)' : 'var(--text-muted)' }}>
                    {room.deposit ? formatMoney(room.deposit) : '0đ'}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  marginTop: '4px',
                  padding: '6px 8px',
                  background: 'var(--bg-paper-alt)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-paper)',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                    <Calendar size={13} color="var(--teal-primary)" />
                    <span>HĐ bắt đầu: </span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {room.contractStart ? new Date(room.contractStart).toLocaleDateString('vi-VN') : 'Chưa thiết lập'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                    <Calendar size={13} color="var(--rose-primary)" />
                    <span>HĐ kết thúc: </span>
                    <strong style={{ color: room.contractEnd ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {room.contractEnd ? new Date(room.contractEnd).toLocaleDateString('vi-VN') : 'Chưa thiết lập'}
                    </strong>
                  </div>
                  {room.depositNote && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--text-muted)', marginTop: '2px', paddingTop: '2px', borderTop: '1px dashed var(--border-paper-dark)' }}>
                      <FileText size={13} color="var(--amber-primary)" style={{ minWidth: '13px', marginTop: '2px' }} />
                      <span style={{ fontStyle: 'italic', wordBreak: 'break-word' }}>
                        "{room.depositNote}"
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Action Button */}
              <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed var(--border-paper-dark)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditRoom(room);
                  }}
                  style={{ width: '100%' }}
                >
                  <Edit3 size={13} />
                  <span>Chỉnh sửa phòng</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
