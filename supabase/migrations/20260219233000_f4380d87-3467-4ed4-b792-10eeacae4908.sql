
CREATE TABLE public.code_snippets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'javascript',
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snippets" ON public.code_snippets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public snippets" ON public.code_snippets FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own snippets" ON public.code_snippets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own snippets" ON public.code_snippets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own snippets" ON public.code_snippets FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_code_snippets_updated_at
  BEFORE UPDATE ON public.code_snippets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
