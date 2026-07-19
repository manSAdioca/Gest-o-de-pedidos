-- Atualização: Adicionar suporte à IA e Precificação de Nichos
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_niches' AND column_name = 'monthly_price') THEN
        ALTER TABLE public.crm_niches ADD COLUMN monthly_price DECIMAL(10,2) DEFAULT 49.90;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_niches' AND column_name = 'ai_agent_prompt') THEN
        ALTER TABLE public.crm_niches ADD COLUMN ai_agent_prompt TEXT;
    END IF;
END $$;
