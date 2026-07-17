-- Criação da tabela de planos
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    max_products INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Segurança de Nível de Linha (RLS)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Política de leitura: qualquer um autenticado pode ver os planos
DROP POLICY IF EXISTS "Qualquer pessoa autenticada pode ver planos" ON public.plans;
CREATE POLICY "Qualquer pessoa autenticada pode ver planos" 
ON public.plans FOR SELECT 
TO authenticated 
USING (true);

-- Política de escrita: somente superadmin pode criar/editar
DROP POLICY IF EXISTS "Somente superadmin pode alterar planos" ON public.plans;
CREATE POLICY "Somente superadmin pode alterar planos" 
ON public.plans FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'superadmin'
    )
);

-- Inserir os planos padrão
INSERT INTO public.plans (name, price, features, max_products)
VALUES 
('Somente Site', 97.00, ARRAY['Site catálogo aberto 24h', 'Sem acesso ao gestor completo', 'Suporte básico via e-mail'], 50),
('Site + Gestor ou CRM', 197.00, ARRAY['Site catálogo aberto 24h', 'Painel Administrativo Completo', 'Gestão de pedidos e clientes'], 200),
('Site + Gestor + API Pagamento', 397.00, ARRAY['Site catálogo aberto 24h', 'Painel Administrativo Completo', 'Integração de pagamento online', 'Recebimento via PIX e Cartão'], 1000),
('Site + Gestor + API + IA WhatsApp', 997.00, ARRAY['Site catálogo aberto 24h', 'Painel Administrativo Completo', 'Integração de pagamento online', 'Atendente Virtual IA no WhatsApp 24h'], 5000);
