import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

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
        // Modo de recuperação ativado
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
      setError('Erro ao atualizar senha. Link inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.3 }}></div>
          
          <ShieldCheck size={54} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ marginBottom: '10px' }}>Senha Redefinida</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Sua senha Master foi alterada com segurança. Redirecionando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Glow effect */}
        <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.3 }}></div>

        <div style={{ marginBottom: '30px' }}>
          <img src="/logo.png" alt="Soul Estratégias" style={{ maxWidth: '200px', marginBottom: '10px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Redefinição de Senha Master
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <input 
              type="password" 
              className="input" 
              placeholder="Nova Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '10px', width: '100%' }}>
            {loading ? 'Salvando...' : 'Salvar Nova Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
