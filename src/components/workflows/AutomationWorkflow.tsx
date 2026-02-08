import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, Send, Trash2, ExternalLink, Clock } from 'lucide-react';
import { useWorkflows, WorkflowRun } from '@/hooks/useWorkflows';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AutomationWorkflow = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { runs, loading, createRun, updateRunStatus, deleteRun } = useWorkflows('automation');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [title, setTitle] = useState('');
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim() || !webhookUrl.trim()) {
      toast({ title: 'Missing fields', description: 'Provide a name and webhook URL', variant: 'destructive' });
      return;
    }
    await createRun({
      workflow_type: 'automation',
      title: title.trim(),
      webhook_url: webhookUrl.trim(),
      metadata: { source: 'zapier' },
    });
    setTitle('');
    setWebhookUrl('');
  };

  const handleTrigger = async (run: WorkflowRun) => {
    if (!run.webhook_url) return;
    setTriggeringId(run.id);
    try {
      await fetch(run.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          workflow_id: run.id,
          title: run.title,
          triggered_by: user?.email,
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });
      await updateRunStatus(run.id, 'completed');
      toast({ title: 'Webhook sent', description: `Triggered "${run.title}". Check your Zap history to confirm.` });
    } catch (err) {
      await updateRunStatus(run.id, 'failed');
      toast({ title: 'Failed', description: 'Could not reach webhook URL', variant: 'destructive' });
    } finally {
      setTriggeringId(null);
    }
  };

  if (!user) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center text-muted-foreground">
          Sign in to create automation workflows
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create new */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus size={18} /> New Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Workflow name (e.g. Notify Slack on new lead)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Zapier / n8n webhook URL"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <Button onClick={handleCreate} className="w-full gap-2">
            <Zap size={16} /> Save Automation
          </Button>
        </CardContent>
      </Card>

      {/* Saved automations */}
      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : runs.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center text-muted-foreground">
            No automations yet. Create one above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <Card key={run.id} className="hover:bg-secondary/30 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={14} className="text-primary shrink-0" />
                    <span className="font-medium truncate">{run.title}</span>
                    <Badge variant={run.status === 'completed' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {run.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    {new Date(run.created_at).toLocaleDateString()}
                    {run.webhook_url && (
                      <span className="ml-2 flex items-center gap-1">
                        <ExternalLink size={10} />
                        <span className="truncate max-w-[160px]">{run.webhook_url}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTrigger(run)}
                    disabled={triggeringId === run.id}
                    className="gap-1"
                  >
                    <Send size={14} />
                    {triggeringId === run.id ? 'Sending...' : 'Trigger'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteRun(run.id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutomationWorkflow;
