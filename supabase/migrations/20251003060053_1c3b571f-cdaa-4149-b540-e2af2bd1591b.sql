-- Add KVK number setting for invoices
INSERT INTO public.settings (key, value, description) 
VALUES 
  ('company_kvk_number', '12345678', 'KVK-nummer voor op facturen')
ON CONFLICT (key) DO NOTHING;