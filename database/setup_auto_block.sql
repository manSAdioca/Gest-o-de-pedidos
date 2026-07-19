-- ==============================================================================
-- ESTRATÉGIA DO PORTEIRO (LAZY EVALUATION): BLOQUEIO AUTOMÁTICO DE LOJAS
-- ==============================================================================
-- Esta função é chamada toda vez que o Lojista entra no painel.
-- Ela checa se o lojista tem alguma fatura pendente estourada (passou da tolerância)
-- Se sim, bloqueia a loja na hora. Se não, devolve o status normal da loja.
-- Usa SECURITY DEFINER para garantir que o painel consiga ler e bloquear as lojas
-- ignorando bloqueios temporários de RLS que o lojista sofra.

CREATE OR REPLACE FUNCTION public.check_tenant_status(
  p_tenant_id UUID, 
  p_tolerance_days INT DEFAULT 5
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_has_overdue BOOLEAN;
BEGIN
  -- 1. Verifica o status atual
  SELECT status INTO v_status 
  FROM tenants 
  WHERE id = p_tenant_id;
  
  -- Se não achar a loja ou ela já estiver inativa por outros motivos, retorna como está
  IF v_status IS NULL OR v_status IN ('inactive', 'pending') THEN
    RETURN COALESCE(v_status, 'unknown');
  END IF;

  -- 2. Checa se o lojista tem alguma fatura que estourou a tolerância
  SELECT EXISTS (
    SELECT 1 
    FROM invoices 
    WHERE tenant_id = p_tenant_id 
      AND status = 'pending' 
      AND due_date < (CURRENT_DATE - (p_tolerance_days || ' days')::INTERVAL)
  ) INTO v_has_overdue;

  -- 3. Bloqueia a loja se for o caso
  IF v_has_overdue THEN
    UPDATE tenants 
    SET status = 'blocked' 
    WHERE id = p_tenant_id;
    
    RETURN 'blocked';
  END IF;

  -- Se não estiver estourado e já estava bloqueado? A reativação ocorre ao dar baixa na fatura no painel Super Admin.
  RETURN v_status;
END;
$$;

-- Permite que os usuários (lojistas) chamem a função
GRANT EXECUTE ON FUNCTION public.check_tenant_status(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_tenant_status(UUID, INT) TO anon;

-- Notifica o PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';
