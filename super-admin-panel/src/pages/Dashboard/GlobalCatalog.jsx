import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Image as ImageIcon, Search, X } from 'lucide-react';

const GlobalCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category_slug: 'cervejas',
    description: '',
    image_url: ''
  });

  const CATEGORIES = [
    { id: 'cervejas', name: 'Cervejas' },
    { id: 'destilados', name: 'Destilados' },
    { id: 'refrigerantes', name: 'Refrigerantes' },
    { id: 'energeticos', name: 'Energéticos' },
    { id: 'aguas', name: 'Águas' },
    { id: 'sucos', name: 'Sucos' },
    { id: 'gelo', name: 'Gelo' },
    { id: 'carvao', name: 'Carvão' },
    { id: 'conveniencia', name: 'Conveniência' },
    { id: 'atacado', name: 'Atacado' }
  ];

  useEffect(() => {
    loadGlobalProducts();
  }, []);

  const loadGlobalProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('global_products')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Erro ao carregar catálogo global:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        category_slug: product.category_slug,
        description: product.description || '',
        image_url: product.image_url || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category_slug: 'cervejas',
        description: '',
        image_url: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await supabase
          .from('global_products')
          .update(formData)
          .eq('id', editingId);
      } else {
        await supabase
          .from('global_products')
          .insert([formData]);
      }
      setShowModal(false);
      loadGlobalProducts();
    } catch (err) {
      console.error('Erro ao salvar produto global:', err);
      alert('Erro ao salvar produto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja apagar este template? O produto nas lojas não será afetado, apenas sumirá desta galeria.')) return;
    
    try {
      await supabase.from('global_products').delete().eq('id', id);
      loadGlobalProducts();
    } catch (err) {
      console.error('Erro ao deletar:', err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category_slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ImageIcon size={28} style={{ color: '#3b82f6' }} />
            Catálogo Global
          </h2>
          <p style={{ color: '#9ca3af', marginTop: '5px' }}>Templates de produtos para lojistas importarem facilmente.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
        >
          <Plus size={18} /> Novo Template
        </button>
      </div>

      <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', border: '1px solid #374151', marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Buscar template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', background: '#374151', border: '1px solid #4b5563', color: 'white', padding: '10px 12px 10px 40px', borderRadius: '8px' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>Carregando...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {filteredProducts.map(prod => (
            <div key={prod.id} style={{ background: '#1f2937', borderRadius: '12px', border: '1px solid #374151', overflow: 'hidden' }}>
              <div style={{ height: '160px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                {prod.image_url ? (
                  <img src={prod.image_url} alt={prod.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ color: '#9ca3af' }}>Sem Imagem</div>
                )}
              </div>
              <div style={{ padding: '15px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', textTransform: 'uppercase' }}>
                  {prod.category_slug}
                </span>
                <h3 style={{ color: 'white', margin: '5px 0 10px 0', fontSize: '16px' }}>{prod.name}</h3>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleOpenModal(prod)}
                    style={{ flex: 1, background: '#374151', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}
                  >
                    <Edit2 size={14} /> Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(prod.id)}
                    style={{ background: '#ef444420', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', color: '#9ca3af', textAlign: 'center', padding: '40px' }}>
              Nenhum template encontrado.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid #374151' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
                {editingId ? 'Editar Template' : 'Novo Template Global'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '5px' }}>Nome do Produto</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  style={{ width: '100%', background: '#111827', border: '1px solid #374151', color: 'white', padding: '10px', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '5px' }}>Categoria</label>
                <select 
                  value={formData.category_slug}
                  onChange={e => setFormData({...formData, category_slug: e.target.value})}
                  required
                  style={{ width: '100%', background: '#111827', border: '1px solid #374151', color: 'white', padding: '10px', borderRadius: '6px' }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '5px' }}>URL da Imagem (Fundo Branco/Transparente recomendado)</label>
                <input 
                  type="url" 
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://..."
                  style={{ width: '100%', background: '#111827', border: '1px solid #374151', color: 'white', padding: '10px', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '5px' }}>Descrição Curta (Opcional)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  style={{ width: '100%', background: '#111827', border: '1px solid #374151', color: 'white', padding: '10px', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', background: '#374151', color: 'white', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                  {saving ? 'Salvando...' : 'Salvar Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalCatalog;
