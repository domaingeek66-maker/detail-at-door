-- Insert existing portfolio items
INSERT INTO public.portfolio_items (title, image_url, customer_name, rating, review, sort_order, is_active)
VALUES 
  (
    'Volvo Premium Detailing',
    '/portfolio/portfolio-1.jpeg',
    'Jan de Vries',
    5,
    'Fantastisch werk! Mijn Volvo ziet er weer uit als nieuw. Het interieur is perfect schoongemaakt.',
    0,
    true
  ),
  (
    'Porsche Interior Care',
    '/portfolio/portfolio-2.jpeg',
    'Sandra Bakker',
    5,
    'Zeer professioneel en nauwkeurig. De Porsche is perfect verzorgd, echt top service!',
    1,
    true
  ),
  (
    'Volkswagen Deep Clean',
    '/portfolio/portfolio-3.jpeg',
    'Mohammed Ali',
    5,
    'Geweldig resultaat! Alle vlekken zijn weg en de auto ruikt heerlijk fris. Absoluut een aanrader.',
    2,
    true
  );