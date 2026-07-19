import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Páginas (serão criadas a seguir)
import Login from './pages/Login';
import DashboardLayout from './pages/Dashboard/Layout';
import DashboardHome from './pages/Dashboard/Home';
import Orders from './pages/Dashboard/Orders';
import Products from './pages/Dashboard/Products';
import Categories from './pages/Dashboard/Categories';
import Users from './pages/Dashboard/Users';
import Finance from './pages/Dashboard/Finance';
import Invoices from './pages/Dashboard/Invoices';
import Support from './pages/Dashboard/Support';
import StoreSettings from './pages/Dashboard/StoreSettings';
import UpdatePassword from './pages/UpdatePassword';
import Coupons from './pages/Dashboard/Coupons';
import Reports from './pages/Dashboard/Reports';
import Integrations from './pages/Dashboard/Integrations';

const ProtectedRoute = ({ children }) => {
  const { user, role, tenantStatus, loading } = useAuth();

  if (loading) return <div style={{display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center'}}>Carregando...</div>;
  if (!user || !['admin', 'superadmin', 'funcionario'].includes(role)) return <Navigate to="/login" replace />;

  if ((tenantStatus === 'blocked' || tenantStatus === 'suspended') && role !== 'superadmin' && window.location.pathname !== '/invoices') {
    // Nós vamos deixar o Layout lidar com o visual do bloqueio para manter o menu lateral
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          {/* Rotas Protegidas do Admin */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="finance" element={<Finance />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="users" element={<Users />} />
            <Route path="support" element={<Support />} />
            <Route path="settings" element={<StoreSettings />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="reports" element={<Reports />} />
            <Route path="integrations" element={<Integrations />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
