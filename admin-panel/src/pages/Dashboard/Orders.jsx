import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Clock, Search, XCircle } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    
    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        // Recarregar pedidos se houver qualquer alteração (Insert, Update, Delete)
        loadOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      // loadOrders será disparado pelo Realtime
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status.');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Concluído':
        return <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> {status}</span>;
      case 'Cancelado':
        return <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={14}/> {status}</span>;
      default:
        return <span style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> {status || 'Pendente'}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Últimos Pedidos</h2>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
          <input 
            type="text" 
            className="form-control" 
            style={{ paddingLeft: '38px', width: '250px' }} 
            placeholder="Buscar cliente..." 
          />
        </div>
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px', color: 'var(--gray)', fontWeight: 500 }}>Cliente</th>
              <th style={{ padding: '16px', color: 'var(--gray)', fontWeight: 500 }}>Contato</th>
              <th style={{ padding: '16px', color: 'var(--gray)', fontWeight: 500 }}>Data</th>
              <th style={{ padding: '16px', color: 'var(--gray)', fontWeight: 500 }}>Total</th>
              <th style={{ padding: '16px', color: 'var(--gray)', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '16px', color: 'var(--gray)', fontWeight: 500, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--gray)' }}>Carregando pedidos...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--gray)' }}>Nenhum pedido encontrado.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'var(--transition)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 500 }}>{order.customer_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{order.delivery_address}</div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--gray)' }}>{order.customer_phone}</td>
                  <td style={{ padding: '16px', color: 'var(--gray)', fontSize: '0.9rem' }}>
                    {new Date(order.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>R$ {Number(order.total).toFixed(2)}</td>
                  <td style={{ padding: '16px' }}>{getStatusBadge(order.status)}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <select 
                      className="form-control" 
                      style={{ width: '130px', padding: '6px', fontSize: '0.85rem' }}
                      value={order.status || 'Pendente'}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
