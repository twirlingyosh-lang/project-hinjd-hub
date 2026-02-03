-- Add admin RLS policies for treasury_metrics
CREATE POLICY "Admins can view all treasury metrics"
ON public.treasury_metrics
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all treasury metrics"
ON public.treasury_metrics
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all treasury metrics"
ON public.treasury_metrics
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add admin RLS policies for fleet_units
CREATE POLICY "Admins can view all fleet units"
ON public.fleet_units
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert fleet units for any user"
ON public.fleet_units
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all fleet units"
ON public.fleet_units
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all fleet units"
ON public.fleet_units
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add admin RLS policies for treasury_activity
CREATE POLICY "Admins can view all treasury activity"
ON public.treasury_activity
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert treasury activity for any user"
ON public.treasury_activity
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add admin policies for profiles (to see user list)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));