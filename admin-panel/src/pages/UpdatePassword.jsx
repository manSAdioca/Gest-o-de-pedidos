import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase auth callback listener (quando o usuário clica no link do email)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Modo de recuperação de senha ativado
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar senha. O link pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', width: '100%', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="glass" style={{ maxWidth: '400px', width: '100%', padding: '40px 30px', textAlign: 'center' }}>
          <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ marginBottom: '10px' }}>Senha Atualizada!</h2>
          <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
            Sua senha foi alterada com sucesso. Você será redirecionado para o login.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass" style={{ maxWidth: '400px', width: '100%', padding: '40px 30px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔐</div>
        <h2 style={{ marginBottom: '5px' }}>Nova Senha</h2>
        <p style={{ color: 'var(--gray)', marginBottom: '30px', fontSize: '0.9rem' }}>
          Digite sua nova senha abaixo.
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--neon-red)', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label>Nova Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
              <input 
                type="password" 
                className="form-control" 
                style={{ paddingLeft: '40px' }} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
