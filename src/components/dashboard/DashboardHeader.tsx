import { Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Visão Geral</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            1 Jan, 2023 - 30 Dec, 2023
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground">Acompanhe a performance das suas vendas</p>
    </div>
  );
}
