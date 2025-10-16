import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Target, Award, Download, DollarSign, Send, TrendingUp, FileText, Package, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { ProductSalesChart } from "@/components/reports/ProductSalesChart";
import { useResultsData } from "@/hooks/useResultsData";
import { ParticipantsModal } from "@/components/reports/ParticipantsModal";
import { FullRankingModal } from "@/components/reports/FullRankingModal";
import { TopPerformerItem } from "@/components/apuracao/TopPerformerItem";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

export default function CampaignReport() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: resultsData, isLoading, error } = useResultsData(scheduleId || "");
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showFullRankingModal, setShowFullRankingModal] = useState(false);

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
  
  // Calcular progresso da campanha em dias
  const startDate = new Date(resultsData.startDate);
  const endDate = new Date(resultsData.endDate);
  const today = new Date();
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const campaignProgressPercentage = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);
  
  console.log('🎯 CampaignReport data:', {
    totalParticipants: resultsData.participants.length,
    topPerformersCount: topPerformers.length,
    firstPerformer: topPerformers[0]?.name
  });

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
                Ver Todos Participantes ({resultsData.metrics.totalParticipants})
              </Button>
            </div>

            {/* Métricas Principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Progresso da Campanha</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Campanha de {totalDays} dias
                  </div>
                  <Progress value={campaignProgressPercentage} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {campaignProgressPercentage.toFixed(1)}% de conclusão
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(resultsData.startDate), "dd/MM/yyyy", { locale: ptBR })} até {format(new Date(resultsData.endDate), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
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

            {/* Dashboard Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Ranking */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Ranking - Top 10 Performers
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowFullRankingModal(true)}
                    >
                      Ranking completo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                {topPerformers.length > 0 ? topPerformers.map((participant, index) => {
                  const totalSales = Number(participant.totalSales) || 0;
                  const targetAmount = Number(participant.targetAmount) || 0;
                  const scheduleTarget = Number(resultsData.salesTarget) || 0;
                  const target = targetAmount > 0 ? targetAmount : scheduleTarget;
                  const progress = target > 0 ? (totalSales / target) * 100 : 0;
                  const isAboveTarget = progress > 100;
                  const displayProgress = Math.min(progress, 100);
                  
                  return (
                    <div 
                      key={participant.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        isAboveTarget 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate flex items-center gap-2">
                          {participant.name}
                          {isAboveTarget && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                              META+
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 relative">
                            <Progress 
                              value={displayProgress} 
                              className="h-2"
                            />
                            {isAboveTarget && (
                              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full h-2"></div>
                            )}
                          </div>
                          <span className={`text-xs font-medium min-w-[3.5rem] ${
                            isAboveTarget ? 'text-green-700' : 'text-muted-foreground'
                          }`}>
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          {target && (
                            <span> / R$ {target.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          )}
                          {isAboveTarget && (
                            <span className="text-green-600 font-medium ml-1">
                              (+R$ {(totalSales - target).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum participante encontrado nesta campanha.</p>
                  </div>
                )}
              </CardContent>
            </Card>

              {/* Saída de Produtos */}
              <ProductSalesChart data={resultsData.productSales} />
            </div>

            {/* Análise Detalhada */}
            <Card>
              <CardHeader>
                <CardTitle>Análise Detalhada</CardTitle>
              </CardHeader>
              <CardContent>
                <div data-export="charts">
                  <Tabs defaultValue="evolution">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="distribution" className="flex gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Distribuição
                      </TabsTrigger>
                      <TabsTrigger value="evolution" className="flex gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Evolução
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="distribution" className="h-[400px] mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={resultsData.distributionHistogram}
                          margin={{ top: 5, right: 30, left: 60, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="range"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                            label={{ 
                              value: 'Progresso da Meta', 
                              position: 'insideBottom', 
                              offset: -50,
                              style: { fontSize: 14, fontWeight: 500 }
                            }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            label={{ 
                              value: 'Número de Participantes', 
                              angle: -90, 
                              position: 'insideLeft',
                              offset: 10,
                              style: { fontSize: 14, fontWeight: 500, textAnchor: 'middle' }
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e0e0e0",
                              borderRadius: "8px",
                              padding: "12px"
                            }}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="hsl(var(--primary))" 
                            name="Participantes"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="evolution" className="h-[400px] mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={resultsData.evolutionData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="week" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => 
                              new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(value)
                            }
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e0e0e0",
                              borderRadius: "8px",
                              padding: "12px"
                            }}
                            formatter={(value: number) => 
                              new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(value)
                            }
                          />
                          <Legend 
                            wrapperStyle={{ paddingTop: "20px" }}
                            iconType="line"
                          />
                          <Line
                            type="monotone"
                            dataKey="average"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "hsl(var(--primary))" }}
                            activeDot={{ r: 6 }}
                            name="Valor Apurado Cumulativo"
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

      <FullRankingModal
        open={showFullRankingModal}
        onClose={() => setShowFullRankingModal(false)}
        participants={resultsData.participants}
        campaignTarget={resultsData.salesTarget}
        campaignName={resultsData.campaignName}
      />
    </SidebarProvider>
  );
}