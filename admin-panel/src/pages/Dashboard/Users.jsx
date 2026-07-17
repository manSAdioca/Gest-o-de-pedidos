import React, { useEffect, useState } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { Shield, User, ShieldOff, AlertCircle, Plus, X, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Users = () => {
  const { user: currentUser, tenantId } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('role', { ascending: true }); // Admins first

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (userId, newRole) => {
    if (userId === currentUser?.id) {
      alert("Você não pode alterar o seu próprio cargo por segurança!");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      loadUsers();
    } catch (err) {
      console.error('Erro ao mudar cargo:', err);
      alert('Não foi possível alterar a permissão deste usuário.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      alert("Você não pode excluir a si mesmo!");
      return;
    }
    if (!window.confirm("Atenção: Tem certeza que deseja excluir DEIFINITIVAMENTE este usuário? Ele perderá o acesso ao painel instantaneamente.")) {
      return;
    }

    try {
      // Chama a função RPC criada no SQL para deletar o usuário de forma segura no backend
      const { error } = await supabase.rpc('delete_user_admin', { user_id_param: userId });
      if (error) throw error;
      
      loadUsers();
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      alert('Falha ao excluir. Certifique-se de ter rodado o script SQL de permissão.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setCreateError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      // 1. Criar o cliente secundário para NÃO subscrever a sessão atual (evita deslogar o Admin)
      const secondarySupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      // 2. Fazer o cadastro
      const { data, error } = await secondarySupabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: {
          data: {
            tenant_id: tenantId,
            role: 'funcionario'
          }
        }
      });

      if (error) throw error;
      
      // 3. Forçar o tenant_id correto no profile (caso a trigger não pegue do metadata)
      if (data.user) {
         await supabase.from('profiles').update({ tenant_id: tenantId }).eq('id', data.user.id);
      }

      // Sucesso!
      setIsModalOpen(false);
      setNewEmail('');
      setNewPassword('');
      loadUsers();
      
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      if (err.message.includes('User already registered')) {
        setCreateError('Este e-mail já está cadastrado.');
      } else {
        setCreateError(err.message || 'Erro ao criar conta.');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Gestão de Acessos</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Novo Usuário
        </button>
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>Carregando equipe...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>Nenhum usuário encontrado.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500 }}>E-mail / Usuário</th>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500 }}>Cargo (Acesso)</th>
                <th style={{ padding: '16px 24px', color: 'var(--gray)', fontWeight: 500, textAlign: 'right' }}>Ações de Permissão</th>
              </tr>
            </thead>
            <tbody>
              {users.map(profile => (
                <tr key={profile.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: profile.id === currentUser?.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: profile.role === 'admin' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: profile.role === 'admin' ? '#eab308' : '#3b82f6'
                      }}>
                        {profile.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                      </div>
                      <div>
                        <div>{profile.email || 'Email Oculto'}</div>
                        {profile.id === currentUser?.id && <span style={{ fontSize: '0.7rem', color: 'var(--neon-blue)', fontWeight: 700 }}>VOCÊ</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      background: profile.role === 'admin' ? 'rgba(234, 179, 8, 0.1)' : (profile.role === 'inativo' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'),
                      color: profile.role === 'admin' ? '#eab308' : (profile.role === 'inativo' ? '#ef4444' : '#3b82f6'),
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {profile.role === 'admin' ? 'Administrador' : (profile.role === 'inativo' ? 'Bloqueado' : 'Funcionário')}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    {profile.id !== currentUser?.id ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {profile.role !== 'admin' && (
                          <button onClick={() => changeRole(profile.id, 'admin')} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#eab308', borderColor: '#eab308' }}>
                            <Shield size={14} style={{ marginRight: '4px' }} /> Promover a Admin
                          </button>
                        )}
                        {profile.role !== 'funcionario' && profile.role !== 'inativo' && (
                          <button onClick={() => changeRole(profile.id, 'funcionario')} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#3b82f6', borderColor: '#3b82f6' }}>
                            <User size={14} style={{ marginRight: '4px' }} /> Tornar Funcionário
                          </button>
                        )}
                        {profile.role !== 'inativo' && (
                          <button onClick={() => changeRole(profile.id, 'inativo')} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }}>
                            <ShieldOff size={14} style={{ marginRight: '4px' }} /> Bloquear Acesso
                          </button>
                        )}
                        {profile.role === 'inativo' && (
                          <button onClick={() => changeRole(profile.id, 'user')} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#22c55e', borderColor: '#22c55e' }}>
                            <User size={14} style={{ marginRight: '4px' }} /> Desbloquear
                          </button>
                        )}
                        <button onClick={() => handleDeleteUser(profile.id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'rgba(239, 68, 68, 0.7)', borderColor: 'rgba(239, 68, 68, 0.3)', marginLeft: '8px' }} title="Excluir Definitivamente">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>Acesso Protegido</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE CRIAÇÃO */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '450px', padding: '30px', position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ marginBottom: '24px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User color="#3b82f6" /> Novo Funcionário
            </h3>

            {createError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <AlertCircle size={18} />
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--gray)' }}>E-mail de Acesso</label>
                <input 
                  type="email" 
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}
                  placeholder="funcionario@exemplo.com"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--gray)' }}>Senha Provisória</label>
                <input 
                  type="text" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' }}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '14px', background: 'transparent', border: 'none', color: 'var(--gray)', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="btn-primary"
                  style={{ flex: 1, padding: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: creating ? 0.7 : 1 }}
                >
                  {creating ? <><Loader2 size={18} className="spin" /> Criando...</> : 'Criar Acesso'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Users;
