import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Tags, Plus, Trash2, Save, FileText, Bot, DollarSign } from 'lucide-react';

export default function CrmManager() {
  const [niches, setNiches] = useState([]);
  const [loading, setLoading] = useState(true);

  // States para novo nicho
  const [newNicheName, setNewNicheName] = useState('');
  const [newNicheDesc, setNewNicheDesc] = useState('');
  const [newNichePrice, setNewNichePrice] = useState('49.90');
  const [newNichePrompt, setNewNichePrompt] = useState('Você é um especialista em vendas deste nicho. Responda objeções de forma curta, persuasiva e humanizada.');

  useEffect(() => {
    fetchNiches();
  }, []);

  const fetchNiches = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_niches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNiches(data || []);
    } catch (err) {
      console.error("Erro ao buscar nichos", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNiche = async () => {
    if (!newNicheName) return;
    
    try {
      const { error } = await supabase
        .from('crm_niches')
        .insert([{ 
          name: newNicheName, 
          description: newNicheDesc,
          monthly_price: parseFloat(newNichePrice),
          ai_agent_prompt: newNichePrompt
        }]);
        
      if (error) throw error;
      
      setNewNicheName('');
      setNewNicheDesc('');
      setNewNichePrice('49.90');
      setNewNichePrompt('Você é um especialista em vendas deste nicho. Responda objeções de forma curta, persuasiva e humanizada.');
      fetchNiches();
      alert("Nicho criado com sucesso! Lembre-se de rodar o SQL update_niches_ai.sql se der erro de coluna.");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar nicho.");
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Tags size={24} color="#3B82F6" />
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#1F2937' }}>Gestão CRM & IA</h1>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>Gerencie os nichos, preços e Prompts Mestres da IA</p>
        </div>
      </div>

      {/* Área de Criação de Nicho */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="#3B82F6" /> Novo Kit de Nicho com Inteligência Artificial
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#4B5563' }}>Nome do Nicho</label>
              <input 
                type="text" 
                value={newNicheName}
                onChange={(e) => setNewNicheName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                placeholder="Ex: Clínicas de Estética"
              />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#4B5563' }}>Descrição</label>
              <input 
                type="text" 
                value={newNicheDesc}
                onChange={(e) => setNewNicheDesc(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                placeholder="Ex: Funil focado em agendamento de botox"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#4B5563' }}>Mensalidade (R$)</label>
              <input 
                type="number" 
                value={newNichePrice}
                onChange={(e) => setNewNichePrice(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#4B5563' }}>
              <Bot size={14} style={{ display: 'inline', marginBottom: '-2px', marginRight: '4px' }} />
              Prompt Mestre da IA (Mata-Objeções)
            </label>
            <textarea 
              value={newNichePrompt}
              onChange={(e) => setNewNichePrompt(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', minHeight: '80px', fontFamily: 'monospace' }}
            />
            <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Este prompt será usado no botão de WhatsApp Sniper do cliente para gerar respostas persuasivas automáticas.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleCreateNiche}
              style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} /> Salvar Nicho Completo
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Nichos */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Nicho</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Preço / IA</th>
              <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Carregando...</td></tr>
            ) : niches.length === 0 ? (
              <tr><td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Nenhum nicho cadastrado.</td></tr>
            ) : (
              niches.map(niche => (
                <tr key={niche.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{niche.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{niche.description}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ color: '#059669', fontWeight: 600 }}>R$ {niche.monthly_price || '49.90'}</div>
                    <div style={{ fontSize: '11px', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Bot size={12} /> Prompt Ativado
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3B82F6', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={16} /> Configurar Funil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
