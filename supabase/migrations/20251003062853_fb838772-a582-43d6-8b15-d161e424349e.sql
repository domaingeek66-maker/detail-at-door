-- Create table for page content management
CREATE TABLE public.page_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read page content
CREATE POLICY "Anyone can view page content"
ON public.page_content
FOR SELECT
USING (true);

-- Only admins can manage page content
CREATE POLICY "Admins can manage page content"
ON public.page_content
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content for About page
INSERT INTO public.page_content (page_key, title, subtitle, content) VALUES
('about', 'Over Cardetail Exclusief', 'Premium car detailing service met passie voor perfectie', 
'{
  "mission_title": "Onze Missie",
  "mission_text": "Bij Cardetail Exclusief geloven we dat uw auto meer is dan alleen vervoer - het is een investering die de beste zorg verdient. Daarom brengen we premium car detailing services direct naar uw deur, zodat u kunt genieten van een perfecte auto zonder uw huis te verlaten.",
  "values": [
    {
      "title": "Professioneel",
      "description": "Ervaren specialisten met hoogwaardige producten en technieken voor het beste resultaat.",
      "icon": "Award"
    },
    {
      "title": "Betrouwbaar",
      "description": "Transparante prijzen, duidelijke afspraken en altijd op tijd. Uw tevredenheid is gegarandeerd.",
      "icon": "Shield"
    },
    {
      "title": "Met Passie",
      "description": "We behandelen elke auto met dezelfde zorg en aandacht alsof het onze eigen auto is.",
      "icon": "Heart"
    },
    {
      "title": "Premium Kwaliteit",
      "description": "Alleen de beste producten en methoden voor een resultaat dat uw verwachtingen overtreft.",
      "icon": "Sparkles"
    }
  ],
  "why_us_title": "Waarom Cardetail Exclusief?",
  "why_us_points": [
    "Professionele 3-staps handwash behandeling",
    "Premium producten voor optimale bescherming",
    "Flexibele afspraken op uw locatie",
    "Transparante prijzen zonder verrassingen",
    "WhatsApp updates en herinneringen"
  ]
}'::jsonb);

-- Insert default content for Contact page
INSERT INTO public.page_content (page_key, title, subtitle, content) VALUES
('contact', 'Neem Contact Op', 'Heeft u vragen of wilt u een afspraak maken? We helpen u graag!',
'{
  "whatsapp": "+31612345678",
  "phone": "+31612345678",
  "email": "info@cardetail-exclusief.nl",
  "work_area": "Landelijk actief",
  "opening_hours": [
    {"day": "Maandag - Vrijdag", "hours": "09:00 - 17:00"},
    {"day": "Zaterdag", "hours": "Op afspraak"},
    {"day": "Zondag", "hours": "Gesloten"}
  ]
}'::jsonb);