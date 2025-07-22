-- Temporarily make support_tickets more permissive for demo purposes
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Customers can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Customers can view their own tickets" ON public.support_tickets;

-- Create more permissive policies for demo
CREATE POLICY "Anyone can create support tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view support tickets" 
ON public.support_tickets 
FOR SELECT 
USING (true);

-- Keep admin policy but recreate it
CREATE POLICY "Admins can manage all tickets" 
ON public.support_tickets 
FOR ALL 
USING (public.get_current_user_role() = 'admin');