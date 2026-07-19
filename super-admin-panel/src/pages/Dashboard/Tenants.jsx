import React, { useEffect, useState } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Store, CreditCard, LogOut, Tags, Megaphone, Search, ArrowRight, Eye, ShieldBan, Package, DollarSign, ShoppingCart, Activity, Plus, Edit3, Trash2, Check, CheckCircle, Settings, X, Palette, Image as ImageIcon, MessageSquare, Phone, Sparkles, Zap, Users } from 'lucide-react';

import CustomToggle from '../../components/UI/CustomToggle';
import ThemeCard from '../../components/UI/ThemeCard';
import SectionSorter from '../../components/UI/SectionSorter';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [visibleEmails, setVisibleEmails] = useState({});

  // Spy Mode States
  const [spyModal, setSpyModal] = useState(false);
  const [spyData, setSpyData] = useState(null);
  const [spyLoading, setSpyLoading] = useState(false);
  const [spyingTenant, setSpyingTenant] = useState(null);

  // Wizard States
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardMode, setWizardMode] = useState('create'); // 'create' or 'edit'
  const [editingTenantId, setEditingTenantId] = useState(null);
  const [wizardSaving, setWizardSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('identidade'); // Tabs: identidade, home, contato

  // Team Management States
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamTenant, setTeamTenant] = useState(null);
  const [teamUsers, setTeamUsers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [newTeamEmail, setNewTeamEmail] = useState('');
  const [newTeamPassword, setNewTeamPassword] = useState('');
  const [newTeamRole, setNewTeamRole] = useState('funcionario');
  const [creatingTeam, setCreatingTeam] = useState(false);

  const [wizardData, setWizardData] = useState({
    name: '', slug: '', custom_domain: '', plan_id: '', email: '', password: '', logoFile: null, logoUrl: null,
    // Billing
    phone: '', billing_day: '1', plan_type: 'monthly',
    // Cores
    primaryColor: '#0047FF', bgDark: '#030B22', headerBg: '',
    textMain: '', textHeading: '', navLinkColor: '', accentColor: '',
    // Tipografia
    fontFamily: 'Outfit', borderRadius: '16px',
    // Hero
    heroTag: '', heroTitle: '', heroDesc: '', heroBtnPrimary: '', heroImageUrl: '', heroImageFile: null,
    // Logo Secundário
    logoUrl2: '', logoFile2: null,
    // Badges
    badge1: '', badge2: '', badge3: '',
    // Marquee
    marqueeText: '',
    // Sobre Nós
    aboutTitle: '', aboutText1: '', aboutText2: '',
    stat1Num: '', stat1Desc: '', stat2Num: '', stat2Desc: '', stat3Num: '', stat3Desc: '',
    // Contato
    phoneText: '', phoneLink: '', addressText: '', addressLink: '', emailText: '', mapUrl: '',
    // Redes Sociais
    instagram: '', facebook: '',
    // Rodapé
    footerText: '', footerCity: '',
    // Cards do Rodapé (footer banners)
    fb1Title: '', fb1Desc: '', fb1Icon: 'fa-truck-fast', fb1Color: '', fb1Bg: '',
    fb2Title: '', fb2Desc: '', fb2Icon: 'fa-headset',    fb2Color: '', fb2Bg: '',
    fb3Title: '', fb3Desc: '', fb3Icon: 'fa-percent',    fb3Color: '', fb3Bg: '',
    // Inteligência Artificial
    openai_api_key: '', ai_system_prompt: 'Você é um assistente virtual da nossa loja. Seu objetivo é ajudar os clientes a tirarem dúvidas e direcionar para o link do nosso site.'
  });

  useEffect(() => {
    loadTenants();
    loadPlans();
  }, []);

  // Live Preview: Envia os dados para o iframe sempre que o wizardData mudar
  useEffect(() => {
    if (wizardStep === 2) {
      const iframe = document.getElementById('live-preview-iframe');
      if (iframe && iframe.contentWindow) {
        // Usa setTimeout pra evitar envio muito excessivo a cada tecla rápida
        const timer = setTimeout(() => {
          iframe.contentWindow.postMessage({
            type: 'CMS_LIVE_PREVIEW',
            payload: wizardData
          }, '*');
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [wizardData, wizardStep]);

  const loadPlans = async () => {
    const { data } = await supabase.from('plans').select('*');
    if (data) setPlans(data);
  };

  const loadTenants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          profiles ( email )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenants(data || []);
    } catch (err) {
      console.error('Erro ao carregar lojas:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({ status: newStatus })
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Bloqueio pelo Banco de Dados (Nenhuma linha afetada). Verifique RLS ou ID.');
      }
      loadTenants();
    } catch (err) {
      alert('Erro ao alterar status: ' + err.message);
    }
  };

  const handleSpy = async (tenant) => {
    setSpyingTenant(tenant);
    setSpyModal(true);
    setSpyLoading(true);
    
    try {
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id);
        
      const { data: orders } = await supabase
        .from('orders')
        .select('total, status')
        .eq('tenant_id', tenant.id);

      let totalRevenue = 0;
      let completedOrders = 0;
      
      if (orders) {
        orders.forEach(o => {
          totalRevenue += Number(o.total || 0);
          completedOrders += 1;
        });
      }

      setSpyData({
        products: productsCount || 0,
        ordersCount: completedOrders,
        revenue: totalRevenue
      });
    } catch (err) {
      console.error(err);
      setSpyData({ products: 0, ordersCount: 0, revenue: 0 });
    } finally {
      setSpyLoading(false);
    }
  };

  // --- WIZARD LOGIC ---

  const openCreateWizard = () => {
    setWizardMode('create');
    setWizardStep(1);
    setWizardData({
      name: '', slug: '', plan_id: '', email: '', password: '', logoFile: null, logoUrl: null,
      // Billing
      phone: '', billing_day: '1', plan_type: 'monthly',
      primaryColor: '#cda434', marqueeBgColor: '#0047FF', bgDark: '#09090b', phoneText: '', phoneLink: '', mapUrl: '', heroTitle: '', heroDesc: '', heroImageUrl: '', heroImageFile: null, heroBtnSecondary: 'Comprar para Empresa', heroBtnPrimaryLink: '#produtos', heroBtnSecondaryLink: '#',
      faviconUrl: '', faviconFile: null,
      theme: 'default', buttonStyle: 'rounded', bgTextureUrl: '', sectionOrder: 'hero,categories,products,about,contact',
      effectParticles: true, effectGlow: true, effectSkeleton: true, effectTilt: true, effectReveal: true,
      effectParallax: false, effectCursor: false, effectFloating: false,
      effectGlitch: false, effectPulse: false, effectSnow: false, floatingEmojis: '🧊,🍾,🥂'
    });
    setWizardOpen(true);
  };

  const openEditWizard = async (tenant) => {
    setWizardMode('edit');
    setEditingTenantId(tenant.id);
    setWizardStep(1);
    
    let baseData = {
      name: tenant.name, slug: tenant.slug, custom_domain: tenant.custom_domain || '', plan_id: tenant.plan_id || '', email: '', password: '', logoFile: null, logoUrl: tenant.logo_url || null,
      // Billing
      phone: tenant.phone || '', billing_day: String(tenant.billing_day || '1'), plan_type: tenant.plan_type || 'monthly',
      primaryColor: '#cda434', marqueeBgColor: '#0047FF', bgDark: '#09090b', phoneText: '', phoneLink: '', mapUrl: '', heroTitle: '', heroDesc: '', heroImageUrl: '', heroImageFile: null, heroBtnSecondary: 'Comprar para Empresa', heroBtnPrimaryLink: '#produtos', heroBtnSecondaryLink: '#',
      faviconUrl: '', faviconFile: null,
      theme: 'default', buttonStyle: 'rounded', bgTextureUrl: '', sectionOrder: 'hero,categories,products,about,contact',
      effectParticles: true, effectGlow: true, effectSkeleton: true, effectTilt: true, effectReveal: true,
      effectParallax: false, effectCursor: false, effectFloating: false,
      effectGlitch: false, effectPulse: false, effectSnow: false, floatingEmojis: '🧊,🍾,🥂'
    };
    setWizardData(baseData);
    setWizardOpen(true);

    try {
      const { data } = await supabase.from('settings').select('value').eq('tenant_id', tenant.id).eq('key', 'site_customization').single();
      if (data && data.value) {
        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        baseData = { ...baseData, ...parsed };
      }
      
      const { data: integData } = await supabase.from('tenant_integrations').select('openai_api_key, ai_system_prompt').eq('tenant_id', tenant.id).single();
      if (integData) {
        if (integData.openai_api_key) baseData.openai_api_key = integData.openai_api_key;
        if (integData.ai_system_prompt) baseData.ai_system_prompt = integData.ai_system_prompt;
      }
      
      setWizardData(baseData);
    } catch(e) {}
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (wizardStep === 1) {
      if (wizardMode === 'create' && (!wizardData.email || wizardData.password.length < 6)) {
        alert("E-mail e senha (mínimo 6 caracteres) são obrigatórios para lojas novas."); 
        return;
      }
      setWizardStep(2);
    } else if (wizardStep === 2) {
      handleFinalSave();
    }
  };

  const handleFinalSave = async () => {
    setWizardSaving(true);
    try {
      let currentTenantId = editingTenantId;

      // 1. Upload Logo if exists
      let finalLogoUrl = wizardData.logoUrl;
      if (wizardData.logoFile) {
        const fileExt = wizardData.logoFile.name.split('.').pop();
        const fileName = `logo_${wizardData.slug}_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('logos').upload(fileName, wizardData.logoFile);
        if (error) throw error;
        finalLogoUrl = supabase.storage.from('logos').getPublicUrl(fileName).data.publicUrl;
      }

      // 2. Upload Hero Image if exists
      let finalHeroUrl = wizardData.heroImageUrl;
      if (wizardData.heroImageFile) {
        const fileExt = wizardData.heroImageFile.name.split('.').pop();
        const fileName = `hero_${wizardData.slug}_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('logos').upload(fileName, wizardData.heroImageFile);
        if (error) throw error;
        finalHeroUrl = supabase.storage.from('logos').getPublicUrl(fileName).data.publicUrl;
      }
      
      let finalLogoUrl2 = wizardData.logoUrl2;
      if (wizardData.logoFile2) {
        const fileExt = wizardData.logoFile2.name.split('.').pop();
        const fileName = `logo2_${wizardData.slug}_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('logos').upload(fileName, wizardData.logoFile2);
        if (error) throw error;
        finalLogoUrl2 = supabase.storage.from('logos').getPublicUrl(fileName).data.publicUrl;
      }
      
      // 2.5 Upload Favicon if exists
      let finalFaviconUrl = wizardData.faviconUrl;
      if (wizardData.faviconFile) {
        const fileExt = wizardData.faviconFile.name.split('.').pop();
        const fileName = `favicon_${wizardData.slug}_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('logos').upload(fileName, wizardData.faviconFile);
        if (error) throw error;
        finalFaviconUrl = supabase.storage.from('logos').getPublicUrl(fileName).data.publicUrl;
      }

      // 2.6 Upload Som de Notificação
      let finalNotificationSoundUrl = wizardData.notificationSoundUrl;
      if (wizardData.notificationSoundFile) {
        const fileExt = wizardData.notificationSoundFile.name.split('.').pop();
        const fileName = `som_${wizardData.slug}_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('logos').upload(fileName, wizardData.notificationSoundFile);
        if (error) throw error;
        finalNotificationSoundUrl = supabase.storage.from('logos').getPublicUrl(fileName).data.publicUrl;
      }

      // 3. Save Tenant Data
      if (wizardMode === 'create') {
        // 3.1 Cria a loja primeiro
        const { data: tenantData, error: tenantError } = await supabase.from('tenants').insert({
          name: wizardData.name,
          slug: wizardData.slug,
          plan_id: wizardData.plan_id || null,
          logo_url: finalLogoUrl
        }).select().single();
        if (tenantError) throw tenantError;
        
        const newTenant = tenantData;
        
        // 3.2 Cria o usuário usando o signUp oficial (cliente secundário para não deslogar o admin)
        const { data: authData, error: authError } = await secondarySupabase.auth.signUp({
          email: wizardData.email,
          password: wizardData.password,
          options: {
            data: {
              tenant_id: newTenant.id,
              role: 'admin'
            }
          }
        });
        
        if (authError) {
          // Se der erro de e-mail duplicado ou senha fraca, exclui a loja recém-criada para evitar lixo
          await supabase.from('tenants').delete().eq('id', newTenant.id);
          throw authError;
        }
        
        if (authData?.user) {
          // 3.3 Vincula o usuário recém-criado à loja que acabou de ser criada, definindo-o como 'admin'
          // A trigger auth_user_created do Supabase já deve ter criado a linha em profiles, então usamos UPDATE.
          // Como o Super Admin tem RLS para atualizar todos os perfis, isso funcionará perfeitamente.
          const { error: profileError } = await supabase.from('profiles').update({
            role: 'admin',
            tenant_id: newTenant.id
          }).eq('id', authData.user.id);
          
          if (profileError) {
             console.error("Erro ao vincular perfil:", profileError);
          }
        }
        
        // Fetch new tenant ID
        const { data: t } = await supabase.from('tenants').select('id').eq('slug', wizardData.slug).single();
        currentTenantId = t.id;
        
        // Transforma o modo em 'edit' imediatamente para que, se algo der erro daqui pra baixo (ex: domínio duplicado),
        // o próximo clique em Salvar apenas atualize, em vez de tentar recriar a loja e dar erro de duplicate key.
        setWizardMode('edit');
        setEditingTenantId(t.id);

        // --- DISPARO AUTOMÁTICO DE E-MAIL (RESEND) ---
        try {
          const { data: setts } = await supabase.from('platform_settings').select('id, value').in('id', ['resend_api_key', 'sender_email']);
          const resendKey = setts?.find(s => s.id === 'resend_api_key')?.value;
          const senderEmail = setts?.find(s => s.id === 'sender_email')?.value;
          const { data: tmpl } = await supabase.from('email_templates').select('subject, body').eq('id', 'welcome_email').single();

          if (resendKey && senderEmail && tmpl && wizardData.email) {
            let finalBody = tmpl.body
              .replace(/{{nome_loja}}/g, wizardData.name)
              .replace(/{{link_painel}}/g, wizardData.custom_domain ? `https://${wizardData.custom_domain}` : `https://${wizardData.slug}.suaempresa.com.br`)
              .replace(/{{email}}/g, wizardData.email)
              .replace(/{{senha}}/g, wizardData.password);
            
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: senderEmail,
                to: wizardData.email,
                subject: tmpl.subject,
                html: finalBody
              })
            });
            // E-mail de boas vindas disparado com sucesso!
          }
        } catch (emailErr) {
          console.error("Erro ao enviar email de boas vindas:", emailErr);
        }
        // ---------------------------------------------
      } else {
        const { error } = await supabase.from('tenants').update({ 
          name: wizardData.name, 
          logo_url: finalLogoUrl,
          plan_id: wizardData.plan_id || null,
          phone: wizardData.phone || null,
          billing_day: wizardData.billing_day ? parseInt(wizardData.billing_day) : 1,
          plan_type: wizardData.plan_type || 'monthly'
        }).eq('id', currentTenantId);
        if (error) throw error;
      }

      // 3.5 Save Custom Domain
      let finalDomain = wizardData.custom_domain ? wizardData.custom_domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '') : null;
      if (finalDomain === '') finalDomain = null;
      const { error: domainError } = await supabase.from('tenants').update({ custom_domain: finalDomain }).eq('id', currentTenantId);
      if (domainError) {
         if (domainError.code === '23505') throw new Error('Este domínio já está em uso por outra loja.');
         throw domainError;
      }

      // 4. Save Customization Settings
      const payload = {
        // Cores
        primaryColor: wizardData.primaryColor,
        bgDark: wizardData.bgDark,
        headerBg: wizardData.headerBg,
        textMain: wizardData.textMain,
        textHeading: wizardData.textHeading,
        navLinkColor: wizardData.navLinkColor,
        accentColor: wizardData.accentColor,
        // Tipografia
        fontFamily: wizardData.fontFamily,
        borderRadius: wizardData.borderRadius,
        // UI & Engine
        theme: wizardData.theme,
        buttonStyle: wizardData.buttonStyle,
        bgTextureUrl: wizardData.bgTextureUrl,
        sectionOrder: wizardData.sectionOrder,
        // WOW Effects
        effectParticles: wizardData.effectParticles,
        effectGlow: wizardData.effectGlow,
        effectTilt: wizardData.effectTilt,
        effectReveal: wizardData.effectReveal,
        effectSkeleton: wizardData.effectSkeleton,
        effectParallax: wizardData.effectParallax,
        effectCursor: wizardData.effectCursor,
        effectFloating: wizardData.effectFloating,
        effectGlitch: wizardData.effectGlitch,
        effectPulse: wizardData.effectPulse,
        effectSnow: wizardData.effectSnow,
        floatingEmojis: wizardData.floatingEmojis,
        // Hero
        heroTag: wizardData.heroTag,
        heroTitle: wizardData.heroTitle,
        heroDesc: wizardData.heroDesc,
        heroBtnPrimary: wizardData.heroBtnPrimary,
        heroImageUrl: finalHeroUrl,
        // Badges
        badge1: wizardData.badge1,
        badge2: wizardData.badge2,
        badge3: wizardData.badge3,
        // Marquee
        marqueeText: wizardData.marqueeText,
        // Sobre Nós
        aboutTitle: wizardData.aboutTitle,
        aboutText1: wizardData.aboutText1,
        aboutText2: wizardData.aboutText2,
        stat1Num: wizardData.stat1Num, stat1Desc: wizardData.stat1Desc,
        stat2Num: wizardData.stat2Num, stat2Desc: wizardData.stat2Desc,
        stat3Num: wizardData.stat3Num, stat3Desc: wizardData.stat3Desc,
        // Contato
        phoneText: wizardData.phoneText,
        phoneLink: wizardData.phoneLink,
        addressText: wizardData.addressText,
        addressLink: wizardData.addressLink,
        emailText: wizardData.emailText,
        mapUrl: wizardData.mapUrl,
        // Redes Sociais
        instagram: wizardData.instagram,
        facebook: wizardData.facebook,
        // Rodapé
        footerText: wizardData.footerText,
        footerCity: wizardData.footerCity,
        // Logos Secundários e Favicon e Som
        logoUrl2: finalLogoUrl2,
        faviconUrl: finalFaviconUrl,
        notificationSoundUrl: finalNotificationSoundUrl,
        // Cards do Rodapé
        fb1Title: wizardData.fb1Title, fb1Desc: wizardData.fb1Desc, fb1Icon: wizardData.fb1Icon, fb1Color: wizardData.fb1Color, fb1Bg: wizardData.fb1Bg,
        fb2Title: wizardData.fb2Title, fb2Desc: wizardData.fb2Desc, fb2Icon: wizardData.fb2Icon, fb2Color: wizardData.fb2Color, fb2Bg: wizardData.fb2Bg,
        fb3Title: wizardData.fb3Title, fb3Desc: wizardData.fb3Desc, fb3Icon: wizardData.fb3Icon, fb3Color: wizardData.fb3Color, fb3Bg: wizardData.fb3Bg
      };

      const { error: upsertErr } = await supabase
        .from('settings')
        .upsert(
          { tenant_id: currentTenantId, key: 'site_customization', value: payload },
          { onConflict: 'tenant_id,key' }
        );
      if (upsertErr) throw upsertErr;

      // 5. Save AI Configurations
      const { error: aiErr } = await supabase
        .from('tenant_integrations')
        .upsert(
          { 
            tenant_id: currentTenantId, 
            openai_api_key: wizardData.openai_api_key, 
            ai_system_prompt: wizardData.ai_system_prompt,
            updated_at: new Date()
          },
          { onConflict: 'tenant_id' }
        );
      if (aiErr) console.error("Erro ao salvar integrações de IA:", aiErr);

      loadTenants();
      setWizardStep(3); // Success Screen

    } catch (err) {
      if (err.message && err.message.includes('users_email_partial_key')) {
        alert("🚨 O e-mail informado já está sendo usado por outro lojista no sistema.\n\nPor favor, escolha um e-mail diferente para o dono desta loja.");
      } else if (err.message && err.message.includes('tenants_slug_key')) {
        alert("🚨 O link da loja (URL) já existe!\n\nPor favor, escolha um link diferente, pois este já está sendo usado por outra loja.");
      } else {
        alert("Erro ao salvar: " + err.message);
      }
    } finally {
      setWizardSaving(false);
    }
  };

  const handleDeleteTenant = async (id, name) => {
    if (!window.confirm(`ATENÇÃO EXTREMA!\nTem certeza que deseja EXCLUIR permanentemente a loja "${name}"?\nEsta ação apagará a loja, os produtos, e não pode ser desfeita.`)) {
      return;
    }
    
    try {
      const { error } = await supabase.rpc('delete_tenant_full', { target_tenant_id: id });
      if (error) throw error;
      loadTenants();
      alert("Loja excluída com sucesso.");
    } catch (err) {
      alert("Erro ao excluir loja: " + err.message);
    }
  };

  // --- TEAM MANAGEMENT LOGIC ---
  const openTeamModal = (tenant) => {
    setTeamTenant(tenant);
    setTeamModalOpen(true);
    loadTeamUsers(tenant.id);
  };

  const loadTeamUsers = async (tId) => {
    setLoadingTeam(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('tenant_id', tId);
      if (error) throw error;
      setTeamUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleCreateTeamUser = async (e) => {
    e.preventDefault();
    if (newTeamPassword.length < 6) return alert('A senha deve ter no mínimo 6 caracteres.');
    
    setCreatingTeam(true);
    try {
      const secondarySupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });
      
      const { data, error } = await secondarySupabase.auth.signUp({
        email: newTeamEmail,
        password: newTeamPassword,
        options: { data: { tenant_id: teamTenant.id, role: newTeamRole } }
      });
      
      if (error) throw error;
      
      if (data.user) {
         await supabase.from('profiles').update({ tenant_id: teamTenant.id, role: newTeamRole }).eq('id', data.user.id);
      }
      
      setNewTeamEmail('');
      setNewTeamPassword('');
      loadTeamUsers(teamTenant.id);
    } catch (err) {
      alert('Erro ao criar usuário: ' + err.message);
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleDeleteTeamUser = async (userId) => {
    if (!window.confirm("Atenção: Deseja realmente excluir permanentemente este usuário da loja? Ele perderá acesso imediatamente.")) return;
    try {
      const { error } = await supabase.rpc('delete_user_admin', { user_id_param: userId });
      if (error) throw error;
      loadTeamUsers(teamTenant.id);
    } catch (err) {
      alert('Erro ao excluir usuário: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Gestão de Inquilinos (Lojas)</h2>
        <button className="btn btn-primary" onClick={openCreateWizard}>Nova Loja +</button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Carregando dados globais...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome / Subdomínio</th>
                <th>Status da Conta</th>
                <th>Plano Atual</th>
                <th style={{ textAlign: 'right' }}>Painel Master</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.name || 'Loja Sem Nome'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.slug || t.id}</div>
                    {t.profiles && t.profiles.length > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          onClick={() => setVisibleEmails(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                          style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                          title="Mostrar/Ocultar E-mail"
                        >
                          <Eye size={16} style={{ opacity: visibleEmails[t.id] ? 1 : 0.5 }} />
                        </button>
                        {visibleEmails[t.id] && <span style={{ color: 'var(--text-main)', fontSize: '13px' }}>{t.profiles[0].email}</span>}
                      </div>
                    )}
                  </td>
                  <td>
                    {t.status === 'active' ? (
                      <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> Ativa</span>
                    ) : (
                      <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShieldBan size={14}/> Bloqueada</span>
                    )}
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-muted)' }}>ID do Plano: {t.plan_id || 'Nenhum'}</span>
                  </td>
                  <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => toggleStatus(t.id, t.status)} className="btn btn-outline" style={{ padding: '8px', borderColor: t.status === 'active' ? '#ef4444' : '#10b981', color: t.status === 'active' ? '#ef4444' : '#10b981' }} title={t.status === 'active' ? "Bloquear Lojista" : "Desbloquear"}>
                        <ShieldBan size={18} />
                      </button>
                      <button onClick={() => openEditWizard(t)} className="btn btn-outline" style={{ padding: '8px' }} title="Editar Loja e Personalizar">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => openTeamModal(t)} className="btn btn-outline" style={{ padding: '8px', borderColor: 'var(--neon-blue)', color: 'var(--neon-blue)' }} title="Gerenciar Equipe / Acessos">
                        <Users size={18} />
                      </button>
                      <button onClick={() => handleSpy(t)} className="btn btn-primary btn-glow" style={{ padding: '8px' }} title="Espiar Faturamento e Produtos">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleDeleteTenant(t.id, t.name)} className="btn btn-outline" style={{ padding: '8px', borderColor: 'var(--danger)', color: 'var(--danger)' }} title="Excluir Loja">
                        <Trash2 size={18} />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL GESTÃO DE EQUIPE */}
      {teamModalOpen && teamTenant && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="var(--primary)" /> 
                Equipe: {teamTenant.name}
              </h3>
              <button onClick={() => setTeamModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTeamUser} style={{ display: 'flex', gap: '10px', marginBottom: '30px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>E-mail</label>
                <input type="email" required className="input" placeholder="novo@email.com" value={newTeamEmail} onChange={e => setNewTeamEmail(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Senha (Mín. 6)</label>
                <input type="password" required minLength="6" className="input" placeholder="******" value={newTeamPassword} onChange={e => setNewTeamPassword(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Cargo</label>
                <select className="input" value={newTeamRole} onChange={e => setNewTeamRole(e.target.value)}>
                  <option value="admin">Administrador (Dono)</option>
                  <option value="funcionario">Funcionário Base</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={creatingTeam} style={{ height: '42px', padding: '0 15px' }}>
                {creatingTeam ? '...' : <Plus size={18} />}
              </button>
            </form>

            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '15px', color: 'var(--text-muted)' }}>Membros Atuais</h4>
              {loadingTeam ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Carregando...</div>
              ) : teamUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Nenhum usuário encontrado.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <tbody>
                    {teamUsers.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 10px' }}>{user.email}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', background: user.role === 'admin' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)', color: user.role === 'admin' ? '#3b82f6' : 'var(--text-muted)', fontSize: '12px' }}>
                            {user.role === 'admin' ? 'Admin' : 'Funcionário'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 10px' }}>
                          <button onClick={() => handleDeleteTeamUser(user.id)} className="btn btn-outline" style={{ padding: '4px 8px', borderColor: 'rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.9)' }} title="Excluir Usuário">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODO ESPIÃO */}
      {spyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card" style={{ width: '500px', border: '1px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.3 }}></div>
            
            <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <Eye size={20} /> Raio-X da Loja
            </h3>
            <p style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '18px', marginBottom: '24px' }}>
              {spyingTenant?.name}
            </p>

            {spyLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--primary)' }}>Realizando varredura secreta...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'rgba(205,164,52,0.1)', borderRadius: '8px', color: 'var(--primary)' }}><Package size={20}/></div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Produtos Cadastrados</div>
                      <div style={{ fontSize: '20px', fontWeight: 700 }}>{spyData?.products}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', color: '#3b82f6' }}><ShoppingCart size={20}/></div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pedidos Recebidos</div>
                      <div style={{ fontSize: '20px', fontWeight: 700 }}>{spyData?.ordersCount}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'rgba(34,197,94,0.2)', borderRadius: '8px', color: '#22c55e' }}><DollarSign size={20}/></div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#22c55e', opacity: 0.8 }}>Faturamento da Loja</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e' }}>R$ {spyData?.revenue.toFixed(2).replace('.', ',')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button className="btn" style={{ width: '100%', marginTop: '24px', background: 'rgba(255,255,255,0.05)' }} onClick={() => setSpyModal(false)}>
              Fechar Raio-X
            </button>
          </div>
        </div>
      )}

      {/* WIZARD MODAL (Criação e Personalização) */}
      {wizardOpen && (
        <div className="modal" style={{ display: 'flex', padding: '20px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
          <div className="modal-content glass" style={{ 
            width: '100%', 
            maxWidth: wizardStep === 2 ? '1400px' : '700px', 
            height: wizardStep === 2 ? '95vh' : 'auto', 
            maxHeight: '95vh', 
            overflow: 'hidden', 
            transition: 'max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.4s ease', 
            display: 'flex', 
            flexDirection: 'column', 
            background: 'var(--bg-sidebar)', 
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '0'
          }}>
            
            <div className="modal-header" style={{ padding: '24px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '22px' }}>{wizardMode === 'create' ? 'Assistente de Criação de Loja' : 'Edição e Personalização da Loja'}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', width: '300px' }}>
                  <div style={{ flex: 1, height: '4px', background: wizardStep >= 1 ? 'var(--primary)' : 'rgba(255,255,255,0.1)', borderRadius: '2px', transition: '0.3s' }}></div>
                  <div style={{ flex: 1, height: '4px', background: wizardStep >= 2 ? 'var(--primary)' : 'rgba(255,255,255,0.1)', borderRadius: '2px', transition: '0.3s' }}></div>
                  <div style={{ flex: 1, height: '4px', background: wizardStep >= 3 ? 'var(--success)' : 'rgba(255,255,255,0.1)', borderRadius: '2px', transition: '0.3s' }}></div>
                </div>
              </div>
              <button onClick={() => setWizardOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--gray)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', ':hover': { background: 'rgba(255,255,255,0.1)', color: '#fff' } }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              
              {/* PASSO 1: DADOS BÁSICOS */}
              {wizardStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '30px', overflowY: 'auto' }}>
                  
                  {/* Bloco 1: Identidade da Loja */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <div style={{ padding: '8px', background: 'rgba(205, 164, 52, 0.1)', color: 'var(--primary)', borderRadius: '8px' }}><Store size={20} /></div>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>Identidade da Empresa</h4>
                    </div>
                    <div className="form-grid">
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Nome do Estabelecimento</label>
                        <input type="text" className="input" required value={wizardData.name} onChange={e => setWizardData({...wizardData, name: e.target.value})} placeholder="Ex: Bebidas do João" />
                      </div>
                      <div className="form-group">
                        <label>Subdomínio (Link da Vitrine)</label>
                        <input type="text" className="input" required disabled={wizardMode === 'edit'} value={wizardData.slug} onChange={e => setWizardData({...wizardData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} placeholder="Ex: bebidasjoao" />
                      </div>
                      <div className="form-group">
                        <label>Domínio Personalizado (Opcional)</label>
                        <input type="text" className="input" value={wizardData.custom_domain} onChange={e => setWizardData({...wizardData, custom_domain: e.target.value})} placeholder="Ex: www.minhaloja.com.br" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Logo Principal da Loja</label>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <input type="file" accept="image/*" className="input" onChange={e => setWizardData({...wizardData, logoFile: e.target.files[0]})} style={{ flex: 1, padding: '10px' }} />
                          {wizardMode === 'edit' && wizardData.logoUrl && !wizardData.logoFile && <div style={{ padding: '6px 12px', background: 'rgba(34,197,94,0.1)', color: 'var(--success)', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>Logo Atual Mantida</div>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloco 2: Faturamento */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px' }}><CreditCard size={20} /></div>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>Plano e Faturamento</h4>
                    </div>
                    <div className="form-grid">
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Plano de Assinatura</label>
                        <select className="input" value={wizardData.plan_id} onChange={e => setWizardData({...wizardData, plan_id: e.target.value})}>
                          <option value="">Nenhum Plano (Gratuito/Teste)</option>
                          {plans.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - R$ {Number(p.price).toFixed(2)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>WhatsApp do Dono</label>
                        <input type="tel" className="input" value={wizardData.phone} onChange={e => setWizardData({...wizardData, phone: e.target.value})} placeholder="DDD + Número" />
                      </div>
                      <div className="form-group">
                        <label>Vencimento / Tipo</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="number" className="input" min="1" max="28" value={wizardData.billing_day} onChange={e => setWizardData({...wizardData, billing_day: e.target.value})} placeholder="Dia (1-28)" style={{ width: '100px' }} />
                          <select className="input" value={wizardData.plan_type} onChange={e => setWizardData({...wizardData, plan_type: e.target.value})} style={{ flex: 1 }}>
                            <option value="monthly">Mensal</option>
                            <option value="annual">Anual</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloco 3: Acesso ao Painel Lojista */}
                  {wizardMode === 'create' && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ padding: '8px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', borderRadius: '8px' }}><LogOut style={{ transform: 'rotate(180deg)' }} size={20} /></div>
                        <h4 style={{ margin: 0, fontSize: '16px' }}>Credenciais de Acesso (Lojista)</h4>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>E-mail de Login</label>
                          <input type="email" className="input" required value={wizardData.email} onChange={e => setWizardData({...wizardData, email: e.target.value})} placeholder="lojista@email.com" />
                        </div>
                        <div className="form-group">
                          <label>Senha Provisória</label>
                          <input type="text" className="input" required value={wizardData.password} onChange={e => setWizardData({...wizardData, password: e.target.value})} placeholder="Crie uma senha inicial" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
                    <button type="submit" className="btn btn-primary btn-glow" style={{ padding: '14px 28px', fontSize: '15px' }}>
                      Próximo Passo <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* PASSO 2: PERSONALIZAÇÃO (CMS) */}
              {wizardStep === 2 && (
                <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
                  
                  {/* SIDEBAR DO CMS WIZARD */}
                  <div style={{ width: '220px', background: 'rgba(0,0,0,0.2)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gray)', fontWeight: 'bold', paddingLeft: '8px', marginBottom: '8px' }}>Construtor CMS</div>
                    
                    <button type="button" onClick={() => setActiveTab('identidade')} style={{ textAlign: 'left', background: activeTab === 'identidade' ? 'rgba(205, 164, 52, 0.1)' : 'transparent', color: activeTab === 'identidade' ? 'var(--primary)' : 'var(--gray)', padding: '12px 16px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s' }}>
                      <Palette size={18} /> Aparência Visual
                    </button>
                    
                    <button type="button" onClick={() => setActiveTab('home')} style={{ textAlign: 'left', background: activeTab === 'home' ? 'rgba(205, 164, 52, 0.1)' : 'transparent', color: activeTab === 'home' ? 'var(--primary)' : 'var(--gray)', padding: '12px 16px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s' }}>
                      <ImageIcon size={18} /> Banner & Info
                    </button>
                    
                    <button type="button" onClick={() => setActiveTab('contato')} style={{ textAlign: 'left', background: activeTab === 'contato' ? 'rgba(205, 164, 52, 0.1)' : 'transparent', color: activeTab === 'contato' ? 'var(--primary)' : 'var(--gray)', padding: '12px 16px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s' }}>
                      <Phone size={18} /> Contato & Footer
                    </button>
                    
                    <button type="button" onClick={() => setActiveTab('ai')} style={{ textAlign: 'left', background: activeTab === 'ai' ? 'rgba(205, 164, 52, 0.1)' : 'transparent', color: activeTab === 'ai' ? 'var(--primary)' : 'var(--gray)', padding: '12px 16px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s' }}>
                      <MessageSquare size={18} /> IA e Bot
                    </button>
                    
                    <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                      <button type="submit" className="btn btn-primary btn-glow" disabled={wizardSaving} style={{ width: '100%', padding: '12px' }}>
                        {wizardSaving ? 'Salvando...' : 'Finalizar e Salvar'}
                      </button>
                      <button type="button" onClick={() => setWizardStep(1)} className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }}>Voltar</button>
                    </div>
                  </div>

                  {/* MAIN CONTENT DO FORMULÁRIO */}
                  <div style={{ flex: 1, padding: '30px', overflowY: 'auto', background: 'var(--bg-main)' }}>
                  
                  {/* ABA 1: IDENTIDADE VISUAL */}
                  {activeTab === 'identidade' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', paddingBottom: '40px' }}>
                      
                      {/* TEMAS E ESTRUTURA (NOVO) */}
                      <div>
                        <h3 style={{ margin: '0 0 20px', color: '#fff', fontSize: '20px' }}>Estilo Geral da Vitrine</h3>
                        
                        <label style={{ display: 'block', marginBottom: '12px', color: 'var(--gray)' }}>Selecione um Tema Base:</label>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                          <ThemeCard active={wizardData.theme === 'default'} onClick={() => setWizardData({...wizardData, theme: 'default'})} title="Clássico Escuro" desc="Preto absoluto, muito elegante" icon={<Store size={24} color='currentColor' />}  />
                          <ThemeCard active={wizardData.theme === 'glass'} onClick={() => setWizardData({...wizardData, theme: 'glass'})} title="Glassmorphism" desc="Vidro, reflexos, premium" icon={<Sparkles size={24} color='currentColor' />}  />
                          <ThemeCard active={wizardData.theme === 'light'} onClick={() => setWizardData({...wizardData, theme: 'light'})} title="Luz / Claro" desc="Branco e limpo" icon={<LayoutDashboard size={24} color='currentColor' />}  />
                          <ThemeCard active={wizardData.theme === 'cyberpunk'} onClick={() => setWizardData({...wizardData, theme: 'cyberpunk'})} title="Cyberpunk" desc="Neon e futurista" icon={<Zap size={24} color='currentColor' />}  />
                        </div>

                        <div className="form-grid">
                          <div className="form-group">
                            <label>Design dos Botões</label>
                            <select className="input" value={wizardData.buttonStyle || 'rounded'} onChange={e => setWizardData({...wizardData, buttonStyle: e.target.value})}>
                              <option value="square">Quadrados (Sério)</option>
                              <option value="rounded">Arredondados (Equilibrado)</option>
                              <option value="pill">Pílula (Moderno)</option>
                              <option value="neumorphism">Neumorphism (Relevo Suave)</option>
                              <option value="outline-glow">Outline Glow (Transparente Brilhante)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Textura de Fundo (Opcional URL)</label>
                            <input type="text" className="input" value={wizardData.bgTextureUrl || ''} onChange={e => setWizardData({...wizardData, bgTextureUrl: e.target.value})} placeholder="URL de textura..." />
                          </div>
                        </div>

                        {/* WOW EFFECTS SECTION */}
                        <div style={{ marginTop: '30px', padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                          <h4 style={{ margin: '0 0 20px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>Efeitos Especiais (WOW Effects)</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                            <CustomToggle checked={wizardData.effectParticles !== false} onChange={e => setWizardData({...wizardData, effectParticles: e.target.checked})} label="Partículas de Fundo" icon={<Sparkles size={18} color='currentColor' />}  />
                            <CustomToggle checked={wizardData.effectGlow !== false} onChange={e => setWizardData({...wizardData, effectGlow: e.target.checked})} label="Botões com Bordas Neon" icon={<Sparkles size={18} color='currentColor' />}  />
                            <CustomToggle checked={wizardData.effectTilt !== false} onChange={e => setWizardData({...wizardData, effectTilt: e.target.checked})} label="Cartões com Hover 3D" icon={<Package size={18} color='currentColor' />}  />
                            <CustomToggle checked={wizardData.effectReveal !== false} onChange={e => setWizardData({...wizardData, effectReveal: e.target.checked})} label="Surgimento Suave (Scroll)" icon={<Activity size={18} color='currentColor' />}  />
                            <CustomToggle checked={wizardData.effectSkeleton !== false} onChange={e => setWizardData({...wizardData, effectSkeleton: e.target.checked})} label="Efeito Skeleton (Ao carregar)" icon={<LayoutDashboard size={18} color='currentColor' />}  />
                            <CustomToggle checked={wizardData.effectParallax === true} onChange={e => setWizardData({...wizardData, effectParallax: e.target.checked})} label="Fundo em Parallax" icon={<ImageIcon size={18} color='currentColor' />}  color="#22c55e" />
                            <CustomToggle checked={wizardData.effectCursor === true} onChange={e => setWizardData({...wizardData, effectCursor: e.target.checked})} label="Cursor Customizado Mágico" icon={<Check size={18} color='currentColor' />}  color="#22c55e" />
                            <CustomToggle checked={wizardData.effectFloating === true} onChange={e => setWizardData({...wizardData, effectFloating: e.target.checked})} label="Objetos 3D Flutuantes" icon={<Tags size={18} color='currentColor' />}  color="#22c55e" />
                            <CustomToggle checked={wizardData.effectGlitch === true} onChange={e => setWizardData({...wizardData, effectGlitch: e.target.checked})} label="Texto Glitch (Títulos)" icon={<Settings size={18} color='currentColor' />}  color="#ff3366" />
                            <CustomToggle checked={wizardData.effectPulse === true} onChange={e => setWizardData({...wizardData, effectPulse: e.target.checked})} label="Batida de Pulso (Comprar)" icon={<CheckCircle size={18} color='currentColor' />}  color="#ff3366" />
                            <CustomToggle checked={wizardData.effectSnow === true} onChange={e => setWizardData({...wizardData, effectSnow: e.target.checked})} label="Chuva de Neve/Folhas" icon={<Sparkles size={18} color='currentColor' />}  color="#ff3366" />
                          </div>
                          
                          {wizardData.effectFloating && (
                            <div className="form-group" style={{ marginTop: '20px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
                                <label style={{ color: 'var(--neon-blue)' }}>Quais emojis/símbolos devem flutuar?</label>
                                <input type="text" className="input" value={wizardData.floatingEmojis || '🧊,🍾,🥂'} onChange={e => setWizardData({...wizardData, floatingEmojis: e.target.value})} placeholder="Ex: 🎅,🌲,🎁" style={{ marginTop: '10px' }} />
                                <small style={{ color: 'var(--text-muted)' }}>Separe por vírgulas.</small>
                            </div>
                          )}
                        </div>

                        <div className="form-group" style={{ marginTop: '30px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--primary)', fontWeight: 'bold' }}>Ordenação das Seções da Vitrine</label>
                          <SectionSorter sectionOrder={wizardData.sectionOrder} onChange={(newOrder) => setWizardData({...wizardData, sectionOrder: newOrder})} />
                        </div>
                      </div>

                      {/* CORES E FONTES */}
                      <div>
                        <h3 style={{ margin: '30px 0 20px', color: '#fff', fontSize: '20px' }}>Cores e Fontes</h3>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Cor Principal (botões, bordas)</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" className="input" value={wizardData.primaryColor} onChange={e => setWizardData({...wizardData, primaryColor: e.target.value})} style={{ height: '45px', padding: '5px', width: '70px', borderRadius: '8px' }} />
                              <input type="text" className="input" value={wizardData.primaryColor} onChange={e => setWizardData({...wizardData, primaryColor: e.target.value})} placeholder="#0047FF" style={{ flex: 1 }} />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Cor de Fundo do Site</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" className="input" value={wizardData.bgDark} onChange={e => setWizardData({...wizardData, bgDark: e.target.value})} style={{ height: '45px', padding: '5px', width: '70px', borderRadius: '8px' }} />
                              <input type="text" className="input" value={wizardData.bgDark} onChange={e => setWizardData({...wizardData, bgDark: e.target.value})} placeholder="#030B22" style={{ flex: 1 }} />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Cor do Cabeçalho (Header)</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" className="input" value={wizardData.headerBg || '#030B22'} onChange={e => setWizardData({...wizardData, headerBg: e.target.value})} style={{ height: '45px', padding: '5px', width: '70px', borderRadius: '8px' }} />
                              <input type="text" className="input" value={wizardData.headerBg} onChange={e => setWizardData({...wizardData, headerBg: e.target.value})} placeholder="#030B22 ou rgba(3,11,34,0.9)" style={{ flex: 1 }} />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Cor dos Links do Menu</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" className="input" value={wizardData.navLinkColor || '#B8C2D1'} onChange={e => setWizardData({...wizardData, navLinkColor: e.target.value})} style={{ height: '45px', padding: '5px', width: '70px', borderRadius: '8px' }} />
                              <input type="text" className="input" value={wizardData.navLinkColor} onChange={e => setWizardData({...wizardData, navLinkColor: e.target.value})} placeholder="#B8C2D1" style={{ flex: 1 }} />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Cor dos Títulos (H1, H2...)</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" className="input" value={wizardData.textHeading || '#FFFFFF'} onChange={e => setWizardData({...wizardData, textHeading: e.target.value})} style={{ height: '45px', padding: '5px', width: '70px', borderRadius: '8px' }} />
                              <input type="text" className="input" value={wizardData.textHeading} onChange={e => setWizardData({...wizardData, textHeading: e.target.value})} placeholder="#FFFFFF" style={{ flex: 1 }} />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Cor dos Textos Normais</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" className="input" value={wizardData.textMain || '#B8C2D1'} onChange={e => setWizardData({...wizardData, textMain: e.target.value})} style={{ height: '45px', padding: '5px', width: '70px', borderRadius: '8px' }} />
                              <input type="text" className="input" value={wizardData.textMain} onChange={e => setWizardData({...wizardData, textMain: e.target.value})} placeholder="#B8C2D1" style={{ flex: 1 }} />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Cor de Destaque / Acento</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" className="input" value={wizardData.accentColor || '#FFD700'} onChange={e => setWizardData({...wizardData, accentColor: e.target.value})} style={{ height: '45px', padding: '5px', width: '70px', borderRadius: '8px' }} />
                              <input type="text" className="input" value={wizardData.accentColor} onChange={e => setWizardData({...wizardData, accentColor: e.target.value})} placeholder="#FFD700" style={{ flex: 1 }} />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Cor do Banner Deslizante</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" className="input" value={wizardData.marqueeBgColor || '#0047FF'} onChange={e => setWizardData({...wizardData, marqueeBgColor: e.target.value})} style={{ height: '45px', padding: '5px', width: '70px', borderRadius: '8px' }} />
                              <input type="text" className="input" value={wizardData.marqueeBgColor} onChange={e => setWizardData({...wizardData, marqueeBgColor: e.target.value})} placeholder="#0047FF" style={{ flex: 1 }} />
                            </div>
                          </div>
                          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Fonte Principal</label>
                            <select className="input" value={wizardData.fontFamily} onChange={e => setWizardData({...wizardData, fontFamily: e.target.value})}>
                              <option value="Outfit">Outfit (Padrão)</option>
                              <option value="Inter">Inter (Moderno)</option>
                              <option value="Roboto">Roboto (Google)</option>
                              <option value="Montserrat">Montserrat (Elegante)</option>
                              <option value="Poppins">Poppins (Suave)</option>
                              <option value="Playfair Display">Playfair Display (Sofisticado)</option>
                              <option value="Oswald">Oswald (Bold/Impacto)</option>
                            </select>
                          </div>
                          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Logo Secundário (ex: para o Cabeçalho Escuro da Loja)</label>
                            <input type="file" accept="image/*" className="input" onChange={e => setWizardData({...wizardData, logoFile2: e.target.files[0]})} style={{ padding: '12px' }} />
                            {wizardData.logoUrl2 && !wizardData.logoFile2 && <span style={{fontSize:'12px', color:'var(--success)', marginTop: '4px', display: 'block'}}>Logo secundário existente será mantido.</span>}
                          </div>
                          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Favicon do Site (Ícone da aba do navegador)</label>
                            <input type="file" accept="image/png, image/x-icon, image/jpeg, image/svg+xml" className="input" onChange={e => setWizardData({...wizardData, faviconFile: e.target.files[0]})} style={{ padding: '12px' }} />
                            {wizardData.faviconUrl && !wizardData.faviconFile && <span style={{fontSize:'12px', color:'var(--success)', marginTop: '4px', display: 'block'}}>Favicon existente será mantido.</span>}
                          </div>
                          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Som de Notificação de Pedido (Opcional - MP3/WAV)</label>
                            <input type="file" accept="audio/mpeg, audio/wav, audio/ogg" className="input" onChange={e => setWizardData({...wizardData, notificationSoundFile: e.target.files[0]})} style={{ padding: '12px' }} />
                            {wizardData.notificationSoundUrl && !wizardData.notificationSoundFile && <span style={{fontSize:'12px', color:'var(--success)', marginTop: '4px', display: 'block'}}>Som personalizado existente será mantido. <audio src={wizardData.notificationSoundUrl} controls style={{height: '30px', marginTop: '5px', display: 'block'}}></audio></span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

              {/* ABA 2: PÁGINA INICIAL */}
              {activeTab === 'home' && (
                <>
                  {/* HERO / BANNER PRINCIPAL */}
                  <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Banner Principal (Hero)</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Tag de Destaque (ex: DISTRIBUIDORA PREMIUM)</label>
                        <input type="text" className="input" value={wizardData.heroTag} onChange={e => setWizardData({...wizardData, heroTag: e.target.value})} placeholder="DISTRIBUIDORA PREMIUM" />
                      </div>
                      <div className="form-group">
                        <label>Texto do Botão Principal</label>
                        <input type="text" className="input" value={wizardData.heroBtnPrimary} onChange={e => setWizardData({...wizardData, heroBtnPrimary: e.target.value})} placeholder="VER PRODUTOS" />
                      </div>
                      <div className="form-group">
                        <label>Link do Botão Principal</label>
                        <input type="text" className="input" value={wizardData.heroBtnPrimaryLink} onChange={e => setWizardData({...wizardData, heroBtnPrimaryLink: e.target.value})} placeholder="#produtos" />
                      </div>
                      <div className="form-group">
                        <label>Texto do Botão Secundário</label>
                        <input type="text" className="input" value={wizardData.heroBtnSecondary} onChange={e => setWizardData({...wizardData, heroBtnSecondary: e.target.value})} placeholder="Comprar para Empresa" />
                      </div>
                      <div className="form-group">
                        <label>Link do Botão Secundário</label>
                        <input type="text" className="input" value={wizardData.heroBtnSecondaryLink} onChange={e => setWizardData({...wizardData, heroBtnSecondaryLink: e.target.value})} placeholder="#" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Título Principal (H1)</label>
                        <input type="text" className="input" value={wizardData.heroTitle} onChange={e => setWizardData({...wizardData, heroTitle: e.target.value})} placeholder="Ex: As melhores bebidas da cidade!" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Subtítulo / Descrição</label>
                        <textarea className="input" value={wizardData.heroDesc} onChange={e => setWizardData({...wizardData, heroDesc: e.target.value})} rows="2" placeholder="Descrição curta da loja..."></textarea>
                      </div>
                      <div className="form-group">
                        <label>Badge 1</label>
                        <input type="text" className="input" value={wizardData.badge1} onChange={e => setWizardData({...wizardData, badge1: e.target.value})} placeholder="10+ Anos de Tradição" />
                      </div>
                      <div className="form-group">
                        <label>Badge 2</label>
                        <input type="text" className="input" value={wizardData.badge2} onChange={e => setWizardData({...wizardData, badge2: e.target.value})} placeholder="Estoque Completo" />
                      </div>
                      <div className="form-group">
                        <label>Badge 3</label>
                        <input type="text" className="input" value={wizardData.badge3} onChange={e => setWizardData({...wizardData, badge3: e.target.value})} placeholder="Entrega Rápida" />
                      </div>
                      <div className="form-group">
                        <label>Texto do Banner Deslizante (separar com •)</label>
                        <input type="text" className="input" value={wizardData.marqueeText} onChange={e => setWizardData({...wizardData, marqueeText: e.target.value})} placeholder="Cervejas Geladas • Entrega Rápida • Melhores Preços" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Imagem do Hero (Opcional)</label>
                        <input type="file" accept="image/*" className="input" onChange={e => setWizardData({...wizardData, heroImageFile: e.target.files[0]})} style={{ padding: '8px' }} />
                        {wizardData.heroImageUrl && !wizardData.heroImageFile && <span style={{fontSize:'12px', color:'var(--success)'}}>Imagem hero existente será mantida.</span>}
                      </div>
                    </div>
                  </div>

                  {/* SOBRE NÓS */}
                  <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Sobre Nós</p>
                    <div className="form-grid">
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Título da Seção</label>
                        <input type="text" className="input" value={wizardData.aboutTitle} onChange={e => setWizardData({...wizardData, aboutTitle: e.target.value})} placeholder="SOBRE NÓS" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Texto Principal</label>
                        <textarea className="input" value={wizardData.aboutText1} onChange={e => setWizardData({...wizardData, aboutText1: e.target.value})} rows="3" placeholder="Descrição da sua empresa..."></textarea>
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Texto Secundário</label>
                        <textarea className="input" value={wizardData.aboutText2} onChange={e => setWizardData({...wizardData, aboutText2: e.target.value})} rows="2" placeholder="Mais detalhes sobre a empresa..."></textarea>
                      </div>
                      <div className="form-group">
                        <label>Estatística 1 (número)</label>
                        <input type="text" className="input" value={wizardData.stat1Num} onChange={e => setWizardData({...wizardData, stat1Num: e.target.value})} placeholder="+10 Anos" />
                      </div>
                      <div className="form-group">
                        <label>Estatística 1 (descrição)</label>
                        <input type="text" className="input" value={wizardData.stat1Desc} onChange={e => setWizardData({...wizardData, stat1Desc: e.target.value})} placeholder="De Tradição" />
                      </div>
                      <div className="form-group">
                        <label>Estatística 2 (número)</label>
                        <input type="text" className="input" value={wizardData.stat2Num} onChange={e => setWizardData({...wizardData, stat2Num: e.target.value})} placeholder="+5.000" />
                      </div>
                      <div className="form-group">
                        <label>Estatística 2 (descrição)</label>
                        <input type="text" className="input" value={wizardData.stat2Desc} onChange={e => setWizardData({...wizardData, stat2Desc: e.target.value})} placeholder="Clientes Satisfeitos" />
                      </div>
                      <div className="form-group">
                        <label>Estatística 3 (número)</label>
                        <input type="text" className="input" value={wizardData.stat3Num} onChange={e => setWizardData({...wizardData, stat3Num: e.target.value})} placeholder="100%" />
                      </div>
                      <div className="form-group">
                        <label>Estatística 3 (descrição)</label>
                        <input type="text" className="input" value={wizardData.stat3Desc} onChange={e => setWizardData({...wizardData, stat3Desc: e.target.value})} placeholder="Região Atendida" />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="button" onClick={() => setActiveTab('contato')} className="btn btn-primary btn-glow">Avançar para Contato & Rodapé <ArrowRight size={16} /></button>
                  </div>
                </>
              )}

              {/* ABA 3: CONTATO E RODAPÉ */}
              {activeTab === 'contato' && (
                <>
                  {/* CONTATO */}
                  <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Contato e Localização</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Número do WhatsApp (exibição)</label>
                        <input type="text" className="input" value={wizardData.phoneText} onChange={e => setWizardData({...wizardData, phoneText: e.target.value})} placeholder="(16) 99999-9999" />
                      </div>
                      <div className="form-group">
                        <label>Link WhatsApp (wa.me)</label>
                        <input type="url" className="input" value={wizardData.phoneLink} onChange={e => setWizardData({...wizardData, phoneLink: e.target.value})} placeholder="https://wa.me/5516..." />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Endereço (HTML permitido: use &lt;br&gt; para quebrar linha)</label>
                        <input type="text" className="input" value={wizardData.addressText} onChange={e => setWizardData({...wizardData, addressText: e.target.value})} placeholder="Rua Exemplo, 123 &lt;br&gt; Cidade - SP" />
                      </div>
                      <div className="form-group">
                        <label>Link do Endereço (Google Maps)</label>
                        <input type="url" className="input" value={wizardData.addressLink} onChange={e => setWizardData({...wizardData, addressLink: e.target.value})} placeholder="https://maps.google.com/?q=..." />
                      </div>
                      <div className="form-group">
                        <label>E-mail de Contato</label>
                        <input type="email" className="input" value={wizardData.emailText} onChange={e => setWizardData({...wizardData, emailText: e.target.value})} placeholder="contato@minhaloja.com" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Google Maps Iframe URL</label>
                        <input type="url" className="input" value={wizardData.mapUrl} onChange={e => setWizardData({...wizardData, mapUrl: e.target.value})} placeholder="https://www.google.com/maps/embed?pb=... ou https://maps.google.com/..." />
                        <span style={{fontSize:'11px', color:'var(--text-muted)'}}>Copie a URL completa do iframe do Google Maps. Aceita qualquer formato.</span>
                      </div>
                    </div>
                  </div>

                  {/* REDES SOCIAIS */}
                  <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Redes Sociais</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Instagram (URL)</label>
                        <input type="url" className="input" value={wizardData.instagram} onChange={e => setWizardData({...wizardData, instagram: e.target.value})} placeholder="https://instagram.com/..." />
                      </div>
                      <div className="form-group">
                        <label>Facebook (URL)</label>
                        <input type="url" className="input" value={wizardData.facebook} onChange={e => setWizardData({...wizardData, facebook: e.target.value})} placeholder="https://facebook.com/..." />
                      </div>
                    </div>
                  </div>

                  {/* BANNERS DO RODAPÉ */}
                  <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Banners do Rodapé</p>
                    <div className="form-grid">
                      {/* Banner 1 */}
                      <div className="form-group">
                        <label>Banner 1 - Título</label>
                        <input type="text" className="input" value={wizardData.fb1Title} onChange={e => setWizardData({...wizardData, fb1Title: e.target.value})} placeholder="Ex: ENTREGA RÁPIDA" />
                      </div>
                      <div className="form-group">
                        <label>Banner 1 - Descrição</label>
                        <input type="text" className="input" value={wizardData.fb1Desc} onChange={e => setWizardData({...wizardData, fb1Desc: e.target.value})} placeholder="Ex: Para toda a região" />
                      </div>
                      <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label>Ícone FontAwesome</label>
                            <input type="text" className="input" value={wizardData.fb1Icon} onChange={e => setWizardData({...wizardData, fb1Icon: e.target.value})} placeholder="fa-truck-fast" />
                        </div>
                        <div style={{ width: '80px' }}>
                            <label>Cor do Ícone</label>
                            <input type="color" className="input" value={wizardData.fb1Color} onChange={e => setWizardData({...wizardData, fb1Color: e.target.value})} style={{ height: '45px', padding: '5px' }} />
                        </div>
                      </div>
                      {/* Banner 2 */}
                      <div className="form-group">
                        <label>Banner 2 - Título</label>
                        <input type="text" className="input" value={wizardData.fb2Title} onChange={e => setWizardData({...wizardData, fb2Title: e.target.value})} placeholder="Ex: ATENDIMENTO" />
                      </div>
                      <div className="form-group">
                        <label>Banner 2 - Descrição</label>
                        <input type="text" className="input" value={wizardData.fb2Desc} onChange={e => setWizardData({...wizardData, fb2Desc: e.target.value})} placeholder="Ex: (16) 99209-2552" />
                      </div>
                      <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label>Ícone FontAwesome</label>
                            <input type="text" className="input" value={wizardData.fb2Icon} onChange={e => setWizardData({...wizardData, fb2Icon: e.target.value})} placeholder="fa-headset" />
                        </div>
                        <div style={{ width: '80px' }}>
                            <label>Cor do Ícone</label>
                            <input type="color" className="input" value={wizardData.fb2Color} onChange={e => setWizardData({...wizardData, fb2Color: e.target.value})} style={{ height: '45px', padding: '5px' }} />
                        </div>
                      </div>
                      {/* Banner 3 */}
                      <div className="form-group">
                        <label>Banner 3 - Título</label>
                        <input type="text" className="input" value={wizardData.fb3Title} onChange={e => setWizardData({...wizardData, fb3Title: e.target.value})} placeholder="Ex: PAGAMENTO FACILITADO" />
                      </div>
                      <div className="form-group">
                        <label>Banner 3 - Descrição</label>
                        <input type="text" className="input" value={wizardData.fb3Desc} onChange={e => setWizardData({...wizardData, fb3Desc: e.target.value})} placeholder="Ex: Condições especiais para CNPJ" />
                      </div>
                      <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label>Ícone FontAwesome</label>
                            <input type="text" className="input" value={wizardData.fb3Icon} onChange={e => setWizardData({...wizardData, fb3Icon: e.target.value})} placeholder="fa-percent" />
                        </div>
                        <div style={{ width: '80px' }}>
                            <label>Cor do Ícone</label>
                            <input type="color" className="input" value={wizardData.fb3Color} onChange={e => setWizardData({...wizardData, fb3Color: e.target.value})} style={{ height: '45px', padding: '5px' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RODAPÉ */}
                  <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Rodapé</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Cidade da Loja</label>
                        <input type="text" className="input" value={wizardData.footerCity} onChange={e => setWizardData({...wizardData, footerCity: e.target.value})} placeholder="Ex: Ribeiraão Preto, SP" />
                      </div>
                      <div className="form-group">
                        <label>Texto livre do rodapé</label>
                        <input type="text" className="input" value={wizardData.footerText} onChange={e => setWizardData({...wizardData, footerText: e.target.value})} placeholder="Ex: Distribuidora do João" />
                      </div>
                    </div>
                  </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="button" onClick={() => setActiveTab('ai')} className="btn btn-primary btn-glow">Avançar para IA <ArrowRight size={16} /></button>
                    </div>
                  </>
                )}

                {/* ABA 4: INTELIGÊNCIA ARTIFICIAL */}
                {activeTab === 'ai' && (
                  <>
                    <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                      <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Assistente de Vendas (IA)</p>
                      <div className="form-grid">
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Chave da API da OpenAI (sk-...)</label>
                          <input type="password" className="input" value={wizardData.openai_api_key} onChange={e => setWizardData({...wizardData, openai_api_key: e.target.value})} placeholder="sk-..." />
                          <span style={{fontSize:'11px', color:'var(--text-muted)'}}>Obrigatório para que a inteligência artificial funcione. Crie sua chave em platform.openai.com.</span>
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Comportamento do Agente (Prompt de Sistema)</label>
                          <textarea className="input" value={wizardData.ai_system_prompt} onChange={e => setWizardData({...wizardData, ai_system_prompt: e.target.value})} rows="6" placeholder="Descreva as instruções que o agente virtual deve seguir ao conversar com clientes..."></textarea>
                          <span style={{fontSize:'11px', color:'var(--text-muted)'}}>Diga como o bot deve se portar, como "Você é um atendente simpático da distribuidora Zé. Seu objetivo é ajudar na compra."</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                  </div> {/* END OF MAIN CONTENT */}
                  
                  {/* COLUNA DIREITA: LIVE PREVIEW IFRAME */}
                  <div style={{ width: '400px', borderLeft: '1px solid rgba(255,255,255,0.05)', background: '#fff', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '12px', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 10, color: '#374151', fontSize: '12px', fontWeight: 'bold' }}>
                      <Activity size={14} /> Pré-visualização ao Vivo
                    </div>
                    <iframe 
                      id="live-preview-iframe"
                      src={`http://localhost:3000/index.html?preview=true&loja=${wizardData.slug}`} 
                      style={{ width: '100%', height: '100%', border: 'none', paddingTop: '45px' }} 
                      title="Live Preview"
                    />
                  </div>
                </div>
              )}

              {/* PASSO 3: SUCESSO E LINKS */}
              {wizardStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', padding: '20px 0' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={40} />
                  </div>
                  <h3 style={{ color: 'var(--text-main)', margin: 0 }}>Loja {wizardMode === 'create' ? 'Criada' : 'Atualizada'} com Sucesso!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    A loja <strong>{wizardData.name}</strong> está pronta para ser acessada e as personalizações foram aplicadas.
                  </p>

                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', textAlign: 'left' }}>
                    <div style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <label style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>LINK DO PAINEL DE GESTÃO (LOJISTA)</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" readOnly className="input" value={`http://localhost:5174`} style={{ background: 'transparent' }} />
                        <button type="button" className="btn btn-outline" onClick={(e) => {navigator.clipboard.writeText(`http://localhost:5174`); e.target.innerText='Copiado!';}}>Copiar</button>
                      </div>
                    </div>
                    
                    <div style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <label style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>LINK DO SITE DE VENDAS (VITRINE)</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" readOnly className="input" value={`http://localhost:3000/index.html?loja=${wizardData.slug}`} style={{ background: 'transparent' }} />
                        <button type="button" className="btn btn-primary" onClick={(e) => {navigator.clipboard.writeText(`http://localhost:3000/index.html?loja=${wizardData.slug}`); e.target.innerText='Copiado!';}}>Copiar</button>
                      </div>
                    </div>
                  </div>

                  <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }} onClick={() => setWizardOpen(false)}>Fechar Assistente</button>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tenants;
