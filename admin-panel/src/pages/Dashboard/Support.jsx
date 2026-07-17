import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { HeadphonesIcon, MessageSquare, CheckCircle, Clock } from 'lucide-react';

const Support = () => {
  const { tenantId } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenantId) loadTickets();
  }, [tenantId]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('tickets').insert([{
        tenant_id: tenantId,
        subject: newTicket.subject,
        message: newTicket.message,
        status: 'open'
      }]);
      if (error) throw error;
      
      setShowModal(false);
      setNewTicket({ subject: '', message: '' });
      loadTickets();
    } catch (err) {
      alert('Erro ao abrir chamado: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'open': return <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> Aguardando Suporte</span>;
      case 'resolved': return <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> Resolvido</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Central de Ajuda</h2>
          <p style={{ color: 'var(--text-color)', opacity: 0.7 }}>Precisa de ajuda com o sistema? Abra um chamado abaixo.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <HeadphonesIcon size={16} /> Abrir Chamado
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Buscando histórico...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>Assunto</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>Data</th>
                <th style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquare size={14} color="var(--primary)" />
                      {ticket.subject}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-color)', opacity: 0.6, marginTop: '4px', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ticket.message}
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px', color: 'var(--text-color)', opacity: 0.8, fontSize: '14px' }}>
                    {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    {getStatusBadge(ticket.status)}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-color)', opacity: 0.5 }}>Nenhum chamado aberto ainda.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card" style={{ width: '500px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeadphonesIcon size={18} color="var(--primary)" /> Novo Chamado
            </h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px', display: 'block' }}>Qual é o assunto?</label>
                <input type="text" className="input" required value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} placeholder="Ex: Dúvida sobre cadastro de produto" />
              </div>
              <div>
                <label style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px', display: 'block' }}>Descreva como podemos ajudar</label>
                <textarea className="input" required value={newTicket.message} onChange={e => setNewTicket({...newTicket, message: e.target.value})} placeholder="Escreva os detalhes aqui..." style={{ minHeight: '120px', resize: 'vertical' }}></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Enviando...' : 'Enviar para o Suporte'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
