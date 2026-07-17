-- 1. Remove as politicas defeituosas que causaram o loop infinito
DROP POLICY IF EXISTS "Admin ve perfis da sua loja" ON public.profiles;
DROP POLICY IF EXISTS "Admin atualiza cargos da sua loja" ON public.profiles;
DROP POLICY IF EXISTS "Funcionario ve pedidos" ON public.orders;
DROP POLICY IF EXISTS "Funcionario ve produtos" ON public.products;

-- 2. Cria funcoes que burlam o RLS para leitura rapida (Evita Infinite Recursion)
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS uuid AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Recria as politicas de forma segura
CREATE POLICY "Admin ve perfis da sua loja" ON public.profiles FOR SELECT USING (
  tenant_id = public.get_my_tenant_id()
  OR id = auth.uid()
  OR public.get_my_role() = 'superadmin'
);

CREATE POLICY "Admin atualiza cargos da sua loja" ON public.profiles FOR UPDATE USING (
  public.get_my_role() IN ('admin', 'superadmin')
  AND tenant_id = public.get_my_tenant_id()
);

CREATE POLICY "Funcionario ve pedidos" ON public.orders FOR SELECT USING (
  tenant_id = public.get_my_tenant_id()
  OR public.get_my_role() = 'superadmin'
);

CREATE POLICY "Funcionario ve produtos" ON public.products FOR SELECT USING (
  tenant_id = public.get_my_tenant_id()
  OR public.get_my_role() = 'superadmin'
);
