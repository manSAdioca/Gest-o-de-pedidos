-- Criação do tipo enumerado para status da assinatura
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adiciona a coluna status na tabela tenants se não existir
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='tenants' AND column_name='status'
    ) THEN
        ALTER TABLE public.tenants ADD COLUMN status text NOT NULL DEFAULT 'active';
    END IF;
END $$;

-- Criação da tabela de assinaturas
CREATE TABLE IF NOT EXISTS public.tenant_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL DEFAULT 0.00,
    due_date date NOT NULL,
    status subscription_status NOT NULL DEFAULT 'pending',
    payment_link text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop políticas antigas se existirem
DROP POLICY IF EXISTS "SuperAdmin all subscriptions" ON public.tenant_subscriptions;
DROP POLICY IF EXISTS "Tenant admin read own subscriptions" ON public.tenant_subscriptions;

-- Super Admin pode tudo
CREATE POLICY "SuperAdmin all subscriptions" ON public.tenant_subscriptions
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

-- Tenant Admin pode ler as suas faturas
CREATE POLICY "Tenant admin read own subscriptions" ON public.tenant_subscriptions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE tenant_id = tenant_subscriptions.tenant_id AND role = 'admin'
        )
    );

-- Função para gerar faturas em lote
CREATE OR REPLACE FUNCTION generate_monthly_billing(target_month date)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    t RECORD;
    plan RECORD;
    count_generated integer := 0;
BEGIN
    IF auth.jwt() ->> 'role' != 'super_admin' THEN
        RAISE EXCEPTION 'Acesso negado';
    END IF;

    FOR t IN 
        SELECT id, billing_day, plan_id 
        FROM public.tenants 
        WHERE status = 'active' AND plan_id IS NOT NULL
    LOOP
        -- Busca valor do plano
        SELECT price INTO plan FROM public.plans WHERE id = t.plan_id;
        
        -- Verifica se já existe fatura gerada para este mês
        IF NOT EXISTS (
            SELECT 1 FROM public.tenant_subscriptions 
            WHERE tenant_id = t.id 
            AND EXTRACT(MONTH FROM due_date) = EXTRACT(MONTH FROM target_month)
            AND EXTRACT(YEAR FROM due_date) = EXTRACT(YEAR FROM target_month)
        ) THEN
            -- Cria a fatura
            INSERT INTO public.tenant_subscriptions (tenant_id, amount, due_date, status)
            VALUES (
                t.id, 
                COALESCE(plan.price, 0), 
                make_date(EXTRACT(YEAR FROM target_month)::int, EXTRACT(MONTH FROM target_month)::int, COALESCE(t.billing_day, 1)),
                'pending'
            );
            count_generated := count_generated + 1;
        END IF;
    END LOOP;

    RETURN json_build_object('success', true, 'generated', count_generated);
END;
$$;

-- Função para checar atrasos manualmente ou via CRON
CREATE OR REPLACE FUNCTION process_overdue_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Marca faturas pendentes que já passaram do vencimento como overdue
    UPDATE public.tenant_subscriptions
    SET status = 'overdue', updated_at = now()
    WHERE status = 'pending' AND due_date < current_date;

    -- 2. Suspende tenants que possuem pelo menos uma fatura overdue
    UPDATE public.tenants
    SET status = 'suspended'
    WHERE id IN (
        SELECT tenant_id FROM public.tenant_subscriptions WHERE status = 'overdue'
    ) AND status = 'active';

    -- 3. Reativa tenants que não possuem fatura overdue e estão suspensos
    UPDATE public.tenants
    SET status = 'active'
    WHERE id NOT IN (
        SELECT tenant_id FROM public.tenant_subscriptions WHERE status = 'overdue'
    ) AND status = 'suspended';
END;
$$;

-- Tentativa de agendar o pg_cron (pode falhar dependendo das permissões do usuário)
DO $$ 
BEGIN
    -- Isso roda todo dia às 00:01
    PERFORM cron.schedule('process_overdue_daily', '1 0 * * *', 'SELECT process_overdue_subscriptions();');
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pg_cron não está habilitado ou requer permissão superuser. A função process_overdue_subscriptions() terá que ser chamada manualmente/API.';
END $$;
