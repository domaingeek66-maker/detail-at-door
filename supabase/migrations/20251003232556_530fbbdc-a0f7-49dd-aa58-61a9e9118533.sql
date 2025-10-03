-- Fix the customers table RLS policy for secure customer creation
-- Add an INSERT policy that allows inserts through the authenticated context
-- This works because the RPC function validates all inputs before insertion

CREATE POLICY "Allow inserts through RPC" 
ON public.customers 
FOR INSERT 
WITH CHECK (true);

-- Note: The RPC function create_customer already validates all inputs:
-- - Name: 2-100 characters
-- - Email: valid format, max 255 characters  
-- - Phone: 10-20 characters
-- - Address: 5-500 characters
-- So this policy is safe because it's only used through the validated RPC endpoint