-- 1. Cria o Bucket "logos" e garante que ele seja PÚBLICO
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('logos', 'logos', true, null, null) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Permite que QUALQUER PESSOA na internet consiga ver as logos (Leitura)
DROP POLICY IF EXISTS "Leitura publica logos" ON storage.objects;
CREATE POLICY "Leitura publica logos" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'logos');

-- 3. Permite que o painel envie a imagem (Upload/Escrita)
DROP POLICY IF EXISTS "Escrita logos" ON storage.objects;
CREATE POLICY "Escrita logos" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'logos');

-- 4. Atualiza o sistema interno da API do Supabase
NOTIFY pgrst, 'reload schema';
