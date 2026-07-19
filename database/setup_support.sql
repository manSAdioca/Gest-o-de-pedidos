-- Funcionalidade 2: Módulo de Suporte (Helpdesk)

CREATE TABLE IF NOT EXISTS public.tickets (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    subject text NOT NULL,
    message text NOT NULL,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'resolved')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Lojas podem ver os seus próprios chamados
CREATE POLICY "Lojas veem seus próprios chamados" 
ON public.tickets FOR SELECT 
USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Lojas podem criar chamados para elas mesmas
CREATE POLICY "Lojas criam seus chamados" 
ON public.tickets FOR INSERT 
WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Superadmin gerencia todos os chamados
CREATE POLICY "Superadmin gerencia todos chamados" 
ON public.tickets FOR ALL 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' );
