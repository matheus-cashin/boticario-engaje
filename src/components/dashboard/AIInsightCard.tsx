import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function AIInsightCard() {
  return (
    <Card className="bg-pink-50 border-pink-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-pink-900 mb-2">
              Insight de Performance
            </h3>
            <p className="text-pink-800 leading-relaxed">
              Com base na análise das últimas campanhas, vendedores que focaram em produtos de maior margem (Categoria Premium) apresentaram um crescimento de 34% no atingimento de metas. Recomendamos direcionar o time para produtos com ticket médio acima de R$ 500, especialmente nas regiões Sul e Sudeste, onde a conversão está 28% acima da média nacional.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
