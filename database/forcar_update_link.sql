CREATE OR REPLACE FUNCTION public.update_payment_link(p_invoice_id uuid, p_link text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Garante que as colunas existem
  BEGIN
    ALTER TABLE public.invoices ADD COLUMN payment_link TEXT;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  -- Força a atualização da fatura ignorando qualquer bloqueio de RLS
  UPDATE public.invoices 
  SET payment_link = p_link 
  WHERE id = p_invoice_id;
END;
$$;

-- Recarrega o schema do Supabase para garantir que a coluna apareça na API
NOTIFY pgrst, 'reload schema';
