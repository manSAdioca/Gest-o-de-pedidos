-- ============================================================
-- CRIAÇÃO DA TABELA DE CUPONS DE DESCONTO
-- ============================================================

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_value NUMERIC(10, 2) DEFAULT 0.00,
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tenant_id, code)
);

-- Habilitar RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- 1. Qualquer pessoa na loja (anônimo ou logado) pode LER cupons ativos daquela loja
DROP POLICY IF EXISTS "Public read active coupons" ON public.coupons;
CREATE POLICY "Public read active coupons"
ON public.coupons FOR SELECT
USING (active = true);

-- 2. Administrador pode ler todos os cupons de sua loja
DROP POLICY IF EXISTS "Admin read own coupons" ON public.coupons;
CREATE POLICY "Admin read own coupons"
ON public.coupons FOR SELECT
USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE profiles.id = auth.uid()));

-- 3. Administrador pode criar/editar/deletar cupons de sua loja
DROP POLICY IF EXISTS "Admin modify own coupons" ON public.coupons;
CREATE POLICY "Admin modify own coupons"
ON public.coupons FOR ALL
USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE profiles.id = auth.uid()))
WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE profiles.id = auth.uid()));

-- ============================================================
-- ADIÇÃO DE CAMPOS DE CUPOM NA TABELA ORDERS
-- ============================================================
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0.00;

-- Notificar PostgREST
NOTIFY pgrst, 'reload schema';
