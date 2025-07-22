-- Fix infinite recursion by creating a security definer function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');

-- Also fix support_tickets admin policy
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;

CREATE POLICY "Admins can view all tickets" 
ON public.support_tickets 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Make storage bucket public for demo purposes
UPDATE storage.buckets SET public = true WHERE id = 'support-attachments';

-- Recreate storage policies to allow demo uploads
DROP POLICY IF EXISTS "Users can upload their own support files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own support files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all support files" ON storage.objects;

-- Create more permissive policies for demo
CREATE POLICY "Anyone can upload support files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'support-attachments');

CREATE POLICY "Anyone can view support files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'support-attachments');