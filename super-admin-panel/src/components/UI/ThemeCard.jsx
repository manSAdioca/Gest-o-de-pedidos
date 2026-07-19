import React from 'react';

const ThemeCard = ({ active, onClick, title, desc, icon }) => (
  <div onClick={onClick} style={{ flex: 1, minWidth: '140px', padding: '16px', borderRadius: '12px', border: `2px solid ${active ? 'var(--primary)' : 'transparent'}`, background: active ? 'rgba(205, 164, 52, 0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: '0.2s', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
    <div style={{ fontSize: '28px', marginBottom: '4px' }}>{icon}</div>
    <div style={{ fontWeight: 'bold', fontSize: '13px', color: active ? 'var(--primary)' : 'var(--text-main)' }}>{title}</div>
    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{desc}</div>
  </div>
);

export default ThemeCard;
