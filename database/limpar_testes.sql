-- 1. Apagar pedidos (Zera o GMV, Pedidos Processados e Ticket Médio)
DELETE FROM orders;

-- 2. Apagar faturas (Zera as Faturas a Receber e Status Financeiro)
DELETE FROM invoices;
