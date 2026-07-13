import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Páginas (serão criadas a seguir)
import Login from './pages/Login';
import DashboardLayout from './pages/Dashboard/Layout';
import DashboardHome from './pages/Dashboard/Home';
import Orders from './pages/Dashboard/Orders';
import Products from './pages/Dashboard/Products';

const ProtectedRoute = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div style={{display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center'}}>Carregando...</div>;
  if (!user || role !== 'admin') return <Navigate to="/login" replace />;

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rotas Protegidas do Admin */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
