
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Check if the user has completed onboarding
  const hasCompletedOnboarding = localStorage.getItem("selectedBusinessType");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={hasCompletedOnboarding ? <Navigate to="/dashboard" /> : <Navigate to="/onboarding" />} 
            />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/customers" element={<Index />} />
            <Route path="/quotes" element={<Index />} />
            <Route path="/settings" element={<Index />} />
            <Route path="/profile" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
