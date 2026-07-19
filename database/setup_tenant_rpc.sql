-- Habilita extensão de criptografia nativa (se já não estiver)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Adiciona a coluna logo_url na tabela tenants (se não existir)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'logo_url') THEN
        ALTER TABLE public.tenants ADD COLUMN logo_url TEXT;
    END IF;
END $$;

-- Criação da função RPC que o Super Admin vai chamar pelo Front-end
CREATE OR REPLACE FUNCTION public.create_tenant_with_user(
    p_tenant_name TEXT,
    p_tenant_slug TEXT,
    p_plan_id UUID,
    p_user_email TEXT,
    p_user_password TEXT,
    p_logo_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_encrypted_pw TEXT;
BEGIN
    -- 1. Cria a loja (Tenant) e guarda o ID gerado
    INSERT INTO public.tenants (name, slug, plan_id, status, logo_url)
    VALUES (p_tenant_name, p_tenant_slug, p_plan_id, 'active', p_logo_url)
    RETURNING id INTO v_tenant_id;

    -- 2. Gera UUID do usuário e criptografa a senha para o padrão do Supabase
    v_user_id := uuid_generate_v4();
    v_encrypted_pw := crypt(p_user_password, gen_salt('bf'));

    -- 3. Insere o usuário diretamente na tabela interna auth.users
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
        recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
        created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 
        p_user_email, v_encrypted_pw, now(), now(), now(), 
        '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
    );

    -- 4. Cria a identidade de login (necessário no Supabase v2+)
    INSERT INTO auth.identities (
        id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
        uuid_generate_v4(), v_user_id, v_user_id::text, 
        format('{"sub":"%s","email":"%s"}', v_user_id::text, p_user_email)::jsonb, 
        'email', now(), now(), now()
    );

    -- 5. Vincula o novo usuário como 'admin' (Dono da loja) da loja recém criada
    INSERT INTO public.profiles (id, email, tenant_id, role, created_at)
    VALUES (v_user_id, p_user_email, v_tenant_id, 'admin', now());

    -- Retorna sucesso pro React
    RETURN jsonb_build_object(
        'success', true,
        'tenant_id', v_tenant_id,
        'user_id', v_user_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Criar Bucket público de logos, se não existir (apenas via SQL, em versões antigas pode dar erro se o schema storage não estiver aberto, mas o padrão permite inserção)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true) 
ON CONFLICT (id) DO NOTHING;

-- Liberar leitura pública do bucket
DROP POLICY IF EXISTS "Leitura publica logos" ON storage.objects;
CREATE POLICY "Leitura publica logos" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'logos');

-- Liberar escrita para usuarios autenticados
DROP POLICY IF EXISTS "Escrita logos" ON storage.objects;
CREATE POLICY "Escrita logos" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'logos');
