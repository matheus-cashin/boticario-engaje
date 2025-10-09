import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, ArrowRight, CheckCircle, Calendar, Tag, FileText, Brain, Layers, AlertTriangle, BarChart3 } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
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
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
            <div className="flex-1 p-8 bg-gray-50">
              <div className="max-w-7xl mx-auto">
                <AnalyzeSkeleton />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!analysisData) return null;

  const editingMapping = mappings.find(m => m.columnNumber === editingColumn);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Button variant="ghost" onClick={() => navigate("/apuracao")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <div className="flex-1 p-8 bg-gray-50">
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

              {/* Alert */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-700">Aviso</h3>
                      <p className="text-sm text-yellow-600">
                        O arquivo está sendo analisado. O processo pode levar alguns minutos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Data de Upload</h3>
                      <p className="text-sm text-gray-600">{analysisData.uploadDate || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Status</h3>
                      <p className="text-sm text-gray-600">{analysisData.status || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mapeamento de Colunas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Layers className="h-5 w-5 text-blue-600" />
                      <CardTitle>Mapeamento de Colunas</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleReprocess}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reprocessar
                      </Button>
                      <Button 
                        onClick={handleConfirm}
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar Mapeamento
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mappings.map((mapping) => (
                    <ColumnMappingCard
                      key={mapping.columnNumber}
                      {...mapping}
                      onEdit={handleEdit}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>

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
    </SidebarProvider>
  );
}
