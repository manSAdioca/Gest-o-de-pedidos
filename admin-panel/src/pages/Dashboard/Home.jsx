import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, ShoppingBag, PackageOpen, TrendingUp, Trophy, ArrowUpRight, Copy, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const { tenantId, role } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    ticketMedio: 0
  });
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tenantSlug, setTenantSlug] = useState('');

  useEffect(() => {
    if (tenantId && (role === 'admin' || role === 'superadmin')) {
      loadStats();
      loadSlug();
    }
  }, [tenantId, role]);

  const loadSlug = async () => {
    try {
      const { data } = await supabase.from('tenants').select('slug').eq('id', tenantId).single();
      if (data) setTenantSlug(data.slug);
    } catch (err) {}
  };

  if (role !== 'admin' && role !== 'superadmin') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 100px)' }}>
        <div className="glass" style={{ maxWidth: '600px', width: '100%', padding: '50px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--neon-blue)', filter: 'blur(100px)', opacity: 0.3, zIndex: 0 }}></div>
          <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--neon-purple)', filter: 'blur(100px)', opacity: 0.3, zIndex: 0 }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Trophy size={36} color="#fff" />
            </div>
            
            <h2 style={{ fontSize: '2.4rem', marginBottom: '40px', fontWeight: '800', background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              Bem-vindo
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <button onClick={() => navigate('/orders')} className="btn btn-primary" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: 'auto', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#fff', borderRadius: '16px', transition: 'all 0.3s ease' }}>
                <ShoppingBag size={28} color="var(--neon-blue)" />
                <span style={{ fontWeight: 600, fontSize: '1.1rem', letterSpacing: '0.3px' }}>Acessar Pedidos</span>
              </button>
              
              <button onClick={() => navigate('/products')} className="btn btn-primary" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: 'auto', background: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.4)', color: '#fff', borderRadius: '16px', transition: 'all 0.3s ease' }}>
                <PackageOpen size={28} color="var(--neon-purple)" />
                <span style={{ fontWeight: 600, fontSize: '1.1rem', letterSpacing: '0.3px' }}>Catálogo de Produtos</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

    const loadStats = async () => {
      if (!tenantId) return;
      try {
        setLoading(true);
        // Puxar produtos
        const { data: products } = await supabase.from('products').select('id').eq('tenant_id', tenantId);
        
        // Puxar pedidos
        const { data: orders } = await supabase.from('orders').select('total, status, created_at, items').eq('tenant_id', tenantId);
        
        let sales = 0;
      let orderCount = 0;
      let ticketMedio = 0;
      
      const salesByDay = {};
      const productSales = {};

      if (orders) {
        // Obter data de hoje (início do dia local)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        orders.forEach(order => {
          let orderDate = null;
          if (order.created_at) {
            orderDate = new Date(order.created_at);
            
            // Verifica se o pedido foi feito "Hoje"
            if (orderDate >= todayStart) {
              orderCount++;
              sales += (Number(order.total) || 0);
            }

            // Group by Day for Chart (mantém todos os dias)
            const dateStr = `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth()+1).toString().padStart(2, '0')}`;
            if (!salesByDay[dateStr]) {
              salesByDay[dateStr] = 0;
            }
            salesByDay[dateStr] += (Number(order.total) || 0);
          }

          // Count Top Products (mantém contagem geral para top products ou focar em hoje?)
          // Focaremos top products em hoje também para consistência do painel "diário"
          if (order.items && Array.isArray(order.items) && (!orderDate || orderDate >= todayStart)) {
            order.items.forEach(item => {
              if (item && item.name) {
                if (!productSales[item.name]) {
                  productSales[item.name] = { quantity: 0, revenue: 0, category: item.category };
                }
                productSales[item.name].quantity += (Number(item.quantity) || 1);
                productSales[item.name].revenue += ((Number(item.price) || 0) * (Number(item.quantity) || 1));
              }
            });
          }
        });

        if (orderCount > 0) {
          ticketMedio = sales / orderCount;
        }
      }

      // Format Chart Data (Last 7 Days)
      const formattedChartData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}`;
        formattedChartData.push({
          name: ds,
          total: salesByDay[ds] || 0
        });
      }

      // Format Top Products Data
      const formattedTopProducts = Object.entries(productSales)
        .map(([name, data]) => ({
          name,
          ...data
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setStats({
        totalSales: sales,
        totalOrders: orderCount,
        totalProducts: products ? products.length : 0,
        ticketMedio: ticketMedio
      });
      setChartData(formattedChartData);
      setTopProducts(formattedTopProducts);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="glass hover-projection" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0 }}>Visão Geral</h2>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard 
          title="Faturamento (Hoje)" 
          value={`R$ ${stats.totalSales.toFixed(2).replace('.', ',')}`} 
          icon={<DollarSign size={28} />} 
          color="34, 197, 94" // green
        />
        <StatCard 
          title="Pedidos (Hoje)" 
          value={stats.totalOrders} 
          icon={<ShoppingBag size={28} />} 
          color="59, 130, 246" // blue
        />
        <StatCard 
          title="Ticket Médio" 
          value={`R$ ${stats.ticketMedio.toFixed(2).replace('.', ',')}`} 
          icon={<TrendingUp size={28} />} 
          color="168, 85, 247" // purple
        />
        <StatCard 
          title="Produtos Ativos" 
          value={stats.totalProducts} 
          icon={<PackageOpen size={28} />} 
          color="234, 179, 8" // gold
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* GRÁFICO DE FATURAMENTO */}
        <div className="glass hover-projection" style={{ padding: '30px', minHeight: '400px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Faturamento (Últimos 7 dias)</h3>
          </div>
          
          {loading ? (
             <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)' }}>Carregando dados...</div>
          ) : chartData.length > 0 ? (
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--gray)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--gray)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#00E5FF', fontWeight: 'bold' }}
                    formatter={(value) => [`R$ ${value.toFixed(2).replace('.', ',')}`, 'Faturamento']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)' }}>Sem dados suficientes</div>
          )}
        </div>

        {/* RANKING DE PRODUTOS */}
        <div className="glass hover-projection" style={{ padding: '30px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trophy size={20} color="#EAB308" />
            <h3 style={{ margin: 0 }}>Top 5 Produtos</h3>
          </div>

          {loading ? (
             <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray)' }}>Carregando...</div>
          ) : topProducts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topProducts.map((prod, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: idx < topProducts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: idx === 0 ? 'rgba(234, 179, 8, 0.2)' : idx === 1 ? 'rgba(156, 163, 175, 0.2)' : idx === 2 ? 'rgba(180, 83, 9, 0.2)' : 'rgba(255,255,255,0.05)',
                    color: idx === 0 ? '#EAB308' : idx === 1 ? '#9CA3AF' : idx === 2 ? '#B45309' : 'var(--gray)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem'
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prod.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray)', textTransform: 'capitalize' }}>{prod.category}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{prod.quantity} un.</div>
                    <div style={{ fontSize: '0.75rem', color: '#00E5FF' }}>R$ {prod.revenue.toFixed(2).replace('.', ',')}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gray)' }}>
              <PackageOpen size={32} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p style={{ margin: 0 }}>Nenhuma venda registrada ainda.</p>
            </div>
          )}
        </div>

      </div>
      
      <style>{`
        .hover-projection {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease;
        }
        .hover-projection:hover {
          transform: translateY(-5px);
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.15), 0 10px 20px rgba(0,0,0,0.4) !important;
          border-color: rgba(59, 130, 246, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;
