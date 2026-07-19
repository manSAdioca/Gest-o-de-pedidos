import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const { login, role } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError('Credenciais inválidas ou sem acesso.');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, digite o e-mail Master para recuperar a senha.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/update-password',
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      console.error(err);
      setError('Erro ao solicitar recuperação. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (role) {
      if (role === 'superadmin') {
        navigate('/');
      } else {
        setError('Acesso negado. Sua conta não tem nível Super Admin.');
        setLoading(false);
      }
    }
  }, [role, navigate]);

  if (resetSent) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.3 }}></div>
          <ShieldCheck size={54} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ marginBottom: '10px' }}>E-mail Enviado!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
            As instruções de recuperação foram enviadas para o e-mail master: <strong>{email}</strong>
          </p>
          <button onClick={() => { setIsResetting(false); setResetSent(false); }} className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}>
            Voltar ao Login Master
          </button>
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
            {isResetting ? 'Recuperação de Acesso' : 'Super Admin Access'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        {isResetting ? (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <input 
                type="email" 
                className="input" 
                placeholder="E-mail Master"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '5px', width: '100%' }}>
              {loading ? 'Enviando...' : 'Recuperar Acesso Master'}
            </button>
            <button type="button" onClick={() => setIsResetting(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', marginTop: '10px' }}>
              Voltar para o Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <input 
                type="email" 
                className="input" 
                placeholder="E-mail Master"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input 
                type="password" 
                className="input" 
                placeholder="Senha de Acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsResetting(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer' }}>
                  Esqueceu a senha?
                </button>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '10px', width: '100%' }}>
              {loading ? 'Verificando Autorização...' : 'Acessar Central'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
