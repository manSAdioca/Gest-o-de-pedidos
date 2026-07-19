import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Crown, Plus, Edit2 } from 'lucide-react';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planForm, setPlanForm] = useState({ name: '', price: '', max_products: 100, features: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('plans').select('*').order('price', { ascending: true });
      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlanId(plan.id);
      setPlanForm({ 
        name: plan.name, 
        price: plan.price, 
        max_products: plan.max_products,
        features: (plan.features || []).join('\n')
      });
    } else {
      setEditingPlanId(null);
      setPlanForm({ name: '', price: '', max_products: 100, features: '' });
    }
    setShowModal(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const featuresArray = planForm.features.split('\n').filter(f => f.trim() !== '');
      
      const planData = {
        name: planForm.name,
        price: Number(planForm.price),
        max_products: Number(planForm.max_products),
        features: featuresArray
      };

      if (editingPlanId) {
        const { error } = await supabase.from('plans').update(planData).eq('id', editingPlanId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('plans').insert([planData]);
        if (error) throw error;
      }
      
      setShowModal(false);
      loadPlans();
    } catch (err) {
      alert('Erro ao salvar plano: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Planos de Assinatura</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie os pacotes e preços oferecidos aos clientes da plataforma.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Novo Plano
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando planos...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {plans.map((plan) => {
            const isPremium = plan.price > 200;
            return (
              <div key={plan.id} className="card" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                borderTop: isPremium ? '4px solid var(--primary)' : '4px solid rgba(255,255,255,0.2)',
                position: 'relative',
                overflow: 'hidden',
                padding: '30px'
              }}>
                {isPremium && (
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
                    <Crown size={120} color="var(--primary)" />
                  </div>
                )}
                
                <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', color: isPremium ? 'var(--primary)' : 'var(--text-main)', position: 'relative', zIndex: 2 }}>
                  {plan.name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '25px', position: 'relative', zIndex: 2 }}>
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>R$</span>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{Number(plan.price).toFixed(0)}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>,00/mês</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, marginBottom: '25px', position: 'relative', zIndex: 2 }}>
                  {(plan.features || []).map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                      <CheckCircle size={18} color={isPremium ? 'var(--primary)' : 'rgba(255,255,255,0.4)'} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ lineHeight: '1.4' }}>{feature}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                      <CheckCircle size={18} color={isPremium ? 'var(--primary)' : 'rgba(255,255,255,0.4)'} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ lineHeight: '1.4' }}>Até {plan.max_products} produtos</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', position: 'relative', zIndex: 2 }}>
                  <button 
                    onClick={() => handleOpenModal(plan)}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '12px', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    <Edit2 size={16} /> Editar
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm(`Tem certeza que deseja excluir o plano "${plan.name}"?`)) {
                        const { error } = await supabase.from('plans').delete().eq('id', plan.id);
                        if (error) alert('Erro ao excluir: ' + error.message);
                        else loadPlans();
                      }
                    }}
                    style={{ 
                      padding: '12px', borderRadius: '12px', 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: 'var(--danger)',
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    title="Excluir Plano"
                  >
                    <span style={{ fontSize: '16px' }}>🗑️</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Editar/Criar Plano */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingPlanId ? 'Editar Plano' : 'Criar Novo Plano'}</h3>
            <form onSubmit={handleSavePlan} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Nome do Plano</label>
                <input type="text" className="input" required value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} placeholder="Ex: Plano Ouro" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Valor (R$)</label>
                  <input type="number" step="0.01" className="input" required value={planForm.price} onChange={e => setPlanForm({...planForm, price: e.target.value})} placeholder="197.00" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Limite de Produtos</label>
                  <input type="number" className="input" required value={planForm.max_products} onChange={e => setPlanForm({...planForm, max_products: e.target.value})} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Benefícios (um por linha)</label>
                <textarea 
                  className="input" 
                  rows="5" 
                  required 
                  value={planForm.features} 
                  onChange={e => setPlanForm({...planForm, features: e.target.value})} 
                  placeholder="Loja online aberta 24h\nPainel completo\nIntegração WhatsApp"
                  style={{ resize: 'vertical' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn" style={{ flex: 1, background: 'var(--bg-dark)' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Salvando...' : 'Salvar Plano'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
