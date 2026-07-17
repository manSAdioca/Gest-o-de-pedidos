import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const StoreCategories = () => {
  const { tenantId } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) fetchCategories();
  }, [tenantId]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });
      
    if (data) setCategories(data);
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Minhas Categorias</h1>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p>Carregando categorias...</p>
        ) : categories.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Você ainda não tem categorias cadastradas.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Ícone / Cor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: c.color || '#333' }}></div>
                      <span style={{ fontSize: '12px' }}>{c.icon_type || 'bottle'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${c.active ? 'badge-success' : 'badge-danger'}`}>
                      {c.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline" style={{ padding: '6px' }}><Edit2 size={14} /></button>
                      <button className="btn btn-outline" style={{ padding: '6px', color: '#ff4d4d', borderColor: '#ff4d4d' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StoreCategories;
