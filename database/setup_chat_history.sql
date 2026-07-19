-- Tabela para armazenar histórico de conversas do WhatsApp
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Segurança)
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Super admin pode acessar todo histórico"
    ON chat_history
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Admin pode acessar histórico da sua loja"
    ON chat_history
    FOR ALL
    USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Index para buscas mais rápidas no histórico de um cliente específico
CREATE INDEX idx_chat_history_lookup ON chat_history (tenant_id, customer_phone);
