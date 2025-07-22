-- Create enum for order status
CREATE TYPE public.order_status AS ENUM (
  'pending',
  'confirmed', 
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- Create enum for scooter models
CREATE TYPE public.scooter_model AS ENUM (
  'ms_classic',
  'ms_sport',
  'ms_electric',
  'ms_premium'
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  scooter_model scooter_model NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_postal_code TEXT NOT NULL,
  delivery_phone TEXT NOT NULL,
  estimated_delivery_date DATE,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Customers can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins can manage all orders" 
ON public.orders 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  order_number TEXT;
BEGIN
  -- Get the next number in sequence
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.orders 
  WHERE order_number ~ '^ORD-\d+$';
  
  -- Format as ORD-000001
  order_number := 'ORD-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN order_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample orders for testing
INSERT INTO public.orders (
  customer_id,
  order_number,
  scooter_model,
  quantity,
  unit_price,
  total_amount,
  status,
  delivery_address,
  delivery_city,
  delivery_postal_code,
  delivery_phone,
  estimated_delivery_date,
  tracking_number
) VALUES 
-- Sample orders (you'll need to replace customer_id with actual user IDs)
(
  '00000000-0000-0000-0000-000000000000', -- placeholder customer_id
  'ORD-000001',
  'ms_classic',
  1,
  1299.99,
  1299.99,
  'shipped',
  '123 Main Street, Apt 4B',
  'New York',
  '10001',
  '+1-555-0123',
  '2025-01-30',
  'TRK-2025-001'
),
(
  '00000000-0000-0000-0000-000000000000', -- placeholder customer_id
  'ORD-000002',
  'ms_electric',
  2,
  1899.99,
  3799.98,
  'processing',
  '456 Oak Avenue',
  'Los Angeles',
  '90210',
  '+1-555-0456',
  '2025-02-05',
  NULL
);