-- Create before_after_items table
CREATE TABLE public.before_after_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.before_after_items ENABLE ROW LEVEL SECURITY;

-- Create policies for admin management
CREATE POLICY "Admins can manage before after items" 
ON public.before_after_items 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy for public viewing of active items
CREATE POLICY "Anyone can view active before after items" 
ON public.before_after_items 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_before_after_items_updated_at
BEFORE UPDATE ON public.before_after_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();