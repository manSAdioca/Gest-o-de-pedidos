-- ============================================================
-- SETUP BILLING SaaS - Base Completa (sem Mercado Pago)
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- 1. EXTENSOES NECESSARIAS
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================
-- 2. ADICIONAR CAMPOS DE BILLING NA TABELA TENANTS
-- ============================================================
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'phone') THEN
        ALTER TABLE public.tenants ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'billing_day') THEN
        ALTER TABLE public.tenants ADD COLUMN billing_day INTEGER DEFAULT 1 CHECK (billing_day >= 1 AND billing_day <= 28);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'plan_type') THEN
        ALTER TABLE public.tenants ADD COLUMN plan_type TEXT DEFAULT 'monthly' CHECK (plan_type IN ('monthly', 'annual'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'activated_at') THEN
        ALTER TABLE public.tenants ADD COLUMN activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ============================================================
-- 3. GARANTIR ESTRUTURA COMPLETA DA TABELA INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_link TEXT,
    mp_preference_id TEXT,
    mp_payment_id TEXT,
    notes TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'mp_preference_id') THEN
        ALTER TABLE public.invoices ADD COLUMN mp_preference_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'mp_payment_id') THEN
        ALTER TABLE public.invoices ADD COLUMN mp_payment_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'notes') THEN
        ALTER TABLE public.invoices ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'paid_at') THEN
        ALTER TABLE public.invoices ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'payment_link') THEN
        ALTER TABLE public.invoices ADD COLUMN payment_link TEXT;
    END IF;
END $$;

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "superadmin_all_invoices" ON public.invoices;
CREATE POLICY "superadmin_all_invoices" ON public.invoices
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
    );

DROP POLICY IF EXISTS "tenant_own_invoices" ON public.invoices;
CREATE POLICY "tenant_own_invoices" ON public.invoices
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- ============================================================
-- 4. FUNCAO: BLOQUEIO AUTOMATICO POR ATRASO
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_block_tenants()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant RECORD;
    v_days_overdue INTEGER;
    v_new_status TEXT;
BEGIN
    FOR v_tenant IN 
        SELECT DISTINCT t.id, t.status
        FROM public.tenants t
        INNER JOIN public.invoices i ON i.tenant_id = t.id
        WHERE i.status IN ('pending', 'overdue')
          AND t.status != 'cancelled'
    LOOP
        SELECT GREATEST(0, EXTRACT(DAY FROM (NOW() - MIN(due_date)))::INTEGER)
        INTO v_days_overdue
        FROM public.invoices
        WHERE tenant_id = v_tenant.id
          AND status IN ('pending', 'overdue')
          AND due_date < CURRENT_DATE;

        UPDATE public.invoices
        SET status = 'overdue'
        WHERE tenant_id = v_tenant.id
          AND status = 'pending'
          AND due_date < CURRENT_DATE;

        IF v_days_overdue >= 3 THEN
            v_new_status := 'blocked';
        ELSIF v_days_overdue >= 2 THEN
            v_new_status := 'warning';
        ELSE
            v_new_status := v_tenant.status;
        END IF;

        IF v_new_status != v_tenant.status AND v_new_status IN ('blocked', 'warning') THEN
            UPDATE public.tenants SET status = v_new_status WHERE id = v_tenant.id;
        END IF;
    END LOOP;

    UPDATE public.tenants t
    SET status = 'active'
    WHERE t.status IN ('warning', 'blocked')
      AND NOT EXISTS (
          SELECT 1 FROM public.invoices i
          WHERE i.tenant_id = t.id
            AND i.status IN ('pending', 'overdue')
            AND i.due_date < CURRENT_DATE
      );
END;
$$;

-- ============================================================
-- 5. FUNCAO: GERACAO AUTOMATICA DE FATURAS MENSAIS
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_monthly_invoices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant RECORD;
    v_plan_price NUMERIC;
    v_today_day INTEGER;
    v_due_date DATE;
    v_already_exists BOOLEAN;
BEGIN
    v_today_day := EXTRACT(DAY FROM CURRENT_DATE)::INTEGER;

    FOR v_tenant IN
        SELECT t.id, t.billing_day, t.plan_id, t.plan_type, t.name
        FROM public.tenants t
        WHERE t.status = 'active'
          AND t.billing_day = v_today_day
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM public.invoices
            WHERE tenant_id = v_tenant.id
              AND status IN ('pending', 'overdue')
              AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        ) INTO v_already_exists;

        IF v_already_exists THEN
            CONTINUE;
        END IF;

        SELECT price INTO v_plan_price FROM public.plans WHERE id = v_tenant.plan_id;
        
        IF v_plan_price IS NULL THEN
            CONTINUE;
        END IF;

        v_due_date := CURRENT_DATE + INTERVAL '5 days';

        INSERT INTO public.invoices (tenant_id, amount, due_date, status, notes)
        VALUES (
            v_tenant.id,
            v_plan_price,
            v_due_date,
            'pending',
            'Fatura automatica - ' || TO_CHAR(CURRENT_DATE, 'MM/YYYY')
        );
    END LOOP;
END;
$$;

-- ============================================================
-- 6. REGISTRAR JOBS PG_CRON
-- ============================================================
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname IN ('auto-block-tenants', 'generate-monthly-invoices');

SELECT cron.schedule('auto-block-tenants', '0 11 * * *', 'SELECT public.auto_block_tenants();');
SELECT cron.schedule('generate-monthly-invoices', '5 11 * * *', 'SELECT public.generate_monthly_invoices();');

NOTIFY pgrst, 'reload schema';
