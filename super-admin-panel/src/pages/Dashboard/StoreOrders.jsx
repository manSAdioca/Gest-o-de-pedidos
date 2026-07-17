import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const StoreOrders = () => {
  const { tenantId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) fetchOrders();
  }, [tenantId]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
      
    if (data) setOrders(data);
    setLoading(false);
  };

  const updateOrderStatus = async (id, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } else {
      alert("Erro ao atualizar status");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Meus Pedidos</h1>
      </div>

      <div className="card">
        {loading ? (
          <p>Carregando pedidos...</p>
        ) : orders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Você ainda não recebeu nenhum pedido.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Método</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{new Date(o.created_at).toLocaleString('pt-BR')}</td>
                  <td>
                    {o.customer_name} <br/>
                    <small style={{ color: 'var(--text-muted)' }}>{o.customer_phone}</small>
                  </td>
                  <td>R$ {Number(o.total).toFixed(2)}</td>
                  <td>{o.payment_method === 'pix' ? 'PIX' : (o.payment_method === 'credit_card' ? 'Cartão' : 'Dinheiro')}</td>
                  <td>
                    <span className={`badge ${o.status === 'Cancelado' ? 'badge-danger' : 'badge-success'}`}>
                      {o.status || 'Pendente'}
                    </span>
                  </td>
                  <td>
                    <select 
                      className="input" 
                      style={{ padding: '4px', fontSize: '12px' }}
                      value={o.status || 'Pendente'}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em Preparação">Em Preparação</option>
                      <option value="Saiu para Entrega">Saiu para Entrega</option>
                      <option value="Entregue">Entregue</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StoreOrders;
