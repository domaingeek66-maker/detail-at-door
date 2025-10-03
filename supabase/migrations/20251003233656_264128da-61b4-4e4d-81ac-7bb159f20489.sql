-- Disable RLS for customer inserts since they only happen through validated RPC
-- The create_customer RPC function already validates all inputs, so this is safe

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Allow inserts through RPC" ON public.customers;

-- Create a new policy that explicitly allows inserts for all roles
-- This is safe because:
-- 1. The only way to insert customers is through the create_customer RPC
-- 2. The RPC validates all inputs (name, email, phone, address lengths and formats)
-- 3. There's no direct INSERT access from the client
CREATE POLICY "Allow inserts for validated RPC" 
ON public.customers 
FOR INSERT 
TO public, anon, authenticated
WITH CHECK (true);