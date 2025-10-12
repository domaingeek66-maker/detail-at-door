-- Update Stoelreiniging duration to 15 minutes per chair
UPDATE services 
SET duration_min = 15 
WHERE name = 'Stoelreiniging';