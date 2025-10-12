-- Add Gmail settings for email notifications
INSERT INTO public.settings (key, value, description) VALUES
  ('gmail_user', NULL, 'Gmail e-mailadres voor het versturen van boekingsbevestigingen en broadcasts'),
  ('gmail_app_password', NULL, 'Gmail app-specifiek wachtwoord (niet je normale Gmail wachtwoord)')
ON CONFLICT (key) DO NOTHING;