import { ComponentType, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { DebugLogProvider } from "@/components/DebugLogPanel";

const isDynamicImportFetchError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("Failed to fetch dynamically imported module");
};

const lazyWithRetry = <T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  cacheKey: string,
) =>
  lazy(async () => {
    try {
      const module = await importer();
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(cacheKey);
      }
      return module;
    } catch (error) {
      if (
        typeof window !== "undefined" &&
        isDynamicImportFetchError(error) &&
        !window.sessionStorage.getItem(cacheKey)
      ) {
        window.sessionStorage.setItem(cacheKey, "true");
        window.location.reload();
        return new Promise<never>(() => undefined);
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(cacheKey);
      }
      throw error;
    }
  });

// Lazy load page components for code splitting
const Index = lazyWithRetry(() => import("./pages/Index"), "lazy-retry:index");
const Auth = lazyWithRetry(() => import("./pages/Auth"), "lazy-retry:auth");
const BeltSaver = lazyWithRetry(() => import("./pages/BeltSaver"), "lazy-retry:beltsaver");
const ConveyorMaintenance = lazyWithRetry(() => import("./pages/ConveyorMaintenance"), "lazy-retry:conveyor-maintenance");
const ContentGeneratorPage = lazyWithRetry(() => import("./pages/ContentGeneratorPage"), "lazy-retry:content-generator");
const AggregateOpps = lazyWithRetry(() => import("./pages/AggregateOpps"), "lazy-retry:aggregate-opps");
const NotFound = lazyWithRetry(() => import("./pages/NotFound"), "lazy-retry:not-found");
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy"), "lazy-retry:privacy-policy");
const Debug = lazyWithRetry(() => import("./pages/Debug"), "lazy-retry:debug");

// Aggregate Tools App pages
const AppHome = lazyWithRetry(() => import("./pages/app/AppHome"), "lazy-retry:app-home");
const MaterialsPage = lazyWithRetry(() => import("./pages/app/MaterialsPage"), "lazy-retry:materials");
const EquipmentPage = lazyWithRetry(() => import("./pages/app/SmashGuruPage"), "lazy-retry:equipment");
const EquipmentOppsPage = lazyWithRetry(() => import("./pages/app/EquipmentOppsPage"), "lazy-retry:equipment-opps");
const CalculatorPage = lazyWithRetry(() => import("./pages/app/CalculatorPage"), "lazy-retry:calculator");
const ResultsPage = lazyWithRetry(() => import("./pages/app/ResultsPage"), "lazy-retry:results");
const SavedRunsPage = lazyWithRetry(() => import("./pages/app/SavedRunsPage"), "lazy-retry:saved-runs");
const UpgradePage = lazyWithRetry(() => import("./pages/app/UpgradePage"), "lazy-retry:upgrade");
const AccountPage = lazyWithRetry(() => import("./pages/app/AccountPage"), "lazy-retry:account");
const LegalPage = lazyWithRetry(() => import("./pages/app/LegalPage"), "lazy-retry:legal");
const InstallPage = lazyWithRetry(() => import("./pages/app/InstallPage"), "lazy-retry:install");
const HinjdDashboard = lazyWithRetry(() => import("./pages/app/HinjdDashboard"), "lazy-retry:dashboard");
const AdminPanel = lazyWithRetry(() => import("./pages/app/AdminPanel"), "lazy-retry:admin");
const WorkflowsPage = lazyWithRetry(() => import("./pages/app/WorkflowsPage"), "lazy-retry:workflows");
const SnippetsPage = lazyWithRetry(() => import("./pages/app/SnippetsPage"), "lazy-retry:snippets");
const Base44AppPage = lazyWithRetry(() => import("./pages/app/Base44AppPage"), "lazy-retry:base44");
const SettingsPage = lazyWithRetry(() => import("./pages/app/SettingsPage"), "lazy-retry:settings");
const ElectricalPage = lazyWithRetry(() => import("./pages/app/ElectricalPage"), "lazy-retry:electrical");
const FaultCodePage = lazyWithRetry(() => import("./pages/app/FaultCodePage"), "lazy-retry:fault-codes");
const HydraulicsPage = lazyWithRetry(() => import("./pages/app/HydraulicsPage"), "lazy-retry:hydraulics");
const TroubleshootingPage = lazyWithRetry(() => import("./pages/app/TroubleshootingPage"), "lazy-retry:troubleshooting");
const CrusherDiagnosticPage = lazyWithRetry(() => import("./pages/app/CrusherDiagnosticPage"), "lazy-retry:crusher-diagnostic");
const ScreenerDiagnosticPage = lazyWithRetry(() => import("./pages/app/ScreenerDiagnosticPage"), "lazy-retry:screener-diagnostic");
const ReferralPage = lazyWithRetry(() => import("./pages/app/ReferralPage"), "lazy-retry:referral");
const ThreeDViewerPage = lazyWithRetry(() => import("./pages/app/ThreeDViewerPage"), "lazy-retry:3d-viewer");
const FleetMapPage = lazyWithRetry(() => import("./pages/app/FleetMapPage"), "lazy-retry:fleet-map");
const BlogPage = lazyWithRetry(() => import("./pages/BlogPage"), "lazy-retry:blog");

