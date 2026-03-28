
CREATE TABLE IF NOT EXISTS public.equipment_master (
    node_id TEXT PRIMARY KEY,
    equipment_type TEXT,
    model TEXT,
    status TEXT,
    lat NUMERIC,
    lng NUMERIC,
    current_spec_task TEXT,
    last_maintenance DATE,
    runtime_hours INTEGER,
    telemetry JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.equipment_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth view equipment master"
ON public.equipment_master FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Auth admins insert equipment master"
ON public.equipment_master FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Auth admins update equipment master"
ON public.equipment_master FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Auth admins delete equipment master"
ON public.equipment_master FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
