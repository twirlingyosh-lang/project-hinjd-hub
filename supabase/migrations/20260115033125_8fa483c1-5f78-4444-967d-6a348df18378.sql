-- Fix overly permissive RLS policies for equipment_dealers
DROP POLICY IF EXISTS "Authenticated users can insert dealers" ON public.equipment_dealers;
CREATE POLICY "Authenticated users can insert dealers" ON public.equipment_dealers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Fix overly permissive RLS policies for equipment_parts  
DROP POLICY IF EXISTS "Authenticated users can insert parts" ON public.equipment_parts;
CREATE POLICY "Authenticated users can insert parts" ON public.equipment_parts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Fix function search path for update_inventory_status
CREATE OR REPLACE FUNCTION public.update_inventory_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.quantity = 0 THEN
    NEW.status := 'out_of_stock';
  ELSIF NEW.quantity <= 5 THEN
    NEW.status := 'low_stock';
  ELSE
    NEW.status := 'in_stock';
  END IF;
  NEW.last_updated := now();
  RETURN NEW;
END;
$$;