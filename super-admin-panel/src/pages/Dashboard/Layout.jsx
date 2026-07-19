import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Store, CreditCard, LogOut, Tags, Megaphone, HeadphonesIcon, Mail, Settings, Menu, X } from 'lucide-react';

const Layout = () => {
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', padding: '10px', position: 'relative' }}>
          {/* Brilho dourado por trás da logo */}
          <div style={{ position: 'absolute', width: '100px', height: '50px', background: 'var(--primary)', filter: 'blur(40px)', opacity: 0.15, top: '10px', left: '20px' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <img src="/logo.png" alt="Soul Estratégias" style={{ maxWidth: '160px', marginBottom: '8px', filter: 'drop-shadow(0 0 8px rgba(205, 164, 52, 0.3))' }} />
            <p style={{ fontSize: '11px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600', opacity: 0.8 }}>Painel Master</p>
          </div>
          <button className="mobile-header" style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '0' }} onClick={closeSidebar}>
             <X size={24} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          
          {role === 'superadmin' ? (
            <>
              <NavLink to="/" end onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} /> Resumo Global
              </NavLink>
              <NavLink to="/tenants" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Store size={18} /> Lojas (Inquilinos)
              </NavLink>
              <NavLink to="/plans" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Tags size={18} /> Planos de Assinatura
              </NavLink>
              <NavLink to="/global-catalog" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Store size={18} /> Catálogo Global
              </NavLink>

              <NavLink to="/invoices" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <CreditCard size={18} /> Cobranças (Geral)
              </NavLink>
              <NavLink to="/announcements" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Megaphone size={18} /> Avisos Globais
              </NavLink>
              <NavLink to="/tickets" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <HeadphonesIcon size={18} /> Central de Suporte
              </NavLink>
              <NavLink to="/emails" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Mail size={18} /> Disparo de E-mails
              </NavLink>
              <NavLink to="/white-label" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Settings size={18} /> White Label
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} /> Painel da Loja
              </NavLink>
              <NavLink to="/orders" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <CreditCard size={18} /> Meus Pedidos
              </NavLink>
              <NavLink to="/products" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Tags size={18} /> Meus Produtos
              </NavLink>
              <NavLink to="/categories" onClick={closeSidebar} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Store size={18} /> Minhas Categorias
              </NavLink>
            </>
          )}

          <button 
            onClick={handleLogout} 
            className="nav-link" 
            style={{ marginTop: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <LogOut size={18} /> Sair do Painel
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <img src="/logo.png" alt="Soul Estratégias" style={{ maxWidth: '120px' }} />
          </div>
          <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
            <Menu size={28} />
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
