-- Create questions table for admin-managed questions
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT NOT NULL,
  category_title TEXT NOT NULL,
  category_description TEXT NOT NULL,
  category_icon TEXT NOT NULL,
  question_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policies for questions
CREATE POLICY "Everyone can view questions" 
ON public.questions 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage questions" 
ON public.questions 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default questions
INSERT INTO public.questions (category_id, category_title, category_description, category_icon, question_text) VALUES
('vehicle-issues', 'Vehicle Issues', 'Problems with your scooter performance', 'Wrench', 'My scooter won''t start'),
('vehicle-issues', 'Vehicle Issues', 'Problems with your scooter performance', 'Wrench', 'Battery not charging properly'),
('vehicle-issues', 'Vehicle Issues', 'Problems with your scooter performance', 'Wrench', 'Strange noises while riding'),
('vehicle-issues', 'Vehicle Issues', 'Problems with your scooter performance', 'Wrench', 'Brakes feel loose or unresponsive'),

('maintenance', 'Maintenance', 'Regular maintenance and service questions', 'Settings', 'When should I service my scooter?'),
('maintenance', 'Maintenance', 'Regular maintenance and service questions', 'Settings', 'How to clean my scooter properly?'),
('maintenance', 'Maintenance', 'Regular maintenance and service questions', 'Settings', 'Tire pressure recommendations'),
('maintenance', 'Maintenance', 'Regular maintenance and service questions', 'Settings', 'How often should I charge the battery?'),

('warranty', 'Warranty & Returns', 'Questions about warranty coverage and returns', 'Shield', 'What does my warranty cover?'),
('warranty', 'Warranty & Returns', 'Questions about warranty coverage and returns', 'Shield', 'How to file a warranty claim?'),
('warranty', 'Warranty & Returns', 'Questions about warranty coverage and returns', 'Shield', 'Return policy for defective items'),
('warranty', 'Warranty & Returns', 'Questions about warranty coverage and returns', 'Shield', 'Warranty registration process'),

('accessories', 'Parts & Accessories', 'Questions about compatible parts and add-ons', 'Package', 'Compatible helmet recommendations'),
('accessories', 'Parts & Accessories', 'Questions about compatible parts and add-ons', 'Package', 'Where to buy replacement parts?'),
('accessories', 'Parts & Accessories', 'Questions about compatible parts and add-ons', 'Package', 'Installation instructions for accessories'),
('accessories', 'Parts & Accessories', 'Questions about compatible parts and add-ons', 'Package', 'Upgrade options available');