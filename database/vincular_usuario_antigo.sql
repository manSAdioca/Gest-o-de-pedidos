-- Vincula automaticamente todos os administradores e funcionários antigos (que ficaram sem loja) à loja principal
UPDATE public.profiles
SET tenant_id = '1b68d0b5-78cc-4f2a-8123-85c01714d34e'
WHERE tenant_id IS NULL AND role IN ('admin', 'funcionario');

-- E caso o usuário antigo estivesse com role 'funcionario' em vez de 'admin', a gente promove ele para admin principal novamente
UPDATE public.profiles
SET role = 'admin'
WHERE tenant_id = '1b68d0b5-78cc-4f2a-8123-85c01714d34e' AND role = 'funcionario';
