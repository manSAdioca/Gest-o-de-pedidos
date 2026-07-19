-- Permite que Donos da Loja (Admins) vejam os perfis apenas de sua própria loja
DROP POLICY IF EXISTS "Admin ve perfis da sua loja" ON public.profiles;
CREATE POLICY "Admin ve perfis da sua loja" ON public.profiles FOR SELECT USING (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) 
  OR id = auth.uid()
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
);

-- Permite que Donos da Loja (Admins) promovam ou rebaixem funcionários apenas de sua própria loja
DROP POLICY IF EXISTS "Admin atualiza cargos da sua loja" ON public.profiles;
CREATE POLICY "Admin atualiza cargos da sua loja" ON public.profiles FOR UPDATE USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
  AND tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
) WITH CHECK (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);
