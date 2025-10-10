import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Mail, Phone, Percent, Copy, Lightbulb, AlertTriangle } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { ValidationCard } from "@/components/apuracao/ValidationCard";
import { AnomalyCard } from "@/components/apuracao/AnomalyCard";
import { ValidationSkeleton } from "@/components/apuracao/ValidationSkeleton";
import { useValidationData } from "@/hooks/useValidationData";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Validate() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { data: validationData, isLoading } = useValidationData(fileId || "1");
  const [anomalyActions, setAnomalyActions] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAnomalyAction = (anomalyId: string, action: string) => {
    setAnomalyActions(prev => ({ ...prev, [anomalyId]: action }));
  };

  const hasCriticalErrors = validationData?.anomalies.some(
    a => a.type === "outlier_negative" && !anomalyActions[a.id]
  );

  const handleProcessData = async () => {
    if (!fileId) return;

    setIsProcessing(true);
    try {
      toast({
        title: "Processando dados...",
        description: "Aguarde enquanto processamos a planilha",
      });

      const { data, error } = await supabase.functions.invoke('process-validation-data', {
        body: { fileId, anomalyActions }
      });

      if (error) throw error;

      toast({
        title: "✅ Apuração concluída com sucesso!",
        description: (
          <div className="space-y-1">
            <p>📊 {data.processed.participants} participante(s) • {data.processed.sales} venda(s)</p>
            <p>💰 Total: R$ {data.processed.totalAmount?.toFixed(2)}</p>
            {data.processed.ranking?.topSeller && (
              <p>🏆 Líder: {data.processed.ranking.topSeller} - R$ {data.processed.ranking.topAmount?.toFixed(2)}</p>
            )}
          </div>
        ),
      });

      // Navegar para relatórios se houver scheduleId
      if (data.processed.scheduleId) {
        navigate(`/reports/${data.processed.scheduleId}`);
      } else {
        navigate('/apuracao');
      }
    } catch (error) {
      console.error('Error processing data:', error);
      toast({
        title: "Erro ao processar dados",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <ValidationSkeleton />
        </div>
      </div>
    );
  }

  if (!validationData) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button 
              onClick={() => navigate("/apuracao")}
              className="hover:text-gray-900 transition-colors"
            >
              Home
            </button>
            <span>›</span>
            <button 
              onClick={() => navigate(`/apuracao/analyze/${fileId}`)}
              className="hover:text-gray-900 transition-colors"
            >
              Análise
            </button>
            <span>›</span>
            <span className="text-gray-900 font-medium">Validação</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(`/apuracao/analyze/${fileId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Validação de Dados</h1>
              <p className="text-gray-600 mt-1">Análise de qualidade e consistência</p>
            </div>
          </div>
        </div>

        {/* Total de registros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total de Registros Processados</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {validationData.totalRecords}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grid de Validações */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Validações Automáticas</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <ValidationCard
                icon={Mail}
                title="Validação de Emails"
                total={validationData.emailValidation.total}
                valid={validationData.emailValidation.valid}
                errors={validationData.emailValidation.invalid}
                iconColor="text-purple-600"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <ValidationCard
                icon={Phone}
                title="Validação de Telefones"
                total={validationData.phoneValidation.total}
                valid={validationData.phoneValidation.valid}
                errors={validationData.phoneValidation.invalid}
                iconColor="text-green-600"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Copy className="h-5 w-5 text-blue-600" />
                    Validação de CPFs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      {validationData.cpfValidation.provided
                        ? `${validationData.cpfValidation.valid}/${validationData.cpfValidation.total} válidos`
                        : "Não fornecidos (opcional)"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <ValidationCard
                icon={Percent}
                title="Validação de Percentuais"
                total={validationData.percentageValidation.total}
                valid={validationData.percentageValidation.total - validationData.percentageValidation.anomalousCount}
                errors={validationData.percentageValidation.anomalies}
                iconColor="text-orange-600"
              />
            </motion.div>
          </div>
        </div>

        {/* Anomalias Detectadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Anomalias Detectadas
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  {validationData.anomalies.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {validationData.anomalies.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-gray-900">Nenhuma anomalia detectada!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Todos os dados estão dentro dos padrões esperados
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {validationData.anomalies.map((anomaly, index) => (
                    <motion.div
                      key={anomaly.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <AnomalyCard
                        {...anomaly}
                        onAction={(action) => handleAnomalyAction(anomaly.id, action)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Duplicatas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5 text-blue-600" />
                Verificação de Duplicatas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {validationData.duplicates.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Nenhuma duplicata encontrada
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {validationData.duplicates.map((dup, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="font-medium">
                        Campo: {dup.field} - Valor: {dup.value}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {dup.participants.length} participantes duplicados
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sugestões da IA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-blue-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                Sugestões da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {validationData.suggestions.map((suggestion, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            variant="outline"
            onClick={() => navigate(`/apuracao/analyze/${fileId}`)}
          >
            Voltar para Análise
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    size="lg"
                    disabled={hasCriticalErrors || isProcessing}
                    onClick={handleProcessData}
                  >
                    {isProcessing ? "Processando..." : "Processar Dados"}
                  </Button>
                </div>
              </TooltipTrigger>
              {hasCriticalErrors && (
                <TooltipContent className="bg-white">
                  <p>Resolva todas as anomalias críticas antes de processar</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
