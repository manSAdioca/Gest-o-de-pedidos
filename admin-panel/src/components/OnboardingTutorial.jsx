import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingCart, Package, Tags, DollarSign, 
  Users, CreditCard, HeadphonesIcon, X, ChevronRight, ChevronLeft,
  CheckCircle, Sparkles, ArrowRight, Rocket
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const steps = [
  {
    id: 'welcome',
    icon: <Rocket size={48} />,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.08))',
    title: 'Bem-vindo ao seu Painel! 🎉',
    description: 'Seu sistema de gestão está pronto. Em menos de 2 minutos vamos te mostrar tudo que você precisa saber para começar a vender!',
    highlight: null,
  },
  {
    id: 'dashboard',
    icon: <LayoutDashboard size={40} />,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.02))',
    title: 'Dashboard — Visão Geral',
    description: 'Aqui você vê o resumo do dia: faturamento, pedidos recebidos, produtos em estoque e muito mais. É a primeira tela que você vê ao entrar.',
    highlight: '/',
    tip: '💡 Consulte o dashboard toda manhã para começar o dia informado!',
  },
  {
    id: 'orders',
    icon: <ShoppingCart size={40} />,
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.02))',
    title: 'Pedidos — Central de Vendas',
    description: 'Sempre que um cliente fizer um pedido no seu site, ele aparece aqui em tempo real. Você pode aceitar, preparar, marcar como entregue ou cancelar.',
    highlight: '/orders',
    tip: '💡 Você receberá um som de alerta e notificação sempre que um pedido novo chegar!',
  },
  {
    id: 'products',
    icon: <Package size={40} />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.02))',
    title: 'Produtos — Seu Catálogo',
    description: 'Cadastre e gerencie todos os produtos da sua loja. Adicione fotos, preços, descrições e controle o estoque. Os produtos aparecem automaticamente no site.',
    highlight: '/products',
    tip: '💡 Produtos com foto vendem muito mais! Capriche nas imagens.',
  },
  {
    id: 'categories',
    icon: <Tags size={40} />,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.02))',
    title: 'Categorias — Organização',
    description: 'Organize seus produtos em categorias como "Cervejas", "Destilados", "Refrigerantes" etc. Isso facilita a navegação do cliente no site.',
    highlight: '/categories',
    tip: '💡 Crie as categorias primeiro, depois vincule os produtos a elas.',
  },
  {
    id: 'finance',
    icon: <DollarSign size={40} />,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.02))',
    title: 'Financeiro — Controle de Caixa',
    description: 'Acompanhe o faturamento, visualize relatórios de vendas e tenha controle completo do dinheiro que está entrando na sua loja.',
    highlight: '/finance',
    tip: '💡 Registre todas as transações para ter uma visão precisa do seu negócio.',
  },
  {
    id: 'users',
    icon: <Users size={40} />,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(6,182,212,0.02))',
    title: 'Equipe — Gerencie seus Funcionários',
    description: 'Crie contas para seus funcionários! Eles terão acesso ao painel para gerenciar pedidos, mas sem acesso às áreas financeiras e administrativas.',
    highlight: '/users',
    tip: '💡 Funcionários veem apenas Pedidos, Produtos e Categorias — sem acesso ao financeiro.',
  },
  {
    id: 'support',
    icon: <HeadphonesIcon size={40} />,
    color: '#f43f5e',
    gradient: 'linear-gradient(135deg, rgba(244,63,94,0.12), rgba(244,63,94,0.02))',
    title: 'Suporte — Estamos Aqui!',
    description: 'Teve algum problema ou dúvida? Abra um ticket de suporte e nossa equipe vai te ajudar rapidamente pelo painel ou WhatsApp.',
    highlight: '/support',
    tip: '💡 Resposta em até 24 horas úteis!',
  },
  {
    id: 'done',
    icon: <CheckCircle size={48} />,
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.05))',
    title: 'Tudo pronto! Vamos vender! 🚀',
    description: 'Você conhece todas as funções do painel. Agora é só configurar seus produtos e começar a receber pedidos. Boas vendas!',
    highlight: null,
    tip: '💡 Dica: Comece cadastrando suas categorias e depois adicione os produtos.',
  },
];

