import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [platformSettings, setPlatformSettings] = useState({
    login_logo_url: '',
    login_title: 'Painel Admin',
    login_subtitle: 'Distribuidora Imperatriz',
    login_footer_text: 'Desenvolvido por Soul Estratégias Digitais'
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    async function fetchPlatformSettings() {
      const { data } = await supabase.from('platform_settings').select('*').eq('id', 'white_label').maybeSingle();
      if (data) setPlatformSettings(data);
    }
    fetchPlatformSettings();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: loginError } = await login(email, password);
      if (loginError) throw loginError;
      
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Credenciais inválidas ou acesso negado.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, digite seu e-mail para recuperar a senha.');
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
      setError('Erro ao solicitar recuperação: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div style={{ display: 'flex', width: '100%', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="glass" style={{ maxWidth: '400px', width: '100%', padding: '40px 30px', textAlign: 'center' }}>
          <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ marginBottom: '10px' }}>Link Enviado!</h2>
          <p style={{ color: 'var(--gray)', marginBottom: '30px', fontSize: '0.9rem' }}>
            Enviamos as instruções para redefinir sua senha para o e-mail: <strong>{email}</strong>
          </p>
          <button onClick={() => { setIsResetting(false); setResetSent(false); }} className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}>
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass" style={{ maxWidth: '400px', width: '100%', padding: '40px 30px', textAlign: 'center' }}>
        {platformSettings.login_logo_url ? (
          <img src={platformSettings.login_logo_url} alt="Logo" style={{ maxHeight: '60px', marginBottom: '10px' }} />
        ) : (
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👑</div>
        )}
        <h2 style={{ marginBottom: '5px' }}>{platformSettings.login_title}</h2>
        <p style={{ color: 'var(--gray)', marginBottom: '30px', fontSize: '0.9rem' }}>
          {isResetting ? 'Recuperação de Senha' : platformSettings.login_subtitle}
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--neon-red)', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {isResetting ? (
          <form onSubmit={handleResetPassword} style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label>E-mail da sua conta</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                <input 
                  type="email" 
                  className="form-control" 
                  style={{ paddingLeft: '40px' }} 
                  placeholder="admin@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button type="button" onClick={() => setIsResetting(false)} style={{ background: 'none', border: 'none', color: 'var(--gray)', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <ArrowLeft size={14} /> Voltar para o Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label>E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                <input 
                  type="email" 
                  className="form-control" 
                  style={{ paddingLeft: '40px' }} 
                  placeholder="admin@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ marginBottom: 0 }}>Senha</label>
                <button type="button" onClick={() => setIsResetting(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer' }}>Esqueceu a senha?</button>
              </div>
              <div style={{ position: 'relative', marginTop: '5px' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                <input 
                  type="password" 
                  className="form-control" 
                  style={{ paddingLeft: '40px' }} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>
        )}

        {!isResetting && (
          <div style={{ marginTop: '30px' }}>
            <a href="/" style={{ color: 'var(--gray)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              ← Voltar ao site
            </a>
          </div>
        )}

        <div style={{ marginTop: '40px', fontSize: '0.8rem', color: 'var(--gray)', opacity: 0.7 }}>
          {platformSettings.login_footer_text}
        </div>
      </div>
    </div>
  );
};

export default Login;
