import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

interface ProductSales {
  productName: string;
  quantity: number;
  totalAmount: number;
  category?: string;
}

interface ProductSalesChartProps {
  data: ProductSales[];
}

export function ProductSalesChart({ data }: ProductSalesChartProps) {
  const topProducts = data.slice(0, 10);
  const maxAmount = Math.max(...topProducts.map(p => p.totalAmount));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Saída de Produtos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum produto vendido ainda
            </p>
          ) : (
            topProducts.map((product, index) => {
              const percentage = (product.totalAmount / maxAmount) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.productName}</p>
                      {product.category && (
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(product.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.quantity} un.
                      </p>
                    </div>
                  </div>
                  <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
