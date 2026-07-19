-- Adicionar as colunas novas caso a tabela já existisse antes
ALTER TABLE platform_settings 
ADD COLUMN IF NOT EXISTS login_logo_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS login_title TEXT DEFAULT 'Painel Admin',
ADD COLUMN IF NOT EXISTS login_subtitle TEXT DEFAULT 'Área Restrita',
ADD COLUMN IF NOT EXISTS login_footer_text TEXT DEFAULT 'Desenvolvido por Soul Estratégias Digitais';

-- Habilitar RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Política de leitura: qualquer um pode ler as configurações de login (necessário para a tela de login)
DROP POLICY IF EXISTS "Public can read platform settings" ON platform_settings;
CREATE POLICY "Public can read platform settings" ON platform_settings
  FOR SELECT USING (true);

-- Política de atualização: apenas superadmins podem atualizar
DROP POLICY IF EXISTS "Superadmins can update platform settings" ON platform_settings;
CREATE POLICY "Superadmins can update platform settings" ON platform_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
  );

-- Política de inserção: apenas superadmins
DROP POLICY IF EXISTS "Superadmins can insert platform settings" ON platform_settings;
CREATE POLICY "Superadmins can insert platform settings" ON platform_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin')
  );
