import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, Store, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Home = () => {
  const { role, tenantId } = useAuth();
  const [stats, setStats] = useState({
    mrr: 0,
    activeTenants: 0,
    pendingAmount: 0,
    paidAmount: 0,
    totalPendingInvoices: 0,
    globalGMV: 0,
    globalOrders: 0,
    globalAvgTicket: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  
  // Big Data States
  const [allOrders, setAllOrders] = useState([]);
  const [tenantsList, setTenantsList] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('all');

  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    let globalGMV = 0;
    let globalOrders = 0;
    let productCounts = {};

    const filteredOrders = selectedTenant === 'all' 
      ? allOrders 
      : allOrders.filter(o => o.tenant_id === selectedTenant);

    filteredOrders.forEach(order => {
      if (order.status !== 'Cancelado' && order.status !== 'cancelado') {
        globalGMV += Number(order.total || 0);
        globalOrders += 1;

        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (item.name) {
              const qty = Number(item.quantity || 1);
              productCounts[item.name] = (productCounts[item.name] || 0) + qty;
            }
          });
        }
      }
    });

    const globalAvgTicket = globalOrders > 0 ? (globalGMV / globalOrders) : 0;

    const sortedProducts = Object.entries(productCounts)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    setTopProducts(sortedProducts);
    
    setStats(prev => ({
      ...prev,
      globalGMV,
      globalOrders,
      globalAvgTicket
    }));
  }, [selectedTenant, allOrders]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Tenants and Plans
      const { data: tenantsData } = await supabase.from('tenants').select('id, name, status, plan_id');
      if (tenantsData) setTenantsList(tenantsData);

      const { data: plansData } = await supabase.from('plans').select('id, price');

      // 2. Fetch all Invoices
      const { data: invoicesData } = await supabase.from('invoices').select('amount, status, created_at');

      let mrr = 0;
      let activeTenantsCount = 0;
      
      if (tenantsData && plansData) {
        const active = tenantsData.filter(t => t.status === 'active');
        activeTenantsCount = active.length;
        
        active.forEach(tenant => {
          const plan = plansData.find(p => p.id === tenant.plan_id);
          if (plan) mrr += Number(plan.price);
        });
      }

      let pendingAmount = 0;
      let paidAmount = 0;
      let totalPendingInvoices = 0;

      if (invoicesData) {
        invoicesData.forEach(inv => {
          if (inv.status === 'pending' || inv.status === 'overdue') {
            pendingAmount += Number(inv.amount);
            totalPendingInvoices += 1;
          }
          if (inv.status === 'paid') {
            paidAmount += Number(inv.amount);
          }
        });
      }

      // 3. Fetch all orders (Global Big Data)
      const { data: ordersData } = await supabase.from('orders').select('total, items, status, tenant_id');
      if (ordersData) setAllOrders(ordersData);

      setStats(prev => ({
        ...prev,
        mrr,
        activeTenants: activeTenantsCount,
        pendingAmount,
        paidAmount,
        totalPendingInvoices
      }));

      // Mock Data for Area Chart (Projeção de Receita) since we don't have historical months yet
      const currentMonth = new Date().toLocaleString('pt-BR', { month: 'short' });
      setChartData([
        { name: 'Fev', receita: mrr * 0.4 },
        { name: 'Mar', receita: mrr * 0.6 },
        { name: 'Abr', receita: mrr * 0.7 },
        { name: 'Mai', receita: mrr * 0.8 },
        { name: 'Jun', receita: mrr * 0.9 },
        { name: currentMonth, receita: mrr > 0 ? mrr : pendingAmount + paidAmount }
      ]);

      // Pie Chart Data
      setPieData([
        { name: 'Pagas', value: paidAmount, color: '#22c55e' },
        { name: 'A Receber', value: pendingAmount, color: '#eab308' }
      ]);

    } catch (err) {
      console.error('Erro ao carregar dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>Sincronizando Dados Globais...</div>;

  if (role === 'tenant') {
    return (
      <div style={{ paddingBottom: '40px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
            Visão Geral da sua Loja
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Métricas e vendas dos seus produtos.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(250, 204, 21, 0.1)', padding: '16px', borderRadius: '12px' }}>
              <DollarSign size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Vendas Totais (GMV)</p>
              <h3 style={{ fontSize: '24px', margin: 0 }}>R$ {stats.globalGMV.toFixed(2)}</h3>
            </div>
          </div>
          
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: '16px', borderRadius: '12px' }}>
              <Activity size={24} style={{ color: '#4caf50' }} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Total de Pedidos</p>
              <h3 style={{ fontSize: '24px', margin: 0 }}>{stats.globalOrders}</h3>
            </div>
          </div>
          
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(33, 150, 243, 0.1)', padding: '16px', borderRadius: '12px' }}>
              <TrendingUp size={24} style={{ color: '#2196f3' }} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>Ticket Médio</p>
              <h3 style={{ fontSize: '24px', margin: 0 }}>R$ {stats.globalAvgTicket.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(90deg, #fff, #facc15)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Painel de Controle
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Métricas do SaaS (Sua Empresa).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* MRR CARD */}
        <div style={{ background: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#eab308', marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Receita Recorrente (MRR)</span>
            <DollarSign size={24} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
            R$ {stats.mrr.toFixed(2).replace('.', ',')}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Baseado no valor das assinaturas ativas</div>
          
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#eab308', filter: 'blur(60px)', opacity: 0.2 }}></div>
        </div>

        {/* PENDING CARD */}
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#60a5fa', marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Faturas A Receber</span>
            <TrendingUp size={24} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
            R$ {stats.pendingAmount.toFixed(2).replace('.', ',')}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total de {stats.totalPendingInvoices} fatura(s) aguardando Pgto</div>
          
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#3b82f6', filter: 'blur(60px)', opacity: 0.2 }}></div>
        </div>

        {/* TENANTS CARD */}
        <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#c084fc', marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Lojas Ativas</span>
            <Store size={24} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
            {stats.activeTenants}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Inquilinos rodando no servidor</div>
          
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#a855f7', filter: 'blur(60px)', opacity: 0.2 }}></div>
        </div>

      </div>

      <div style={{ marginBottom: '30px', marginTop: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Big Data Global
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Movimentação de todas as lojas do ecossistema somadas.</p>
        </div>
        
        <div>
          <select 
            className="input" 
            style={{ minWidth: '250px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            value={selectedTenant}
            onChange={e => setSelectedTenant(e.target.value)}
          >
            <option value="all" style={{ background: '#09090b' }}>Todas as Lojas (Visão Global)</option>
            {tenantsList.map(t => (
              <option key={t.id} value={t.id} style={{ background: '#09090b' }}>Loja: {t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* GMV CARD */}
        <div style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#4ade80', marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Volume Transacionado (GMV)</span>
            <DollarSign size={24} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
            R$ {stats.globalGMV.toFixed(2).replace('.', ',')}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Soma de todas as vendas da plataforma</div>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#22c55e', filter: 'blur(60px)', opacity: 0.15 }}></div>
        </div>

        {/* ORDERS CARD */}
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#60a5fa', marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Pedidos Processados</span>
            <Activity size={24} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
            {stats.globalOrders}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total de pedidos finalizados</div>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#3b82f6', filter: 'blur(60px)', opacity: 0.15 }}></div>
        </div>

        {/* TICKET CARD */}
        <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#c084fc', marginBottom: '16px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Ticket Médio Global</span>
            <TrendingUp size={24} />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
            R$ {stats.globalAvgTicket.toFixed(2).replace('.', ',')}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gasto médio por cliente nas lojas</div>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#a855f7', filter: 'blur(60px)', opacity: 0.15 }}></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* LINE CHART */}
        <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--primary)"/> Crescimento de Receita (6 Meses)
          </h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip 
                  contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#eab308' }}
                  formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']}
                />
                <Area type="monotone" dataKey="receita" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={18} color="var(--primary)"/> Status Financeiro
          </h3>
          
          {(stats.pendingAmount === 0 && stats.paidAmount === 0) ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Sem faturas processadas
            </div>
          ) : (
            <>
              <div style={{ width: '100%', height: '200px', margin: 'auto' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                      contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></div>
                  Pagas
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></div>
                  Pendentes
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--primary)"/> Ranking: Top 5 Produtos do Brasil
        </h3>
        
        {topProducts.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum produto processado ainda.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topProducts.map((prod, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: idx === 0 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.1)', color: idx === 0 ? '#eab308' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {idx + 1}
                  </div>
                  <strong style={{ fontSize: '15px' }}>{prod.name}</strong>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{prod.qty}</span> unidades vendidas
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
