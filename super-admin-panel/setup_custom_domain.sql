-- Adicionar coluna custom_domain na tabela tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE;

-- Criar índice para buscas rápidas por domínio
CREATE INDEX IF NOT EXISTS tenants_custom_domain_idx ON public.tenants(custom_domain);
