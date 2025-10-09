
import { Clock, FileCheck, AlertTriangle } from "lucide-react";
import { RuleRawRecord } from "@/types/rules";

interface RuleStatusProps {
  currentRuleRecord: RuleRawRecord | null;
}

export function RuleStatus({ currentRuleRecord }: RuleStatusProps) {
  if (!currentRuleRecord) return null;

  const getStatusIcon = () => {
    switch (currentRuleRecord.processing_status) {
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <FileCheck className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (currentRuleRecord.processing_status) {
      case 'pending':
        return 'Aguardando processamento';
      case 'processing':
        return 'Processando...';
      case 'completed':
        return 'Processado com sucesso';
      case 'failed':
        return `Falha no processamento (${currentRuleRecord.retry_count} tentativas)`;
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        {new Date(currentRuleRecord.upload_date).toLocaleString()}
      </div>
    </div>
  );
}
