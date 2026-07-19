import React from 'react';

const CustomToggle = ({ checked, onChange, label, icon, color = 'var(--primary)' }) => (
  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: checked ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)', border: `1px solid ${checked ? color : 'var(--border)'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: checked ? '#fff' : 'var(--gray)' }}>{label}</span>
    </div>
    <div style={{ width: '40px', height: '22px', background: checked ? color : '#374151', borderRadius: '20px', position: 'relative', transition: '0.3s' }}>
      <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: checked ? '21px' : '3px', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
  </label>
);

export default CustomToggle;
