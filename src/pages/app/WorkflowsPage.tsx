import { AppLayout } from '@/components/app/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Wrench, Briefcase, FileText } from 'lucide-react';
import AutomationWorkflow from '@/components/workflows/AutomationWorkflow';
import DiagnosticWorkflow from '@/components/workflows/DiagnosticWorkflow';
import BusinessWorkflow from '@/components/workflows/BusinessWorkflow';
import ContentApprovalWorkflow from '@/components/workflows/ContentApprovalWorkflow';

const WorkflowsPage = () => {
  return (
    <AppLayout title="Workflows">
      <div className="p-4">
        <Tabs defaultValue="automation" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="automation" className="gap-1 text-xs px-1">
              <Zap size={14} />
              <span className="hidden sm:inline">Automate</span>
            </TabsTrigger>
            <TabsTrigger value="diagnostic" className="gap-1 text-xs px-1">
              <Wrench size={14} />
              <span className="hidden sm:inline">Diagnose</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="gap-1 text-xs px-1">
              <Briefcase size={14} />
              <span className="hidden sm:inline">Pipeline</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1 text-xs px-1">
              <FileText size={14} />
              <span className="hidden sm:inline">Approve</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="automation">
            <AutomationWorkflow />
          </TabsContent>
          <TabsContent value="diagnostic">
            <DiagnosticWorkflow />
          </TabsContent>
          <TabsContent value="business">
            <BusinessWorkflow />
          </TabsContent>
          <TabsContent value="content">
            <ContentApprovalWorkflow />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default WorkflowsPage;
