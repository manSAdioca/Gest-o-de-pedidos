import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Save, Info } from 'lucide-react';

const Emails = () => {
  const [template, setTemplate] = useState({ subject: '', body: '' });
  const [settings, setSettings] = useState({ resendApiKey: '', senderEmail: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const { data: tmplData } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', 'welcome_email')
        .single();
      
      if (tmplData) {
        setTemplate({ subject: tmplData.subject, body: tmplData.body });
      }

      const { data: settsData } = await supabase
        .from('platform_settings')
        .select('*')
        .in('id', ['resend_api_key', 'sender_email']);

      if (settsData) {
        const apiKey = settsData.find(s => s.id === 'resend_api_key')?.value || '';
        const sender = settsData.find(s => s.id === 'sender_email')?.value || '';
        setSettings({ resendApiKey: apiKey, senderEmail: sender });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await supabase.from('email_templates').upsert({ 
        id: 'welcome_email', 
        subject: template.subject, 
        body: template.body,
        updated_at: new Date().toISOString()
      });

      await supabase.from('platform_settings').upsert([
        { id: 'resend_api_key', value: settings.resendApiKey, updated_at: new Date().toISOString() },
        { id: 'sender_email', value: settings.senderEmail, updated_at: new Date().toISOString() }
      ]);
      
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--primary)' }}>Carregando configurações...</div>;

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(90deg, #fff, #facc15)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Mail size={28} color="#facc15" /> Disparo de E-mails (SMTP)
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Configure o motor de envio e os textos automáticos do sistema.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', paddingBottom: '40px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* CREDENCIAIS DO SISTEMA */}
          <div style={{ background: 'var(--bg-dark)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Credenciais de Envio (Motor)</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>E-mail Remetente</label>
                <input 
                  type="email" 
                  className="input" 
                  value={settings.senderEmail} 
                  onChange={e => setSettings({...settings, senderEmail: e.target.value})}
                  placeholder="Ex: vendas@suaempresa.com.br"
                  required
                />
              </div>

              <div className="form-group">
                <label>Chave da API (Resend)</label>
                <input 
                  type="password" 
                  className="input" 
                  value={settings.resendApiKey} 
                  onChange={e => setSettings({...settings, resendApiKey: e.target.value})}
                  placeholder="re_..."
                  required
                />
              </div>
            </div>
          </div>

          {/* TEMPLATE DE EMAIL */}
          <div style={{ background: 'var(--bg-dark)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>E-mail de Boas-Vindas</h3>
          
          <div className="form-group">
            <label>Assunto do E-mail</label>
            <input 
              type="text" 
              className="input" 
              value={template.subject} 
              onChange={e => setTemplate({...template, subject: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Corpo do E-mail (HTML permitido)</label>
            <textarea 
              className="input" 
              rows="12" 
              value={template.body} 
              onChange={e => setTemplate({...template, body: e.target.value})}
              required
              style={{ fontFamily: 'monospace' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} disabled={saving}>
            <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          </div>
        </form>

        <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)', height: 'fit-content' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', marginBottom: '16px' }}>
            <Info size={20} /> Como funciona?
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
            Quando você cadastra um novo inquilino na aba Lojas, o sistema vai ler este modelo de e-mail e enviar para o lojista automaticamente.
          </p>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <strong>Variáveis Dinâmicas Mágicas:</strong><br/><br/>
            <code style={{ background: '#000', padding: '2px 6px', borderRadius: '4px', color: '#4ade80' }}>{`{{nome_loja}}`}</code><br/>Nome do Estabelecimento<br/><br/>
            <code style={{ background: '#000', padding: '2px 6px', borderRadius: '4px', color: '#4ade80' }}>{`{{link_painel}}`}</code><br/>Link do Painel do Lojista<br/><br/>
            <code style={{ background: '#000', padding: '2px 6px', borderRadius: '4px', color: '#4ade80' }}>{`{{email}}`}</code><br/>E-mail de Acesso<br/><br/>
            <code style={{ background: '#000', padding: '2px 6px', borderRadius: '4px', color: '#4ade80' }}>{`{{senha}}`}</code><br/>Senha Provisória
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emails;
