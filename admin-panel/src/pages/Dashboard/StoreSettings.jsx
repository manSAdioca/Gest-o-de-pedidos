import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Settings, Clock, MapPin, Truck, QrCode, DollarSign,
  Save, CheckCircle, Plus, Trash2, ChevronDown, ChevronUp,
  Store, Wallet, AlertCircle
} from 'lucide-react';

const DAYS = [
  { key: 'seg', label: 'Segunda-feira' },
  { key: 'ter', label: 'Terça-feira' },
  { key: 'qua', label: 'Quarta-feira' },
  { key: 'qui', label: 'Quinta-feira' },
  { key: 'sex', label: 'Sexta-feira' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
];

const defaultHorario = Object.fromEntries(
  DAYS.map(d => [d.key, { aberto: d.key !== 'dom', abertura: '08:00', fechamento: '22:00' }])
);

const StoreSettings = () => {
  const { tenantId, role } = useAuth();
  const isAdmin = role === 'admin' || role === 'superadmin';

  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);

  // Dados das seções
  const [horario, setHorario] = useState(defaultHorario);
  const [endereco, setEndereco] = useState({ rua: '', numero: '', bairro: '', cidade: '', cep: '' });
  const [entrega, setEntrega] = useState({ minimo: '', taxaPadrao: '', gratis_acima: '', zonas: [] });
  const [pagamento, setPagamento] = useState({ pix_key: '', pix_tipo: 'cpf', aceita_dinheiro: true, aceita_cartao: false });
  const [loja, setLoja] = useState({ nome: '', whatsapp: '', descricao: '' });

  useEffect(() => {
    if (tenantId) loadAllSettings();
  }, [tenantId]);

  const loadSetting = async (key) => {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('tenant_id', tenantId)
      .eq('key', key)
      .single();
    if (data?.value) {
      return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    }
    return null;
  };

  const loadAllSettings = async () => {
    setLoading(true);
    const [h, e, en, p, l] = await Promise.all([
      loadSetting('horario_funcionamento'),
      loadSetting('endereco_loja'),
      loadSetting('configuracao_entrega'),
      loadSetting('configuracao_pagamento'),
      loadSetting('info_loja'),
    ]);
    if (h) setHorario(h);
    if (e) setEndereco(e);
    if (en) setEntrega(en);
    if (p) setPagamento(p);
    if (l) setLoja(l);
    setLoading(false);
  };

  const saveSetting = async (key, value, section) => {
    setSaving(s => ({ ...s, [section]: true }));
    const { error } = await supabase
      .from('settings')
      .upsert({ tenant_id: tenantId, key, value: JSON.stringify(value) }, { onConflict: 'tenant_id,key' });

    if (!error) {
      setSaved(s => ({ ...s, [section]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [section]: false })), 2500);
    }
    setSaving(s => ({ ...s, [section]: false }));
  };

  const addZona = () => {
    setEntrega(e => ({ ...e, zonas: [...(e.zonas || []), { bairro: '', taxa: '' }] }));
  };

  const removeZona = (i) => {
    setEntrega(e => ({ ...e, zonas: e.zonas.filter((_, idx) => idx !== i) }));
  };

  const updateZona = (i, field, val) => {
    setEntrega(e => {
      const z = [...e.zonas];
      z[i] = { ...z[i], [field]: val };
      return { ...e, zonas: z };
    });
  };

  const sectionCard = (icon, title, subtitle, color, children, saveKey, saveValue, section) => (
    <div style={{
      background: '#0d1b3e',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '20px',
      overflow: 'hidden',
      marginBottom: '24px',
    }}>
      {/* Header do card */}
      <div style={{
        padding: '22px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: `linear-gradient(135deg, ${color}12, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
            {icon}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>{title}</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{subtitle}</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => saveSetting(saveKey, saveValue, section)}
            disabled={saving[section]}
            style={{
              padding: '9px 20px',
              background: saved[section] ? 'rgba(34,197,94,0.2)' : `${color}20`,
              border: `1px solid ${saved[section] ? '#22c55e' : color + '50'}`,
              borderRadius: '10px', color: saved[section] ? '#22c55e' : color,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', fontWeight: 700, transition: 'all 0.3s',
            }}
          >
            {saved[section] ? <CheckCircle size={14} /> : <Save size={14} />}
            {saving[section] ? 'Salvando...' : saved[section] ? 'Salvo!' : 'Salvar'}
          </button>
        )}
      </div>
      {/* Conteúdo */}
      <div style={{ padding: '24px 28px' }}>
        {children}
      </div>
    </div>
  );

  const inputStyle = (disabled = false) => ({
    width: '100%', boxSizing: 'border-box',
    padding: '10px 14px',
    background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: disabled ? '#64748b' : '#fff',
    fontSize: '14px', outline: 'none',
  });

  const labelStyle = { fontSize: '12px', color: '#94a3b8', marginBottom: '6px', display: 'block', fontWeight: 600 };

  if (loading) return (
    <div style={{ padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
      <div style={{ color: '#64748b' }}>Carregando configurações...</div>
    </div>
  );

  return (
    <div style={{ padding: '30px', maxWidth: '860px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={26} color="#3b82f6" /> Configurações da Loja
        </h2>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
          Gerencie horários, endereço, entrega e formas de pagamento da sua loja.
        </p>
        {!isAdmin && (
          <div style={{ marginTop: '12px', padding: '10px 16px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#eab308' }}>
            <AlertCircle size={15} /> Você está em modo visualização. Apenas o administrador pode editar as configurações.
          </div>
        )}
      </div>

      {/* INFO DA LOJA */}
      {sectionCard(
        <Store size={20} />, 'Informações da Loja', 'Nome, WhatsApp e descrição pública',
        '#3b82f6', (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nome da Loja</label>
                <input style={inputStyle(!isAdmin)} disabled={!isAdmin} value={loja.nome || ''} onChange={e => setLoja(l => ({ ...l, nome: e.target.value }))} placeholder="Ex: Distribuidora São João" />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp para Pedidos</label>
                <input style={inputStyle(!isAdmin)} disabled={!isAdmin} value={loja.whatsapp || ''} onChange={e => setLoja(l => ({ ...l, whatsapp: e.target.value }))} placeholder="Ex: 5511999999999" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Descrição (aparece no site)</label>
              <textarea disabled={!isAdmin} value={loja.descricao || ''} onChange={e => setLoja(l => ({ ...l, descricao: e.target.value }))} placeholder="Ex: Distribuidor de bebidas e conveniências..." style={{ ...inputStyle(!isAdmin), minHeight: '80px', resize: 'vertical' }} />
            </div>
          </div>
        ),
        'info_loja', loja, 'loja'
      )}

      {/* HORÁRIO DE FUNCIONAMENTO */}
      {sectionCard(
        <Clock size={20} />, 'Horário de Funcionamento', 'Defina os dias e horários que sua loja fica aberta',
        '#8b5cf6', (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DAYS.map(day => (
              <div key={day.key} style={{
                display: 'grid', gridTemplateColumns: '160px 60px 1fr',
                alignItems: 'center', gap: '16px',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: `1px solid ${horario[day.key]?.aberto ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)'}`,
                opacity: horario[day.key]?.aberto ? 1 : 0.5,
                transition: 'all 0.2s',
              }}>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{day.label}</span>

                {/* Toggle */}
                <div
                  onClick={() => isAdmin && setHorario(h => ({ ...h, [day.key]: { ...h[day.key], aberto: !h[day.key]?.aberto } }))}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', position: 'relative',
                    background: horario[day.key]?.aberto ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                    cursor: isAdmin ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '3px',
                    left: horario[day.key]?.aberto ? '23px' : '3px',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                  }} />
                </div>

                {horario[day.key]?.aberto ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="time" disabled={!isAdmin} value={horario[day.key]?.abertura || '08:00'}
                      onChange={e => setHorario(h => ({ ...h, [day.key]: { ...h[day.key], abertura: e.target.value } }))}
                      style={{ ...inputStyle(!isAdmin), width: '110px' }} />
                    <span style={{ color: '#64748b', fontSize: '13px' }}>até</span>
                    <input type="time" disabled={!isAdmin} value={horario[day.key]?.fechamento || '22:00'}
                      onChange={e => setHorario(h => ({ ...h, [day.key]: { ...h[day.key], fechamento: e.target.value } }))}
                      style={{ ...inputStyle(!isAdmin), width: '110px' }} />
                  </div>
                ) : (
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Fechado</span>
                )}
              </div>
            ))}
          </div>
        ),
        'horario_funcionamento', horario, 'horario'
      )}

      {/* ENDEREÇO */}
      {sectionCard(
        <MapPin size={20} />, 'Endereço da Loja', 'Localização para exibição no site e cálculo de entrega',
        '#10b981', (
          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Rua / Avenida</label>
                <input style={inputStyle(!isAdmin)} disabled={!isAdmin} value={endereco.rua || ''} onChange={e => setEndereco(a => ({ ...a, rua: e.target.value }))} placeholder="Ex: Rua das Flores" />
              </div>
              <div>
                <label style={labelStyle}>Número</label>
                <input style={inputStyle(!isAdmin)} disabled={!isAdmin} value={endereco.numero || ''} onChange={e => setEndereco(a => ({ ...a, numero: e.target.value }))} placeholder="123" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Bairro</label>
                <input style={inputStyle(!isAdmin)} disabled={!isAdmin} value={endereco.bairro || ''} onChange={e => setEndereco(a => ({ ...a, bairro: e.target.value }))} placeholder="Centro" />
              </div>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input style={inputStyle(!isAdmin)} disabled={!isAdmin} value={endereco.cidade || ''} onChange={e => setEndereco(a => ({ ...a, cidade: e.target.value }))} placeholder="São Paulo" />
              </div>
              <div>
                <label style={labelStyle}>CEP</label>
                <input style={inputStyle(!isAdmin)} disabled={!isAdmin} value={endereco.cep || ''} onChange={e => setEndereco(a => ({ ...a, cep: e.target.value }))} placeholder="00000-000" />
              </div>
            </div>
          </div>
        ),
        'endereco_loja', endereco, 'endereco'
      )}

      {/* ENTREGA */}
      {sectionCard(
        <Truck size={20} />, 'Configuração de Entrega', 'Taxa, mínimo e zonas por bairro',
        '#f59e0b', (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Valor Mínimo do Pedido (R$)</label>
                <input type="number" style={inputStyle(!isAdmin)} disabled={!isAdmin} value={entrega.minimo || ''} onChange={e => setEntrega(d => ({ ...d, minimo: e.target.value }))} placeholder="Ex: 30.00" step="0.01" min="0" />
              </div>
              <div>
                <label style={labelStyle}>Taxa de Entrega Padrão (R$)</label>
                <input type="number" style={inputStyle(!isAdmin)} disabled={!isAdmin} value={entrega.taxaPadrao || ''} onChange={e => setEntrega(d => ({ ...d, taxaPadrao: e.target.value }))} placeholder="Ex: 5.00" step="0.01" min="0" />
              </div>
              <div>
                <label style={labelStyle}>Grátis Acima de (R$)</label>
                <input type="number" style={inputStyle(!isAdmin)} disabled={!isAdmin} value={entrega.gratis_acima || ''} onChange={e => setEntrega(d => ({ ...d, gratis_acima: e.target.value }))} placeholder="Ex: 100.00 (0 = desativado)" step="0.01" min="0" />
              </div>
            </div>

            {/* Zonas por bairro */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ ...labelStyle, margin: 0 }}>Taxas por Bairro (opcional)</label>
                {isAdmin && (
                  <button onClick={addZona} style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '5px 12px', color: '#f59e0b', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                    <Plus size={13} /> Adicionar Bairro
                  </button>
                )}
              </div>
              {(entrega.zonas || []).length === 0 && (
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Nenhuma zona definida. A taxa padrão será aplicada para todos os bairros.</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(entrega.zonas || []).map((zona, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 40px', gap: '10px', alignItems: 'center' }}>
                    <input disabled={!isAdmin} value={zona.bairro} onChange={e => updateZona(i, 'bairro', e.target.value)} placeholder="Nome do bairro" style={inputStyle(!isAdmin)} />
                    <input type="number" disabled={!isAdmin} value={zona.taxa} onChange={e => updateZona(i, 'taxa', e.target.value)} placeholder="Taxa R$" step="0.01" min="0" style={inputStyle(!isAdmin)} />
                    {isAdmin && (
                      <button onClick={() => removeZona(i)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '9px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ),
        'configuracao_entrega', entrega, 'entrega'
      )}

      {/* PAGAMENTO */}
      {sectionCard(
        <Wallet size={20} />, 'Formas de Pagamento', 'PIX, dinheiro e cartão aceitos na entrega',
        '#22c55e', (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* PIX */}
            <div>
              <label style={labelStyle}>Chave PIX</label>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '10px' }}>
                <select disabled={!isAdmin} value={pagamento.pix_tipo || 'cpf'} onChange={e => setPagamento(p => ({ ...p, pix_tipo: e.target.value }))}
                  style={{ ...inputStyle(!isAdmin), cursor: isAdmin ? 'pointer' : 'default' }}>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="telefone">Telefone</option>
                  <option value="aleatoria">Chave Aleatória</option>
                </select>
                <input disabled={!isAdmin} value={pagamento.pix_key || ''} onChange={e => setPagamento(p => ({ ...p, pix_key: e.target.value }))} placeholder="Digite sua chave PIX..." style={inputStyle(!isAdmin)} />
              </div>
            </div>

            {/* Métodos aceitos */}
            <div>
              <label style={labelStyle}>Métodos Aceitos na Entrega</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[
                  { key: 'aceita_pix', label: '⚡ PIX', color: '#22c55e' },
                  { key: 'aceita_dinheiro', label: '💵 Dinheiro', color: '#f59e0b' },
                  { key: 'aceita_cartao', label: '💳 Cartão', color: '#3b82f6' },
                ].map(m => (
                  <div
                    key={m.key}
                    onClick={() => isAdmin && setPagamento(p => ({ ...p, [m.key]: !p[m.key] }))}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      background: pagamento[m.key] ? `${m.color}20` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${pagamento[m.key] ? m.color + '50' : 'rgba(255,255,255,0.08)'}`,
                      color: pagamento[m.key] ? m.color : '#64748b',
                      cursor: isAdmin ? 'pointer' : 'default',
                      fontWeight: 600, fontSize: '14px',
                      transition: 'all 0.2s',
                      userSelect: 'none',
                    }}
                  >
                    {m.label} {pagamento[m.key] ? '✓' : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Troco */}
            {pagamento.aceita_dinheiro && (
              <div style={{ padding: '14px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', fontSize: '13px', color: '#f59e0b' }}>
                💡 Com dinheiro ativado, o cliente pode informar o valor para troco ao finalizar o pedido.
              </div>
            )}
          </div>
        ),
        'configuracao_pagamento', pagamento, 'pagamento'
      )}
    </div>
  );
};

export default StoreSettings;
