CREATE TABLE public.mcp_tool_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  tool_name text NOT NULL CHECK (char_length(tool_name) <= 100),
  success boolean NOT NULL DEFAULT true
);
GRANT SELECT, INSERT ON public.mcp_tool_calls TO authenticated;
GRANT ALL ON public.mcp_tool_calls TO service_role;
ALTER TABLE public.mcp_tool_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users log own calls" ON public.mcp_tool_calls FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins read calls" ON public.mcp_tool_calls FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX ON public.mcp_tool_calls (user_id, created_at DESC);
CREATE POLICY "Admins read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));