// CRM pages
const CRMDashboard = lazyWithRetry(() => import("./pages/crm/CRMDashboard"), "lazy-retry:crm-dashboard");
const CRMLogin = lazyWithRetry(() => import("./pages/crm/CRMLogin"), "lazy-retry:crm-login");
const CRMClients = lazyWithRetry(() => import("./pages/crm/CRMClients"), "lazy-retry:crm-clients");
const CRMClientForm = lazyWithRetry(() => import("./pages/crm/CRMClientForm"), "lazy-retry:crm-client-form");
const CRMDeals = lazyWithRetry(() => import("./pages/crm/CRMDeals"), "lazy-retry:crm-deals");
const CRMDealForm = lazyWithRetry(() => import("./pages/crm/CRMDealForm"), "lazy-retry:crm-deal-form");
const CRMInvoices = lazyWithRetry(() => import("./pages/crm/CRMInvoices"), "lazy-retry:crm-invoices");
const CRMInvoiceForm = lazyWithRetry(() => import("./pages/crm/CRMInvoiceForm"), "lazy-retry:crm-invoice-form");
const CRMMessages = lazyWithRetry(() => import("./pages/crm/CRMMessages"), "lazy-retry:crm-messages");
const CRMSalesFunnel = lazyWithRetry(() => import("./pages/crm/CRMSalesFunnel"), "lazy-retry:crm-funnel");
const CRMReports = lazyWithRetry(() => import("./pages/crm/CRMReports"), "lazy-retry:crm-reports");

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DebugLogProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/beltsaver" element={<BeltSaver />} />
                <Route path="/conveyor-maintenance" element={<ConveyorMaintenance />} />
                <Route path="/content-generator" element={<ContentGeneratorPage />} />
                <Route path="/aggregate-opps" element={<AggregateOpps />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/debug" element={<Debug />} />
                {/* Aggregate Tools App Routes */}
                <Route path="/app" element={<AppHome />} />
                <Route path="/app/materials" element={<MaterialsPage />} />
                <Route path="/app/equipment" element={<EquipmentPage />} />
                <Route path="/app/equipment-opps" element={<EquipmentOppsPage />} />
                <Route path="/app/calculator" element={<CalculatorPage />} />
                <Route path="/app/results" element={<ResultsPage />} />
                <Route path="/app/saved" element={<SavedRunsPage />} />
                <Route path="/app/upgrade" element={<UpgradePage />} />
                <Route path="/app/account" element={<AccountPage />} />
                <Route path="/app/legal" element={<LegalPage />} />
                <Route path="/app/install" element={<InstallPage />} />
                <Route path="/app/dashboard" element={<HinjdDashboard />} />
                <Route path="/app/admin" element={<AdminPanel />} />
                <Route path="/app/workflows" element={<WorkflowsPage />} />
                <Route path="/app/snippets" element={<SnippetsPage />} />
                <Route path="/app/base44" element={<Base44AppPage />} />
                <Route path="/app/settings" element={<SettingsPage />} />
                <Route path="/app/referral" element={<ReferralPage />} />
                <Route path="/app/electrical" element={<ElectricalPage />} />
                <Route path="/app/fault-codes" element={<FaultCodePage />} />
                <Route path="/app/hydraulics" element={<HydraulicsPage />} />
                <Route path="/app/troubleshooting" element={<TroubleshootingPage />} />
                <Route path="/app/crusher-diagnostic" element={<CrusherDiagnosticPage />} />
                <Route path="/app/screener-diagnostic" element={<ScreenerDiagnosticPage />} />
                <Route path="/app/3d-viewer" element={<ThreeDViewerPage />} />
                <Route path="/app/fleet-map" element={<FleetMapPage />} />
                <Route path="/blog" element={<BlogPage />} />
                {/* CRM Routes */}
                <Route path="/crm" element={<CRMDashboard />} />
                <Route path="/crm/login" element={<CRMLogin />} />
                <Route path="/crm/clients" element={<CRMClients />} />
                <Route path="/crm/clients/new" element={<CRMClientForm />} />
                <Route path="/crm/clients/:id" element={<CRMClientForm />} />
                <Route path="/crm/clients/:id/edit" element={<CRMClientForm />} />
                <Route path="/crm/deals" element={<CRMDeals />} />
                <Route path="/crm/deals/new" element={<CRMDealForm />} />
                <Route path="/crm/deals/:id" element={<CRMDealForm />} />
                <Route path="/crm/deals/:id/edit" element={<CRMDealForm />} />
                <Route path="/crm/invoices" element={<CRMInvoices />} />
                <Route path="/crm/invoices/new" element={<CRMInvoiceForm />} />
                <Route path="/crm/invoices/:id" element={<CRMInvoiceForm />} />
                <Route path="/crm/invoices/:id/edit" element={<CRMInvoiceForm />} />
                <Route path="/crm/messages" element={<CRMMessages />} />
                <Route path="/crm/funnel" element={<CRMSalesFunnel />} />
                <Route path="/crm/reports" element={<CRMReports />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </DebugLogProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
