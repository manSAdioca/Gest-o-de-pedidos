-- Permite que Funcionários e Admins atualizem os pedidos de sua própria loja
DROP POLICY IF EXISTS "Permitir atualizacao de pedidos" ON public.orders;

CREATE POLICY "Permitir atualizacao de pedidos" 
ON public.orders FOR UPDATE 
USING (
  tenant_id = public.get_my_tenant_id()
  OR public.get_my_role() = 'superadmin'
)
WITH CHECK (
  tenant_id = public.get_my_tenant_id()
  OR public.get_my_role() = 'superadmin'
);
