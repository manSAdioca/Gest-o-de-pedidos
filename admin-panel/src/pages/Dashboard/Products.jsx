import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Image as ImageIcon, Search, X, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Products = () => {
  const { user, tenantId } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxProducts, setMaxProducts] = useState(null);

  // Global Catalog states
  const [showGlobalCatalog, setShowGlobalCatalog] = useState(false);
  const [globalProducts, setGlobalProducts] = useState([]);
  const [globalCatalogSearch, setGlobalCatalogSearch] = useState('');
  
  const [formData, setFormData] = useState({
    productName: '',
    category: 'cervejas',
    price: '',
    stock: '',
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

      // Fetch Tenant Plan Limits
      const { data: tenantData } = await supabase
        .from('tenants')
        .select(`
          plan_id,
          plans ( max_products )
        `)
        .eq('id', tenantId)
        .single();
        
      if (tenantData?.plans?.max_products) {
        setMaxProducts(tenantData.plans.max_products);
      } else {
        setMaxProducts(100); // Default/Free limit
      }

      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('active', true)
        .order('name', { ascending: true });

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name', { ascending: true });

      if (error) throw error;
      
      setCategories(catData || []);
      setProducts(data || []);
      
      // Load Global Catalog
      const { data: globalData } = await supabase
        .from('global_products')
        .select('*')
        .order('name', { ascending: true });
        
      if (globalData) setGlobalProducts(globalData);
      
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
      let editCategory = product.category || 'cervejas';
      // Se a categoria antiga não existe mais na lista, seleciona a primeira disponível
      if (categories.length > 0 && !categories.some(c => c.slug === editCategory)) {
        editCategory = categories[0].slug;
      }
      
      setFormData({
        productName: product.name || '',
        category: editCategory,
        price: product.price || '',
        stock: product.stock ?? '',
        description: product.description || '',
        image_url: product.image_url || '',
        active: product.active ?? true
      });
    } else {
      setEditingId(null);
      const defaultCategory = categories.length > 0 ? categories[0].slug : 'cervejas';
      setFormData({ productName: '', category: defaultCategory, price: '', stock: '', description: '', image_url: '', active: true });
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
        stock: formData.stock !== '' ? parseInt(formData.stock, 10) : 9999,
        description: formData.description,
        image_url: finalImageUrl,
        active: formData.active,
        tenant_id: tenantId
      };

      if (editingId) {
        // Na edição, não precisamos sobrescrever o tenant_id, mas não faz mal
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

  const exportToCSV = () => {
    if (!products || products.length === 0) return;
    
    const headers = ['ID', 'Nome', 'Categoria', 'Preco (R$)', 'Estoque', 'Status'];
    const csvRows = [headers.join(';')];
    
    products.forEach(p => {
      const row = [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category,
        p.price.toString().replace('.', ','),
        p.stock === 9999 ? 'Ilimitado' : p.stock,
        p.active ? 'Ativo' : 'Inativo'
      ];
      csvRows.push(row.join(';'));
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `estoque_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <button className="btn btn-outline" onClick={exportToCSV} style={{ color: 'var(--neon-green)', borderColor: 'var(--neon-green)' }}>
            <Download size={18} /> Exportar
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              if (maxProducts && products.length >= maxProducts) {
                alert(`LIMITE ATINGIDO!\nSeu plano permite no máximo ${maxProducts} produtos. Faça um upgrade para adicionar mais.`);
                return;
              }
              openModal();
            }}
            style={{ opacity: (maxProducts && products.length >= maxProducts) ? 0.6 : 1 }}
          >
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
              <div style={{ height: '180px', background: product.image_url ? '#ffffff' : 'rgba(0,0,0,0.3)', padding: product.image_url ? '10px' : '0', position: 'relative' }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)' }}>Sem Imagem</div>
                )}
                {!product.active && (
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239,68,68,0.9)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Inativo</span>
                )}
                {product.active && product.stock <= 0 && (
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239,68,68,0.9)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Esgotado</span>
                )}
              </div>
              
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{product.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--neon-blue)', fontWeight: 600, textTransform: 'capitalize' }}>{product.category}</span>
                  <span style={{ fontSize: '0.75rem', color: product.stock <= 10 ? 'rgba(239,68,68,1)' : 'var(--gray)', fontWeight: 600 }}>
                    Estoque: {product.stock === 9999 || product.stock == null ? 'Ilimitado' : product.stock}
                  </span>
                </div>
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
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
              {!editingId && (
                <button 
                  onClick={() => setShowGlobalCatalog(true)}
                  type="button"
                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold' }}
                >
                  <ImageIcon size={14} /> Importar do Catálogo
                </button>
              )}
            </div>
            
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
                  <label>Estoque (Deixe vazio p/ infinito)</label>
                  <input type="number" name="stock" className="form-control" placeholder="Ilimitado" value={formData.stock} onChange={handleInputChange} />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Categoria</label>
                  <select name="category" className="form-control" value={formData.category} onChange={handleInputChange}>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug} style={{ color: '#000' }}>{cat.name}</option>
                    ))}
                    {categories.length === 0 && <option value="cervejas" style={{ color: '#000' }}>Cervejas</option>}
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

      {/* Global Catalog Sub-Modal */}
      {showGlobalCatalog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column', padding: '30px', position: 'relative', background: 'var(--bg-sidebar)' }}>
            <button 
              onClick={() => setShowGlobalCatalog(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '5px' }}>Catálogo Global</h2>
            <p style={{ color: 'var(--gray)', marginBottom: '20px', fontSize: '14px' }}>Clique em um produto para importar as informações automaticamente.</p>
            
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '38px', width: '100%' }} 
                placeholder="Buscar por nome ou categoria..."
                value={globalCatalogSearch}
                onChange={(e) => setGlobalCatalogSearch(e.target.value)}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', paddingRight: '10px' }}>
              {globalProducts
                .filter(p => p.name.toLowerCase().includes(globalCatalogSearch.toLowerCase()) || p.category_slug.toLowerCase().includes(globalCatalogSearch.toLowerCase()))
                .map(prod => (
                  <div 
                    key={prod.id} 
                    onClick={() => {
                      setFormData({
                        ...formData,
                        productName: prod.name,
                        category: prod.category_slug,
                        description: prod.description || '',
                        image_url: prod.image_url || ''
                      });
                      setShowGlobalCatalog(false);
                    }}
                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', ':hover': { borderColor: 'var(--primary)' } }}
                  >
                    <div style={{ height: '120px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                      {prod.image_url ? (
                        <img src={prod.image_url} alt={prod.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <ImageIcon size={40} style={{ color: '#ccc' }} />
                      )}
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>{prod.category_slug}</div>
                      <div style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 'bold' }}>{prod.name}</div>
                    </div>
                  </div>
              ))}
              {globalProducts.length === 0 && (
                <div style={{ gridColumn: '1 / -1', color: 'var(--gray)', textAlign: 'center', padding: '40px' }}>
                  Nenhum produto global encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
