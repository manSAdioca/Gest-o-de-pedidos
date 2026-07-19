import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, Search, CheckCircle, Truck, Package, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const COLUMNS = [
  { id: 'Pendente', title: 'Pendentes', icon: <Clock size={16} />, color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' },
  { id: 'Em Preparo', title: 'Em Preparo', icon: <Package size={16} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  { id: 'Em Rota', title: 'Em Rota', icon: <Truck size={16} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  { id: 'Concluído', title: 'Concluídos', icon: <CheckCircle size={16} />, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  { id: 'Cancelado', title: 'Cancelados', icon: <XCircle size={16} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
];

const Orders = () => {
  const { tenantId, role } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!tenantId && !['superadmin', 'admin', 'funcionario'].includes(role)) return;
    loadOrders();
    
    const filter = `tenant_id=eq.${tenantId}`;
    
    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter }, payload => {
        loadOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tenantId, role]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      let query = supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: false });

      if (role !== 'superadmin' && tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Mapear status legados que não estão nas novas colunas para "Pendente"
      const formattedData = data.map(order => ({
        ...order,
        status: COLUMNS.find(c => c.id === order.status) ? order.status : 'Pendente'
      }));
      
      setOrders(formattedData || []);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    // Optimistic UI Update para ficar instantâneo na tela
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status.');
      loadOrders(); // rollback se der erro
    }
  };

  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData('orderId', orderId);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (orderId) {
      const order = orders.find(o => o.id === orderId);
      if (order && order.status !== newStatus) {
        updateOrderStatus(orderId, newStatus);
      }
    }
  };

  const handleBoardDragOver = (e) => {
    e.preventDefault();
    const board = e.currentTarget;
    const edgeThreshold = 250; // Começa a rolar mais cedo
    const maxSpeed = 60; // Velocidade máxima (míssil teleguiado)

    const rect = board.getBoundingClientRect();
    if (e.clientX > rect.right - edgeThreshold) {
      // Quanto mais perto da borda, mais rápido vai (efeito aceleração)
      const distance = edgeThreshold - (rect.right - e.clientX);
      const intensity = Math.max(0.1, distance / edgeThreshold);
      board.scrollLeft += maxSpeed * intensity;
    } else if (e.clientX < rect.left + edgeThreshold) {
      const distance = edgeThreshold - (e.clientX - rect.left);
      const intensity = Math.max(0.1, distance / edgeThreshold);
      board.scrollLeft -= maxSpeed * intensity;
    }
  };

  // Filtrar ordens
  const filteredOrders = orders.filter(o => 
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ height: 'calc(100vh - 120px)', width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
        <h2>Gestão de Pedidos (Kanban)</h2>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
          <input 
            type="text" 
            className="form-control" 
            style={{ paddingLeft: '38px', width: '300px' }} 
            placeholder="Buscar por cliente ou endereço..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--gray)' }}>Carregando funil de pedidos...</div>
      ) : (
        <div 
          onDragOver={handleBoardDragOver}
          style={{ 
          display: 'flex', 
          gap: '20px', 
          overflowX: 'auto', 
          paddingBottom: '20px',
          flex: 1,
          alignItems: 'flex-start',
          scrollBehavior: 'auto'
        }}>
          {COLUMNS.map(column => {
            const columnOrders = filteredOrders.filter(o => o.status === column.id);
            
            return (
              <div 
                key={column.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
                style={{
                  minWidth: '320px',
                  width: '320px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '100%',
                  border: `1px solid ${column.bg}`
                }}
              >
                {/* Header da Coluna */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: column.color, display: 'flex' }}>{column.icon}</div>
                    <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{column.title}</strong>
                  </div>
                  <span style={{ background: column.bg, color: column.color, padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {columnOrders.length}
                  </span>
                </div>

                {/* Lista de Cards */}
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {columnOrders.map(order => (
                    <div 
                      key={order.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, order.id)}
                      onDragEnd={handleDragEnd}
                      className="glass"
                      style={{ 
                        padding: '16px', 
                        cursor: 'grab',
                        borderLeft: `4px solid ${column.color}`,
                        transition: 'transform 0.2s',
                        userSelect: 'none'
                      }}
                      onDragOver={(e) => e.preventDefault()} // necessary to avoid buggy dragging
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                          {new Date(order.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <strong style={{ color: column.color, fontSize: '0.9rem' }}>R$ {Number(order.total).toFixed(2)}</strong>
                      </div>
                      
                      <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px' }}>
                        {order.customer_name}
                      </div>
                      
                      <div style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.delivery_address || 'Retirada'}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#a1a1aa' }}>ID: {order.id.substring(0, 8)}</span>
                        
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--border)',
                            color: 'white',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          {COLUMNS.map(col => (
                            <option key={col.id} value={col.id} style={{ color: '#000' }}>
                              Mover: {col.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  
                  {columnOrders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray)', fontSize: '0.9rem', borderStyle: 'dashed', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                      Arraste pedidos para cá
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
