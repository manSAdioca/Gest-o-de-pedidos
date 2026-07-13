import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    productName: '',
    category: 'cervejas',
    price: '',
    description: '',
    image_url: '',
    active: true
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      loadProducts();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      alert(`ERRO DO SUPABASE: ${err.message || JSON.stringify(err)}`);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        productName: product.name || '',
        category: product.category || 'cervejas',
        price: product.price || '',
        description: product.description || '',
        image_url: product.image_url || '',
        active: product.active ?? true
      });
    } else {
      setEditingId(null);
      setFormData({ productName: '', category: 'cervejas', price: '', description: '', image_url: '', active: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, imageFile: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image_url;

      // Se o usuário selecionou um arquivo para upload
      if (formData.imageFile) {
        const fileExt = formData.imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('imagens-do-produto')
          .upload(fileName, formData.imageFile);

        if (uploadError) {
          console.error("Erro no upload:", uploadError);
          alert(`ERRO EXATO DO SUPABASE: ${uploadError.message || JSON.stringify(uploadError)}`);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('imagens-do-produto')
          .getPublicUrl(fileName);
          
        finalImageUrl = publicUrl;
      }

      const productData = {
        name: formData.productName,
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description,
        image_url: finalImageUrl,
        active: formData.active
      };

      if (editingId) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
      }
      
      closeModal();
      loadProducts();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Catálogo de Produtos</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '38px', width: '250px' }} 
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={18} /> Novo Produto
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {loading ? (
          <p style={{ color: 'var(--gray)' }}>Carregando produtos...</p>
        ) : filteredProducts.length === 0 ? (
          <p style={{ color: 'var(--gray)' }}>Nenhum produto encontrado.</p>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="glass" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)' }}>Sem Imagem</div>
                )}
                {!product.active && (
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239,68,68,0.9)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Inativo</span>
                )}
              </div>
              
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{product.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--neon-blue)', marginBottom: '10px', fontWeight: 600, textTransform: 'capitalize' }}>{product.category}</span>
                <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {product.description}
                </p>
                
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>R$ {Number(product.price).toFixed(2)}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openModal(product)} className="btn btn-outline" style={{ padding: '8px' }} title="Editar">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="btn btn-danger" style={{ padding: '8px' }} title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Glassmorphism */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '30px', position: 'relative', background: 'var(--bg-sidebar)' }}>
            <button 
              onClick={closeModal}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '24px' }}>{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Nome do Produto</label>
                <input required type="text" name="productName" autoComplete="off" className="form-control" value={formData.productName} onChange={handleInputChange} />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Preço (R$)</label>
                  <input required type="number" step="0.01" name="price" className="form-control" value={formData.price} onChange={handleInputChange} />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Categoria</label>
                  <select name="category" className="form-control" value={formData.category} onChange={handleInputChange}>
                    <option value="cervejas">Cervejas</option>
                    <option value="destilados">Destilados</option>
                    <option value="refrigerantes">Refrigerantes</option>
                    <option value="energeticos">Energéticos</option>
                    <option value="aguas">Águas</option>
                    <option value="sucos">Sucos</option>
                    <option value="gelo">Gelo</option>
                    <option value="carvao">Carvão</option>
                    <option value="conveniencia">Conveniência</option>
                    <option value="atacado">Atacado</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Imagem do Produto</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="form-control" 
                    onChange={handleFileChange} 
                    style={{ padding: '8px' }}
                  />
                  <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>ou</span>
                  <input 
                    type="url" 
                    name="image_url" 
                    className="form-control" 
                    value={formData.image_url} 
                    onChange={handleInputChange} 
                    placeholder="Cole o link (opcional se enviar arquivo)" 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Descrição</label>
                <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--white)' }}>
                <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange} style={{ width: '18px', height: '18px' }} />
                Produto Ativo (Disponível para Venda)
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
