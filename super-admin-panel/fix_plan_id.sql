ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id);

NOTIFY pgrst, 'reload schema';
