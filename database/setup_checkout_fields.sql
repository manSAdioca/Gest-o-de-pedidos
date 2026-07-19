-- ============================================================
-- ATUALIZAÇÃO DA TABELA ORDERS PARA CHECKOUT INTELIGENTE
-- ============================================================

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) DEFAULT 0.00;

-- Atualizar dados antigos para evitar nulos problemáticos (opcional, mas boa prática)
UPDATE public.orders SET payment_method = 'dinheiro' WHERE payment_method IS NULL;

-- Notificar PostgREST para reconhecer as novas colunas
NOTIFY pgrst, 'reload schema';
