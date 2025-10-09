import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface MetricCardAnimatedProps {
  icon: LucideIcon;
  label: string;
  value: number;
  format?: "number" | "currency" | "percentage";
  color: string;
  index: number;
}

export function MetricCardAnimated({
  icon: Icon,
  label,
  value,
  format = "number",
  color,
  index,
}: MetricCardAnimatedProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return `R$ ${val.toLocaleString("pt-BR")}`;
      case "percentage":
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString("pt-BR");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{label}</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatValue(displayValue)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
