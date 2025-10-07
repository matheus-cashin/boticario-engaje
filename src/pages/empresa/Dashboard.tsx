import Navigation from "@/components/Navigation";
import MetricCard from "@/components/MetricCard";
import SalesChart from "@/components/SalesChart";
import SalesTargetCard from "@/components/SalesTargetCard";
import MonthlyGrid from "@/components/MonthlyGrid";
import MiniChart from "@/components/MiniChart";
import { ArrowUpRight, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";

const Dashboard = () => {
  const { empresaId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-[1600px] mx-auto px-6 pt-24 pb-12">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Olá, este mês<br />
                as lojas venderam
              </h1>
              <p className="text-5xl font-bold bg-gradient-to-r from-warning to-success bg-clip-text text-transparent">
                R$ 331.224,74
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <SalesChart />
          <MonthlyGrid />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Média de itens por venda"
            value="3.7"
            subtitle="unidades"
            trend="up"
          />
          
          <Card className="p-6 rounded-3xl shadow-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Lucro Bruto</p>
                <p className="text-2xl font-bold">R$ 14.332,23</p>
                <p className="text-xs text-success mt-1">mais que o mês passado</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <MiniChart color="success" />
          </Card>

          <MetricCard
            title="Valor médio de venda"
            value="R$ 177.340,50"
            subtitle="R$ 0,25 a menos que o mês passado"
          />

          <Card className="p-6 rounded-3xl shadow-card bg-muted/30 border-none">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Transferências</p>
                <p className="text-xl font-bold">Aguardando</p>
                <p className="text-xs text-muted-foreground mt-1">para serem entregues</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold mt-4">04</p>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SalesTargetCard />
            
            <Card className="p-6 rounded-3xl shadow-card overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-info/20 to-transparent rounded-full blur-2xl" />
              <div className="relative flex items-center gap-6">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-info/30 to-info/10 flex items-center justify-center">
                  <Package className="h-10 w-10 text-info" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">Aprenda como receber entregas</h3>
                  <p className="text-sm text-muted-foreground">Gerencie seu estoque de consumíveis com precisão</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowUpRight className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 rounded-3xl shadow-card bg-muted/30 border-none">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Pedidos Despachados</p>
                  <p className="text-sm font-medium">Pedidos aguardando</p>
                  <p className="text-xs text-muted-foreground mt-1">para serem entregues</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold mt-4">01</p>
            </Card>

            <Card className="p-6 rounded-3xl shadow-card bg-muted/30 border-none">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Enviar Pedidos</p>
                  <p className="text-sm font-medium">Pedidos aguardando</p>
                  <p className="text-xs text-muted-foreground mt-1">para serem enviados</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold mt-4">07</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
