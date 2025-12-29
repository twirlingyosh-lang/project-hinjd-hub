import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  RotateCcw,
  Wrench,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SocialShareButtons from './SocialShareButtons';

interface DiagnosticStep {
  id: string;
  question: string;
  options: { value: string; label: string; description?: string }[];
}

interface DiagnosisResult {
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  causes: string[];
  repairs: string[];
  beltSaverBenefit?: string;
}

const diagnosticSteps: DiagnosticStep[] = [
  {
    id: 'location',
    question: 'Where is the belt mistracking occurring?',
    options: [
      { value: 'head', label: 'Head Pulley', description: 'Discharge end of conveyor' },
      { value: 'tail', label: 'Tail Pulley', description: 'Loading/feed end' },
      { value: 'midspan', label: 'Mid-Span', description: 'Between pulleys along idlers' },
      { value: 'multiple', label: 'Multiple Locations', description: 'Wandering throughout' }
    ]
  },
  {
    id: 'direction',
    question: 'Which direction is the belt tracking off?',
    options: [
      { value: 'left', label: 'Consistently Left', description: 'Always drifts to left side' },
      { value: 'right', label: 'Consistently Right', description: 'Always drifts to right side' },
      { value: 'alternating', label: 'Alternating/Wandering', description: 'Moves side to side' },
      { value: 'loaded', label: 'Only When Loaded', description: 'Tracks fine empty, misaligns under load' }
    ]
  },
  {
    id: 'severity',
    question: 'How severe is the mistracking?',
    options: [
      { value: 'minor', label: 'Minor (< 2")', description: 'Belt touching edge guides occasionally' },
      { value: 'moderate', label: 'Moderate (2-4")', description: 'Consistent edge contact, some spillage' },
      { value: 'severe', label: 'Severe (> 4")', description: 'Belt rubbing structure, major spillage' },
      { value: 'critical', label: 'Critical', description: 'Belt damage occurring, production at risk' }
    ]
  },
  {
    id: 'symptoms',
    question: 'What additional symptoms do you observe?',
    options: [
      { value: 'edge_wear', label: 'Edge Wear/Fraying', description: 'Belt edges showing damage' },
      { value: 'spillage', label: 'Material Spillage', description: 'Product falling off belt' },
      { value: 'noise', label: 'Unusual Noise', description: 'Grinding, squealing, or rubbing sounds' },
      { value: 'none', label: 'Mistracking Only', description: 'No other visible issues' }
    ]
  }
];

const generateDiagnosis = (answers: Record<string, string>): DiagnosisResult => {
  const { location, direction, severity, symptoms } = answers;
  
  let issue = '';
  let severityLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  const causes: string[] = [];
  const repairs: string[] = [];
  let beltSaverBenefit = '';

  // Location-based diagnosis
  if (location === 'tail') {
    issue = 'Tail Pulley Mistracking';
    causes.push('Tail pulley misalignment');
    causes.push('Uneven belt tension');
    causes.push('Material buildup on tail pulley');
    repairs.push('Check and adjust tail pulley alignment using laser alignment');
    repairs.push('Clean pulley lagging and remove material buildup');
    repairs.push('Verify take-up tension is correct and even on both sides');
    beltSaverBenefit = 'BeltSaver® Integrated Tail Pulley eliminates tracking wander at the tail by maintaining consistent edge contact and self-centering geometry.';
  } else if (location === 'head') {
    issue = 'Head Pulley Mistracking';
    causes.push('Head pulley misalignment');
    causes.push('Worn or damaged pulley lagging');
    causes.push('Uneven drive tension');
    repairs.push('Laser-align head pulley perpendicular to belt travel');
    repairs.push('Inspect and replace worn lagging');
    repairs.push('Balance drive system and check reducer alignment');
  } else if (location === 'midspan') {
    issue = 'Idler Zone Mistracking';
    causes.push('Misaligned carrying or return idlers');
    causes.push('Stuck or seized idler rollers');
    causes.push('Belt camber or manufacturing defect');
    repairs.push('Square all idlers to belt centerline');
    repairs.push('Replace seized or worn idlers');
    repairs.push('Check belt for camber - may need replacement if severe');
  } else {
    issue = 'System-Wide Tracking Instability';
    causes.push('Multiple alignment issues');
    causes.push('Belt splice problem or belt camber');
    causes.push('Conveyor structure deflection');
    causes.push('Foundation settling');
    repairs.push('Perform complete conveyor alignment audit');
    repairs.push('Inspect belt splice for squareness');
    repairs.push('Check structure for deflection under load');
    beltSaverBenefit = 'BeltSaver® provides continuous edge protection during diagnostics, preventing further damage while you identify root cause.';
  }

  // Direction-based additions
  if (direction === 'loaded') {
    causes.push('Off-center loading from chute');
    causes.push('Impact bed misalignment');
    repairs.push('Adjust loading chute for centered material placement');
    repairs.push('Install or adjust impact cradles');
  } else if (direction === 'alternating') {
    causes.push('Belt splice not square');
    causes.push('Belt has internal camber');
    repairs.push('Re-splice belt ensuring squareness within 1/16" per foot');
    repairs.push('Track belt empty to isolate belt vs. system issues');
  }

  // Severity mapping
  if (severity === 'critical') {
    severityLevel = 'critical';
    repairs.unshift('⚠️ STOP CONVEYOR IMMEDIATELY - Risk of belt destruction');
  } else if (severity === 'severe') {
    severityLevel = 'high';
    repairs.unshift('Schedule emergency maintenance within 24 hours');
  } else if (severity === 'moderate') {
    severityLevel = 'medium';
  } else {
    severityLevel = 'low';
  }

  // Symptom-based additions
  if (symptoms === 'edge_wear') {
    causes.push('Prolonged edge contact with structure');
    repairs.push('Install belt edge guards or adjust skirting');
    beltSaverBenefit = 'BeltSaver® protects belt edges from structure contact, extending belt life by up to 40%.';
  } else if (symptoms === 'spillage') {
    repairs.push('Address alignment first, then optimize skirting system');
  } else if (symptoms === 'noise') {
    causes.push('Potential bearing failure in idlers or pulleys');
    repairs.push('Perform vibration analysis on all rotating components');
  }

  return { issue, severity: severityLevel, causes, repairs, beltSaverBenefit };
};

