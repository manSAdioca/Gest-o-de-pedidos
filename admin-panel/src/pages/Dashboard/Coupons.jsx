import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Tag, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function Coupons() {
  const { user, tenantId } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '0',
    max_uses: '',
    active: true
  });

  useEffect(() => {
    if (tenantId) fetchCoupons();
  }, [tenantId]);

  async function fetchCoupons() {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
      
    if (error) console.error(error);
    else setCoupons(data || []);
    setLoading(false);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    
    const payload = {
      tenant_id: tenantId,
      code: formData.code.toUpperCase().trim(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_order_value: parseFloat(formData.min_order_value || 0),
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      active: formData.active
    };

    let error;
    if (formData.id) {
      const { error: updateError } = await supabase.from('coupons').update(payload).eq('id', formData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('coupons').insert([payload]);
      error = insertError;
    }

    if (error) {
      alert('Erro ao salvar cupom: ' + error.message);
    } else {
      setShowForm(false);
      setFormData({ id: null, code: '', discount_type: 'percentage', discount_value: '', min_order_value: '0', max_uses: '', active: true });
      fetchCoupons();
    }
  };

  const handleEdit = (coupon) => {
    setFormData({
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_value: coupon.min_order_value,
      max_uses: coupon.max_uses || '',
      active: coupon.active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cupom?')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) alert('Erro ao excluir: ' + error.message);
    else fetchCoupons();
  };

  const toggleActive = async (id, currentStatus) => {
    const { error } = await supabase.from('coupons').update({ active: !currentStatus }).eq('id', id);
    if (!error) fetchCoupons();
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none'
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Tag size={26} color="#ec4899" /> Cupons de Desconto
          </h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
            Crie cupons promocionais para seus clientes usarem no catálogo.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ id: null, code: '', discount_type: 'percentage', discount_value: '', min_order_value: '0', max_uses: '', active: true });
            setShowForm(!showForm);
          }}
          style={{ background: '#ec4899', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          {showForm ? 'Cancelar' : <><Plus size={18} /> Novo Cupom</>}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#fff' }}>{formData.id ? 'Editar Cupom' : 'Criar Novo Cupom'}</h3>
          <form onSubmit={handleSave} style={{ display: 'grid', gap: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Código do Cupom *</label>
                <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="Ex: BEMVINDO10" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Status Inicial</label>
                <select value={formData.active} onChange={e => setFormData({...formData, active: e.target.value === 'true'})} style={{...inputStyle, cursor: 'pointer'}}>
                  <option value="true" style={{ background: '#0f172a', color: '#fff' }}>Ativo</option>
                  <option value="false" style={{ background: '#0f172a', color: '#fff' }}>Inativo</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Tipo de Desconto *</label>
                <select value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})} style={{...inputStyle, cursor: 'pointer'}}>
                  <option value="percentage" style={{ background: '#0f172a', color: '#fff' }}>Porcentagem (%)</option>
                  <option value="fixed" style={{ background: '#0f172a', color: '#fff' }}>Valor Fixo (R$)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Valor do Desconto *</label>
                <input type="number" step="0.01" min="0" required value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} placeholder={formData.discount_type === 'percentage' ? "Ex: 10" : "Ex: 15.00"} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Valor Mínimo do Pedido (Opcional)</label>
                <input type="number" step="0.01" min="0" value={formData.min_order_value} onChange={e => setFormData({...formData, min_order_value: e.target.value})} placeholder="Ex: 50.00" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Limite de Usos (Opcional)</label>
                <input type="number" min="1" value={formData.max_uses} onChange={e => setFormData({...formData, max_uses: e.target.value})} placeholder="Ex: 100" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" style={{ background: '#ec4899', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                Salvar Cupom
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#64748b' }}>Carregando cupons...</div>
      ) : coupons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Tag size={40} color="#64748b" style={{ marginBottom: '10px' }} />
          <p style={{ color: '#94a3b8', margin: 0 }}>Nenhum cupom cadastrado ainda.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {coupons.map(coupon => (
            <div key={coupon.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: `1px solid ${coupon.active ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.05)'}` }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', letterSpacing: '1px' }}>{coupon.code}</h3>
                  <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '20px', background: coupon.active ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: coupon.active ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>
                    {coupon.active ? 'ATIVO' : 'INATIVO'}
                  </span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '14px', display: 'flex', gap: '16px' }}>
                  <span>Desconto: <strong style={{ color: '#ec4899' }}>{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value.toFixed(2)}`}</strong></span>
                  <span>Mínimo: R$ {coupon.min_order_value.toFixed(2)}</span>
                  <span>Usos: {coupon.current_uses} {coupon.max_uses ? `/ ${coupon.max_uses}` : '(Ilimitado)'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => toggleActive(coupon.id, coupon.active)} title={coupon.active ? 'Desativar' : 'Ativar'} style={{ background: 'transparent', border: 'none', color: coupon.active ? '#eab308' : '#22c55e', cursor: 'pointer', padding: '8px' }}>
                  {coupon.active ? <XCircle size={20} /> : <CheckCircle size={20} />}
                </button>
                <button onClick={() => handleEdit(coupon)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '8px' }}>
                  <Edit2 size={20} />
                </button>
                <button onClick={() => handleDelete(coupon.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
