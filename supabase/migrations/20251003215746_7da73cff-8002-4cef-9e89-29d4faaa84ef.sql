-- Remove the insecure public INSERT policy on customers
DROP POLICY IF EXISTS "Anyone can create customer" ON public.customers;

-- Create a secure function to create customers with validation
CREATE OR REPLACE FUNCTION public.create_customer(
  _name TEXT,
  _email TEXT,
  _phone TEXT,
  _address TEXT
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _customer_id uuid;
  _name_trimmed TEXT;
  _email_trimmed TEXT;
  _phone_trimmed TEXT;
  _address_trimmed TEXT;
BEGIN
  -- Trim and validate inputs
  _name_trimmed := TRIM(_name);
  _email_trimmed := LOWER(TRIM(_email));
  _phone_trimmed := TRIM(_phone);
  _address_trimmed := TRIM(_address);
  
  -- Validate name length
  IF LENGTH(_name_trimmed) < 2 OR LENGTH(_name_trimmed) > 100 THEN
    RAISE EXCEPTION 'Name must be between 2 and 100 characters';
  END IF;
  
  -- Validate email format (basic validation)
  IF _email_trimmed !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate email length
  IF LENGTH(_email_trimmed) > 255 THEN
    RAISE EXCEPTION 'Email must be less than 255 characters';
  END IF;
  
  -- Validate phone length
  IF LENGTH(_phone_trimmed) < 10 OR LENGTH(_phone_trimmed) > 20 THEN
    RAISE EXCEPTION 'Phone must be between 10 and 20 characters';
  END IF;
  
  -- Validate address length
  IF LENGTH(_address_trimmed) < 5 OR LENGTH(_address_trimmed) > 500 THEN
    RAISE EXCEPTION 'Address must be between 5 and 500 characters';
  END IF;
  
  -- Insert the customer
  INSERT INTO public.customers (name, email, phone, address)
  VALUES (_name_trimmed, _email_trimmed, _phone_trimmed, _address_trimmed)
  RETURNING id INTO _customer_id;
  
  RETURN _customer_id;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.create_customer TO anon, authenticated;