-- Verwijder onnodige instellingen die niet meer gebruikt worden
DELETE FROM settings WHERE key IN (
  'gmail_app_password',
  'RESEND_API_KEY',
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_BUSINESS_ACCOUNT_ID',
  'WHATSAPP_PHONE_NUMBER_ID'
);