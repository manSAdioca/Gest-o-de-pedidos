-- Permite que qualquer cliente no site público (mesmo sem estar logado) possa salvar um pedido
DROP POLICY IF EXISTS "Permitir inserção anônima de pedidos" ON public.orders;
CREATE POLICY "Permitir inserção anônima de pedidos" ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Permite que os clientes vejam seus próprios pedidos (se estiverem logados) ou anônimos vejam apenas o que acabaram de criar (dependendo da sua regra, mas INSERT é o principal)
