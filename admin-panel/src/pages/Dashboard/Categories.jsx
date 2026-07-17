import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Categories = () => {
  const { user, tenantId } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon_type: 'bottle',
    color: '#0047FF',
    image_url: '',
    imageFile: null,
    active: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria? Isso pode afetar os produtos vinculados a ela!')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      loadCategories();
    } catch (err) {
      console.error('Erro ao excluir:', err);
      alert('Não foi possível excluir a categoria.');
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        slug: category.slug,
        icon_type: category.icon_type,
        color: category.color,
        image_url: category.image_url || '',
        imageFile: null,
        active: category.active
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        slug: '',
        icon_type: 'bottle',
        color: '#0047FF',
        image_url: '',
        imageFile: null,
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const generateSlug = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    if (!editingId) {
      setFormData({ ...formData, name: newName, slug: generateSlug(newName) });
    } else {
      setFormData({ ...formData, name: newName });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imageFile: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      let finalImageUrl = formData.image_url;

      if (formData.imageFile) {
        const fileExt = formData.imageFile.name.split('.').pop();
        const fileName = `${tenantId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('imagens-do-produto') // Usando o mesmo bucket de produtos
          .upload(fileName, formData.imageFile);

        if (uploadError) {
          console.error("Erro no upload da categoria:", uploadError);
          alert(`Erro ao fazer upload da imagem: ${uploadError.message}`);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('imagens-do-produto')
          .getPublicUrl(fileName);
          
        finalImageUrl = publicUrl;
      }

      const categoryData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        icon_type: formData.icon_type,
        color: formData.color,
        image_url: finalImageUrl,
        active: formData.active,
        tenant_id: tenantId
      };

      if (editingId) {
        const { error } = await supabase.from('categories').update(categoryData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([categoryData]);
        if (error) throw error;
      }
      
      closeModal();
      loadCategories();
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
      alert('Erro ao salvar. Verifique se o Slug já existe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Gerenciar Categorias</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border)', 
                padding: '10px 16px 10px 40px', 
                borderRadius: '8px',
                color: 'white'
              }}
            />
          </div>
          <button className="btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Nova Categoria
          </button>
        </div>
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>Carregando...</div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>Nenhuma categoria encontrada.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500 }}>Nome</th>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500 }}>Cor</th>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500 }}>Ícone</th>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(cat => (
                <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>{cat.name}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: cat.color }}></div>
                      {cat.color}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textTransform: 'capitalize' }}>{cat.icon_type}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      background: cat.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: cat.active ? '#22c55e' : '#ef4444'
                    }}>
                      {cat.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => openModal(cat)} style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', padding: '4px', marginRight: '8px' }} title="Editar">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '30px', position: 'relative' }}>
            <button 
              onClick={closeModal}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--gray)' }}>Nome da Categoria</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}
                  placeholder="Ex: Vinhos"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--gray)' }}>Identificador (Slug) - Usado no sistema</label>
                <input 
                  type="text" 
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--gray)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--gray)' }}>Formato (Ícone)</label>
                  <select 
                    value={formData.icon_type}
                    onChange={(e) => setFormData({...formData, icon_type: e.target.value})}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}
                  >
                    <option value="bottle" style={{ color: '#000' }}>Garrafa Comum (Cerveja)</option>
                    <option value="can" style={{ color: '#000' }}>Lata (Cerveja)</option>
                    <option value="vodka" style={{ color: '#000' }}>Garrafa Destilado</option>
                    <option value="pet" style={{ color: '#000' }}>Garrafa PET</option>
                    <option value="energy-can" style={{ color: '#000' }}>Lata Fina (Energético)</option>
                    <option value="water" style={{ color: '#000' }}>Garrafa de Água</option>
                    <option value="juice" style={{ color: '#000' }}>Caixa de Suco</option>
                    <option value="ice" style={{ color: '#000' }}>Cubo de Gelo</option>
                    <option value="coal" style={{ color: '#000' }}>Saco de Carvão</option>
                    <option value="snack" style={{ color: '#000' }}>Pacote de Salgadinho</option>
                    <option value="box-pack" style={{ color: '#000' }}>Caixa de Atacado</option>
                  </select>
                </div>
                <div style={{ width: '120px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--gray)' }}>Cor Padrão</label>
                  <input 
                    type="color" 
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    style={{ width: '100%', height: '45px', background: 'none', border: 'none', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--gray)' }}>Foto da Categoria (Opcional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'var(--gray)' }}
                />
                {formData.image_url && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={formData.image_url} alt="Categoria" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                )}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                Categoria Ativa no Site
              </label>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={closeModal}
                  style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ flex: 1, padding: '14px', borderRadius: '8px', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
