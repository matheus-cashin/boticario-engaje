import Navigation from "@/components/Navigation";
import MetricCard from "@/components/MetricCard";
import SalesChart from "@/components/SalesChart";
import SalesTargetCard from "@/components/SalesTargetCard";
import MonthlyGrid from "@/components/MonthlyGrid";
import MiniChart from "@/components/MiniChart";
import { ArrowUpRight, TrendingUp, Package, Send, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-[1600px] mx-auto px-6 pt-24 pb-12">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Hi Balan, this month<br />
                stores have sold
              </h1>
              <p className="text-5xl font-bold bg-gradient-to-r from-warning to-success bg-clip-text text-transparent">
                $ 331,224.74
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
                Today
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
                Week
              </Button>
              <Button variant="default" size="sm" className="rounded-full">
                Month
              </Button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Sales Chart - Takes 2 columns */}
          <SalesChart />
          
          {/* Right Column - Monthly Grid */}
          <MonthlyGrid />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Average item per sale"
            value="3.7"
            subtitle="unit"
            trend="up"
          />
          
          <Card className="p-6 rounded-3xl shadow-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Gross Profit</p>
                <p className="text-2xl font-bold">$14,332.23</p>
                <p className="text-xs text-success mt-1">more than the last month</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <MiniChart color="success" />
          </Card>

          <MetricCard
            title="Average sale value"
            value="$ 177,340.50"
            subtitle="$ 0.25 was less than last month"
          />

          <Card className="p-6 rounded-3xl shadow-card bg-muted/30 border-none">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Transfer</p>
                <p className="text-xl font-bold">Juniors waiting</p>
                <p className="text-xs text-muted-foreground mt-1">to be delivered</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold mt-4">04</p>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Target - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <SalesTargetCard />
            
            <Card className="p-6 rounded-3xl shadow-card overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-info/20 to-transparent rounded-full blur-2xl" />
              <div className="relative flex items-center gap-6">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-info/30 to-info/10 flex items-center justify-center">
                  <Package className="h-10 w-10 text-info" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">Learn how to receive deliveries</h3>
                  <p className="text-sm text-muted-foreground">Stock Consumables you order accurately manage your inventory</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowUpRight className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column Cards */}
          <div className="space-y-6">
            <Card className="p-6 rounded-3xl shadow-card bg-muted/30 border-none">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Dispatched Orders</p>
                  <p className="text-sm font-medium">Dispatched orders waiting</p>
                  <p className="text-xs text-muted-foreground mt-1">to be delivered</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold mt-4">01</p>
            </Card>

            <Card className="p-6 rounded-3xl shadow-card bg-muted/30 border-none">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Send Orders</p>
                  <p className="text-sm font-medium">Send orders waiting</p>
                  <p className="text-xs text-muted-foreground mt-1">to be delivered</p>
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

export default Index;
