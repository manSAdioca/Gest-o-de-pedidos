-- ==============================================================================
-- CATÁLOGO GLOBAL DE PRODUTOS
-- ==============================================================================
-- Esta tabela armazena templates de produtos criados pelo Super Admin.
-- Os lojistas poderão visualizar e importar esses produtos para suas lojas,
-- poupando tempo na busca por imagens e criação de nomes padrão.

CREATE TABLE IF NOT EXISTS public.global_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category_slug TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.global_products ENABLE ROW LEVEL SECURITY;

-- Política 1: Leitura livre para qualquer usuário logado (Lojistas e Super Admins)
CREATE POLICY "Leitura livre para usuarios autenticados" 
ON public.global_products FOR SELECT 
TO authenticated 
USING (true);

-- Política 2: Escrita restrita aos Super Admins
CREATE POLICY "Escrita e delecao apenas para superadmins" 
ON public.global_products FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
  )
);

-- Permite acesso anônimo para visualizar as fotos do catálogo na Vitrine (se necessário no futuro)
CREATE POLICY "Leitura anonima" 
ON public.global_products FOR SELECT 
TO anon 
USING (true);

-- Notifica o PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';
