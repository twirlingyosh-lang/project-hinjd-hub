import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import Materials from "./pages/Materials";
import Equipment from "./pages/Equipment";
import CalculatorPage from "./pages/CalculatorPage";
import Results from "./pages/Results";
import SavedRuns from "./pages/SavedRuns";
import Upgrade from "./pages/Upgrade";
import Account from "./pages/Account";
import Legal from "./pages/Legal";
import Auth from "./pages/Auth";
import BeltSaver from "./pages/BeltSaver";
import ConveyorMaintenance from "./pages/ConveyorMaintenance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/results" element={<Results />} />
              <Route path="/saved-runs" element={<SavedRuns />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/account" element={<Account />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/beltsaver" element={<BeltSaver />} />
              <Route path="/conveyor-maintenance" element={<ConveyorMaintenance />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
