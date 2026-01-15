-- Create dealer inventory table for real-time parts availability
CREATE TABLE public.dealer_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES public.equipment_dealers(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES public.equipment_parts(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'out_of_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dealer_id, part_id)
);

-- Enable RLS
ALTER TABLE public.dealer_inventory ENABLE ROW LEVEL SECURITY;

-- Anyone can view inventory (public data for parts availability)
CREATE POLICY "Anyone can view dealer inventory"
  ON public.dealer_inventory FOR SELECT
  USING (true);

-- Only authenticated users can insert inventory
CREATE POLICY "Authenticated users can insert inventory"
  ON public.dealer_inventory FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can update inventory
CREATE POLICY "Authenticated users can update inventory"
  ON public.dealer_inventory FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create index for fast lookups
CREATE INDEX idx_dealer_inventory_dealer_id ON public.dealer_inventory(dealer_id);
CREATE INDEX idx_dealer_inventory_part_id ON public.dealer_inventory(part_id);
CREATE INDEX idx_dealer_inventory_status ON public.dealer_inventory(status);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.dealer_inventory;

-- Function to auto-update status based on quantity
CREATE OR REPLACE FUNCTION public.update_inventory_status()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to auto-update status
CREATE TRIGGER update_inventory_status_trigger
  BEFORE INSERT OR UPDATE OF quantity ON public.dealer_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_status();