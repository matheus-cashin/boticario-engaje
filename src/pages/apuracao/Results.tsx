import { useParams, useNavigate } from "react-router-dom";
import { Users, Award, TrendingUp, UserX, Activity, Target, Coins } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { MetricCardAnimated } from "@/components/apuracao/MetricCardAnimated";
import { LevelDistributionCard } from "@/components/apuracao/LevelDistributionCard";
import { TopPerformerItem } from "@/components/apuracao/TopPerformerItem";
import { ActionBar } from "@/components/apuracao/ActionBar";
import { ResultsSkeleton } from "@/components/apuracao/ResultsSkeleton";
import { useResultsData } from "@/hooks/useResultsData";
import { useToast } from "@/hooks/use-toast";

export default function Results() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { data: resultsData, isLoading, error } = useResultsData(campaignId || "");
  const { toast } = useToast();

  const handleExport = (format: "pdf" | "excel" | "csv") => {
    toast({
      title: "Exportando relatório",
      description: `Preparando arquivo ${format.toUpperCase()}...`,
    });
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

  const handleViewAll = () => {
    toast({
      title: "Ver Todos Participantes",
      description: "Esta funcionalidade será implementada em breve",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <ResultsSkeleton />
        </div>
      </div>
    );
  }

  if (error || !resultsData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Não foram encontrados dados de resultados para esta campanha.
              </p>
              <Button 
                onClick={() => navigate("/apuracao")} 
                variant="outline" 
                className="mt-4"
              >
                Voltar para Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const topPerformers = resultsData.participants.slice(0, 10).map((p) => ({
    id: p.id,
    name: p.name,
    averagePerformance:
      (p.achievementBrazil + p.achievementDivision + p.achievementIndividual) / 3,
    cashins: p.cashins,
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <ActionBar
        onExport={handleExport}
        onProcessPayments={handleProcessPayments}
        onSendCommunications={handleSendCommunications}
        onViewAll={handleViewAll}
      />

      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button
                onClick={() => navigate("/apuracao")}
                className="hover:text-gray-900 transition-colors"
              >
                Home
              </button>
              <span>›</span>
              <span className="text-gray-900 font-medium">Resultados</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold text-gray-900">
                    {resultsData.campaignName}
                  </h1>
                  <Badge className="bg-green-100 text-green-800">
                    {resultsData.status === "processed" ? "Processada" : "Processando"}
                  </Badge>
                </div>
                <p className="text-gray-600 mt-2">
                  Processado em {new Date(resultsData.processDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </div>

          {/* Grid de Métricas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCardAnimated
              icon={Users}
              label="Total de Participantes"
              value={resultsData.metrics.totalParticipants}
              color="bg-blue-500"
              index={0}
            />
            <MetricCardAnimated
              icon={Target}
              label="Metas Atingidas"
              value={resultsData.metrics.metasAtingidas}
              color="bg-green-500"
              index={1}
            />
            <MetricCardAnimated
              icon={TrendingUp}
              label="Participantes >100%"
              value={resultsData.metrics.participantesAcima100}
              color="bg-purple-500"
              index={2}
            />
            <MetricCardAnimated
              icon={Coins}
              label="Total Cashins"
              value={resultsData.metrics.totalCashins}
              format="currency"
              color="bg-orange-500"
              index={3}
            />
            <MetricCardAnimated
              icon={Activity}
              label="Taxa de Engajamento"
              value={resultsData.metrics.taxaEngajamento}
              format="percentage"
              color="bg-pink-500"
              index={4}
            />
            <MetricCardAnimated
              icon={UserX}
              label="Não Qualificados"
              value={resultsData.metrics.naoQualificados}
              color="bg-gray-500"
              index={5}
            />
          </div>

          {/* Distribuição por Nível */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Distribuição por Nível
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {resultsData.levelDistribution.map((level, index) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <LevelDistributionCard {...level} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Top 10 Performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-500" />
                  Top 10 Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <TopPerformerItem
                    key={performer.id}
                    rank={index + 1}
                    name={performer.name}
                    averagePerformance={performer.averagePerformance}
                    cashins={performer.cashins}
                    onClick={() => navigate(`/apuracao/participant/${performer.id}`)}
                    index={index}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráficos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Análise Detalhada</CardTitle>
              </CardHeader>
              <CardContent>
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
                        <Bar dataKey="count" fill="#3b82f6" name="Participantes" />
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
                        />
                        <Line
                          type="monotone"
                          dataKey="average"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          name="Performance Média (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
