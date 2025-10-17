
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReportsData } from "@/hooks/useReportsData";
import { ReportMetrics } from "@/components/reports/ReportMetrics";
import { CampaignPerformanceChart } from "@/components/reports/CampaignPerformanceChart";
import { GoalAchievementChart } from "@/components/reports/GoalAchievementChart";
import { CampaignTable } from "@/components/reports/CampaignTable";
import { ReportFilters, ReportFilters as ReportFiltersType } from "@/components/reports/ReportFilters";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, FileText } from "lucide-react";

export default function Reports() {
  const navigate = useNavigate();
  const { data: reportData, isLoading, error } = useReportsData();
  const [filters, setFilters] = useState<ReportFiltersType>({
    period: 'all',
    status: 'all',
    dateRange: undefined
  });
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");

  console.log('=== REPORTS PAGE DEBUG ===');
  console.log('📊 Report data:', reportData);
  console.log('🔄 Loading:', isLoading);
  console.log('❌ Error:', error);
  console.log('🔍 Filters:', filters);

  const handleFiltersChange = (newFilters: ReportFiltersType) => {
    console.log('🔍 Filtros atualizados:', newFilters);
    setFilters(newFilters);
  };

  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    navigate(`/reports/${campaignId}`);
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-semibold">Relatórios</h1>
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-semibold">Relatórios</h1>
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-red-600 mb-2">Erro ao carregar relatórios</p>
                  <p className="text-sm text-gray-500">{error.message}</p>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!reportData) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-semibold">Relatórios</h1>
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum dado disponível para exibir relatórios</p>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Relatórios</h1>
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="mb-4">
              <p className="text-gray-600">
                Acompanhe o desempenho e resultados das suas campanhas de incentivo
              </p>
            </div>

            <div className="space-y-6">
              {/* Filtros */}
              <ReportFilters onFiltersChange={handleFiltersChange} />

              {/* Métricas Principais */}
              <ReportMetrics metrics={reportData.metrics} />

              {/* Filtro de Campanha Específica */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visualizar Campanha Específica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Select value={selectedCampaign} onValueChange={handleCampaignSelect}>
                      <SelectTrigger className="w-full max-w-md">
                        <SelectValue placeholder="Selecione uma campanha" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportData.campaignPerformance.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CampaignPerformanceChart data={reportData.campaignPerformance} />
                <GoalAchievementChart data={reportData.campaignPerformance} />
              </div>

              {/* Tabela Detalhada */}
              <CampaignTable data={reportData.campaignPerformance} />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
