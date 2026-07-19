-- Desabilita e reabilita RLS para garantir estado limpo
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Remove qualquer politica velha
DROP POLICY IF EXISTS "Permitir inserção anônima de pedidos" ON public.orders;
DROP POLICY IF EXISTS "Dono da loja pode ver seus pedidos" ON public.orders;
DROP POLICY IF EXISTS "Superadmin pode ver todos os pedidos" ON public.orders;
DROP POLICY IF EXISTS "Leitura publica de pedidos temporaria" ON public.orders;

-- 1. Qualquer um (site público) pode INSERIR pedidos
CREATE POLICY "Permitir inserção anônima de pedidos" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- 2. O dono da loja (admin) pode VER apenas os pedidos da loja dele
CREATE POLICY "Dono da loja pode ver seus pedidos" 
ON public.orders FOR SELECT 
USING ( tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) );

-- 3. O dono da loja (admin) pode ATUALIZAR (mudar status) os pedidos da loja dele
CREATE POLICY "Dono da loja pode atualizar seus pedidos" 
ON public.orders FOR UPDATE 
USING ( tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) );

-- 4. O Super Admin pode VER TODOS os pedidos de qualquer loja
CREATE POLICY "Superadmin pode ver todos os pedidos" 
ON public.orders FOR ALL 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' );
