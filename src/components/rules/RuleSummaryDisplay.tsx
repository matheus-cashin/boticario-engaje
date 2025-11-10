import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, Users, Package, AlertCircle, Award } from "lucide-react";

interface RuleSummaryDisplayProps {
  ruleJson: any;
}

export function RuleSummaryDisplay({ ruleJson }: RuleSummaryDisplayProps) {
  // Função para garantir que qualquer valor seja convertido em string renderizável
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return '';
    
    // Se for um objeto com name e multiplier (padrão comum)
    if (typeof value === 'object' && !Array.isArray(value)) {
      const { name, multiplier } = value as any;
      if (name !== undefined || multiplier !== undefined) {
        const parts = [];
        if (name) parts.push(String(name));
        if (multiplier) parts.push(`(${multiplier}x)`);
        return parts.join(' ');
      }
      // Se for outro tipo de objeto, tentar converter para string legível
      try {
        return JSON.stringify(value);
      } catch {
        return '[objeto]';
      }
    }
    
    // Se for array
    if (Array.isArray(value)) {
      return value.map(v => safeRender(v)).join(', ');
    }
    
    // Qualquer outro tipo, converter para string
    return String(value);
  };

  // Se houver erro de parse, mostrar o texto bruto
  if (ruleJson?.parse_error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Regra em formato texto</span>
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">
          {ruleJson.raw_analysis}
        </div>
      </div>
    );
  }

  const getRuleTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'meta_progressiva': 'Meta Progressiva',
      'meta_fixa': 'Meta Fixa',
      'bonus_condicional': 'Bônus Condicional',
      'pontos_por_produto': 'Pontos por Produto'
    };
    return types[type] || type;
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-4">
      {/* Tipo de Regra */}
      {ruleJson.rule_type && (
        <div>
          <Badge variant="secondary" className="text-sm">
            {getRuleTypeLabel(ruleJson.rule_type)}
          </Badge>
        </div>
      )}

      {/* Período da Campanha */}
      {ruleJson.campaign_period && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">Período da Campanha</p>
              <p className="text-sm text-blue-700">
                {formatDate(ruleJson.campaign_period.start_date)} até {formatDate(ruleJson.campaign_period.end_date)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Período de Avaliação */}
      {ruleJson.evaluation_period && (
        <Card className="p-3 bg-purple-50 border-purple-200">
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900 mb-1">Período de Avaliação</p>
              <p className="text-sm text-purple-700">
                {safeRender(ruleJson.evaluation_period.type)}
                {ruleJson.evaluation_period.report_day && ` - ${safeRender(ruleJson.evaluation_period.report_day)}`}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Metas */}
      {ruleJson.targets && ruleJson.targets.length > 0 && (
        <Card className="p-3 bg-green-50 border-green-200">
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 mb-2">Metas e Recompensas</p>
              <div className="space-y-3">
                {ruleJson.targets.map((target: any, index: number) => (
                  <div key={index} className="pl-3 border-l-2 border-green-300">
                    <p className="text-sm font-medium text-green-800">{safeRender(target.name)}</p>
                    <p className="text-xs text-green-600 mt-1">
                      Métrica: {safeRender(target.metric)}
                    </p>
                    {target.conditions && target.conditions.length > 0 && (
                      <div className="mt-2 space-y-1">
                    {target.conditions.map((condition: any, condIndex: number) => {
                      const op = safeRender(condition?.operator);
                      const formatVal = (v: any) => {
                        if (v && typeof v === "object") {
                          const name = (v as any).name;
                          const mult = (v as any).multiplier;
                          if (name || mult) {
                            return `${name ?? ""}${mult ? ` (${mult}x)` : ""}`.trim();
                          }
                          return JSON.stringify(v);
                        }
                        return String(v ?? "");
                      };
                      const val = formatVal(condition?.value);
                      const valMax = condition?.value_max ? formatVal(condition.value_max) : "";

                      let rewardDisplay: string | null = null;
                      const reward = condition?.reward;
                      if (reward) {
                        if (typeof reward === "object" && reward !== null) {
                          const amount = (reward as any).amount;
                          const type = (reward as any).type;
                          const name = (reward as any).name;
                          const mult = (reward as any).multiplier;
                          if (amount !== undefined) {
                            rewardDisplay = `Prêmio: R$ ${amount}${type === "Percentual" ? "%" : type === "Por Ponto" ? " por ponto" : ""}`;
                          } else if (name || mult) {
                            rewardDisplay = `Prêmio: ${name ?? ""}${mult ? ` (${mult}x)` : ""}`.trim();
                          } else {
                            rewardDisplay = `Prêmio: ${formatVal(reward)}`;
                          }
                        } else {
                          rewardDisplay = `Prêmio: ${String(reward)}`;
                        }
                      }

                      // Formatar descrição da condição em linguagem natural
                      let conditionText = '';
                      if (valMax) {
                        conditionText = `${op} ${val} até ${valMax}`;
                      } else {
                        conditionText = `${op} ${val}`;
                      }

                      return (
                        <div key={condIndex} className="text-xs text-green-700 bg-white/50 p-2 rounded">
                          <span className="font-medium">
                            {safeRender(condition.type)}:
                          </span>{' '}
                          {conditionText}
                          {rewardDisplay && (
                            <span className="ml-2 text-green-800">→ {rewardDisplay}</span>
                          )}
                        </div>
                      );
                    })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Ranking */}
      {ruleJson.ranking_config?.enabled && (
        <Card className="p-3 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 mb-1">Configuração de Ranking</p>
              <p className="text-sm text-amber-700">
                Frequência: {safeRender(ruleJson.ranking_config.frequency) || '-'}
              </p>
              {ruleJson.ranking_config.top_positions && (
                <p className="text-sm text-amber-700">
                  Top {safeRender(ruleJson.ranking_config.top_positions)} posições premiadas
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Grupos Elegíveis */}
      {ruleJson.eligible_groups && ruleJson.eligible_groups.length > 0 && (
        <Card className="p-3 bg-indigo-50 border-indigo-200">
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-indigo-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-900 mb-1">Grupos Elegíveis</p>
              <div className="flex flex-wrap gap-1">
                {ruleJson.eligible_groups.map((group: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs text-indigo-700 border-indigo-300">
                    {safeRender(group)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Produtos Excluídos */}
      {ruleJson.excluded_products && ruleJson.excluded_products.length > 0 && (
        <Card className="p-3 bg-red-50 border-red-200">
          <div className="flex items-start gap-2">
            <Package className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 mb-1">Produtos Excluídos</p>
              <div className="flex flex-wrap gap-1">
                {ruleJson.excluded_products.map((product: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs text-red-700 border-red-300">
                    {safeRender(product)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Produtos (para regras de pontos por produto) */}
      {ruleJson.products && Object.keys(ruleJson.products).length > 0 && (
        <Card className="p-3 bg-teal-50 border-teal-200">
          <div className="flex items-start gap-2">
            <Package className="h-4 w-4 text-teal-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-teal-900 mb-2">Produtos e Pontuações</p>
              <div className="space-y-1 text-xs text-teal-700">
                {Object.entries(ruleJson.products).map(([product, points], index) => {
                  const displayPoints = typeof points === 'object' && points !== null 
                    ? `${(points as any).name || ''} (${(points as any).multiplier || 1}x)`.trim()
                    : String(points);
                  
                  return (
                    <div key={index} className="flex justify-between bg-white/50 p-2 rounded">
                      <span>{product}</span>
                      <span className="font-medium">{displayPoints} pontos</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Regras Especiais */}
      {ruleJson.special_rules && Object.keys(ruleJson.special_rules).length > 0 && (
        <Card className="p-3 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900 mb-1">Regras Especiais</p>
              <div className="text-xs text-orange-700 space-y-1">
                {Object.entries(ruleJson.special_rules).map(([key, value], index) => (
                  <div key={index}>
                    <span className="font-medium">{safeRender(key)}:</span> {safeRender(value)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
