import React, { useEffect, useState, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, ExternalLink, Bell, Tags, DollarSign, Power, CreditCard, HeadphonesIcon, Lock, Crown, Menu } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import OnboardingTutorial, { useOnboarding } from '../../components/OnboardingTutorial';

const DashboardLayout = () => {
  const { user, logout, tenantId, role, tenantStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [tenantInfo, setTenantInfo] = useState({ name: 'Carregando...', logo_url: null });
  const { showOnboarding, setShowOnboarding, userId } = useOnboarding();
  
  const isBlocked = tenantStatus === 'blocked' && role !== 'superadmin';

  // Redireciona para faturas se tentar acessar rota bloqueada
  useEffect(() => {
    if (isBlocked && location.pathname !== '/invoices') {
      navigate('/invoices', { replace: true });
    }
  }, [isBlocked, location.pathname, navigate]);
  
  // Guardamos a instância do áudio num ref para não recriar
  const audioRef = useRef(new Audio('/assets/som-pedidos.mp3'));

  useEffect(() => {
    // Busca status da loja
    const fetchStoreStatus = async () => {
      if (!tenantId) return;
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('tenant_id', tenantId)
        .eq('key', 'store_status')
        .single();
      
      if (data) {
        setIsStoreOpen(data.value === 'open');
      }
    };
    
    // Busca dados da Loja (Nome e Logo)
    const fetchTenantInfo = async () => {
      if (!tenantId) return;
      const { data, error } = await supabase
        .from('tenants')
        .select('name, logo_url, slug')
        .eq('id', tenantId)
        .single();
      
      if (data) {
        setTenantInfo({ name: data.name, logo_url: data.logo_url, slug: data.slug });
      }
    };

    // Busca Som Personalizado
    const fetchCustomSound = async () => {
      if (!tenantId) return;
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('tenant_id', tenantId)
        .eq('key', 'site_customization')
        .single();
        
      if (data && data.value) {
        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        if (parsed.notificationSoundUrl) {
          audioRef.current = new Audio(parsed.notificationSoundUrl);
          audioRef.current.load();
        }
      }
    };

    if (tenantId) {
      fetchStoreStatus();
      fetchTenantInfo();
      fetchCustomSound();
    }

    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar avisos:', error);
      } else if (data) {
        console.log('Avisos recebidos:', data);
        setAnnouncements(data);
      }
    };
    fetchAnnouncements();
  }, [tenantId]);

  const toggleStoreStatus = async () => {
    const newStatus = !isStoreOpen;
    setIsStoreOpen(newStatus);
    
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: newStatus ? 'open' : 'closed' })
        .eq('tenant_id', tenantId)
        .eq('key', 'store_status');
        
      if (error) throw error;
      setToastMessage(`Loja ${newStatus ? 'Aberta' : 'Fechada'} com sucesso!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setIsStoreOpen(!newStatus); // rollback
      alert('Erro ao alterar status da loja.');
    }
  };

  useEffect(() => {
    // Se o usuário entrou na página de pedidos, tira o alerta
    if (location.pathname === '/orders') {
      setHasNewOrder(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!tenantId) return;

    // A assinatura em tempo real usa a ref atual do audio, então não precisa estar no array de dependencias.
    // Mas para garantir que não haja vazamentos e que a ref esteja atualizada:
    const subscription = supabase
      .channel('realtime-orders-layout')
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders',
          filter: `tenant_id=eq.${tenantId}`
        }, payload => {
        
        // Toca o som atualizado que estiver no ref
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.warn('Audio blocked by browser auto-play policy:', e));
        }
        
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
  }, [location.pathname, tenantId]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      
      {/* Onboarding Tutorial — aparece apenas para novos usuários */}
      {showOnboarding && (
        <OnboardingTutorial userId={userId} onComplete={() => setShowOnboarding(false)} />
      )}
      
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
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '24px 20px' }}>
          {tenantInfo.logo_url ? (
            <img 
              src={tenantInfo.logo_url} 
              alt="Logo da Loja" 
              style={{ height: '45px', width: 'auto', maxWidth: '100px', objectFit: 'contain', borderRadius: '8px' }} 
            />
          ) : (
            <div style={{ width: '45px', height: '45px', background: 'var(--bg-lighter)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={24} style={{ color: 'var(--gray)' }} />
            </div>
          )}
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--gray)', letterSpacing: '2px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Painel Lojista</span>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.2, color: 'var(--white)', letterSpacing: '-0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tenantInfo.name}
            </h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-category-title" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gray)', fontWeight: 700, margin: '0 0 8px 15px' }}>Visão Geral</div>
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={e => isBlocked && e.preventDefault()}>
            <LayoutDashboard size={20} /> Dashboard
            {isBlocked && <Lock size={14} style={{ marginLeft: 'auto', color: '#ef4444' }} />}
          </NavLink>
          
          <div className="sidebar-category-title" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gray)', fontWeight: 700, margin: '20px 0 8px 15px' }}>Gestão de Loja</div>
          <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${hasNewOrder && !isActive ? 'pulse-animation' : ''}`} onClick={e => isBlocked && e.preventDefault()}>
            <ShoppingCart size={20} /> Pedidos 
            {isBlocked ? (
              <Lock size={14} style={{ marginLeft: 'auto', color: '#ef4444' }} />
            ) : hasNewOrder && (
              <span style={{
                marginLeft:'auto', background:'var(--neon-red)', color:'#fff', 
                padding:'2px 8px', borderRadius:'10px', fontSize:'0.7rem', fontWeight: 700,
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
              }}>Novo!</span>
            )}
          </NavLink>

          <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={e => isBlocked && e.preventDefault()}>
            <Package size={20} /> Produtos
            {isBlocked && <Lock size={14} style={{ marginLeft: 'auto', color: '#ef4444' }} />}
          </NavLink>
          
          <NavLink to="/categories" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={e => isBlocked && e.preventDefault()}>
            <Tags size={20} /> Categorias
            {isBlocked && <Lock size={14} style={{ marginLeft: 'auto', color: '#ef4444' }} />}
          </NavLink>

          {(role === 'admin' || role === 'superadmin') && (
            <>
              <div className="sidebar-category-title" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gray)', fontWeight: 700, margin: '20px 0 8px 15px' }}>Administração</div>
              <NavLink to="/finance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={e => isBlocked && e.preventDefault()}>
                <DollarSign size={20} /> Financeiro
                {isBlocked && <Lock size={14} style={{ marginLeft: 'auto', color: '#ef4444' }} />}
              </NavLink>

              <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={e => isBlocked && e.preventDefault()}>
                <Users size={20} /> Acessos da Equipe
                {isBlocked && <Lock size={14} style={{ marginLeft: 'auto', color: '#ef4444' }} />}
              </NavLink>

              <NavLink to="/invoices" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <CreditCard size={20} /> Minha Assinatura
              </NavLink>
            </>
          )}

          <div style={{ marginTop: 'auto' }}></div>
          <div className="sidebar-category-title" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gray)', fontWeight: 700, margin: '20px 0 8px 15px' }}>Sistema</div>

          <NavLink to="/support" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <HeadphonesIcon size={20} /> Ajuda / Suporte
          </NavLink>
          
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
      <main style={{ 
        flex: 1, 
        marginLeft: isSidebarCollapsed ? '80px' : 'var(--sidebar-w)', 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0,
        transition: 'margin-left var(--transition)' 
      }}>
        
        {/* GLOBAL ANNOUNCEMENTS BANNER */}
        {announcements.map(ann => {
          let bg = 'rgba(59, 130, 246, 0.15)'; // info blue
          let color = '#60a5fa';
          if (ann.type === 'warning') { bg = 'rgba(234, 179, 8, 0.15)'; color = '#fbbf24'; }
          if (ann.type === 'success') { bg = 'rgba(34, 197, 94, 0.15)'; color = '#4ade80'; }
          
          return (
            <div key={ann.id} style={{ background: bg, borderBottom: `1px solid ${color}`, padding: '12px 40px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Bell size={18} color={color} style={{ marginTop: '2px' }} />
              <div>
                <strong style={{ color: color, display: 'block', marginBottom: '2px', fontSize: '14px' }}>{ann.title}</strong>
                <span style={{ color: 'var(--text-color)', fontSize: '13px', opacity: 0.9 }}>{ann.message}</span>
              </div>
            </div>
          );
        })}

        {/* TOPBAR */}
        <header style={{ 
          height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '0 40px', zIndex: 10,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{ 
                background: 'transparent', border: '1px solid var(--border)', 
                borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--gray)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = '#475569'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--gray)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--white)', fontWeight: 600 }}>Central de Operações</h1>
              <p style={{ color: 'var(--gray)', fontSize: '0.8rem', margin: '2px 0 0', fontWeight: 400 }}>Monitoramento em tempo real</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
             
             {/* TOGGLE LOJA */}
             <div style={{ 
               display: 'flex', alignItems: 'center', gap: '12px', 
               background: isStoreOpen ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)', 
               padding: '6px 16px 6px 20px', borderRadius: '30px', 
               border: `1px solid ${isStoreOpen ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
               boxShadow: isStoreOpen ? '0 0 15px rgba(34, 197, 94, 0.1)' : '0 0 15px rgba(239, 68, 68, 0.1)'
             }}>
               <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: isStoreOpen ? '#4ade80' : '#f87171' }}>
                 {isStoreOpen ? 'LOJA ABERTA' : 'LOJA FECHADA'}
               </span>
               <button 
                 onClick={toggleStoreStatus}
                 style={{ 
                   width: '46px', height: '26px', borderRadius: '15px', 
                   background: isStoreOpen ? '#22c55e' : 'rgba(255,255,255,0.1)',
                   border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s'
                 }}
               >
                 <div style={{
                   width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                   position: 'absolute', top: '3px', left: isStoreOpen ? '23px' : '3px',
                   transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                   boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                 }}>
                   <Power size={12} color={isStoreOpen ? '#22c55e' : '#ef4444'} />
                 </div>
               </button>
             </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
          {isBlocked && location.pathname !== '/invoices' ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <Lock size={64} color="#ef4444" style={{ marginBottom: '20px', opacity: 0.2 }} />
              <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '10px' }}>Acesso Restrito</h2>
              <p style={{ color: '#94a3b8', maxWidth: '400px' }}>Sua loja está bloqueada. Regularize sua assinatura na aba "Minha Assinatura" ou entre em contato com o suporte.</p>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
        
      </main>

      <style>{`
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulseLive {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
