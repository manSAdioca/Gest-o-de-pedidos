-- Corrige o cargo do usuário teste para 'funcionario' (pois estava como 'user' e o sistema estava bloqueando o login)
UPDATE public.profiles
SET role = 'funcionario'
WHERE email = 'funcionario@teste.com';
