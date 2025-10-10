import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

const products = [
  { name: 'Malbec Eau de Parfum', value: 1250000, percentage: 80, class: 'A' },
  { name: 'Lily Eau de Toilette', value: 980000, percentage: 40, class: 'A' },
  { name: 'Egeo Dolce Desodorante Colônia', value: 720000, percentage: 30, class: 'A' },
  { name: 'Cuide-se Bem Creme Hidratante', value: 450000, percentage: 25, class: 'B' },
  { name: 'Malbec Base Líquida', value: 280000, percentage: 15, class: 'C' },
];

const classInfo = [
  { class: 'A', color: 'bg-green-500', percentage: '80%' },
  { class: 'B', color: 'bg-yellow-500', percentage: '15%' },
  { class: 'C', color: 'bg-red-500', percentage: '5%' },
];

export function ABCCurveCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Curva ABC de Produtos</CardTitle>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-6 text-sm">
          {classInfo.map((item) => (
            <div key={item.class} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${item.color}`} />
              <span className="text-muted-foreground">Classe {item.class}</span>
              <span className="font-semibold">{item.percentage}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{product.name}</span>
                <span className="text-muted-foreground">
                  R$ {product.value.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div 
                  className={`h-full transition-all ${
                    product.class === 'A' ? 'bg-green-500' : 
                    product.class === 'B' ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${product.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
          <span>R$ 0</span>
          <span>300k</span>
          <span>600k</span>
          <span>900k</span>
          <span>1.2M</span>
        </div>
      </CardContent>
    </Card>
  );
}
