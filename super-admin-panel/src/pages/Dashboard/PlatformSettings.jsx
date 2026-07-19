import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings, Save, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

export default function PlatformSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [settings, setSettings] = useState({
    login_logo_url: '',
    login_title: 'Painel Admin',
    login_subtitle: 'Área Restrita',
    login_footer_text: 'Desenvolvido por Soul Estratégias Digitais'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 'white_label')
      .maybeSingle();
      
    if (data) {
      setSettings(data);
    }
    setLoading(false);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_whitelabel_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      if (data && data.publicUrl) {
        setSettings(prev => ({ ...prev, login_logo_url: data.publicUrl }));
      }
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      alert('Erro ao enviar a logo. Verifique se o bucket "logos" existe e se você tem permissão.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: existing } = await supabase.from('platform_settings').select('id').eq('id', 'white_label').maybeSingle();
      
      let error;
      const { id, updated_at, ...payload } = settings;
      if (existing) {
        const { error: err } = await supabase
          .from('platform_settings')
          .update(payload)
          .eq('id', existing.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('platform_settings')
          .insert([{ id: 'white_label', value: '', ...payload }]);
        error = err;
      }

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      console.error("Catch error:", err);
      alert('Erro ao salvar configurações: ' + (err.message || JSON.stringify(err)));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '30px', color: 'var(--gray)' }}>Carregando configurações...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Settings size={28} color="#8b5cf6" />
        <div>
          <h2 style={{ fontSize: '24px', margin: 0 }}>White Label (Login Admin)</h2>
          <p style={{ color: 'var(--gray)', margin: 0, fontSize: '14px' }}>Personalize a tela de login do painel dos lojistas.</p>
        </div>
      </div>

      <div className="glass" style={{ padding: '30px' }}>
        <form onSubmit={handleSave} style={{ display: 'grid', gap: '24px' }}>
          
          <div className="form-group">
            <label>Logo da Loja</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, display: 'flex', gap: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <ImageIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                  <input 
                    type="url" 
                    name="login_logo_url"
                    className="form-control" 
                    style={{ paddingLeft: '40px' }} 
                    placeholder="https://exemplo.com/logo.png"
                    value={settings.login_logo_url || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <label className="btn" style={{ background: 'rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {uploadingLogo ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}
                  {uploadingLogo ? 'Enviando...' : 'Enviar Arquivo'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                  />
                </label>
              </div>
              {settings.login_logo_url && (
                <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={settings.login_logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              )}
            </div>
            <small style={{ color: 'var(--gray)', marginTop: '8px', display: 'block' }}>Se deixado em branco, aparecerá o ícone de coroa (👑) por padrão. Você pode colar a URL ou fazer o upload de uma imagem do seu computador.</small>
          </div>

          <div className="form-group">
            <label>Título Principal</label>
            <input 
              type="text" 
              name="login_title"
              className="form-control" 
              placeholder="Ex: Painel Admin"
              value={settings.login_title || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Subtítulo (Nome da Loja/Sistema)</label>
            <input 
              type="text" 
              name="login_subtitle"
              className="form-control" 
              placeholder="Ex: Distribuidora Imperatriz"
              value={settings.login_subtitle || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Texto do Rodapé (Créditos)</label>
            <input 
              type="text" 
              name="login_footer_text"
              className="form-control" 
              placeholder="Ex: Desenvolvido por Soul Estratégias Digitais"
              value={settings.login_footer_text || ''}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : <><Save size={18} /> Salvar Configurações</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
