import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { HeadphonesIcon, MessageSquare, CheckCircle, Clock } from 'lucide-react';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      // Busca chamados com os dados do inquilino (join manual)
      const { data: ticketsData, error: tError } = await supabase
        .from('tickets')
        .select('*')
        .order('status', { ascending: true }) // open first
        .order('created_at', { ascending: false });

      if (tError) throw tError;
      
      const { data: tenData } = await supabase.from('tenants').select('id, name');
      
      const mapped = ticketsData?.map(t => {
        const tenant = tenData?.find(tenant => tenant.id === t.tenant_id);
        return {
          ...t,
          tenant_name: tenant ? tenant.name : 'Loja Desconhecida'
        };
      });

      setTickets(mapped || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (id) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: 'resolved' })
        .eq('id', id);
        
      if (error) throw error;
      loadTickets();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'open': return <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> Pendente</span>;
      case 'resolved': return <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> Resolvido</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Central de Chamados (Helpdesk)</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie os pedidos de suporte e dúvidas dos seus clientes.</p>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Buscando chamados...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Loja (Inquilino)</th>
                <th>Assunto & Mensagem</th>
                <th>Data</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ação Master</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id} style={{ opacity: ticket.status === 'resolved' ? 0.6 : 1 }}>
                  <td style={{ fontWeight: 600 }}>{ticket.tenant_name}</td>
                  <td>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-color)' }}>
                      <MessageSquare size={14} color="var(--primary)" />
                      {ticket.subject}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '300px' }}>
                      {ticket.message}
                    </div>
                  </td>
                  <td style={{ fontSize: '13px' }}>
                    {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td>{getStatusBadge(ticket.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {ticket.status !== 'resolved' && (
                      <button 
                        onClick={() => markAsResolved(ticket.id)}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px', background: '#22c55e', borderColor: '#22c55e', color: '#000' }}
                      >
                        <CheckCircle size={14} /> Fechar Chamado
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Nenhum chamado aberto na sua base de clientes!</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Tickets;
