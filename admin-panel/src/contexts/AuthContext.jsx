import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [tenantStatus, setTenantStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        setRole(data.role);
        setTenantId(data.tenant_id);
        
        if (data.tenant_id) {
          // Estratégia do Porteiro: Usa o RPC para checar bloqueio automático por falta de pagamento (5 dias de tolerância)
          const { data: tStatus } = await supabase.rpc('check_tenant_status', { p_tenant_id: data.tenant_id, p_tolerance_days: 5 });
          if (tStatus) setTenantStatus(tStatus);
        }
      } else {
        // Perfil não encontrado no banco: desloga para evitar comportamento indefinido
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
        setTenantId(null);
        setTenantStatus(null);
      }
    } catch (err) {
      // Em caso de erro de rede, apenas desbloqueia o loading sem dar acesso
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const logout = async () => {
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, tenantId, tenantStatus, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
