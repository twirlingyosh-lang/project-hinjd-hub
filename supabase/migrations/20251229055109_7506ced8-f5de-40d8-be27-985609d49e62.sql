-- Add attachments column to belt_diagnostics table
ALTER TABLE public.belt_diagnostics 
ADD COLUMN attachments text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.belt_diagnostics.attachments IS 'Array of file paths in the documents storage bucket';