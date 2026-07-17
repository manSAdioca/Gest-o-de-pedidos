import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Megaphone, Plus, Trash2, Power } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', message: '', type: 'info' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
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
      const { error } = await supabase.from('announcements').insert([{
        title: newAnn.title,
        message: newAnn.message,
        type: newAnn.type,
        active: true
      }]);
      if (error) throw error;
      
      setShowModal(false);
      setNewAnn({ title: '', message: '', type: 'info' });
      loadAnnouncements();
    } catch (err) {
      alert('Erro ao criar aviso: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      loadAnnouncements();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const deleteAnn = async (id) => {
    if (!window.confirm('Certeza que deseja excluir permanentemente este aviso?')) return;
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      loadAnnouncements();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const getTypeStyle = (type) => {
    switch(type) {
      case 'info': return { color: '#3b82f6', label: 'Informativo (Azul)' };
      case 'warning': return { color: '#eab308', label: 'Atenção (Amarelo)' };
      case 'success': return { color: '#22c55e', label: 'Sucesso (Verde)' };
      default: return { color: '#94a3b8', label: 'Neutro' };
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Avisos Globais (Megafone)</h2>
          <p style={{ color: 'var(--text-muted)' }}>Mande alertas instantâneos para o painel de todos os seus clientes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Novo Aviso
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Buscando avisos...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Aviso (Título e Mensagem)</th>
                <th>Tipo</th>
                <th>Status (Visibilidade)</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map(ann => (
                <tr key={ann.id} style={{ opacity: ann.active ? 1 : 0.5 }}>
                  <td>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Megaphone size={14} color={getTypeStyle(ann.type).color} />
                      {ann.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{ann.message}</div>
                  </td>
                  <td style={{ fontSize: '13px', color: getTypeStyle(ann.type).color }}>
                    {getTypeStyle(ann.type).label}
                  </td>
                  <td>
                    {ann.active ? (
                      <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontSize: '12px' }}>Transmitindo Agora</span>
                    ) : (
                      <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', fontSize: '12px' }}>Desligado</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => toggleActive(ann.id, ann.active)}
                        className="btn"
                        style={{ padding: '6px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border)' }}
                      >
                        <Power size={14} color={ann.active ? '#ef4444' : '#22c55e'} />
                        {ann.active ? 'Desligar' : 'Ligar'}
                      </button>
                      <button 
                        onClick={() => deleteAnn(ann.id)}
                        className="btn btn-danger"
                        style={{ padding: '6px 10px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Nenhum aviso criado ainda.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card" style={{ width: '500px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={18} color="var(--primary)" /> Criar Aviso Global
            </h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Título (Chamativo)</label>
                <input type="text" className="input" required value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})} placeholder="Ex: Manutenção Programada" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Mensagem Detalhada</label>
                <textarea className="input" required value={newAnn.message} onChange={e => setNewAnn({...newAnn, message: e.target.value})} placeholder="Escreva o recado aqui..." style={{ minHeight: '80px', resize: 'vertical' }}></textarea>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Tipo (Cor do Banner)</label>
                <select className="input" required value={newAnn.type} onChange={e => setNewAnn({...newAnn, type: e.target.value})}>
                  <option value="info">Informativo (Azul - Para comunicados normais)</option>
                  <option value="warning">Atenção (Amarelo - Para coisas importantes)</option>
                  <option value="success">Sucesso/Promo (Verde - Para boas notícias)</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn" style={{ flex: 1, background: 'var(--bg-dark)' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Transmitindo...' : 'Transmitir Aviso Agora'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