const BeltSaverTool = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedDiagnosticId, setSavedDiagnosticId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAnswer = (value: string) => {
    const stepId = diagnosticSteps[currentStep].id;
    setAnswers(prev => ({ ...prev, [stepId]: value }));
  };

  const handleNext = () => {
    if (currentStep < diagnosticSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
    setSavedDiagnosticId(null);
  };

  const currentStepData = diagnosticSteps[currentStep];
  const currentAnswer = answers[currentStepData?.id];
  const diagnosis = showResults ? generateDiagnosis(answers) : null;

  // Auto-save diagnostic when results are shown
  useEffect(() => {
    const saveDiagnostic = async () => {
      if (!showResults || !diagnosis || savedDiagnosticId) return;
      
      setIsSaving(true);
      try {
        const { data, error } = await supabase
          .from('belt_diagnostics')
          .insert({
            location: answers.location,
            tracking_direction: answers.direction,
            severity: diagnosis.severity,
            cause: diagnosis.issue,
            recommendations: diagnosis.repairs,
            belt_saver_benefits: diagnosis.beltSaverBenefit ? [diagnosis.beltSaverBenefit] : [],
            user_id: user?.id || null,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;

        setSavedDiagnosticId(data.id);
        toast({
          title: "Diagnostic Saved",
          description: "Your diagnosis has been saved to your history.",
        });
      } catch (error) {
        console.error('Error saving diagnostic:', error);
        toast({
          title: "Save Failed",
          description: "Could not save diagnostic. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
    };

    saveDiagnostic();
  }, [showResults, diagnosis, answers, user?.id, savedDiagnosticId, toast]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/30';
      case 'high': return 'text-industrial-red bg-industrial-red/10 border-industrial-red/30';
      case 'medium': return 'text-primary bg-primary/10 border-primary/30';
      default: return 'text-green-500 bg-green-500/10 border-green-500/30';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'left': return <ArrowLeft className="text-primary" size={20} />;
      case 'right': return <ArrowRight className="text-primary" size={20} />;
      case 'alternating': return <div className="flex"><ArrowLeft size={16} /><ArrowRight size={16} /></div>;
      default: return <ArrowDown className="text-primary" size={20} />;
    }
  };

  if (showResults && diagnosis) {
    return (
      <div className="space-y-6 animate-slide-up">
        {/* Diagnosis Header */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="industrial-title text-lg">{diagnosis.issue}</CardTitle>
              <div className="flex items-center gap-2">
                {isSaving ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 size={12} className="animate-spin" />
                    Saving...
                  </span>
                ) : savedDiagnosticId ? (
                  <span className="flex items-center gap-1 text-xs text-green-500">
                    <Save size={12} />
                    Saved
                  </span>
                ) : null}
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getSeverityColor(diagnosis.severity)}`}>
                  {diagnosis.severity} severity
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Probable Causes */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm industrial-label flex items-center gap-2">
              <AlertTriangle size={14} className="text-primary" />
              Probable Causes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {diagnosis.causes.map((cause, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  {cause}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommended Repairs */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm industrial-label flex items-center gap-2">
              <Wrench size={14} className="text-primary" />
              Recommended Repairs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {diagnosis.repairs.map((repair, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-foreground">{repair}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* BeltSaver Benefit */}
        {diagnosis.beltSaverBenefit && (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/15 border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm industrial-title flex items-center gap-2 text-primary">
                <CheckCircle size={16} />
                BeltSaver® Solution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">
                {diagnosis.beltSaverBenefit}
              </p>
              <Button 
                variant="default" 
                size="sm" 
                className="mt-4"
                onClick={() => window.open('mailto:twirlingyosh@gmail.com?subject=BeltSaver%20Inquiry', '_blank')}
              >
                Request BeltSaver® Quote
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Social Share */}
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <SocialShareButtons 
              title={`Conveyor Diagnosis: ${diagnosis.issue}`}
              text={`${diagnosis.severity.toUpperCase()} severity - ${diagnosis.causes[0]}. Recommended: ${diagnosis.repairs[0]}`}
            />
          </CardContent>
        </Card>

        {/* Reset Button */}
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleReset}
        >
          <RotateCcw size={16} className="mr-2" />
          Run New Diagnosis
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex gap-2">
        {diagnosticSteps.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= currentStep ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <Card className="bg-card border-border animate-slide-up">
        <CardHeader>
          <div className="text-xs industrial-label mb-2">
            Step {currentStep + 1} of {diagnosticSteps.length}
          </div>
          <CardTitle className="text-lg font-bold text-foreground">
            {currentStepData.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={currentAnswer} 
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentStepData.options.map((option) => (
              <div 
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                  currentAnswer === option.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleAnswer(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div className="font-medium text-foreground">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
                  )}
                </Label>
                {currentStepData.id === 'direction' && getDirectionIcon(option.value)}
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!currentAnswer}
          className="flex-1"
        >
          {currentStep === diagnosticSteps.length - 1 ? 'Get Diagnosis' : 'Next'}
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default BeltSaverTool;