const OnboardingTutorial = ({ onComplete, userId }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [animating, setAnimating] = useState(false);

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep) / (steps.length - 1)) * 100;

  const goTo = (index) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(index);
      setAnimating(false);
    }, 200);
  };

  const markCompleted = async () => {
    // Salva no Supabase (banco de dados)
    if (userId) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId);
    }
    // Salva também no localStorage como fallback
    localStorage.setItem('onboarding_completed_v1', 'true');
  };

  const handleComplete = async () => {
    await markCompleted();
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = async () => {
    await markCompleted();
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(3, 11, 34, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#0d1b3e',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '540px',
        overflow: 'hidden',
        boxShadow: `0 0 80px rgba(${step.color.replace('#','').match(/../g).map(x=>parseInt(x,16)).join(',')}, 0.15), 0 25px 60px rgba(0,0,0,0.5)`,
        transition: 'box-shadow 0.4s ease',
      }}>
        
        {/* Progress Bar */}
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${step.color}, ${step.color}aa)`,
            transition: 'width 0.4s ease, background 0.4s ease',
            borderRadius: '0 2px 2px 0',
          }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '28px 32px 24px',
          background: step.gradient,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          transition: 'background 0.4s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Step counter */}
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
              {currentStep === 0 ? 'Início' : currentStep === steps.length - 1 ? 'Concluído' : `Passo ${currentStep} de ${steps.length - 2}`}
            </div>
            <button
              onClick={handleSkip}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              title="Pular tutorial"
            >
              <X size={18} />
            </button>
          </div>

          {/* Icon */}
          <div style={{
            width: '80px', height: '80px',
            borderRadius: '20px',
            background: `${step.color}20`,
            border: `1px solid ${step.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: step.color,
            margin: '20px 0 16px',
            filter: `drop-shadow(0 0 20px ${step.color}40)`,
            transition: 'all 0.4s ease',
            opacity: animating ? 0 : 1,
            transform: animating ? 'scale(0.9)' : 'scale(1)',
          }}>
            {step.icon}
          </div>

          <h2 style={{
            fontSize: '22px', fontWeight: 800, color: '#fff',
            margin: '0 0 10px',
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(8px)' : 'translateY(0)',
            transition: 'all 0.2s ease',
          }}>
            {step.title}
          </h2>
          <p style={{
            fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', margin: 0,
            opacity: animating ? 0 : 1,
            transition: 'opacity 0.2s ease',
          }}>
            {step.description}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 32px 28px' }}>
          {/* Tip */}
          {step.tip && (
            <div style={{
              padding: '12px 16px',
              background: `${step.color}10`,
              border: `1px solid ${step.color}25`,
              borderLeft: `3px solid ${step.color}`,
              borderRadius: '10px',
              fontSize: '13px', color: 'rgba(255,255,255,0.7)',
              marginBottom: '24px', lineHeight: '1.5',
              opacity: animating ? 0 : 1,
              transition: 'opacity 0.2s ease',
            }}>
              {step.tip}
            </div>
          )}

          {/* Dot indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === currentStep ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === currentStep ? step.color : 'rgba(255,255,255,0.15)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {!isFirst && (
              <button
                onClick={() => goTo(currentStep - 1)}
                style={{
                  flex: '0 0 auto',
                  padding: '12px 18px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '14px', fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                <ChevronLeft size={16} /> Voltar
              </button>
            )}

            {!isLast ? (
              <button
                onClick={() => goTo(currentStep + 1)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: step.color,
                  border: 'none', borderRadius: '12px',
                  color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontSize: '15px', fontWeight: 700,
                  boxShadow: `0 4px 20px ${step.color}40`,
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 25px ${step.color}60`; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px ${step.color}40`; }}
              >
                {isFirst ? <><Sparkles size={16} /> Começar Tour</> : <>Próximo <ChevronRight size={16} /></>}
              </button>
            ) : (
              <button
                onClick={handleComplete}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  border: 'none', borderRadius: '12px',
                  color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  fontSize: '16px', fontWeight: 800,
                  boxShadow: '0 4px 25px rgba(34,197,94,0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(34,197,94,0.6)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 25px rgba(34,197,94,0.4)'; }}
              >
                <CheckCircle size={18} /> Entendi, vamos lá!
              </button>
            )}
          </div>

          {isFirst && (
            <button
              onClick={handleSkip}
              style={{ 
                width: '100%', marginTop: '12px', background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '13px',
                padding: '8px', transition: 'color 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              Pular tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const useOnboarding = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const checkOnboarding = async () => {
      // Busca o status do onboarding no perfil do usuário
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, role')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        // Fallback: usa localStorage se não conseguiu buscar do banco
        const local = localStorage.getItem('onboarding_completed_v1');
        if (!local) setTimeout(() => setShowOnboarding(true), 800);
        return;
      }

      // Superadmin nunca vê o tutorial
      if (data.role === 'superadmin') return;

      // Se não completou ainda, mostra o tutorial
      if (!data.onboarding_completed) {
        setUserId(user.id);
        setTimeout(() => setShowOnboarding(true), 800);
      }
    };

    checkOnboarding();
  }, [user?.id]);

  return { showOnboarding, setShowOnboarding, userId };
};

export default OnboardingTutorial;
