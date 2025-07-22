-- Fix the generate_order_number function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  next_number INTEGER;
  generated_order_number TEXT;
BEGIN
  -- Get the next number in sequence, using table alias to avoid ambiguity
  SELECT COALESCE(MAX(CAST(SUBSTRING(o.order_number FROM 'ORD-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.orders o
  WHERE o.order_number ~ '^ORD-\d+$';
  
  -- Format as ORD-000001
  generated_order_number := 'ORD-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN generated_order_number;
END;
$function$