-- Garante que o Super Admin tem permissão para alterar (UPDATE) os inquilinos
DROP POLICY IF EXISTS "Superadmin update tenants" ON public.tenants;
CREATE POLICY "Superadmin update tenants" ON public.tenants FOR UPDATE USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' );
