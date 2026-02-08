
-- Create workflow_runs table to track all workflow executions
CREATE TABLE public.workflow_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('automation', 'diagnostic', 'business', 'content_approval')),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  current_step TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow_steps table to track individual steps
CREATE TABLE public.workflow_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_run_id UUID NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'failed')),
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;

-- RLS policies for workflow_runs
CREATE POLICY "Users can view their own workflow runs"
ON public.workflow_runs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow runs"
ON public.workflow_runs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow runs"
ON public.workflow_runs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow runs"
ON public.workflow_runs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS policies for workflow_steps (via workflow_run ownership)
CREATE POLICY "Users can view steps of their own workflows"
ON public.workflow_steps FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.workflow_runs
  WHERE id = workflow_run_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create steps in their own workflows"
ON public.workflow_steps FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.workflow_runs
  WHERE id = workflow_run_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update steps in their own workflows"
ON public.workflow_steps FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.workflow_runs
  WHERE id = workflow_run_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete steps in their own workflows"
ON public.workflow_steps FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.workflow_runs
  WHERE id = workflow_run_id AND user_id = auth.uid()
));

-- Trigger for updated_at on workflow_runs
CREATE TRIGGER update_workflow_runs_updated_at
BEFORE UPDATE ON public.workflow_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_workflow_runs_user_type ON public.workflow_runs(user_id, workflow_type);
CREATE INDEX idx_workflow_steps_run ON public.workflow_steps(workflow_run_id);
