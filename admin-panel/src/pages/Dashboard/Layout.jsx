import React, { useEffect, useState, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, ExternalLink, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Guardamos a instância do áudio num ref para não recriar
  const audioRef = useRef(new Audio('/assets/som-pedidos.mp3'));

  useEffect(() => {
    // Se o usuário entrou na página de pedidos, tira o alerta
    if (location.pathname === '/orders') {
      setHasNewOrder(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Configura o áudio
    audioRef.current.load();

    const subscription = supabase
      .channel('realtime-orders-layout')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        
        // Toca o som (ignora silenciosamente se o navegador bloquear)
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.warn('Audio blocked by browser auto-play policy:', e));
        
        const customerName = payload.new.customer_name || 'Cliente';
        setToastMessage(`Pedido Novo: ${customerName}`);
        
        // Ativa o pulse
        if (location.pathname !== '/orders') {
          setHasNewOrder(true);
        }

        setTimeout(() => {
          setToastMessage(null);
        }, 6000);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      
      {/* Toast de Notificação Premium */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '30px', right: '30px', zIndex: 9999,
          background: 'var(--bg-sidebar)', color: '#fff', padding: '16px 24px',
          borderRadius: '16px', boxShadow: 'var(--shadow-neon)',
          border: '1px solid var(--neon-blue)',
          display: 'flex', alignItems: 'center', gap: '14px',
          animation: 'slideInDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
        }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '50%', color: 'var(--neon-blue)' }}>
            <Bell size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--neon-blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Novo Alerta</div>
            <strong style={{ fontSize: '1.05rem' }}>{toastMessage}</strong>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.5))' }}>👑</div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.2, color: 'var(--white)' }}>Imperatriz</h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--neon-blue)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>Painel Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          
          <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${hasNewOrder && !isActive ? 'pulse-animation' : ''}`}>
            <ShoppingCart size={20} /> Pedidos 
            {hasNewOrder && (
              <span style={{
                marginLeft:'auto', background:'var(--neon-red)', color:'#fff', 
                padding:'2px 8px', borderRadius:'10px', fontSize:'0.7rem', fontWeight: 700,
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
              }}>Novo!</span>
            )}
          </NavLink>

          <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Package size={20} /> Produtos
          </NavLink>
          
          <div className="nav-divider"></div>
          
          <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="nav-item">
            <ExternalLink size={20} /> Ver Site Oficial
          </a>
          
          <div className="nav-divider"></div>
          
          <button onClick={handleLogout} className="nav-item danger">
            <LogOut size={20} /> Sair
          </button>
        </nav>

        <div className="sidebar-user" style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--neon-blue), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}>
            A
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Administrador</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>{user?.email}</div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-w)', display: 'flex', flexDirection: 'column' }}>
        
        {/* TOPBAR */}
        <header className="glass" style={{ height: '80px', borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', margin: 0, background: 'linear-gradient(to right, #fff, var(--gray))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Gestão Imperial</h1>
            <p style={{ color: 'var(--gray)', fontSize: '0.85rem', margin: 0 }}>Monitoramento em Tempo Real</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
             <button className="btn btn-outline" onClick={() => {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e=>console.warn(e));
                setToastMessage('Alerta de Teste Tocado!');
                setHasNewOrder(true);
                setTimeout(() => setToastMessage(null), 4000);
             }}>
                <Bell size={18}/> Testar Áudio
             </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
        
      </main>

      <style>{`
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
