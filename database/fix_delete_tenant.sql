CREATE OR REPLACE FUNCTION delete_tenant_full(target_tenant_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Deletar dependências básicas
    DELETE FROM products WHERE tenant_id = target_tenant_id;
    DELETE FROM categories WHERE tenant_id = target_tenant_id;
    DELETE FROM orders WHERE tenant_id = target_tenant_id;
    DELETE FROM invoices WHERE tenant_id = target_tenant_id;
    DELETE FROM settings WHERE tenant_id = target_tenant_id;
    
    -- Deleta também os perfis de usuários ligados apenas a essa loja
    DELETE FROM profiles WHERE tenant_id = target_tenant_id;
    
    -- 2. Por fim, deleta a loja com segurança
    DELETE FROM tenants WHERE id = target_tenant_id;
END;
$$;
