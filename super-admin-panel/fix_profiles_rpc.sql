-- Atualiza a Função RPC removendo a coluna created_at da tabela profiles
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
    INSERT INTO public.tenants (name, slug, plan_id, status, logo_url)
    VALUES (p_tenant_name, p_tenant_slug, p_plan_id, 'active', p_logo_url)
    RETURNING id INTO v_tenant_id;

    v_user_id := uuid_generate_v4();
    v_encrypted_pw := crypt(p_user_password, gen_salt('bf'));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
        recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
        created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 
        p_user_email, v_encrypted_pw, now(), now(), now(), 
        '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
        id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
        uuid_generate_v4(), v_user_id, v_user_id::text, 
        format('{"sub":"%s","email":"%s"}', v_user_id::text, p_user_email)::jsonb, 
        'email', now(), now(), now()
    );

    -- Correção: Inserindo no profiles sem a coluna created_at
    INSERT INTO public.profiles (id, email, tenant_id, role)
    VALUES (v_user_id, p_user_email, v_tenant_id, 'admin');

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

NOTIFY pgrst, 'reload schema';
