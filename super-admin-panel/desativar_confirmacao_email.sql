-- 1. Confirma automaticamente todos os e-mails que já estão pendentes no banco de dados agora
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. Cria uma função mágica que vai confirmar os próximos usuários sozinhos
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Assim que o usuário for criado, o banco já marca o email como confirmado na mesma hora
  NEW.email_confirmed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Prende essa função na tabela de usuários para rodar sempre que um funcionário for adicionado
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_confirm_email();
