CREATE OR REPLACE FUNCTION public.delete_user_admin(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_calling_role text;
    v_calling_tenant uuid;
    v_target_tenant uuid;
    v_target_role text;
BEGIN
    -- Obter role e tenant_id do chamador (admin atual)
    SELECT role, tenant_id INTO v_calling_role, v_calling_tenant 
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Obter role e tenant_id do usuário que vai ser deletado
    SELECT role, tenant_id INTO v_target_role, v_target_tenant 
    FROM public.profiles 
    WHERE id = user_id_param;

    -- Validações de segurança
    IF v_calling_role = 'superadmin' THEN
        -- superadmin pode deletar qualquer um, passa direto
        NULL;
    ELSIF v_calling_role = 'admin' THEN
        -- admin só pode deletar funcionários da sua própria loja
        IF v_calling_tenant IS NULL OR v_calling_tenant != v_target_tenant THEN
            RAISE EXCEPTION 'Acesso negado: Este usuário pertence a outra loja.';
        END IF;
    ELSE
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem excluir usuários.';
    END IF;

    -- Proteção contra exclusão do dono mestre do sistema
    IF v_target_role = 'superadmin' THEN
        RAISE EXCEPTION 'Acesso negado: Nao e permitido excluir o Super Admin do sistema.';
    END IF;

    -- Excluir do auth.users (isso exclui o perfil junto através de CASCADE)
    DELETE FROM auth.users WHERE id = user_id_param;
END;
$$;
