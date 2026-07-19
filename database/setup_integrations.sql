-- Cria a tabela de integrações atrelada aos lojistas
CREATE TABLE IF NOT EXISTS public.tenant_integrations (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Gateway de Pagamento (MercadoPago)
    mp_access_token TEXT,
    mp_public_key TEXT,
    
    -- WhatsApp IA (Evolution API + OpenAI)
    whatsapp_instance_name TEXT,
    whatsapp_instance_key TEXT,
    openai_api_key TEXT,
    ai_system_prompt TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.tenant_integrations ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Superadmins can read all integrations" 
ON public.tenant_integrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
);

CREATE POLICY "Superadmins can insert all integrations" 
ON public.tenant_integrations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
);

CREATE POLICY "Superadmins can update all integrations" 
ON public.tenant_integrations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
);

CREATE POLICY "Tenants can read own integrations" 
ON public.tenant_integrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = tenant_integrations.tenant_id AND profiles.role = 'admin')
);

CREATE POLICY "Tenants can update own integrations" 
ON public.tenant_integrations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = tenant_integrations.tenant_id AND profiles.role = 'admin')
);

CREATE POLICY "Tenants can insert own integrations" 
ON public.tenant_integrations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = tenant_integrations.tenant_id AND profiles.role = 'admin')
);

-- Trigger de updated_at
CREATE TRIGGER handle_updated_at_tenant_integrations
  BEFORE UPDATE ON public.tenant_integrations
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);
