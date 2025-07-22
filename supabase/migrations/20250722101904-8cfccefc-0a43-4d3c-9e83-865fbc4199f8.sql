-- Create storage bucket for support attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('support-attachments', 'support-attachments', false);

-- Create storage policies for support attachments
CREATE POLICY "Users can upload their own support files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'support-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own support files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'support-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all support files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'support-attachments' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'::user_role
));

-- Add attachment_url column to support_tickets table
ALTER TABLE public.support_tickets 
ADD COLUMN attachment_url TEXT;