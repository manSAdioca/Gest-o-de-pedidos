import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, role } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Redirecionamento movido para o useEffect abaixo
    } catch (err) {
      setError('Credenciais inválidas ou sem acesso.');
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

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Glow effect */}
        <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.3 }}></div>

        <div style={{ marginBottom: '30px' }}>
          <img src="/logo.png" alt="Soul Estratégias" style={{ maxWidth: '200px', marginBottom: '10px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Super Admin Access
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

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
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '10px', width: '100%' }}>
            {loading ? 'Verificando Autorização...' : 'Acessar Central'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
