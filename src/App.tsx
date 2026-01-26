import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";

// Lazy load page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const BeltSaver = lazy(() => import("./pages/BeltSaver"));
const ConveyorMaintenance = lazy(() => import("./pages/ConveyorMaintenance"));
const ContentGeneratorPage = lazy(() => import("./pages/ContentGeneratorPage"));
const AggregateOpps = lazy(() => import("./pages/AggregateOpps"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Aggregate Tools App pages
const AppHome = lazy(() => import("./pages/app/AppHome"));
const MaterialsPage = lazy(() => import("./pages/app/MaterialsPage"));
const EquipmentPage = lazy(() => import("./pages/app/EquipmentPage"));
const EquipmentOppsPage = lazy(() => import("./pages/app/EquipmentOppsPage"));
const CalculatorPage = lazy(() => import("./pages/app/CalculatorPage"));
const ResultsPage = lazy(() => import("./pages/app/ResultsPage"));
const SavedRunsPage = lazy(() => import("./pages/app/SavedRunsPage"));
const UpgradePage = lazy(() => import("./pages/app/UpgradePage"));
const AccountPage = lazy(() => import("./pages/app/AccountPage"));
const LegalPage = lazy(() => import("./pages/app/LegalPage"));
const InstallPage = lazy(() => import("./pages/app/InstallPage"));

// CRM pages
const CRMDashboard = lazy(() => import("./pages/crm/CRMDashboard"));
const CRMLogin = lazy(() => import("./pages/crm/CRMLogin"));
const CRMClients = lazy(() => import("./pages/crm/CRMClients"));
const CRMClientForm = lazy(() => import("./pages/crm/CRMClientForm"));
const CRMDeals = lazy(() => import("./pages/crm/CRMDeals"));
const CRMDealForm = lazy(() => import("./pages/crm/CRMDealForm"));
const CRMInvoices = lazy(() => import("./pages/crm/CRMInvoices"));
const CRMInvoiceForm = lazy(() => import("./pages/crm/CRMInvoiceForm"));
const CRMMessages = lazy(() => import("./pages/crm/CRMMessages"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
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
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
