-- Create settings table for API keys and other configuration
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings"
ON public.settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings for API keys
INSERT INTO public.settings (key, value, description) VALUES
  ('RESEND_API_KEY', NULL, 'Resend API key voor email notificaties'),
  ('WHATSAPP_ACCESS_TOKEN', NULL, 'WhatsApp Cloud API access token'),
  ('WHATSAPP_PHONE_NUMBER_ID', NULL, 'WhatsApp Business Phone Number ID'),
  ('WHATSAPP_BUSINESS_ACCOUNT_ID', NULL, 'WhatsApp Business Account ID')
ON CONFLICT (key) DO NOTHING;