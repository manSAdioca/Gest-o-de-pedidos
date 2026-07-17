-- Habilitar Realtime para a tabela de pedidos
begin;
  -- Remove a tabela se já estiver na publicação
  alter publication supabase_realtime drop table if exists orders;
  -- Adiciona a tabela à publicação
  alter publication supabase_realtime add table orders;
commit;
