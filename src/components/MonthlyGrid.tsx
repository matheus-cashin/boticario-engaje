import { Card } from "@/components/ui/card";

const MonthlyGrid = () => {
  const months = [
    { name: "Oct", color: "bg-success/20 hover:bg-success/30" },
    { name: "Nov", color: "bg-success/30 hover:bg-success/40" },
    { name: "Dec", color: "bg-danger/20 hover:bg-danger/30" },
    { name: "Feb", color: "bg-success/20 hover:bg-success/30" },
    { name: "Mar", color: "bg-info/20 hover:bg-info/30" },
    { name: "Jan", color: "bg-muted hover:bg-muted/80" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sales this month</h3>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Show more +
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {months.map((month, index) => (
          <Card
            key={index}
            className={`p-6 rounded-2xl shadow-soft ${month.color} border-none transition-all duration-300 cursor-pointer hover:scale-105`}
          >
            <p className="text-lg font-semibold">{month.name}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 rounded-3xl shadow-card bg-muted/30 border-none">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Average item per sale</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold">3.1</p>
            <p className="text-sm text-muted-foreground mb-1">unit</p>
          </div>
          <p className="text-xs text-muted-foreground">$ 0.2 was less than last month</p>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyGrid;
