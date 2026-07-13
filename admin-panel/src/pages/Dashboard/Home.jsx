import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, ShoppingBag, PackageOpen, TrendingUp } from 'lucide-react';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Puxar produtos
      const { data: products } = await supabase.from('products').select('id');
      
      // Puxar pedidos
      const { data: orders } = await supabase.from('orders').select('total, status');
      
      let sales = 0;
      let orderCount = 0;
      
      if (orders) {
        orderCount = orders.length;
        sales = orders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
      }

      setStats({
        totalSales: sales,
        totalOrders: orderCount,
        totalProducts: products ? products.length : 0
      });

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: `rgba(${color}, 0.1)`, color: `rgb(${color})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 500 }}>{title}</p>
        <h3 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700 }}>{loading ? '...' : value}</h3>
      </div>
    </div>
  );

  return (
    <div>
      <h2 style={{ marginBottom: '30px' }}>Visão Geral</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard 
          title="Faturamento Bruto" 
          value={`R$ ${stats.totalSales.toFixed(2)}`} 
          icon={<DollarSign size={28} />} 
          color="34, 197, 94" // green
        />
        <StatCard 
          title="Total de Pedidos" 
          value={stats.totalOrders} 
          icon={<ShoppingBag size={28} />} 
          color="59, 130, 246" // blue
        />
        <StatCard 
          title="Produtos Cadastrados" 
          value={stats.totalProducts} 
          icon={<PackageOpen size={28} />} 
          color="234, 179, 8" // gold
        />
        <StatCard 
          title="Taxa de Crescimento" 
          value="+12.5%" 
          icon={<TrendingUp size={28} />} 
          color="168, 85, 247" // purple
        />
      </div>

      <div className="glass" style={{ padding: '30px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--gray)' }}>
          <TrendingUp size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
          <h3>Gráficos em Breve</h3>
          <p>Seus relatórios avançados aparecerão aqui.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
