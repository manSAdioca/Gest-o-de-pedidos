import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Login from './pages/Login';
import Layout from './pages/Dashboard/Layout';
import Home from './pages/Dashboard/Home';
import Tenants from './pages/Dashboard/Tenants';
import Plans from './pages/Dashboard/Plans';
import Invoices from './pages/Dashboard/Invoices';
import Announcements from './pages/Dashboard/Announcements';
import Tickets from './pages/Dashboard/Tickets';
import Emails from './pages/Dashboard/Emails';
import StoreProducts from './pages/Dashboard/StoreProducts';
import StoreCategories from './pages/Dashboard/StoreCategories';
import StoreOrders from './pages/Dashboard/StoreOrders';
import GlobalCatalog from './pages/Dashboard/GlobalCatalog';
import CrmManager from './pages/Dashboard/CrmManager';
import PlatformSettings from './pages/Dashboard/PlatformSettings';
import UpdatePassword from './pages/UpdatePassword';

const ProtectedRoute = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div style={{ display:'flex', height:'100vh', justifyContent:'center', alignItems:'center' }}>Carregando Segurança...</div>;
  if (!user || role !== 'superadmin') return <Navigate to="/login" replace />;

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="plans" element={<Plans />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="emails" element={<Emails />} />
            <Route path="products" element={<StoreProducts />} />
            <Route path="categories" element={<StoreCategories />} />
            <Route path="orders" element={<StoreOrders />} />
            <Route path="global-catalog" element={<GlobalCatalog />} />
            <Route path="crm-manager" element={<CrmManager />} />
            <Route path="white-label" element={<PlatformSettings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
