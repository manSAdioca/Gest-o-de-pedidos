-- 1. Cria a Tabela de Planos (SaaS)
CREATE TABLE IF NOT EXISTS public.plans (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    price numeric(10, 2) NOT NULL,
    max_products integer DEFAULT 100,
    features jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir planos iniciais
INSERT INTO public.plans (name, price, max_products) VALUES
('Plano Starter', 97.00, 100),
('Plano Profissional', 197.00, 9999);

-- 2. Atualiza a tabela de Lojas (Tenants) para suportar Planos
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.plans(id);

-- Opcional: Vincular a loja atual ao Plano Profissional
UPDATE public.tenants 
SET plan_id = (SELECT id FROM public.plans WHERE price = 197.00 LIMIT 1) 
WHERE id = '1b68d0b5-78cc-4f2a-8123-85c01714d34e';

-- 3. Injeta a regra do Super Admin (Bypass de RLS)
-- Somente o dono do sistema poderá ver todas as lojas e todas as faturas
-- CUIDADO: Este script pressupõe que o seu email master seja atualizado para 'superadmin' na tabela profiles

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Planos são públicos para leitura (para usar no site no futuro)
CREATE POLICY "Planos visíveis publicamente" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Apenas superadmin gerencia planos" ON public.plans FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' );

-- Expande o RLS do Tenants para o Superadmin ver tudo
DROP POLICY IF EXISTS "Superadmin pode ver todos os tenants" ON public.tenants;
CREATE POLICY "Superadmin pode ver todos os tenants" ON public.tenants FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' );

-- Expande o RLS das Faturas para o Superadmin ver tudo
DROP POLICY IF EXISTS "Superadmin pode ver todas as faturas" ON public.invoices;
CREATE POLICY "Superadmin pode ver todas as faturas" ON public.invoices FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' );
