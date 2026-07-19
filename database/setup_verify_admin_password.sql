-- ============================================================
-- RPC: verify_admin_password
-- Verifica se a senha fornecida pertence ao admin do tenant
-- Chamada pelo funcionário ao tentar excluir um chamado
-- ============================================================

CREATE OR REPLACE FUNCTION public.verify_admin_password(
  p_tenant_id UUID,
  p_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_email TEXT;
  v_result BOOLEAN := FALSE;
BEGIN
  -- Busca o email do admin do tenant
  SELECT au.email INTO v_admin_email
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.tenant_id = p_tenant_id
    AND p.role = 'admin'
  LIMIT 1;

  IF v_admin_email IS NULL THEN
    RAISE EXCEPTION 'Admin not found for tenant';
  END IF;

  -- Tenta autenticar com as credenciais do admin
  -- Supabase não expõe verificação de senha via SQL diretamente,
  -- então usamos uma abordagem: verificar via crypt se a senha confere
  -- com o hash armazenado no auth.users
  SELECT (
    au.encrypted_password = crypt(p_password, au.encrypted_password)
  ) INTO v_result
  FROM auth.users au
  WHERE au.email = v_admin_email;

  IF NOT v_result THEN
    RAISE EXCEPTION 'Invalid admin password';
  END IF;

  RETURN TRUE;
END;
$$;

-- Garantir que apenas usuários autenticados podem chamar
REVOKE ALL ON FUNCTION public.verify_admin_password FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_admin_password TO authenticated;
