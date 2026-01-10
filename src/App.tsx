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
