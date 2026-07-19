import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CreditCard, MessageCircle, Lock, Save, AlertTriangle, CheckCircle } from 'lucide-react';

const Integrations = () => {
  const { tenantId, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPremiumPlan, setHasPremiumPlan] = useState(false);
  const [planName, setPlanName] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    mp_access_token: '',
    mp_public_key: '',
    whatsapp_instance_name: '',
    whatsapp_instance_key: ''
  });

  useEffect(() => {
    if (tenantId) {
      checkPlanAndLoadData();
    }
  }, [tenantId]);

  const checkPlanAndLoadData = async () => {
    try {
      setLoading(true);
      
      // 1. Verificar plano do lojista
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('plan_id, plans(name, price)')
        .eq('id', tenantId)
        .single();
        
      if (tenantData && tenantData.plans) {
        setPlanName(tenantData.plans.name);
        // Regra: Apenas planos acima de X valor (ex: 200 reais) tem acesso, ou planos contendo API
        // Vamos checar pelo nome ou se o price é maior que 200
        const isPremium = Number(tenantData.plans.price) >= 300 || tenantData.plans.name.toLowerCase().includes('api');
        setHasPremiumPlan(isPremium);
        
        if (isPremium) {
          // 2. Carregar dados de integração existentes
          const { data: integData, error: integError } = await supabase
            .from('tenant_integrations')
            .select('*')
            .eq('tenant_id', tenantId)
            .single();
            
          if (integData && !integError) {
            setFormData({
              mp_access_token: integData.mp_access_token || '',
              mp_public_key: integData.mp_public_key || '',
              whatsapp_instance_name: integData.whatsapp_instance_name || '',
              whatsapp_instance_key: integData.whatsapp_instance_key || ''
            });
          }
        }
      }
    } catch (err) {
      console.error('Erro ao verificar integrações', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!hasPremiumPlan) return;
    
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Upsert na tabela
      const { error } = await supabase
        .from('tenant_integrations')
        .upsert({
          tenant_id: tenantId,
          mp_access_token: formData.mp_access_token,
          mp_public_key: formData.mp_public_key,
          whatsapp_instance_name: formData.whatsapp_instance_name,
          whatsapp_instance_key: formData.whatsapp_instance_key,
          updated_at: new Date()
        }, { onConflict: 'tenant_id' });
        
      if (error) throw error;
      
      setMessage({ text: 'Integrações salvas com sucesso!', type: 'success' });
    } catch (err) {
      console.error('Erro ao salvar integrações:', err);
      setMessage({ text: 'Erro ao salvar integrações. Tente novamente.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ color: '#94a3b8' }}>Carregando integrações...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Integrações Avançadas</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Configure pagamentos online e atendimento automatizado via IA.</p>
        </div>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600 }}>Plano Atual:</span>
          <span style={{ fontSize: '13px', color: '#fff', fontWeight: 700 }}>{planName || 'Carregando...'}</span>
        </div>
      </div>

      {!hasPremiumPlan ? (
        <div style={{ 
          background: 'linear-gradient(145deg, rgba(13, 27, 62, 0.4), rgba(8, 14, 33, 0.6))', 
          border: '1px solid rgba(59, 130, 246, 0.2)', 
          borderRadius: '20px', padding: '40px', textAlign: 'center' 
        }}>
          <Lock size={48} color="#3b82f6" style={{ margin: '0 auto 20px', opacity: 0.8 }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Recurso Premium Bloqueado</h2>
          <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto 24px', lineHeight: '1.6' }}>
            Seu plano atual não inclui as integrações avançadas de <strong>Gateway de Pagamento</strong> e <strong>Inteligência Artificial no WhatsApp</strong>.
          </p>
          <button className="btn" style={{ background: 'linear-gradient(90deg, #3b82f6, #2563eb)', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
            Fazer Upgrade do Plano
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          {message.text && (
            <div style={{ 
              background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, 
              color: message.type === 'success' ? '#4ade80' : '#f87171', 
              padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              {message.text}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '30px' }}>
            
            {/* Bloco MercadoPago */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>
                  <CreditCard size={24} color="#3b82f6" />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>Mercado Pago</h3>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Receba via PIX e Cartão na sua loja</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '8px' }}>Access Token (Produção)</label>
                <input 
                  type="password" 
                  value={formData.mp_access_token}
                  onChange={e => setFormData({...formData, mp_access_token: e.target.value})}
                  placeholder="APP_USR-..." 
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '8px' }}>Public Key (Produção)</label>
                <input 
                  type="text" 
                  value={formData.mp_public_key}
                  onChange={e => setFormData({...formData, mp_public_key: e.target.value})}
                  placeholder="APP_USR-..." 
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Bloco WhatsApp IA */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '12px' }}>
                  <MessageCircle size={24} color="#22c55e" />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>Atendente IA (WhatsApp)</h3>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Automatize as vendas com Inteligência Artificial</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '8px' }}>Nome da Instância WhatsApp</label>
                <input 
                  type="text" 
                  value={formData.whatsapp_instance_name}
                  onChange={e => setFormData({...formData, whatsapp_instance_name: e.target.value})}
                  placeholder="Loja Exemplo" 
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '8px' }}>Chave da Instância (API Key)</label>
                <input 
                  type="password" 
                  value={formData.whatsapp_instance_key}
                  onChange={e => setFormData({...formData, whatsapp_instance_key: e.target.value})}
                  placeholder="sk-..." 
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px' }}
                />
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={saving}
              style={{ 
                background: 'linear-gradient(90deg, #3b82f6, #2563eb)', color: '#fff', 
                padding: '12px 30px', border: 'none', borderRadius: '12px', fontWeight: 600, 
                cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                opacity: saving ? 0.7 : 1
              }}
            >
              <Save size={18} />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Integrations;
