import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, Maximize2 } from "lucide-react";

const SalesChart = () => {
  // Mock data for the bars
  const data = Array.from({ length: 60 }, (_, i) => ({
    value: Math.random() * 100,
    isRecord: i > 45,
    needsCorrection: i < 15,
  }));

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card className="p-6 rounded-3xl shadow-card col-span-2">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Sales Performance</h3>
          <p className="text-sm text-muted-foreground">Daily tracking overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-end gap-[2px] h-48 mb-4">
        {data.map((item, index) => (
          <div
            key={index}
            className={`flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80 ${
              item.isRecord
                ? 'bg-success'
                : item.needsCorrection
                ? 'bg-warning'
                : 'bg-muted'
            }`}
            style={{ height: `${(item.value / maxValue) * 100}%` }}
          />
        ))}
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-success" />
          <span className="text-muted-foreground">New Record</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-warning" />
          <span className="text-muted-foreground">Correction Needed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span className="text-muted-foreground">Rate</span>
        </div>
      </div>
    </Card>
  );
};

export default SalesChart;
