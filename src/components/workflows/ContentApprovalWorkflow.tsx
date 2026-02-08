import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Check, X, Eye, Trash2, Clock } from 'lucide-react';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useAuth } from '@/contexts/AuthContext';

const CONTENT_TYPES = ['Blog Post', 'Social Media', 'Email Campaign', 'Product Description', 'Technical Doc', 'Press Release'];

const APPROVAL_STEPS = [
  { step_name: 'Draft', step_order: 0 },
  { step_name: 'Internal Review', step_order: 1 },
  { step_name: 'Revision', step_order: 2 },
  { step_name: 'Final Approval', step_order: 3 },
  { step_name: 'Published', step_order: 4 },
];

const ContentApprovalWorkflow = () => {
  const { user } = useAuth();
  const { runs, loading, createRun, updateRunStatus, deleteRun } = useWorkflows('content_approval');
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!title.trim() || !contentType) return;
    const run = await createRun({
      workflow_type: 'content_approval',
      title: title.trim(),
      metadata: { content_type: contentType, description: description.trim() },
      steps: APPROVAL_STEPS,
    });
    if (run) {
      await updateRunStatus(run.id, 'in_progress', 'Draft');
    }
    setTitle('');
    setContentType('');
    setDescription('');
  };

  const advanceStage = async (runId: string, currentStep: string | null) => {
    const currentIdx = APPROVAL_STEPS.findIndex(s => s.step_name === currentStep);
    if (currentIdx < APPROVAL_STEPS.length - 1) {
      const next = APPROVAL_STEPS[currentIdx + 1].step_name;
      await updateRunStatus(runId, 'in_progress', next);
    } else {
      await updateRunStatus(runId, 'completed');
    }
  };

  const rejectContent = async (runId: string) => {
    await updateRunStatus(runId, 'in_progress', 'Revision');
  };

  const getStatusIcon = (status: string, currentStep: string | null) => {
    if (status === 'completed') return <Check size={14} className="text-primary" />;
    if (currentStep === 'Revision') return <X size={14} className="text-destructive" />;
    return <Eye size={14} className="text-muted-foreground" />;
  };

  const getStepProgress = (currentStep: string | null, status: string) => {
    if (status === 'completed') return 100;
    const idx = APPROVAL_STEPS.findIndex(s => s.step_name === currentStep);
    return idx >= 0 ? ((idx + 1) / APPROVAL_STEPS.length) * 100 : 0;
  };

  if (!user) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center text-muted-foreground">
          Sign in to manage content approvals
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus size={18} /> New Content Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Content title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue placeholder="Content type" />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Brief description or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <Button onClick={handleCreate} className="w-full gap-2" disabled={!title.trim() || !contentType}>
            <FileText size={16} /> Submit for Review
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : runs.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center text-muted-foreground">
            No content reviews yet. Submit one above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => {
            const progress = getStepProgress(run.current_step, run.status);
            const meta = run.metadata as Record<string, any>;
            return (
              <Card key={run.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {getStatusIcon(run.status, run.current_step)}
                      <span className="font-medium truncate">{run.title}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {meta?.content_type || 'Content'}
                      </Badge>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteRun(run.id)}>
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>

                  {meta?.description && (
                    <p className="text-xs text-muted-foreground">{meta.description}</p>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{run.status === 'completed' ? 'Published' : run.current_step || 'Pending'}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Step indicators */}
                  <div className="flex gap-1">
                    {APPROVAL_STEPS.map((step, i) => {
                      const stepIdx = APPROVAL_STEPS.findIndex(s => s.step_name === run.current_step);
                      const isCompleted = run.status === 'completed' || i < stepIdx;
                      const isCurrent = step.step_name === run.current_step;
                      return (
                        <div
                          key={step.step_name}
                          className={`flex-1 h-1 rounded-full ${
                            isCompleted ? 'bg-primary' : isCurrent ? 'bg-primary/50' : 'bg-secondary'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(run.updated_at).toLocaleDateString()}
                    </span>
                    {run.status !== 'completed' && (
                      <div className="flex items-center gap-2">
                        {run.current_step !== 'Draft' && run.current_step !== 'Revision' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectContent(run.id)}
                            className="gap-1 h-7 text-xs text-destructive hover:text-destructive"
                          >
                            <X size={12} /> Revise
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => advanceStage(run.id, run.current_step)}
                          className="gap-1 h-7 text-xs"
                        >
                          <Check size={12} /> Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContentApprovalWorkflow;
