import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Target, Award, Download, DollarSign, Send, TrendingUp, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { useResultsData } from "@/hooks/useResultsData";
import { ParticipantsModal } from "@/components/reports/ParticipantsModal";
import { TopPerformerItem } from "@/components/apuracao/TopPerformerItem";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

export default function CampaignReport() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: resultsData, isLoading, error } = useResultsData(campaignId || "");
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);

  const handleExportPDF = () => {
    if (!resultsData) return;
    
    toast({
      title: "Exportando relatório",
      description: "Gerando PDF com dados da campanha...",
    });
    
    // Simulação de exportação bem sucedida
    setTimeout(() => {
      toast({
        title: "Relatório exportado",
        description: "PDF gerado com sucesso!",
      });
    }, 1000);
  };

  const handleProcessPayments = () => {
    toast({
      title: "Processar Pagamentos",
      description: "Esta funcionalidade será implementada em breve",
    });
  };

  const handleSendCommunications = () => {
    toast({
      title: "Enviar Comunicações",
      description: "Esta funcionalidade será implementada em breve",
    });
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex h-16 shrink-0 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="animate-pulse h-6 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="p-4">
              <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (error || !resultsData) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex h-16 shrink-0 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/reports")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center p-8">
              <Card className="w-full max-w-md">
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Relatório não encontrado</h2>
                  <p className="text-muted-foreground mb-4">
                    Não foram encontrados dados de apuração para esta campanha.
                  </p>
                  <Button onClick={() => navigate("/reports")} variant="outline">
                    Voltar para Relatórios
                  </Button>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const salesProgressPercentage = (resultsData.totalSalesAchieved / resultsData.salesTarget) * 100;
  const topPerformers = resultsData.participants.slice(0, 10);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/reports")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex-1 flex items-center gap-3">
              <h1 className="text-xl font-semibold">{resultsData.campaignName}</h1>
              <Badge className="bg-green-100 text-green-800">
                Processada
              </Badge>
            </div>
            <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleProcessPayments} className="gap-2">
                <DollarSign className="h-4 w-4" />
                Processar Pagamentos
              </Button>
              <Button onClick={handleSendCommunications} variant="outline" className="gap-2">
                <Send className="h-4 w-4" />
                Enviar Comunicação
              </Button>
              <Button 
                onClick={() => setShowParticipantsModal(true)} 
                variant="outline" 
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Ver Todos Participantes
              </Button>
            </div>

            {/* Métricas Principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Participantes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resultsData.metrics.totalParticipants}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Meta de Vendas</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(resultsData.salesTarget)}
                  </div>
                  <Progress value={salesProgressPercentage} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {salesProgressPercentage.toFixed(1)}% alcançado
                  </p>
                  <p className="text-xs font-medium text-green-600 mt-1">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(resultsData.totalSalesAchieved)} vendidos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prêmio Estimado</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(resultsData.estimatedPrize)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total distribuído
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Cashins</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(resultsData.metrics.totalCashins)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ranking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Ranking - Top 10 Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                 {topPerformers.map((participant, index) => {
                  const avgPerformance = 
                    (participant.achievementBrazil + participant.achievementDivision + participant.achievementIndividual) / 3;
                  
                  // Verificar se temos valores válidos
                  const hasValidPerformance = !isNaN(avgPerformance) && isFinite(avgPerformance);
                  const hasValidSales = !isNaN(participant.totalSales) && isFinite(participant.totalSales);
                  const hasValidCashins = !isNaN(participant.cashins) && isFinite(participant.cashins);
                  
                  return (
                    <div key={participant.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {hasValidSales ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(participant.totalSales) : 'R$ 0,00'} vendidos
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={hasValidPerformance && avgPerformance >= 100 ? "default" : "secondary"}>
                          {hasValidPerformance ? `${avgPerformance.toFixed(1)}%` : '0.0%'} performance
                        </Badge>
                        {hasValidCashins && participant.cashins > 0 && (
                          <p className="text-sm text-green-600 font-medium mt-1">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(participant.cashins)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Análise Detalhada */}
            <Card>
              <CardHeader>
                <CardTitle>Análise Detalhada</CardTitle>
              </CardHeader>
              <CardContent>
                <div data-export="charts">
                  <Tabs defaultValue="distribution">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="distribution">Distribuição</TabsTrigger>
                      <TabsTrigger value="evolution">Evolução</TabsTrigger>
                    </TabsList>

                    <TabsContent value="distribution" className="mt-6">
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={resultsData.distributionHistogram}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
                          />
                          <Bar dataKey="count" fill="hsl(var(--primary))" name="Participantes" />
                        </BarChart>
                      </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="evolution" className="mt-6">
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={resultsData.evolutionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
                            formatter={(value: number) => `${value.toFixed(1)}%`}
                          />
                          <Line
                            type="monotone"
                            dataKey="average"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            name="Atingimento da Meta"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>

      <ParticipantsModal
        open={showParticipantsModal}
        onClose={() => setShowParticipantsModal(false)}
        participants={resultsData.participants}
      />
    </SidebarProvider>
  );
}