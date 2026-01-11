-- Create equipment diagnostics history table
CREATE TABLE public.equipment_diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  equipment_type text,
  make text,
  model text,
  symptoms text NOT NULL,
  diagnosis text,
  parts_needed jsonb DEFAULT '[]'::jsonb,
  repair_steps text,
  images text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'open',
  notes text
);

-- Create parts database table
CREATE TABLE public.equipment_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  part_number text NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  equipment_types text[] DEFAULT '{}',
  makes text[] DEFAULT '{}',
  avg_price decimal(10,2),
  image_url text
);

-- Create dealers table
CREATE TABLE public.equipment_dealers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  email text,
  website text,
  latitude decimal(10,7),
  longitude decimal(10,7),
  makes_served text[] DEFAULT '{}',
  hours jsonb,
  is_verified boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.equipment_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_dealers ENABLE ROW LEVEL SECURITY;

-- RLS policies for equipment_diagnostics (user-owned)
CREATE POLICY "Users can view own diagnostics" ON public.equipment_diagnostics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostics" ON public.equipment_diagnostics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnostics" ON public.equipment_diagnostics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagnostics" ON public.equipment_diagnostics
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for equipment_parts (public read)
CREATE POLICY "Anyone can view parts" ON public.equipment_parts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert parts" ON public.equipment_parts
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS policies for equipment_dealers (public read)
CREATE POLICY "Anyone can view dealers" ON public.equipment_dealers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert dealers" ON public.equipment_dealers
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create equipment-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-images',
  'equipment-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Storage policies for equipment-images
CREATE POLICY "Anyone can view equipment images" ON storage.objects
  FOR SELECT USING (bucket_id = 'equipment-images');

CREATE POLICY "Authenticated users can upload equipment images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'equipment-images');

CREATE POLICY "Users can delete own equipment images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'equipment-images' AND auth.uid()::text = (storage.foldername(name))[1]);