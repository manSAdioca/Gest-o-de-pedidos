import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CreditCard, CheckCircle, Clock, AlertTriangle, ExternalLink, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Invoices = () => {
  const { tenantId, role, tenantStatus } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subStatus, setSubStatus] = useState({ 
    color: 'var(--neon-green)', 
    icon: CheckCircle, 
    title: 'Assinatura Ativa', 
    message: 'Seu catálogo está operando perfeitamente. Mantenha suas faturas em dia para evitar bloqueios.' 
  });

  useEffect(() => {
    if (invoices.length > 0) {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
      
      if (pendingInvoices.length > 0) {
        // Pega a fatura em aberto mais antiga (assumindo ordem por vencimento, pois já tem order('due_date'))
        const oldestPending = pendingInvoices[0];
        const due = new Date(oldestPending.due_date);
        due.setHours(0,0,0,0);
        
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          setSubStatus({
            color: 'var(--neon-red)',
            icon: AlertTriangle,
            title: 'Fatura Vencida!',
            message: `Sua fatura venceu há ${Math.abs(diffDays)} dia(s). Regularize o pagamento imediatamente para evitar o bloqueio da loja.`
          });
        } else if (diffDays <= 5) {
          setSubStatus({
            color: 'var(--neon-gold)',
            icon: Clock,
            title: 'Fatura Vencendo',
            message: `Sua fatura vence em ${diffDays} dia(s) (dia ${due.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}). Fique atento para não ter a loja bloqueada.`
          });
        } else {
          setSubStatus({ 
            color: 'var(--neon-green)', 
            icon: CheckCircle, 
            title: 'Assinatura Ativa', 
            message: 'Sua próxima fatura ainda tem prazo longo. Seu catálogo está operando perfeitamente.' 
          });
        }
      } else {
         setSubStatus({ 
           color: 'var(--neon-green)', 
           icon: CheckCircle, 
           title: 'Assinatura Ativa', 
           message: 'Você não possui faturas em aberto. Seu catálogo está operando perfeitamente.' 
         });
      }
    }
  }, [invoices]);

  useEffect(() => {
    if (tenantId && (role === 'admin' || role === 'superadmin')) {
      loadInvoices();
    }
  }, [tenantId, role]);

  if (role !== 'admin' && role !== 'superadmin') {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <AlertTriangle size={48} color="var(--neon-red)" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>Acesso Negado</h2>
        <p style={{ color: 'var(--gray)', fontSize: '1.1rem' }}>Você não tem permissão para acessar a área financeira da assinatura.</p>
      </div>
    );
  }

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      console.error('Erro ao carregar faturas:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, dueDate) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDate);
    due.setHours(0,0,0,0);

    if (status === 'paid') {
      return <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> Pago</span>;
    }
    
    if (status === 'pending') {
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={14}/> Atrasado</span>;
      } else if (diffDays <= 30) {
        return <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> Aberta</span>;
      } else {
        return <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> A Vencer</span>;
      }
    }
    
    return <span>{status}</span>;
  };

  return (
    <div>
      {/* Banner de Aviso — aparece quando status é 'warning' (2 dias de atraso) */}
      {tenantStatus === 'warning' && (
        <div style={{ 
          background: 'linear-gradient(90deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05))',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          borderLeft: '4px solid #eab308',
          borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <AlertTriangle size={24} color="#eab308" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#eab308', fontSize: '15px' }}>⚠️ Atenção: Pagamento em Atraso</p>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
              Sua fatura está em atraso. Regularize o pagamento para evitar o bloqueio completo da loja em breve. Acesse a aba de faturas abaixo e utilize o link de pagamento.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Minha Assinatura</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        {/* Card do Plano */}
        {/* Card do Plano */}
        <div className="hover-projection" style={{ 
          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(234, 179, 8, 0.02) 100%)', 
          borderRadius: '24px', padding: '35px', border: '1px solid rgba(234, 179, 8, 0.2)',
          boxShadow: '0 10px 40px rgba(234, 179, 8, 0.1)', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.08 }}>
            <Crown size={140} color="var(--neon-gold)" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', position: 'relative', zIndex: 2 }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(234, 179, 8, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
              <Crown size={28} color="var(--neon-gold)" style={{ filter: 'drop-shadow(0 0 5px rgba(234,179,8,0.5))' }} />
            </div>
            <div>
              <div style={{ color: 'var(--neon-gold)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Seu Plano Atual</div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--white)', letterSpacing: '-0.5px' }}>Site + Gestor</h3>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '30px', position: 'relative', zIndex: 2 }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--gray)' }}>R$</span>
            <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--white)', lineHeight: 1 }}>197</span>
            <span style={{ fontSize: '1rem', color: 'var(--gray)' }}>,00 / mês</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: 'var(--gray-light)' }}>
              <CheckCircle size={18} color="var(--neon-gold)" /> Loja online aberta 24h por dia
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: 'var(--gray-light)' }}>
              <CheckCircle size={18} color="var(--neon-gold)" /> Painel Administrativo Completo
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: 'var(--gray-light)' }}>
              <CheckCircle size={18} color="var(--neon-gold)" /> Gestão de pedidos e estoque
            </div>
          </div>
        </div>

        {/* Card de Status */}
        <div className="glass hover-projection" style={{ borderRadius: '24px', padding: '35px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', borderTop: `4px solid ${subStatus.color}`, transition: 'all 0.4s' }}>
           <div style={{ 
             width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', 
             display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px',
             boxShadow: `0 0 30px ${subStatus.color}33`, border: `1px solid ${subStatus.color}66`,
             transition: 'all 0.4s'
           }}>
             <subStatus.icon size={46} color={subStatus.color} style={{ filter: `drop-shadow(0 0 10px ${subStatus.color}99)`, transition: 'all 0.4s' }} />
           </div>
           <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: 'var(--white)', transition: 'all 0.4s' }}>{subStatus.title}</h3>
           <p style={{ color: 'var(--gray)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '300px' }}>
             {subStatus.message}
           </p>
        </div>
      </div>

      <div className="glass hover-projection" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>Carregando histórico de faturas...</div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>Nenhuma fatura encontrada.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500 }}>Vencimento</th>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500 }}>Valor</th>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500, textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                    {new Date(invoice.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                    R$ {Number(invoice.amount).toFixed(2).replace('.', ',')}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {getStatusBadge(invoice.status, invoice.due_date)}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    {invoice.status !== 'paid' && invoice.payment_link ? (
                      (() => {
                        const today = new Date();
                        const due = new Date(invoice.due_date);
                        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
                        
                        if (diffDays <= 30 || diffDays < 0) {
                          return (
                            <a 
                              href={invoice.payment_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-primary"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '14px' }}
                            >
                              Pagar Agora <ExternalLink size={14} />
                            </a>
                          )
                        } else {
                          return <span style={{ color: 'var(--gray)', fontSize: '14px' }}>Disponível em breve</span>;
                        }
                      })()
                    ) : (
                      <span style={{ color: 'var(--gray)', fontSize: '14px' }}>
                        {invoice.status === 'paid' ? 'Liquidado' : 'Link indisponível'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <style>{`
        .hover-projection {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease !important;
        }
        .hover-projection:hover {
          transform: translateY(-5px);
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.15), 0 10px 20px rgba(0,0,0,0.4) !important;
          border-color: rgba(59, 130, 246, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default Invoices;
