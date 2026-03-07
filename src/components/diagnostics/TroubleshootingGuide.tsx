import { useState } from 'react';
import { TroubleshootingIssue } from '@/data/troubleshootingData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface TroubleshootingGuideProps {
  issue: TroubleshootingIssue;
  equipmentName: string;
  onBack: () => void;
}

const severityConfig = {
  low: { label: 'Low Priority', className: 'bg-green-500/20 text-green-500 border-green-500/30' },
  medium: { label: 'Medium Priority', className: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
  high: { label: 'High Priority', className: 'bg-primary/20 text-primary border-primary/30' },
  critical: { label: 'Critical - Act Immediately', className: 'bg-destructive/20 text-destructive border-destructive/30' },
};

export function TroubleshootingGuide({ issue, equipmentName, onBack }: TroubleshootingGuideProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedSections, setExpandedSections] = useState({ symptoms: true, causes: false });
  const severity = severityConfig[issue.severity];

  const toggleStep = (stepNum: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepNum) 
        ? prev.filter(s => s !== stepNum)
        : [...prev, stepNum]
    );
  };

  const progress = (completedSteps.length / issue.steps.length) * 100;

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Issues
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">{equipmentName}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{issue.title}</h1>
          </div>
          <Badge variant="outline" className={`${severity.className} self-start`}>{severity.label}</Badge>
        </div>
      </div>

      <Card className="p-4 mb-6 bg-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Troubleshooting Progress</span>
          <span className="text-sm text-muted-foreground">{completedSteps.length} of {issue.steps.length} steps complete</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </Card>

      <div className="grid gap-4 mb-6">
        <Card className="bg-card overflow-hidden">
          <button onClick={() => setExpandedSections(prev => ({ ...prev, symptoms: !prev.symptoms }))} className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors">
            <span className="text-lg font-semibold">Symptoms</span>
            {expandedSections.symptoms ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.symptoms && (
            <div className="px-4 pb-4">
              <ul className="space-y-2">
                {issue.symptoms.map((symptom, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="bg-card overflow-hidden">
          <button onClick={() => setExpandedSections(prev => ({ ...prev, causes: !prev.causes }))} className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors">
            <span className="text-lg font-semibold">Possible Causes</span>
            {expandedSections.causes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.causes && (
            <div className="px-4 pb-4">
              <ul className="space-y-2">
                {issue.possibleCauses.map((cause, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                    {cause}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Step-by-Step Guide</h2>
        <div className="space-y-4">
          {issue.steps.map((step) => {
            const isComplete = completedSteps.includes(step.step);
            return (
              <Card key={step.step} className={`p-5 transition-all duration-300 ${isComplete ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border'}`}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <button onClick={() => toggleStep(step.step)} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${isComplete ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'}`}>
                      {isComplete ? <CheckCircle2 className="w-5 h-5" /> : step.step}
                    </button>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${isComplete ? 'text-green-500' : 'text-foreground'}`}>{step.action}</h3>
                    <p className="text-muted-foreground mb-3">{step.details}</p>
                    {step.caution && (
                      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-500">{step.caution}</p>
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <Checkbox id={`step-${step.step}`} checked={isComplete} onCheckedChange={() => toggleStep(step.step)} />
                      <label htmlFor={`step-${step.step}`} className="text-sm text-muted-foreground cursor-pointer">Mark as complete</label>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {completedSteps.length === issue.steps.length && (
        <Card className="mt-6 p-6 bg-green-500/10 border-green-500/30 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-green-500 mb-2">All Steps Complete!</h3>
          <p className="text-muted-foreground">If the issue persists after completing all steps, consider contacting your equipment dealer for further assistance.</p>
        </Card>
      )}
    </div>
  );
}
