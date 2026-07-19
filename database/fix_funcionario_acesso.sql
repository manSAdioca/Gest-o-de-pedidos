-- 1. Garante que qualquer funcionário possa ler os pedidos e produtos de sua própria loja
DROP POLICY IF EXISTS "Funcionario ve pedidos" ON public.orders;
CREATE POLICY "Funcionario ve pedidos" ON public.orders FOR SELECT USING (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) 
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
);

DROP POLICY IF EXISTS "Funcionario ve produtos" ON public.products;
CREATE POLICY "Funcionario ve produtos" ON public.products FOR SELECT USING (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) 
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
);

-- 2. Conserta a sua conta específica que estava "fantasma" sem loja
UPDATE public.profiles
SET 
  role = 'funcionario', -- Como você pediu para testar o nível de funcionário
  tenant_id = '1b68d0b5-78cc-4f2a-8123-85c01714d34e'
WHERE email = 'samuelgoncalves0409@gmail.com';
