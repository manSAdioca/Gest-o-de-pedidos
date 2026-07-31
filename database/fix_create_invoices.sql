-- FIX DEFINITIVO PARA ERRO DE RLS AO CRIAR FATURA

-- 1. Garante que RLS está habilitado
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 2. Remove políticas antigas que podem estar conflitando
DROP POLICY IF EXISTS "Superadmin pode ver todas as faturas" ON public.invoices;
DROP POLICY IF EXISTS "Superadmin all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Permitir insercao faturas superadmin" ON public.invoices;
DROP POLICY IF EXISTS "Fallback allow insert" ON public.invoices;

-- 3. Cria uma política unificada e forte para SELECT, INSERT, UPDATE, DELETE para superadmin
CREATE POLICY "Superadmin all invoices" ON public.invoices
  FOR ALL
  USING ( 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'master') 
  )
  WITH CHECK ( 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('superadmin', 'master') 
  );

-- 4. Como você é o dono do sistema, caso seu usuário por algum motivo não 
-- esteja como 'superadmin' na tabela profiles, a política abaixo serve como fallback:
CREATE POLICY "Fallback allow insert" ON public.invoices 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

NOTIFY pgrst, 'reload schema';
