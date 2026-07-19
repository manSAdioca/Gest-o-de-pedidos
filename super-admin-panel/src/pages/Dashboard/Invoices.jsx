import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Plus, ExternalLink, RefreshCw, AlertTriangle, CheckCircle, Clock, ShieldBan, X, Trash, FileText, DollarSign, CreditCard } from 'lucide-react';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTenant, setFilterTenant] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newInvoice, setNewInvoice] = useState({
    tenant_id: '',
    amount: '',
    due_date: '',
    notes: '',
    payment_link: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [{ data: invData, error: invError }, { data: tenData }] = await Promise.all([
        supabase.from('invoices').select('*').order('due_date', { ascending: false }),
        supabase.from('tenants').select('id, name, phone, status')
      ]);

      if (invError) throw invError;

      const mapped = invData?.map(inv => {
        const tenant = tenData?.find(t => t.id === inv.tenant_id);
        return { ...inv, tenant_name: tenant?.name || 'Loja Desconhecida', tenant_phone: tenant?.phone || '' };
      });

      setInvoices(mapped || []);
      setTenants(tenData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id) => {
    if (!window.confirm('Confirmar baixa manual desta fatura?')) return;
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;

      // Verifica se tenant tem outras pendências antes de reativar
      const { data: pending } = await supabase
        .from('invoices')
        .select('id')
        .eq('tenant_id', invoices.find(i => i.id === id)?.tenant_id)
        .in('status', ['pending', 'overdue']);
      
      if (!pending || pending.length === 0) {
        const tenantId = invoices.find(i => i.id === id)?.tenant_id;
        await supabase.from('tenants').update({ status: 'active' }).eq('id', tenantId);
      }

      loadData();
    } catch (err) {
      alert('Erro ao atualizar: ' + err.message);
    }
  };

  const blockTenantNow = async (tenantId) => {
    if (!window.confirm('Bloquear esta loja imediatamente?')) return;
    try {
      await supabase.from('tenants').update({ status: 'blocked' }).eq('id', tenantId);
      loadData();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const toggleInvoiceStatus = async (id, currentStatus) => {
    const isCancelled = currentStatus === 'cancelled';
    const actionText = isCancelled ? 'Reativar' : 'Cancelar (desativar)';
    const newStatus = isCancelled ? 'pending' : 'cancelled';

    if (!window.confirm(`${actionText} esta fatura?`)) return;

    try {
      await supabase.from('invoices').update({ status: newStatus }).eq('id', id);
      loadData();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm('ATENÇÃO: Deseja apagar esta fatura PERMANENTEMENTE? Esta ação não pode ser desfeita.')) return;
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) {
        if (error.code === '42501') {
          // RLS bloqueando DELETE, vamos usar um RPC se necessário, ou alertar.
          alert('Erro de permissão. O Supabase bloqueou a exclusão (RLS).');
        } else {
          throw error;
        }
      }
      loadData();
    } catch (err) {
      alert('Erro ao apagar: ' + err.message);
    }
  };

  const createInvoice = async () => {
    if (!newInvoice.tenant_id || !newInvoice.amount || !newInvoice.due_date) {
      alert('Preencha todos os campos obrigatórios.'); return;
    }
    try {
      setSaving(true);
      const { error } = await supabase.from('invoices').insert({
        tenant_id: newInvoice.tenant_id,
        amount: parseFloat(newInvoice.amount),
        due_date: newInvoice.due_date,
        status: 'pending',
        notes: newInvoice.notes || null,
        payment_link: newInvoice.payment_link || null,
      });
      if (error) throw error;
      setShowModal(false);
      setNewInvoice({ tenant_id: '', amount: '', due_date: '', notes: '', payment_link: '' });
      loadData();
    } catch (err) {
      alert('Erro ao criar fatura: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status, dueDate) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(dueDate); due.setHours(0,0,0,0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    const badges = {
      paid: <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid rgba(34,197,94,0.2)' }}><CheckCircle size={13}/> Pago</span>,
      overdue: <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid rgba(239,68,68,0.2)' }}><AlertTriangle size={13}/> Atrasado</span>,
      cancelled: <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(100,116,139,0.15)', color: '#64748b', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(100,116,139,0.2)' }}>Cancelado</span>,
    };
    if (badges[status]) return badges[status];

    // pending
    if (diffDays < 0) return badges.overdue;
    if (diffDays <= 3) return <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid rgba(239,68,68,0.2)' }}><Clock size={13}/> Vence em {diffDays}d</span>;
    if (diffDays <= 7) return <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid rgba(234,179,8,0.2)' }}><Clock size={13}/> Vence em {diffDays}d</span>;
    return <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid rgba(59,130,246,0.2)' }}><Clock size={13}/> A Vencer</span>;
  };

  const filtered = invoices.filter(inv => {
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchSearch = !searchQuery || inv.tenant_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTenant = !filterTenant || inv.tenant_id === filterTenant;
    return matchStatus && matchSearch && matchTenant;
  });

  const updatePaymentLink = async (id, currentLink) => {
    const newLink = window.prompt('Insira o Link de Pagamento (PIX) para esta fatura:\n(Pode ser Mercado Pago, Nubank, Appmax ou qualquer link de pagamento)', currentLink || '');
    if (newLink === null) return; // cancelado pelo usuário

    // Atualização otimista: reflete na tela imediatamente
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, payment_link: newLink } : inv));

    try {
      // Usando RPC para forçar a atualização ignorando qualquer bloqueio do banco
      const { error } = await supabase.rpc('update_payment_link', {
        p_invoice_id: id,
        p_link: newLink
      });

      if (error) {
        console.error('[Supabase UPDATE erro]', error);
        // Reverte atualização otimista em caso de erro
        loadData();
        alert(`Erro ao salvar o link:\n${error.message}\n\nCódigo: ${error.code}\n\nPossível causa: Não rodou o SQL. Rode o forcar_update_link.sql no Supabase.`);
        return;
      }

      // Supabase UPDATE ok
      // Recarrega para sincronizar com o banco
      loadData();
    } catch (err) {
      console.error('[Erro inesperado]', err);
      loadData();
      alert('Erro inesperado: ' + err.message);
    }
  };


  // Summary stats
  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'pending').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalValue: invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((a, i) => a + Number(i.amount), 0),
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>Faturamento Global</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Controle de inadimplência, recebimentos e faturas.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
        >
          <Plus size={16} /> Nova Fatura
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '30px' }}>
        {[
          { label: 'Total de Faturas', value: stats.total, icon: <FileText size={20}/>, color: '59,130,246' },
          { label: 'A Receber', value: `R$ ${stats.totalValue.toFixed(2).replace('.',',')}`, icon: <DollarSign size={20}/>, color: '234,179,8' },
          { label: 'Pagas', value: stats.paid, icon: <CheckCircle size={20}/>, color: '34,197,94' },
          { label: 'Atrasadas', value: stats.overdue, icon: <AlertTriangle size={20}/>, color: '239,68,68' },
        ].map((card, i) => (
          <div key={i} style={{ background: `rgba(${card.color},0.06)`, border: `1px solid rgba(${card.color},0.15)`, borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `rgba(${card.color},0.12)`, color: `rgb(${card.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 4px', fontWeight: 500 }}>{card.label}</p>
              <p style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0 }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por loja..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '36px' }}
          />
        </div>
        <select value={filterTenant} onChange={e => setFilterTenant(e.target.value)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
          <option value="" style={{ background: '#1e293b', color: '#fff' }}>Todas as Lojas</option>
          {tenants.map(t => (
            <option key={t.id} value={t.id} style={{ background: '#1e293b', color: '#fff' }}>{t.name}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
          <option value="all" style={{ background: '#1e293b', color: '#fff' }}>Todos os status</option>
          <option value="pending" style={{ background: '#1e293b', color: '#fff' }}>Pendentes</option>
          <option value="paid" style={{ background: '#1e293b', color: '#fff' }}>Pagas</option>
          <option value="overdue" style={{ background: '#1e293b', color: '#fff' }}>Atrasadas</option>
          <option value="cancelled" style={{ background: '#1e293b', color: '#fff' }}>Canceladas</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando faturas...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma fatura encontrada.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Loja (Inquilino)</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Link PIX</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(invoice => (
                <tr key={invoice.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div>{invoice.tenant_name}</div>
                    {invoice.tenant_phone && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{invoice.tenant_phone}</div>}
                  </td>
                  <td>{new Date(invoice.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                  <td style={{ fontWeight: 700, color: invoice.status === 'paid' ? '#22c55e' : '#fff' }}>
                    R$ {Number(invoice.amount).toFixed(2).replace('.', ',')}
                  </td>
                  <td>{getStatusBadge(invoice.status, invoice.due_date)}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {invoice.payment_link ? (
                      <a href={invoice.payment_link} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontWeight: 500, textDecoration: 'underline' }}>
                        {invoice.payment_link}
                      </a>
                    ) : (
                      'Sem Link'
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {invoice.status !== 'paid' && (
                        <>
                          {invoice.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => updatePaymentLink(invoice.id, invoice.payment_link)}
                                title="Inserir / Editar Link PIX"
                                style={{ padding: '5px 8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', color: '#60a5fa', fontSize: '12px', cursor: 'pointer' }}
                              >
                                🔗 Link
                              </button>
                              <button
                                onClick={() => markAsPaid(invoice.id)}
                                style={{ padding: '5px 12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '6px', color: '#22c55e', fontSize: '12px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                              >
                                ✓ Baixa
                              </button>
                              <button
                                onClick={() => blockTenantNow(invoice.tenant_id)}
                                title="Bloquear loja agora"
                                style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}
                              >
                                <ShieldBan size={14} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => toggleInvoiceStatus(invoice.id, invoice.status)}
                            title={invoice.status === 'cancelled' ? 'Reativar fatura' : 'Desativar fatura'}
                            style={{ 
                              padding: '5px 8px', 
                              background: invoice.status === 'cancelled' ? 'rgba(59,130,246,0.1)' : 'rgba(100,116,139,0.1)', 
                              border: `1px solid ${invoice.status === 'cancelled' ? 'rgba(59,130,246,0.3)' : 'rgba(100,116,139,0.3)'}`, 
                              borderRadius: '6px', 
                              color: invoice.status === 'cancelled' ? '#60a5fa' : '#94a3b8', 
                              fontSize: '12px', cursor: 'pointer',
                              fontWeight: invoice.status === 'cancelled' ? 600 : 'normal'
                            }}
                          >
                            {invoice.status === 'cancelled' ? '↻ Reativar' : '🚫 Desativar'}
                          </button>
                          <button
                            onClick={() => deleteInvoice(invoice.id)}
                            title="Apagar fatura permanentemente"
                            style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}
                          >
                            <Trash size={14} />
                          </button>
                        </>
                      )}
                      {invoice.status === 'paid' && (
                        <span style={{ fontSize: '12px', color: '#22c55e' }}>
                          {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('pt-BR') : 'Pago'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Nova Fatura */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', width: '480px', maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={20} color="var(--primary)" /> Nova Fatura Manual
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Loja *</label>
                <select
                  value={newInvoice.tenant_id}
                  onChange={e => setNewInvoice({...newInvoice, tenant_id: e.target.value})}
                  style={inputStyle}
                >
                  <option value="" style={{ background: '#1e293b', color: '#fff' }}>Selecione a loja...</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id} style={{ background: '#1e293b', color: '#fff' }}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="197.00"
                    value={newInvoice.amount}
                    onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Vencimento *</label>
                  <input
                    type="date"
                    value={newInvoice.due_date}
                    onChange={e => setNewInvoice({...newInvoice, due_date: e.target.value})}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Link de Pagamento (PIX) *</label>
                <input
                  type="text"
                  placeholder="https://link.mercadopago.com.br/..."
                  value={newInvoice.payment_link}
                  onChange={e => setNewInvoice({...newInvoice, payment_link: e.target.value})}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Observações</label>
                <textarea
                  placeholder="Ex: Mensalidade Julho/2026..."
                  value={newInvoice.notes}
                  onChange={e => setNewInvoice({...newInvoice, notes: e.target.value})}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div style={{ padding: '12px', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.15)', fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
                💡 Você pode colar o link do Mercado Pago, Appmax ou Nubank. O lojista verá o link no painel dele para realizar o pagamento.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancelar
              </button>
              <button
                onClick={createInvoice}
                disabled={saving}
                style={{ flex: 1, padding: '12px', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Criando...' : 'Criar Fatura'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
