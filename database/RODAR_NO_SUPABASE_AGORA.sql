-- ============================================================
-- SETUP FINAL CONSOLIDADO
-- Execute este arquivo completo no SQL Editor do Supabase
-- Resolve: onboarding, exclusão de chamados e configurações da loja
-- ============================================================

-- ─────────────────────────────────────────
-- 1. ONBOARDING — Tutorial vinculado ao perfil
-- ─────────────────────────────────────────
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

UPDATE public.profiles 
SET onboarding_completed = TRUE 
WHERE role = 'superadmin';

DROP POLICY IF EXISTS "usuario_atualiza_proprio_onboarding" ON public.profiles;
CREATE POLICY "usuario_atualiza_proprio_onboarding" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());


-- ─────────────────────────────────────────
-- 2. CONFIGURAÇÕES DA LOJA — Constraint única para upsert
-- ─────────────────────────────────────────
ALTER TABLE public.settings 
  DROP CONSTRAINT IF EXISTS settings_tenant_id_key_unique;
  
ALTER TABLE public.settings 
  ADD CONSTRAINT settings_tenant_id_key_unique 
  UNIQUE (tenant_id, key);

-- Políticas de RLS para settings
DROP POLICY IF EXISTS "Permitir insert de settings" ON public.settings;
CREATE POLICY "Permitir insert de settings"
ON public.settings FOR INSERT
WITH CHECK (
  tenant_id = public.get_my_tenant_id() 
  OR public.get_my_role() = 'superadmin'
);

DROP POLICY IF EXISTS "Permitir select de settings" ON public.settings;
CREATE POLICY "Permitir select de settings"
ON public.settings FOR SELECT
USING (
  tenant_id = public.get_my_tenant_id() 
  OR public.get_my_role() = 'superadmin'
);

DROP POLICY IF EXISTS "Permitir atualizacao de settings" ON public.settings;
CREATE POLICY "Permitir atualizacao de settings"
ON public.settings FOR UPDATE
USING (
  tenant_id = public.get_my_tenant_id() 
  OR public.get_my_role() = 'superadmin'
)
WITH CHECK (
  tenant_id = public.get_my_tenant_id() 
  OR public.get_my_role() = 'superadmin'
);


-- ─────────────────────────────────────────
-- 3. EXCLUIR CHAMADOS — RPC de verificação de senha do admin
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.verify_admin_password(
  p_tenant_id UUID,
  p_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result BOOLEAN := FALSE;
BEGIN
  SELECT (
    au.encrypted_password = crypt(p_password, au.encrypted_password)
  ) INTO v_result
  FROM auth.users au
  JOIN public.profiles p ON p.id = au.id
  WHERE p.tenant_id = p_tenant_id
    AND p.role = 'admin'
  LIMIT 1;

  IF NOT FOUND OR NOT v_result THEN
    RAISE EXCEPTION 'Invalid admin password';
  END IF;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_admin_password FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_admin_password TO authenticated;


-- ─────────────────────────────────────────
-- 4. Recarregar schema do PostgREST
-- ─────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
