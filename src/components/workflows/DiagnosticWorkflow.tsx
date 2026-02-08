import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Plus, ChevronRight, CheckCircle2, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { useWorkflows, WorkflowRun } from '@/hooks/useWorkflows';
import { useAuth } from '@/contexts/AuthContext';

const EQUIPMENT_TYPES = ['Jaw Crusher', 'Cone Crusher', 'Impact Crusher', 'Vibrating Screen', 'Conveyor Belt', 'Feeder'];

const DIAGNOSTIC_STEPS = [
  { step_name: 'Identify symptoms', step_order: 0 },
  { step_name: 'Visual inspection', step_order: 1 },
  { step_name: 'Root cause analysis', step_order: 2 },
  { step_name: 'Parts identification', step_order: 3 },
  { step_name: 'Repair action', step_order: 4 },
  { step_name: 'Verification', step_order: 5 },
];

const DiagnosticWorkflow = () => {
  const { user } = useAuth();
  const { runs, loading, createRun, updateRunStatus, deleteRun, fetchSteps, updateStep } = useWorkflows('diagnostic');
  const [equipmentType, setEquipmentType] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [stepNotes, setStepNotes] = useState<Record<string, string>>({});

  const handleCreate = async () => {
    if (!equipmentType || !symptoms.trim()) return;
    await createRun({
      workflow_type: 'diagnostic',
      title: `${equipmentType} - ${symptoms.slice(0, 50)}`,
      metadata: { equipment_type: equipmentType, symptoms },
      steps: DIAGNOSTIC_STEPS,
    });
    setEquipmentType('');
    setSymptoms('');
  };

  const handleExpand = async (runId: string) => {
    if (expandedId === runId) {
      setExpandedId(null);
      return;
    }
    const s = await fetchSteps(runId);
    setSteps(s);
    setExpandedId(runId);
  };

  const handleStepComplete = async (stepId: string, runId: string, stepOrder: number) => {
    await updateStep(stepId, 'completed', stepNotes[stepId] || undefined);

    // Auto-advance workflow
    const nextStep = DIAGNOSTIC_STEPS[stepOrder + 1];
    if (nextStep) {
      await updateRunStatus(runId, 'in_progress', nextStep.step_name);
    } else {
      await updateRunStatus(runId, 'completed');
    }

    const s = await fetchSteps(runId);
    setSteps(s);
  };

  if (!user) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center text-muted-foreground">
          Sign in to start diagnostic workflows
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus size={18} /> New Diagnostic Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={equipmentType} onValueChange={setEquipmentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select equipment type" />
            </SelectTrigger>
            <SelectContent>
              {EQUIPMENT_TYPES.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Describe symptoms (e.g. excessive vibration, unusual noise, belt tracking off)"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={3}
          />
          <Button onClick={handleCreate} className="w-full gap-2" disabled={!equipmentType || !symptoms.trim()}>
            <Wrench size={16} /> Start Diagnostic
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : runs.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center text-muted-foreground">
            No diagnostics yet. Start one above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <Card key={run.id}>
              <CardContent className="p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleExpand(run.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Wrench size={14} className="text-primary shrink-0" />
                      <span className="font-medium truncate">{run.title}</span>
                      <Badge
                        variant={run.status === 'completed' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}
                        className="text-[10px]"
                      >
                        {run.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(run.created_at).toLocaleDateString()}
                      {run.current_step && (
                        <span className="ml-2">→ {run.current_step}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteRun(run.id); }}>
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                    <ChevronRight
                      size={18}
                      className={`transition-transform text-muted-foreground ${expandedId === run.id ? 'rotate-90' : ''}`}
                    />
                  </div>
                </div>

                {expandedId === run.id && (
                  <div className="mt-4 border-t pt-4 space-y-3">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          step.status === 'completed' ? 'bg-primary/5' : 'bg-secondary/30'
                        }`}
                      >
                        <div className="mt-0.5">
                          {step.status === 'completed' ? (
                            <CheckCircle2 size={18} className="text-primary" />
                          ) : (
                            <AlertTriangle size={18} className="text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{step.step_name}</p>
                          {step.notes && <p className="text-xs text-muted-foreground mt-1">{step.notes}</p>}
                          {step.status !== 'completed' && (
                            <div className="mt-2 space-y-2">
                              <Input
                                placeholder="Add notes for this step..."
                                value={stepNotes[step.id] || ''}
                                onChange={(e) => setStepNotes(prev => ({ ...prev, [step.id]: e.target.value }))}
                                className="text-sm h-8"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStepComplete(step.id, run.id, step.step_order)}
                                className="gap-1 h-7 text-xs"
                              >
                                <CheckCircle2 size={12} /> Complete Step
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiagnosticWorkflow;
