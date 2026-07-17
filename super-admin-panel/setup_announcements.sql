-- Funcionalidade 1: Módulo de Comunicação (Avisos Globais)

CREATE TABLE IF NOT EXISTS public.announcements (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL CHECK (type IN ('info', 'warning', 'success')),
    active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Lojas (Qualquer usuário logado) podem ler os avisos ativos
CREATE POLICY "Lojas podem ver avisos ativos" 
ON public.announcements FOR SELECT 
USING (active = true);

-- Somente Superadmin pode ver todos os avisos (ativos e inativos), criar, editar e deletar
CREATE POLICY "Superadmin gerencia tudo" 
ON public.announcements FOR ALL 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' );
