import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function AIInsightCard() {
  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Insight de Performance
            </h3>
            <p className="text-sm leading-relaxed">
              Com base na análise das últimas campanhas, vendedores que focaram em produtos de maior margem (Categoria Premium) apresentaram um crescimento de 34% no atingimento de metas. Recomendamos direcionar o time para produtos com ticket médio acima de R$ 500, especialmente nas regiões Sul e Sudeste, onde a conversão está 28% acima da média nacional.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
