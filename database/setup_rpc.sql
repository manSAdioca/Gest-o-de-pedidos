-- Função para verificar se a loja tem integração ativa do Mercado Pago
CREATE OR REPLACE FUNCTION check_mercadopago_active(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios de bypass RLS para ler tenant_integrations
AS $$
DECLARE
    has_mp BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM tenant_integrations 
        WHERE tenant_id = p_tenant_id 
          AND mp_access_token IS NOT NULL 
          AND mp_access_token != ''
    ) INTO has_mp;
    
    RETURN has_mp;
END;
$$;
