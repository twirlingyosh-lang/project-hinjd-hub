-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id column to belt_diagnostics
ALTER TABLE public.belt_diagnostics 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for user_id lookups
CREATE INDEX idx_belt_diagnostics_user_id ON public.belt_diagnostics(user_id);

-- Update RLS policies for belt_diagnostics to be user-aware
DROP POLICY IF EXISTS "Anyone can view diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Anyone can create diagnostics" ON public.belt_diagnostics;
DROP POLICY IF EXISTS "Anyone can update diagnostics" ON public.belt_diagnostics;

-- Users can view all diagnostics (or restrict to own if preferred)
CREATE POLICY "Anyone can view diagnostics" 
ON public.belt_diagnostics 
FOR SELECT 
USING (true);

-- Authenticated users can create diagnostics linked to themselves
CREATE POLICY "Authenticated users can create diagnostics" 
ON public.belt_diagnostics 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()));

-- Users can update their own diagnostics
CREATE POLICY "Users can update own diagnostics" 
ON public.belt_diagnostics 
FOR UPDATE 
USING (user_id = auth.uid());