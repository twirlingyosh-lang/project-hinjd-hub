-- Add DELETE policy for belt_diagnostics so users can delete their own records
CREATE POLICY "Users can delete own diagnostics" 
ON public.belt_diagnostics 
FOR DELETE 
USING (user_id = auth.uid());

-- Enhance handle_new_user function with input validation and error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Validate email format (basic check)
  IF new.email IS NULL OR new.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE WARNING 'Invalid email format for user %', new.id;
  END IF;
  
  -- Insert profile with sanitized full_name (limit length, remove control characters)
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    SUBSTRING(REGEXP_REPLACE(COALESCE(new.raw_user_meta_data ->> 'full_name', ''), E'[\\x00-\\x1F\\x7F]', '', 'g'), 1, 255)
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore
    RAISE WARNING 'Profile already exists for user %', new.id;
    RETURN new;
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Profile creation failed for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;