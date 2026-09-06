import React, { useState, useEffect } from 'react';
import { Home, Key, FileText, Settings as SettingsIcon, Clock, Calendar, Building2, Plus, Edit2, Trash2, PieChart, Menu, X } from 'lucide-react';
import { socket } from '../services/socket';

export default function Navbar({
  activeTab,
  setActiveTab,
  buildings,
  selectedBuildingId,
  setSelectedBuildingId,
  onOpenAddBuilding,
  onOpenEditBuilding,
  onDeleteBuilding
}) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan',        icon: Home },
    { id: 'rooms',     label: 'Phòng & Khách',     icon: Key },
    { id: 'invoices',  label: 'Hóa đơn',           icon: FileText },
    { id: 'expenses',  label: 'Chi phí',            icon: PieChart },
    { id: 'settings',  label: 'Cài đặt',            icon: SettingsIcon }
  ];

  const formatDateTime = (date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayName = days[date.getDay()];
    const day   = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year  = date.getFullYear();
    const hh    = String(date.getHours()).padStart(2, '0');
    const mm    = String(date.getMinutes()).padStart(2, '0');
    const ss    = String(date.getSeconds()).padStart(2, '0');
    return {
      dayStr: `${dayName} ${day}/${month}/${year}`,
      timeStr: `${hh}:${mm}:${ss}`
    };
  };

  const { dayStr, timeStr } = formatDateTime(currentTime);

  const handleTabClick = (id) => {
    setActiveTab(id);
    setMenuOpen(false);
  };

  return (
    <header style={{
      backgroundColor: 'rgba(255,255,255,0.06)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(45,212,191,0.2)',
      boxShadow: '0 4px 24px rgba(13,148,136,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* ── Top Row: Logo + Clock + Hamburger ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              backgroundColor: 'var(--teal-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(0.95rem, 3vw, 1.3rem)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                SỔ QUẢN LÝ PHÒNG TRỌ
              </h1>
              <p className="navbar-logo-subtitle" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Quản lý nhiều căn nhà • Real-time
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Clock — hidden on mobile via CSS */}
            <div className="navbar-clock" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '10px',
              backgroundColor: 'var(--bg-paper-alt)',
              border: '1px solid var(--border-paper)', fontSize: '0.85rem'
            }}>
              <Clock size={15} color="var(--teal-primary)" />
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--teal-primary)' }}>{timeStr}</span>
              <span style={{ color: 'var(--border-paper-dark)' }}>|</span>
              <Calendar size={14} color="var(--text-muted)" />
              <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{dayStr}</span>
            </div>

            {/* Hamburger — only visible on mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'none',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(45,212,191,0.25)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                cursor: 'pointer',
                padding: '7px 9px',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="hamburger-btn"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Building Tabs ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 10px', backgroundColor: 'var(--bg-paper-alt)',
          borderRadius: '12px', border: '1px solid var(--border-paper)',
          overflowX: 'auto'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600,
            paddingRight: '8px', borderRight: '1px solid var(--border-paper)',
            whiteSpace: 'nowrap', flexShrink: 0
          }}>
            <Building2 size={15} />
            <span>NHÀ:</span>
          </div>

          <div style={{ display: 'flex', gap: '6px', flex: 1, overflowX: 'auto', alignItems: 'center' }}>
            {buildings.map((b) => {
              const isSelected = b._id === selectedBuildingId;
              return (
                <div
                  key={b._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '5px 10px', borderRadius: '8px',
                    backgroundColor: isSelected ? 'var(--teal-primary)' : 'var(--bg-paper-card)',
                    color: isSelected ? '#fff' : 'var(--text-main)',
                    border: isSelected ? 'none' : '1px solid var(--border-paper)',
                    cursor: 'pointer', fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.84rem', transition: 'all 0.2s ease', whiteSpace: 'nowrap'
                  }}
                  onClick={() => setSelectedBuildingId(b._id)}
                >
                  <span>{b.name}</span>
                  {isSelected && (
                    <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }} onClick={(e) => e.stopPropagation()}>
                      <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.85, padding: '1px' }}
                        title="Sửa" onClick={() => onOpenEditBuilding(b)}>
                        <Edit2 size={12} />
                      </button>
                      {buildings.length > 1 && (
                        <button style={{ background: 'none', border: 'none', color: '#ffb3b3', cursor: 'pointer', opacity: 0.85, padding: '1px' }}
                          title="Xóa" onClick={() => onDeleteBuilding(b)}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <button onClick={onOpenAddBuilding} className="btn btn-outline" style={{
              borderRadius: '8px', padding: '5px 10px', fontSize: '0.8rem',
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px',
              borderColor: 'var(--teal-primary)', color: 'var(--teal-primary)', flexShrink: 0
            }}>
              <Plus size={14} />
              <span>Thêm</span>
            </button>
          </div>
        </div>

        {/* ── Nav Tabs — Desktop ── */}
        <nav className="nav-tabs-desktop" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: '10px', whiteSpace: 'nowrap', padding: '7px 14px', fontSize: '0.875rem', fontWeight: isActive ? 700 : 500 }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Nav Tabs — Mobile Drawer ── */}
        {menuOpen && (
          <div className="nav-mobile-drawer" style={{
            display: 'flex', flexDirection: 'column', gap: '4px',
            paddingBottom: '8px'
          }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '11px 14px', borderRadius: '10px', border: 'none',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    fontSize: '0.95rem', fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? 'var(--teal-primary)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#fff' : 'var(--text-main)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
