
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Campaigns from "./pages/Campaigns";
import Reports from "./pages/Reports";
import CampaignReport from "./pages/reports/CampaignReport";
import NotFound from "./pages/NotFound";
import ApuracaoHome from "./pages/apuracao/Home";
import Analyze from "./pages/apuracao/Analyze";
import Validate from "./pages/apuracao/Validate";
import ParticipantDetails from "./pages/apuracao/ParticipantDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:campaignId" element={<CampaignReport />} />
          <Route path="/apuracao" element={<ApuracaoHome />} />
          <Route path="/apuracao/analyze/:fileId" element={<Analyze />} />
          <Route path="/apuracao/validate/:fileId" element={<Validate />} />
          <Route path="/apuracao/participant/:participantId" element={<ParticipantDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
