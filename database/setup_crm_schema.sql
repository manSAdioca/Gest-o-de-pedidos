-- =========================================================================
-- CRM SPIN-OFF - SUPABASE SCHEMA SETUP
-- =========================================================================

-- 1. Adicionar o tipo de tenant na tabela tenants
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tenants' 
        AND column_name = 'tenant_type'
    ) THEN
        ALTER TABLE tenants ADD COLUMN tenant_type VARCHAR(50) DEFAULT 'ecommerce';
    END IF;
END $$;

-- 2. Tabela de Nichos (Templates globais)
CREATE TABLE IF NOT EXISTS crm_niches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10,2) DEFAULT 49.90, -- Preço da assinatura deste nicho com IA
    ai_agent_prompt TEXT, -- Prompt Mestre da IA para gerar Mata-Objeções
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Colunas (Fases do Kanban) - Pode pertencer a um Nicho (Template) ou a um Inquilino
CREATE TABLE IF NOT EXISTS crm_kanban_columns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- Se null, pertence a um nicho (template global)
    niche_id UUID REFERENCES crm_niches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(50) DEFAULT '#3b82f6',
    sla_hours INTEGER, -- Tempo máximo que o lead pode ficar aqui antes de estourar o SLA
    playbook_instructions TEXT, -- O que o vendedor deve falar ou fazer nesta etapa
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Leads
CREATE TABLE IF NOT EXISTS crm_leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    column_id UUID REFERENCES crm_kanban_columns(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    source VARCHAR(100) DEFAULT 'manual', -- 'meta_ads', 'google_ads', 'landing_page', etc
    value DECIMAL(10,2), -- Valor financeiro potencial do lead
    custom_data JSONB, -- Qualquer outro campo extra capturado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contact_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active' -- active, won, lost
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================================

-- RLS para CRM Niches (Apenas Super Admin pode editar, todos podem ler)
ALTER TABLE crm_niches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin pode editar nichos" ON crm_niches
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
    );

CREATE POLICY "Todos podem ler nichos" ON crm_niches
    FOR SELECT USING (true);

-- RLS para Kanban Columns (Tenant só vê as suas)
ALTER TABLE crm_kanban_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin pode acessar todas as colunas" ON crm_kanban_columns
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
    );

CREATE POLICY "Admin pode acessar as colunas da sua loja" ON crm_kanban_columns
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

-- RLS para Leads (Tenant só vê os seus)
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin pode acessar todos os leads" ON crm_leads
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
    );

CREATE POLICY "Admin pode acessar leads da sua loja" ON crm_leads
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

-- Permitir INSERT anônimo para o Webhook (necessário para a Edge Function ou se for usado direto no front-end da Landing Page)
CREATE POLICY "Anon pode inserir leads se souber o tenant_id" ON crm_leads
    FOR INSERT WITH CHECK (true);

-- =========================================================================
-- INDEXES PARA PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant ON crm_leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_column ON crm_leads(column_id);
CREATE INDEX IF NOT EXISTS idx_crm_kanban_tenant ON crm_kanban_columns(tenant_id);
