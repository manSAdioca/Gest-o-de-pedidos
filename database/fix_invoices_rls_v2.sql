-- ============================================================
-- FIX DEFINITIVO: Coluna payment_link + RLS corrigido
-- ============================================================

-- 1. Adiciona a coluna payment_link se não existir
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS payment_link TEXT;

-- 2. Adiciona a coluna notes se não existir
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Adiciona a coluna paid_at se não existir
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- 4. Garante que RLS está habilitado
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 5. Remove políticas para recriar limpas
DROP POLICY IF EXISTS "Superadmin pode ver todas as faturas" ON public.invoices;
DROP POLICY IF EXISTS "Superadmin all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Tenant admin read own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Tenant pode ver suas faturas" ON public.invoices;
DROP POLICY IF EXISTS "Tenant pode ler suas faturas" ON public.invoices;

-- 6. Super Admin pode fazer TUDO (agora com a subquery correta de role)
CREATE POLICY "Superadmin all invoices" ON public.invoices
  FOR ALL
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' )
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' );

-- 7. Tenant Admin pode apenas LER suas próprias faturas
CREATE POLICY "Tenant pode ler suas faturas" ON public.invoices
  FOR SELECT
  USING ( 
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- 8. Recarrega schema
NOTIFY pgrst, 'reload schema';
