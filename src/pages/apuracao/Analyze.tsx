import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, ArrowRight, CheckCircle, Calendar, Tag, FileText, Brain, Layers, AlertTriangle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ColumnMappingCard } from "@/components/apuracao/ColumnMappingCard";
import { EditMappingModal } from "@/components/apuracao/EditMappingModal";
import { AnalyzeSkeleton } from "@/components/apuracao/AnalyzeSkeleton";
import { useAnalysisData } from "@/hooks/useAnalysisData";

export default function Analyze() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { data: analysisData, isLoading, refetch } = useAnalysisData(fileId || "1");
  
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [mappings, setMappings] = useState(analysisData?.columnMappings || []);

  useEffect(() => {
    if (analysisData?.columnMappings) {
      setMappings(analysisData.columnMappings);
    }
  }, [analysisData]);

  const handleEdit = (columnNumber: number) => {
    setEditingColumn(columnNumber);
  };

  const handleSaveEdit = (field: string, dataType: string, ignore: boolean) => {
    setMappings(prev =>
      prev.map(m =>
        m.columnNumber === editingColumn
          ? { ...m, suggestedField: field, dataType, validated: true }
          : m
      )
    );
  };

  const handleReprocess = () => {
    refetch();
  };

  const handleConfirm = () => {
    navigate(`/apuracao/validate/${fileId}`);
  };

  const handleViewReport = () => {
    if (analysisData?.campaignId) {
      navigate(`/reports/${analysisData.campaignId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <AnalyzeSkeleton />
        </div>
      </div>
    );
  }

  if (!analysisData) return null;

  const editingMapping = mappings.find(m => m.columnNumber === editingColumn);

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
            <span className="text-gray-900 font-medium">Análise</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/apuracao")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">{analysisData.fileName}</h1>
                  <Badge className="bg-blue-100 text-blue-800">Analisando</Badge>
                </div>
                <p className="text-gray-600 mt-1">Análise inteligente do arquivo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de Validação de Regras */}
        {analysisData.ruleValidation && !analysisData.ruleValidation.hasValidRules && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900 mb-1">Regras da Campanha Não Definidas</h3>
                    <p className="text-sm text-yellow-800 mb-3">
                      {analysisData.ruleValidation.message}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white hover:bg-yellow-50"
                      onClick={() => navigate(`/campaigns`)}
                    >
                      Ir para Campanhas e Definir Regras
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Estrutura Detectada e Metadados */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Estrutura Detectada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Cabeçalho</p>
                    <p className="font-semibold">{analysisData.structure.headerType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Participantes</p>
                    <p className="font-semibold">{analysisData.structure.totalParticipants}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Colunas de Dados</p>
                    <p className="font-semibold">{analysisData.structure.totalColumns}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Níveis de Meta Detectados</p>
                    <div className="flex flex-wrap gap-2">
                      {analysisData.structure.metaLevels.map((level) => (
                        <Badge key={level} variant="outline" className="bg-green-50 text-green-700">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Metadados da Campanha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Nome da Campanha</p>
                  <p className="font-semibold text-lg">{analysisData.metadata.campaignName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Período</p>
                  <p className="font-semibold">{analysisData.metadata.period}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo de Campanha</p>
                  <Badge className="bg-purple-100 text-purple-800">
                    {analysisData.metadata.campaignType}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Mapeamento de Colunas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Mapeamento de Colunas (IA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mappings.map((mapping, index) => (
                <motion.div
                  key={mapping.columnNumber}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ColumnMappingCard
                    {...mapping}
                    onEdit={() => handleEdit(mapping.columnNumber)}
                  />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pb-8">
          <Button variant="ghost" onClick={() => navigate("/apuracao")}>
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={handleViewReport}
              disabled={!analysisData?.campaignId}
            >
              <BarChart3 className="h-4 w-4" />
              Ver Report
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleReprocess}>
              <RefreshCw className="h-4 w-4" />
              Reprocessar
            </Button>
            <Button className="gap-2" onClick={handleConfirm}>
              Confirmar Mapeamento
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingMapping && (
        <EditMappingModal
          open={editingColumn !== null}
          onClose={() => setEditingColumn(null)}
          columnName={editingMapping.originalName}
          currentField={editingMapping.suggestedField}
          currentDataType={editingMapping.dataType}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
