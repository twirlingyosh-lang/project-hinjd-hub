import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/app/AppLayout';
import { TroubleshootingGuide } from '@/components/diagnostics/TroubleshootingGuide';
import { equipmentList, TroubleshootingIssue } from '@/data/troubleshootingData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, AlertTriangle, ChevronRight, TreeDeciduous } from 'lucide-react';

const severityColors: Record<string, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  high: 'bg-primary/20 text-primary border-primary/30',
  critical: 'bg-destructive/20 text-destructive border-destructive/30',
};

export default function TroubleshootingPage() {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<TroubleshootingIssue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const equipment = selectedEquipment
    ? equipmentList.find(e => e.id === selectedEquipment)
    : null;

  const filteredEquipment = equipmentList.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.issues.some(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (selectedIssue && equipment) {
    return (
      <AppLayout title="Troubleshooting Guide">
        <TroubleshootingGuide
          issue={selectedIssue}
          equipmentName={equipment.name}
          onBack={() => setSelectedIssue(null)}
        />
      </AppLayout>
    );
  }

  if (equipment) {
    return (
      <AppLayout title="Troubleshooting Guide">
        <div className="mb-6">
          <button
            onClick={() => setSelectedEquipment(null)}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1"
          >
            ← All Equipment
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{equipment.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{equipment.name}</h1>
              <p className="text-muted-foreground">{equipment.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {equipment.issues.map(issue => (
            <Card
              key={issue.id}
              className="p-4 bg-card hover:bg-muted/50 cursor-pointer transition-colors group"
              onClick={() => setSelectedIssue(issue)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{issue.title}</h3>
                    <Badge variant="outline" className={severityColors[issue.severity]}>
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {issue.steps.length} steps · {issue.symptoms.length} symptoms · {issue.possibleCauses.length} causes
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Card>
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Troubleshooting Guide">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Equipment Troubleshooting</h1>
        <p className="text-muted-foreground">Step-by-step diagnostic checklists for crushers and screeners</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search equipment or issues..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="crusher">Crushers</TabsTrigger>
          <TabsTrigger value="screener">Screeners</TabsTrigger>
        </TabsList>

        {['all', 'crusher', 'screener'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEquipment
                .filter(e => tab === 'all' || e.type === tab)
                .map(e => (
                  <Card
                    key={e.id}
                    className="p-5 bg-card hover:bg-muted/50 cursor-pointer transition-colors group"
                    onClick={() => setSelectedEquipment(e.id)}
                  >
                    <div className="text-3xl mb-3">{e.icon}</div>
                    <h3 className="font-semibold text-foreground mb-1">{e.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{e.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {e.issues.length} known issues
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </AppLayout>
  );
}
