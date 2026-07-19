import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Download, Calendar, DollarSign, ShoppingBag, Tag } from 'lucide-react';

export default function Reports() {
  const { tenantId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [period, setPeriod] = useState('month'); // today, week, month, all
  const [summary, setSummary] = useState({ total_sales: 0, total_revenue: 0, total_discount: 0 });

  useEffect(() => {
    if (tenantId) fetchOrders();
  }, [tenantId, period]);

  async function fetchOrders() {
    setLoading(true);
    let query = supabase.from('orders').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });

    // Aplicar filtro de data
    const now = new Date();
    let startDate = new Date();
    
    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
      query = query.gte('created_at', startDate.toISOString());
    } else if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
      query = query.gte('created_at', startDate.toISOString());
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) {
      console.error(error);
    } else {
      const validOrders = data || [];
      // Vamos contabilizar apenas pedidos Concluídos ou Pagos no faturamento, 
      // mas para ser simples, vamos contabilizar todos os que não são Cancelados.
      const successfulOrders = validOrders.filter(o => o.status !== 'Cancelado');
      
      const total_revenue = successfulOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const total_discount = successfulOrders.reduce((sum, o) => sum + (Number(o.discount_amount) || 0), 0);
      
      setSummary({
        total_sales: successfulOrders.length,
        total_revenue,
        total_discount
      });
      setOrders(validOrders);
    }
    setLoading(false);
  }

  const exportCSV = () => {
    if (orders.length === 0) return alert('Não há pedidos para exportar.');
    
    // Header do CSV
    let csv = 'ID,Data,Cliente,Telefone,Status,Subtotal/Desconto/Frete,Total,Pagamento,Cupom\n';
    
    orders.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString('pt-BR');
      const time = new Date(o.created_at).toLocaleTimeString('pt-BR');
      // Tratando vírgulas para não quebrar o CSV
      const name = o.customer_name ? `"${o.customer_name}"` : 'N/A';
      const phone = o.customer_phone || 'N/A';
      const status = o.status || 'N/A';
      const payment = o.payment_method || 'N/A';
      const coupon = o.coupon_code || '';
      const total = o.total ? Number(o.total).toFixed(2).replace('.', ',') : '0,00';
      
      csv += `${o.id},${date} ${time},${name},${phone},${status},-,R$ ${total},${payment},${coupon}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_vendas_${period}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearTestOrders = async () => {
    if (!window.confirm('TEM CERTEZA? Isso vai apagar TODOS os pedidos da sua loja para sempre. Use apenas para limpar dados de teste!')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('tenant_id', tenantId);
        
      if (error) throw error;
      alert('Pedidos de teste apagados com sucesso!');
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Erro ao apagar pedidos. Verifique as permissões.');
      setLoading(false);
    }
  };

  const statCard = (title, value, icon, color) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
        {icon}
      </div>
      <div>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 4px 0', fontWeight: 600 }}>{title}</p>
        <h3 style={{ margin: 0, fontSize: '24px', color: '#fff' }}>{value}</h3>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={26} color="#8b5cf6" /> Relatórios
          </h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
            Acompanhe o desempenho da sua loja e exporte os dados.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}>
            <option value="today" style={{ background: '#0f172a', color: '#fff' }}>Hoje</option>
            <option value="week" style={{ background: '#0f172a', color: '#fff' }}>Últimos 7 dias</option>
            <option value="month" style={{ background: '#0f172a', color: '#fff' }}>Últimos 30 dias</option>
            <option value="all" style={{ background: '#0f172a', color: '#fff' }}>Todo o período</option>
          </select>
          <button onClick={clearTestOrders} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>
            Limpar Testes
          </button>
          <button onClick={exportCSV} disabled={loading || orders.length === 0} style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: (loading || orders.length===0) ? 'not-allowed' : 'pointer', opacity: (loading || orders.length===0) ? 0.5 : 1 }}>
            <Download size={18} /> Exportar CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#64748b' }}>Carregando dados...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {statCard('Total Faturado', `R$ ${summary.total_revenue.toFixed(2).replace('.', ',')}`, <DollarSign size={28} />, '#22c55e')}
            {statCard('Pedidos Finalizados', summary.total_sales, <ShoppingBag size={28} />, '#3b82f6')}
            {statCard('Descontos Concedidos', `R$ ${summary.total_discount.toFixed(2).replace('.', ',')}`, <Tag size={28} />, '#ec4899')}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={18} color="#94a3b8" />
              <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>Listagem de Pedidos</h3>
            </div>
            
            {orders.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Nenhum pedido encontrado neste período.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Data</th>
                      <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Cliente</th>
                      <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Total</th>
                      <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Cupom</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 50).map(order => (
                      <tr key={order.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '16px 20px', color: '#fff', fontSize: '14px' }}>
                          {new Date(order.created_at).toLocaleDateString('pt-BR')} <span style={{ color: '#64748b' }}>{new Date(order.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#fff', fontSize: '14px' }}>{order.customer_name || 'Desconhecido'}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: order.status === 'Cancelado' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)', color: order.status === 'Cancelado' ? '#ef4444' : '#3b82f6' }}>
                            {order.status || 'Pendente'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#22c55e', fontSize: '14px', fontWeight: 600 }}>
                          R$ {Number(order.total).toFixed(2).replace('.', ',')}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#ec4899', fontSize: '14px', fontWeight: 600 }}>
                          {order.coupon_code ? order.coupon_code : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length > 50 && (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    Exibindo os 50 pedidos mais recentes. Exporte para CSV para ver todos.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
