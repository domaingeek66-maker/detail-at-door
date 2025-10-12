-- Add Gmail OAuth settings keys if they don't exist
INSERT INTO public.settings (key, value, description) VALUES
  ('gmail_client_id', NULL, 'Google Cloud OAuth Client ID voor Gmail API'),
  ('gmail_client_secret', NULL, 'Google Cloud OAuth Client Secret voor Gmail API'),
  ('gmail_refresh_token', NULL, 'Gmail OAuth Refresh Token (eenmalig opgehaald via consent)')
ON CONFLICT (key) DO NOTHING;