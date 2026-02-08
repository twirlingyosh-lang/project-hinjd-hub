import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, ArrowRight, Trash2, Clock } from 'lucide-react';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useAuth } from '@/contexts/AuthContext';

const PIPELINE_STAGES = [
  { name: 'Lead Captured', color: 'bg-blue-500/20 text-blue-400' },
  { name: 'Quote Sent', color: 'bg-yellow-500/20 text-yellow-400' },
  { name: 'Order Placed', color: 'bg-orange-500/20 text-orange-400' },
  { name: 'In Production', color: 'bg-purple-500/20 text-purple-400' },
  { name: 'Shipped', color: 'bg-cyan-500/20 text-cyan-400' },
  { name: 'Fulfilled', color: 'bg-green-500/20 text-green-400' },
];

const BUSINESS_STEPS = PIPELINE_STAGES.map((s, i) => ({ step_name: s.name, step_order: i }));

const BusinessWorkflow = () => {
  const { user } = useAuth();
  const { runs, loading, createRun, updateRunStatus, deleteRun } = useWorkflows('business');
  const [title, setTitle] = useState('');
  const [startStage, setStartStage] = useState('Lead Captured');

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createRun({
      workflow_type: 'business',
      title: title.trim(),
      metadata: { pipeline: 'lead_to_fulfillment' },
      steps: BUSINESS_STEPS,
    });
    await updateRunStatus(
      (await createRun({
        workflow_type: 'business',
        title: title.trim(),
        metadata: { pipeline: 'lead_to_fulfillment', current_stage: startStage },
        steps: BUSINESS_STEPS,
      }))?.id || '',
      'in_progress',
      startStage
    );
    setTitle('');
  };

  const handleCreateSimple = async () => {
    if (!title.trim()) return;
    const run = await createRun({
      workflow_type: 'business',
      title: title.trim(),
      metadata: { pipeline: 'lead_to_fulfillment', current_stage: startStage },
      steps: BUSINESS_STEPS,
    });
    if (run) {
      await updateRunStatus(run.id, 'in_progress', startStage);
    }
    setTitle('');
  };

  const advanceStage = async (runId: string, currentStep: string | null) => {
    const currentIdx = PIPELINE_STAGES.findIndex(s => s.name === currentStep);
    if (currentIdx < PIPELINE_STAGES.length - 1) {
      const next = PIPELINE_STAGES[currentIdx + 1].name;
      await updateRunStatus(runId, 'in_progress', next);
    } else {
      await updateRunStatus(runId, 'completed');
    }
  };

  const getStageColor = (stage: string | null) => {
    return PIPELINE_STAGES.find(s => s.name === stage)?.color || 'bg-secondary text-muted-foreground';
  };

  if (!user) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center text-muted-foreground">
          Sign in to manage business workflows
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus size={18} /> New Business Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Flow name (e.g. Jones Quarry - 50T Order)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Select value={startStage} onValueChange={setStartStage}>
            <SelectTrigger>
              <SelectValue placeholder="Starting stage" />
            </SelectTrigger>
            <SelectContent>
              {PIPELINE_STAGES.map(s => (
                <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreateSimple} className="w-full gap-2" disabled={!title.trim()}>
            <Briefcase size={16} /> Create Flow
          </Button>
        </CardContent>
      </Card>

      {/* Pipeline visualization */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 px-1">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.name} className="flex items-center shrink-0">
            <div className={`text-[10px] px-2 py-1 rounded-full ${stage.color} whitespace-nowrap`}>
              {stage.name}
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <ArrowRight size={12} className="text-muted-foreground mx-0.5" />
            )}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : runs.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center text-muted-foreground">
            No business flows yet. Create one above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <Card key={run.id} className="hover:bg-secondary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Briefcase size={14} className="text-primary shrink-0" />
                    <span className="font-medium truncate">{run.title}</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteRun(run.id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] ${getStageColor(run.current_step)}`}>
                      {run.status === 'completed' ? '✓ Fulfilled' : run.current_step || 'Pending'}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(run.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {run.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => advanceStage(run.id, run.current_step)}
                      className="gap-1 h-7 text-xs"
                    >
                      <ArrowRight size={12} /> Advance
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessWorkflow;
