-- Tabela para guardar os textos dos e-mails
CREATE TABLE IF NOT EXISTS public.email_templates (
    id text PRIMARY KEY, -- 'welcome_email', 'invoice_reminder', etc
    subject text NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Apenas superadmin pode ver e editar os templates
CREATE POLICY "Superadmin gerencia email_templates" 
ON public.email_templates FOR ALL 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' );

-- Inserir o modelo padrão de Boas-vindas
INSERT INTO public.email_templates (id, subject, body)
VALUES (
    'welcome_email', 
    'Bem-vindo(a) à nossa plataforma de Lojas!',
    'Olá {{nome_loja}},<br><br>Sua loja foi criada com sucesso!<br><br>Seu link de acesso ao painel é: {{link_painel}}<br>Seu e-mail de login: {{email}}<br>Sua senha provisória: {{senha}}<br><br>Por favor, troque sua senha no primeiro acesso.<br><br>Desejamos ótimas vendas!'
) ON CONFLICT (id) DO NOTHING;
