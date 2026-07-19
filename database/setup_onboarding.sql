-- ============================================================
-- SETUP ONBOARDING - Tutorial vinculado ao perfil do usuario
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- 1. Adicionar campo onboarding_completed na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 2. Marcar superadmins como ja tendo concluido o onboarding
-- (eles nao precisam ver o tutorial)
UPDATE public.profiles 
SET onboarding_completed = TRUE 
WHERE role = 'superadmin';

-- 3. Politica RLS: usuario pode atualizar seu proprio onboarding_completed
DROP POLICY IF EXISTS "usuario_atualiza_proprio_onboarding" ON public.profiles;
CREATE POLICY "usuario_atualiza_proprio_onboarding" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 4. Garantir que novos usuarios criados pelo super-admin
--    tenham onboarding_completed = FALSE por padrao (ja e o default)

NOTIFY pgrst, 'reload schema';
