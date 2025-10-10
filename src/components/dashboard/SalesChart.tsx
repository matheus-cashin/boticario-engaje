import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Maximize2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

const data = [
  { month: 'Jan', totalRevenue: 35000, campaignRevenue: 18000, engagement: 40 },
  { month: 'Feb', totalRevenue: 52000, campaignRevenue: 28000, engagement: 45 },
  { month: 'Mar', totalRevenue: 30000, campaignRevenue: 8000, engagement: 15 },
  { month: 'Apr', totalRevenue: 25000, campaignRevenue: 5000, engagement: 10 },
  { month: 'May', totalRevenue: 45000, campaignRevenue: 22000, engagement: 50 },
  { month: 'Jun', totalRevenue: 68000, campaignRevenue: 38000, engagement: 65 },
  { month: 'Jul', totalRevenue: 40000, campaignRevenue: 15000, engagement: 28 },
  { month: 'Aug', totalRevenue: 48000, campaignRevenue: 25000, engagement: 48 },
  { month: 'Sep', totalRevenue: 60000, campaignRevenue: 40000, engagement: 70 },
  { month: 'Oct', totalRevenue: 58000, campaignRevenue: 35000, engagement: 52 },
  { month: 'Nov', totalRevenue: 45000, campaignRevenue: 20000, engagement: 35 },
  { month: 'Dec', totalRevenue: 75000, campaignRevenue: 45000, engagement: 95 },
];

export function SalesChart() {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">Vendas</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">R$238.032,00</span>
            <span className="text-sm text-green-600">↑ 5% vs ano passado</span>
          </div>
          <p className="text-sm text-muted-foreground">Volume de vendas</p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Faturamento Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-900" />
            <span className="text-muted-foreground">Faturamento das Campanhas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-cyan-400" />
            <span className="text-muted-foreground">Engajamento da campanha</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="totalRevenue" 
              stroke="#eab308" 
              strokeWidth={3}
              dot={{ fill: "#eab308", r: 4 }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="campaignRevenue" 
              stroke="#1e3a8a" 
              strokeWidth={3}
              dot={{ fill: "#1e3a8a", r: 4 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="engagement" 
              stroke="#22d3ee" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#22d3ee", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
