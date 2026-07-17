-- Atualiza a Distribuidora Principal para o nome e logo corretos, e com o slug imperatriz
UPDATE public.tenants
SET name = 'Distribuidora Imperatriz', logo_url = '/cat_logo.png', slug = 'imperatriz'
WHERE id = '1b68d0b5-78cc-4f2a-8123-85c01714d34e';
