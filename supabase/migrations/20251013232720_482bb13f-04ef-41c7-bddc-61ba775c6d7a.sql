-- Remove public access to discount_codes table
DROP POLICY IF EXISTS "Anyone can view active discount codes" ON public.discount_codes;

-- Create a secure server-side function to validate and apply discount codes
CREATE OR REPLACE FUNCTION public.validate_discount_code(
  _code TEXT,
  _total_price NUMERIC
)
RETURNS TABLE (
  discount_id UUID,
  discount_code TEXT,
  discount_type TEXT,
  discount_value NUMERIC,
  discount_amount NUMERIC,
  final_price NUMERIC,
  valid BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _discount RECORD;
  _calculated_discount NUMERIC;
  _final_price NUMERIC;
BEGIN
  -- Trim and uppercase the code for case-insensitive comparison
  _code := UPPER(TRIM(_code));
  
  -- Validate inputs
  IF _code IS NULL OR LENGTH(_code) = 0 THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, 
      0::NUMERIC, _total_price, FALSE, 'Discount code is required'::TEXT;
    RETURN;
  END IF;
  
  IF _total_price <= 0 THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, 
      0::NUMERIC, _total_price, FALSE, 'Invalid order amount'::TEXT;
    RETURN;
  END IF;
  
  -- Find the discount code
  SELECT * INTO _discount
  FROM public.discount_codes
  WHERE UPPER(code) = _code
    AND is_active = true
  LIMIT 1;
  
  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, 
      0::NUMERIC, _total_price, FALSE, 'Ongeldige kortingscode'::TEXT;
    RETURN;
  END IF;
  
  -- Check validity period
  IF _discount.valid_from > NOW() THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, 
      0::NUMERIC, _total_price, FALSE, 'Deze kortingscode is nog niet geldig'::TEXT;
    RETURN;
  END IF;
  
  IF _discount.valid_until IS NOT NULL AND _discount.valid_until < NOW() THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, 
      0::NUMERIC, _total_price, FALSE, 'Deze kortingscode is verlopen'::TEXT;
    RETURN;
  END IF;
  
  -- Check usage limits
  IF _discount.max_uses IS NOT NULL AND _discount.times_used >= _discount.max_uses THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, 
      0::NUMERIC, _total_price, FALSE, 'Deze kortingscode is niet meer geldig'::TEXT;
    RETURN;
  END IF;
  
  -- Check minimum order amount
  IF _discount.min_order_amount > 0 AND _total_price < _discount.min_order_amount THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, 
      0::NUMERIC, _total_price, FALSE, 
      FORMAT('Minimaal bestelbedrag van €%.2f vereist', _discount.min_order_amount)::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount amount
  IF _discount.discount_type = 'percentage' THEN
    _calculated_discount := ROUND((_total_price * _discount.discount_value / 100)::NUMERIC, 2);
  ELSIF _discount.discount_type = 'fixed' THEN
    _calculated_discount := _discount.discount_value;
  ELSE
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::NUMERIC, 
      0::NUMERIC, _total_price, FALSE, 'Invalid discount type'::TEXT;
    RETURN;
  END IF;
  
  -- Ensure discount doesn't exceed total price
  IF _calculated_discount > _total_price THEN
    _calculated_discount := _total_price;
  END IF;
  
  _final_price := _total_price - _calculated_discount;
  
  -- Return success
  RETURN QUERY SELECT 
    _discount.id,
    _discount.code,
    _discount.discount_type,
    _discount.discount_value,
    _calculated_discount,
    _final_price,
    TRUE,
    NULL::TEXT;
END;
$$;

-- Increment usage counter when discount is applied (called during appointment creation)
CREATE OR REPLACE FUNCTION public.increment_discount_usage(_discount_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.discount_codes
  SET times_used = times_used + 1
  WHERE id = _discount_id
    AND is_active = true;
END;
$$;