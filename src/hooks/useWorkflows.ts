import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WorkflowRun {
  id: string;
  user_id: string;
  workflow_type: 'automation' | 'diagnostic' | 'business' | 'content_approval';
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  current_step: string | null;
  metadata: Record<string, any>;
  webhook_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  workflow_run_id: string;
  step_name: string;
  step_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  notes: string | null;
  completed_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export const useWorkflows = (workflowType?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    let query = supabase
      .from('workflow_runs')
      .select('*')
      .order('created_at', { ascending: false });

    if (workflowType) {
      query = query.eq('workflow_type', workflowType);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching workflows:', error);
    } else {
      setRuns((data || []) as WorkflowRun[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRuns();
  }, [user, workflowType]);

  const createRun = async (params: {
    workflow_type: WorkflowRun['workflow_type'];
    title: string;
    metadata?: Record<string, any>;
    webhook_url?: string;
    steps?: { step_name: string; step_order: number }[];
  }) => {
    if (!user) return null;

    const { data: run, error } = await supabase
      .from('workflow_runs')
      .insert({
        user_id: user.id,
        workflow_type: params.workflow_type,
        title: params.title,
        metadata: params.metadata || {},
        webhook_url: params.webhook_url || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to create workflow', variant: 'destructive' });
      return null;
    }

    if (params.steps?.length) {
      await supabase.from('workflow_steps').insert(
        params.steps.map(s => ({
          workflow_run_id: run.id,
          step_name: s.step_name,
          step_order: s.step_order,
        }))
      );
    }

    toast({ title: 'Workflow created', description: params.title });
    fetchRuns();
    return run as WorkflowRun;
  };

  const updateRunStatus = async (runId: string, status: WorkflowRun['status'], currentStep?: string) => {
    const update: Record<string, any> = { status };
    if (currentStep !== undefined) update.current_step = currentStep;

    const { error } = await supabase
      .from('workflow_runs')
      .update(update)
      .eq('id', runId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update workflow', variant: 'destructive' });
    } else {
      fetchRuns();
    }
  };

  const deleteRun = async (runId: string) => {
    const { error } = await supabase
      .from('workflow_runs')
      .delete()
      .eq('id', runId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete workflow', variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Workflow removed' });
      fetchRuns();
    }
  };

  const fetchSteps = async (runId: string) => {
    const { data, error } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_run_id', runId)
      .order('step_order', { ascending: true });

    if (error) {
      console.error('Error fetching steps:', error);
      return [];
    }
    return (data || []) as WorkflowStep[];
  };

  const updateStep = async (stepId: string, status: WorkflowStep['status'], notes?: string) => {
    const update: Record<string, any> = { status };
    if (notes !== undefined) update.notes = notes;
    if (status === 'completed') update.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('workflow_steps')
      .update(update)
      .eq('id', stepId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update step', variant: 'destructive' });
    }
  };

  return { runs, loading, createRun, updateRunStatus, deleteRun, fetchSteps, updateStep, refetch: fetchRuns };
};
