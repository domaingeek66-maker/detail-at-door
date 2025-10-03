-- Add company info settings for invoices
INSERT INTO public.settings (key, value, description) 
VALUES 
  ('company_name', 'Car Detail Exclusief', 'Bedrijfsnaam voor op facturen'),
  ('company_address', 'Adres bedrijf', 'Bedrijfsadres voor op facturen'),
  ('company_postal_city', 'Postcode, Stad', 'Postcode en plaats voor op facturen'),
  ('company_vat_number', 'BE0123456789', 'BTW-nummer voor op facturen'),
  ('company_email', 'info@cardetail.be', 'Bedrijfs e-mailadres voor op facturen'),
  ('company_phone', '+32 123 45 67 89', 'Bedrijfs telefoonnummer voor op facturen')
ON CONFLICT (key) DO NOTHING;