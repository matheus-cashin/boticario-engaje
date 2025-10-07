import Navigation from "@/components/Navigation";
import PerformanceOverview from "@/components/PerformanceOverview";
import DistributionChart from "@/components/DistributionChart";
import EngagementCard from "@/components/EngagementCard";
import ComparisonChart from "@/components/ComparisonChart";
import { Target, Users, TrendingUp, DollarSign, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";

const Dashboard = () => {
  const { empresaId } = useParams();

  // Mock data - Em produção, virá da API
  const distributionData = [
    { label: "0-50%", value: 23, percentage: 15.3, color: "danger" },
    { label: "51-100%", value: 67, percentage: 44.7, color: "warning" },
    { label: "101-150%", value: 45, percentage: 30.0, color: "success" },
    { label: ">150%", value: 15, percentage: 10.0, color: "info" },
  ];

  const clusterData = [
    { name: "Região Sul", value: 92.4, percentage: 8.5, trend: "up" as const },
    { name: "Região Sudeste", value: 88.7, percentage: 5.2, trend: "up" as const },
    { name: "Região Centro-Oeste", value: 76.3, percentage: -2.1, trend: "down" as const },
  ];

  const cargoData = [
    { name: "Supervisores", value: 95.8, percentage: 12.3, trend: "up" as const, subtitle: "Alto desempenho" },
    { name: "Consultores", value: 87.2, percentage: 7.8, trend: "up" as const, subtitle: "Acima da média" },
    { name: "Assistentes", value: 72.5, percentage: 3.2, trend: "up" as const, subtitle: "Em crescimento" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-[1600px] mx-auto px-6 pt-24 pb-12">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Dashboard Engaje Analytics
              </h1>
              <p className="text-lg text-muted-foreground">
                Visão completa do desempenho e engajamento
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
                Hoje
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
                Semana
              </Button>
              <Button variant="default" size="sm" className="rounded-full">
                Mês
              </Button>
            </div>
          </div>
        </div>

        {/* Desempenho Geral */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PerformanceOverview />
          </div>
          <div>
            <DistributionChart 
              title="Distribuição de Atingimento" 
              data={distributionData}
            />
          </div>
        </div>

        {/* Engajamento com Campanhas */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Engajamento com Campanhas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EngagementCard
              title="Taxa de Elegibilidade"
              value={67.3}
              target={80}
              subtitle="atingiram critério mínimo"
              icon={Target}
              color="success"
            />
            <EngagementCard
              title="Penetração da Campanha"
              value={82.5}
              target={90}
              subtitle="vendedores impactados positivamente"
              icon={Users}
              color="info"
            />
            <EngagementCard
              title="ROI da Campanha"
              value={245}
              subtitle="retorno sobre investimento"
              icon={DollarSign}
              color="warning"
            />
          </div>
        </div>

        {/* Comparativos */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Análise Comparativa</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComparisonChart 
              title="Performance por Cluster" 
              data={clusterData}
            />
            <ComparisonChart 
              title="Performance por Cargo" 
              data={cargoData}
            />
          </div>
        </div>

        {/* Velocity Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl shadow-card bg-gradient-to-br from-success/10 via-background to-info/10 border border-border">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-success" />
                  Velocity Score
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tempo médio para atingir 100% da meta
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-success">18.5</p>
                <p className="text-sm text-muted-foreground">dias</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-card">
                <p className="text-xs text-muted-foreground mb-1">Melhor tempo</p>
                <p className="text-2xl font-bold text-success">12 dias</p>
              </div>
              <div className="p-4 rounded-2xl bg-card">
                <p className="text-xs text-muted-foreground mb-1">Média geral</p>
                <p className="text-2xl font-bold">18.5 dias</p>
              </div>
              <div className="p-4 rounded-2xl bg-card">
                <p className="text-xs text-muted-foreground mb-1">Mais lento</p>
                <p className="text-2xl font-bold text-danger">27 dias</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl shadow-card bg-gradient-to-br from-warning/10 to-success/10 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-warning/20">
                <Award className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Top Performers</h3>
                <p className="text-xs text-muted-foreground">Melhores da semana</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-card/50">
                <span className="font-medium">João Silva</span>
                <span className="text-success font-bold">185%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-card/50">
                <span className="font-medium">Maria Santos</span>
                <span className="text-success font-bold">167%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-card/50">
                <span className="font-medium">Pedro Costa</span>
                <span className="text-success font-bold">152%</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
