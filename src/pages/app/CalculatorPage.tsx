import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Sparkles, Save, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const issueTypes = [
  { value: 'low-output', label: 'Low Output', icon: '📉' },
  { value: 'excessive-wear', label: 'Excessive Wear', icon: '⚙️' },
  { value: 'product-shape', label: 'Poor Product Shape', icon: '🔶' },
  { value: 'belt-tracking', label: 'Belt Tracking Issues', icon: '🔧' },
  { value: 'screen-blinding', label: 'Screen Blinding', icon: '🕸️' },
  { value: 'other', label: 'Other Issue', icon: '❓' },
];

const CalculatorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tonnage');
  
  // Tonnage calculator state
  const [tonnage, setTonnage] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('8');
  const [daysPerWeek, setDaysPerWeek] = useState('5');
  
  // Troubleshooter state
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved material data
  useEffect(() => {
    const saved = localStorage.getItem('currentMaterial');
    if (saved) {
      const data = JSON.parse(saved);
      // Could pre-fill values here
    }
  }, []);

  const calculateThroughput = () => {
    const daily = parseFloat(tonnage) * parseFloat(hoursPerDay);
    const weekly = daily * parseFloat(daysPerWeek);
    const monthly = weekly * 4.33;
    const yearly = monthly * 12;
    return { daily, weekly, monthly, yearly };
  };

  const handleTroubleshoot = async () => {
    if (!issueType) {
      toast.error('Please select an issue type');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `I'm experiencing ${issueTypes.find(i => i.value === issueType)?.label} in my aggregate crushing operation. ${description ? `Details: ${description}` : ''} Please provide troubleshooting steps and recommendations.`;
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          prompt,
          type: 'report',
          context: 'Industrial aggregate crushing and screening troubleshooting'
        }
      });

      if (error) throw error;
      if (data?.content) {
        setAiResponse(data.content);
      }
    } catch (err) {
      toast.error('Failed to generate troubleshooting advice');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRun = () => {
    if (!user) {
      toast.error('Please sign in to save runs');
      navigate('/auth');
      return;
    }

    const runData = {
      id: Date.now().toString(),
      type: activeTab,
      data: activeTab === 'tonnage' 
        ? { tonnage, hoursPerDay, daysPerWeek, results: calculateThroughput() }
        : { issueType, description, aiResponse },
      timestamp: new Date().toISOString(),
    };

    const existingRuns = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    existingRuns.unshift(runData);
    localStorage.setItem('savedRuns', JSON.stringify(existingRuns.slice(0, 50))); // Keep last 50
    
    toast.success('Run saved successfully');
    navigate('/app/saved');
  };

  const throughput = tonnage ? calculateThroughput() : null;

  return (
    <AppLayout title="Calculator">
      <div className="p-4 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tonnage">Tonnage</TabsTrigger>
            <TabsTrigger value="troubleshoot">Troubleshoot</TabsTrigger>
          </TabsList>

          <TabsContent value="tonnage" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator size={18} />
                  Throughput Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tonnage">Hourly Tonnage (TPH)</Label>
                  <Input
                    id="tonnage"
                    type="number"
                    placeholder="Enter TPH"
                    value={tonnage}
                    onChange={(e) => setTonnage(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours/Day</Label>
                    <Input
                      id="hours"
                      type="number"
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="days">Days/Week</Label>
                    <Input
                      id="days"
                      type="number"
                      value={daysPerWeek}
                      onChange={(e) => setDaysPerWeek(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {throughput && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold">Production Estimates</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-card rounded-lg">
                      <p className="text-xs text-muted-foreground">Daily</p>
                      <p className="text-lg font-bold">{throughput.daily.toLocaleString()} tons</p>
                    </div>
                    <div className="p-3 bg-card rounded-lg">
                      <p className="text-xs text-muted-foreground">Weekly</p>
                      <p className="text-lg font-bold">{throughput.weekly.toLocaleString()} tons</p>
                    </div>
                    <div className="p-3 bg-card rounded-lg">
                      <p className="text-xs text-muted-foreground">Monthly</p>
                      <p className="text-lg font-bold">{Math.round(throughput.monthly).toLocaleString()} tons</p>
                    </div>
                    <div className="p-3 bg-card rounded-lg">
                      <p className="text-xs text-muted-foreground">Yearly</p>
                      <p className="text-lg font-bold text-primary">{Math.round(throughput.yearly).toLocaleString()} tons</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="troubleshoot" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle size={18} className="text-yellow-500" />
                  AI Troubleshooter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Issue Type</Label>
                  <Select value={issueType} onValueChange={setIssueType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue" />
                    </SelectTrigger>
                    <SelectContent>
                      {issueTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Additional Details (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in more detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleTroubleshoot} 
                  disabled={isLoading || !issueType}
                  className="w-full gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Get AI Recommendations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {aiResponse && (
              <Card className="bg-green-500/5 border-green-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-400">
                    <CheckCircle size={16} />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm whitespace-pre-wrap">{aiResponse}</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Button 
          variant="outline" 
          onClick={handleSaveRun}
          className="w-full gap-2"
          disabled={activeTab === 'tonnage' ? !tonnage : !aiResponse}
        >
          <Save size={16} />
          Save This Run
        </Button>
      </div>
    </AppLayout>
  );
};

export default CalculatorPage;
