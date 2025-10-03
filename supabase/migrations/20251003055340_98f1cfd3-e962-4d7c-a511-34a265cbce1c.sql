-- Add address fields to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS travel_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS distance_km NUMERIC;

-- Add service area settings
INSERT INTO public.settings (key, value, description) 
VALUES 
  ('service_area_lat', '50.8503', 'Startlocatie breedtegraad (latitude)'),
  ('service_area_lng', '4.3517', 'Startlocatie lengtegraad (longitude)'),
  ('service_area_radius_km', '25', 'Maximale radius servicegebied in km'),
  ('travel_cost_per_km', '0.50', 'Reiskosten per km buiten servicegebied')
ON CONFLICT (key) DO NOTHING;

COMMENT ON COLUMN public.appointments.street_address IS 'Straat en huisnummer van de klant';
COMMENT ON COLUMN public.appointments.postal_code IS 'Postcode van de klant';
COMMENT ON COLUMN public.appointments.city IS 'Plaats van de klant';
COMMENT ON COLUMN public.appointments.travel_cost IS 'Extra reiskosten voor deze afspraak';
COMMENT ON COLUMN public.appointments.distance_km IS 'Afstand in km van startlocatie naar klantadres';