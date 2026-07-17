import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, Download, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Finance = () => {
  const { tenantId } = useAuth();
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      loadFinanceData();
    }
  }, [tenantId]);

  const loadFinanceData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      // Define a data limite para, por exemplo, os últimos 30 dias ou início do mês atual
      const firstDay = new Date();
      firstDay.setDate(firstDay.getDate() - 30);

      // 1. Buscar todos os pedidos
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('created_at', firstDay.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. Agrupar por dia
      const groupedData = {};

      if (orders) {
        orders.forEach(order => {
          if (order.created_at) {
            const dateObj = new Date(order.created_at);
            // Formato YYYY-MM-DD para garantir o agrupamento exato por data local
            const dateKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
            
            if (!groupedData[dateKey]) {
              groupedData[dateKey] = {
                date: dateKey,
                orderCount: 0,
                totalRevenue: 0,
                itemsSold: 0
              };
            }
            
            groupedData[dateKey].orderCount += 1;
            groupedData[dateKey].totalRevenue += (Number(order.total) || 0);
            
            // Somar quantidade de itens vendidos (opcional, mas bom ter no relatório)
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach(item => {
                groupedData[dateKey].itemsSold += (Number(item.quantity) || 1);
              });
            }
          }
        });
      }

      // 3. Converter o objeto agrupado de volta para um array e ordenar (do mais recente pro mais antigo)
      const historyArray = Object.values(groupedData).sort((a, b) => new Date(b.date) - new Date(a.date));
      setSalesHistory(historyArray);

    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (salesHistory.length === 0) return;
    
    const headers = ['Data', 'Qtd. Pedidos', 'Qtd. Itens Vendidos', 'Faturamento Total (R$)'];
    const csvRows = [headers.join(';')];
    
    salesHistory.forEach(day => {
      // Formatar a data para o CSV (DD/MM/YYYY)
      const [year, month, dayNum] = day.date.split('-');
      const formattedDate = `${dayNum}/${month}/${year}`;
      
      const row = [
        formattedDate,
        day.orderCount,
        day.itemsSold,
        day.totalRevenue.toFixed(2).replace('.', ',')
      ];
      csvRows.push(row.join(';'));
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper para formatar a data na tela
  const formatDateForDisplay = (dateString) => {
    const [year, month, dayNum] = dateString.split('-');
    return `${dayNum}/${month}/${year}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Financeiro e Histórico</h2>
        <button className="btn btn-outline" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neon-green)', borderColor: 'var(--neon-green)' }}>
          <Download size={18} /> Exportar Relatório Geral
        </button>
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>Carregando histórico...</div>
        ) : salesHistory.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>Nenhuma venda registrada ainda.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500 }}>Data do Fechamento</th>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500, textAlign: 'center' }}>Total de Pedidos</th>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500, textAlign: 'center' }}>Produtos Vendidos</th>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500, textAlign: 'right' }}>Faturamento Total</th>
              </tr>
            </thead>
            <tbody>
              {salesHistory.map((day, idx) => {
                // Destacar o primeiro item se for "hoje"
                const today = new Date();
                const todayKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
                const isToday = day.date === todayKey;

                return (
                  <tr key={day.date} style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.05)', 
                    background: isToday ? 'rgba(34, 197, 94, 0.05)' : 'transparent' 
                  }}>
                    <td style={{ padding: '16px 24px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', 
                        background: isToday ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isToday ? '#22c55e' : 'var(--gray)'
                      }}>
                        <Calendar size={16} />
                      </div>
                      <div>
                        {formatDateForDisplay(day.date)}
                        {isToday && <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 6px', borderRadius: '4px' }}>HOJE EM ABERTO</span>}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--white)' }}>{day.orderCount}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--gray)' }}>
                      {day.itemsSold} unid.
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', color: 'var(--neon-green)', fontWeight: 600 }}>
                        R$ {day.totalRevenue.toFixed(2).replace('.', ',')}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default Finance;
