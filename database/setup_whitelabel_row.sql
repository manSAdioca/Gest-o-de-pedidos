-- Inserir a configuração white label especificamente
INSERT INTO platform_settings (id, login_logo_url, login_title, login_subtitle, login_footer_text)
VALUES ('white_label', '', 'Painel Admin', 'Distribuidora Imperatriz', 'Desenvolvido por Soul Estratégias Digitais')
ON CONFLICT (id) DO NOTHING;
