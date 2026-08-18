import React, { useState, useEffect } from 'react';
import { Home, Key, FileText, Settings as SettingsIcon, Wifi, Clock, Calendar } from 'lucide-react';
import { socket } from '../services/socket';

export default function Navbar({ activeTab, setActiveTab }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: '1. Tổng quan', icon: Home },
    { id: 'rooms', label: '2. Phòng & Người thuê', icon: Key },
    { id: 'invoices', label: '3. Hóa đơn tháng', icon: FileText },
    { id: 'settings', label: '4. Cài đặt', icon: SettingsIcon }
  ];

  const formatDateTime = (date) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return {
      dayStr: `${dayName}, ${day}/${month}/${year}`,
      timeStr: `${hours}:${minutes}:${seconds}`
    };
  };

  const { dayStr, timeStr } = formatDateTime(currentTime);

  return (
    <header style={{ backgroundColor: 'var(--bg-paper-card)', borderBottom: '1px solid var(--border-paper)', sticky: 'top' }}>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'var(--teal-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Key size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>SỔ QUẢN LÝ PHÒNG TRỌ</h1>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>Hệ thống theo dõi & tính tiền trọ thời gian thực</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Live Clock Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-paper-alt)',
                border: '1px solid var(--border-paper)',
                fontSize: '0.875rem'
              }}
            >
              <Clock size={16} color="var(--teal-primary)" />
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--teal-primary)', fontSize: '0.95rem' }}>
                {timeStr}
              </span>
              <span style={{ color: 'var(--border-paper-dark)' }}>|</span>
              <Calendar size={15} color="var(--text-muted)" />
              <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{dayStr}</span>
            </div>

            <div className="live-indicator">
              <span className="live-dot" style={{ backgroundColor: isConnected ? 'var(--teal-primary)' : 'var(--rose-primary)' }}></span>
              <span>{isConnected ? 'Real-time Connected' : 'Connecting...'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
