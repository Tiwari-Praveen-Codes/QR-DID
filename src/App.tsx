import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import WalletPage from "./pages/WalletPage";
import VerifierPage from "./pages/VerifierPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import { WalkthroughProvider } from "./components/WalkthroughContext";
import WalkthroughOverlay from "./components/WalkthroughOverlay";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WalkthroughProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/verifier" element={<VerifierPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WalkthroughOverlay />
        </WalkthroughProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
