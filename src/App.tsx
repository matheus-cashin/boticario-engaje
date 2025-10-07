import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Empresa pages
import Dashboard from "./pages/empresa/Dashboard";
import Campanhas from "./pages/empresa/campanhas/Campanhas";
import NovaCampanha from "./pages/empresa/campanhas/NovaCampanha";
import DetalhesCampanha from "./pages/empresa/campanhas/DetalhesCampanha";
import EditarCampanha from "./pages/empresa/campanhas/EditarCampanha";
import RelatorioCampanha from "./pages/empresa/campanhas/RelatorioCampanha";
import ParticipantesCampanha from "./pages/empresa/campanhas/ParticipantesCampanha";
import RegraCampanha from "./pages/empresa/campanhas/RegraCampanha";
import Vendedores from "./pages/empresa/vendedores/Vendedores";
import PerfilVendedor from "./pages/empresa/vendedores/PerfilVendedor";
import Comunicacao from "./pages/empresa/comunicacao/Comunicacao";
import NovoDisparo from "./pages/empresa/comunicacao/NovoDisparo";
import Produtos from "./pages/empresa/produtos/Produtos";
import DetalhesProduto from "./pages/empresa/produtos/DetalhesProduto";
import Configuracoes from "./pages/empresa/configuracoes/Configuracoes";

// Backoffice pages
import BackofficeDashboard from "./pages/backoffice/Dashboard";
import Empresas from "./pages/backoffice/empresas/Empresas";
import NovaEmpresa from "./pages/backoffice/empresas/NovaEmpresa";
import DetalhesEmpresa from "./pages/backoffice/empresas/DetalhesEmpresa";
import Auditoria from "./pages/backoffice/auditoria/Auditoria";
import Financeiro from "./pages/backoffice/financeiro/Financeiro";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Empresa Routes */}
          <Route path="/empresa/:empresaId" element={<Dashboard />} />
          <Route path="/empresa/:empresaId/campanhas" element={<Campanhas />} />
          <Route path="/empresa/:empresaId/campanhas/nova" element={<NovaCampanha />} />
          <Route path="/empresa/:empresaId/campanhas/:campanhaId" element={<DetalhesCampanha />} />
          <Route path="/empresa/:empresaId/campanhas/:campanhaId/editar" element={<EditarCampanha />} />
          <Route path="/empresa/:empresaId/campanhas/:campanhaId/relatorio" element={<RelatorioCampanha />} />
          <Route path="/empresa/:empresaId/campanhas/:campanhaId/participantes" element={<ParticipantesCampanha />} />
          <Route path="/empresa/:empresaId/campanhas/:campanhaId/regra" element={<RegraCampanha />} />
          <Route path="/empresa/:empresaId/vendedores" element={<Vendedores />} />
          <Route path="/empresa/:empresaId/vendedores/:vendedorId" element={<PerfilVendedor />} />
          <Route path="/empresa/:empresaId/comunicacao" element={<Comunicacao />} />
          <Route path="/empresa/:empresaId/comunicacao/novo" element={<NovoDisparo />} />
          <Route path="/empresa/:empresaId/produtos" element={<Produtos />} />
          <Route path="/empresa/:empresaId/produtos/:produtoId" element={<DetalhesProduto />} />
          <Route path="/empresa/:empresaId/configuracoes" element={<Configuracoes />} />
          
          {/* Backoffice Routes */}
          <Route path="/backoffice" element={<BackofficeDashboard />} />
          <Route path="/backoffice/empresas" element={<Empresas />} />
          <Route path="/backoffice/empresas/nova" element={<NovaEmpresa />} />
          <Route path="/backoffice/empresas/:empresaId" element={<DetalhesEmpresa />} />
          <Route path="/backoffice/auditoria" element={<Auditoria />} />
          <Route path="/backoffice/financeiro" element={<Financeiro />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
