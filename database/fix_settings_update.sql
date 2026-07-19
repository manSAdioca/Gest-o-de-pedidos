-- Permite que Funcionários e Admins atualizem as configurações da sua própria loja
DROP POLICY IF EXISTS "Permitir atualizacao de settings" ON public.settings;

CREATE POLICY "Permitir atualizacao de settings" 
ON public.settings FOR UPDATE 
USING (
  tenant_id = public.get_my_tenant_id()
  OR public.get_my_role() = 'superadmin'
)
WITH CHECK (
  tenant_id = public.get_my_tenant_id()
  OR public.get_my_role() = 'superadmin'
);
