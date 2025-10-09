
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileCheck, RefreshCw } from "lucide-react";
import { RuleRawRecord } from "@/types/rules";

interface RuleActionsProps {
  hasRules: boolean;
  isUploading: boolean;
  isRetrying: boolean;
  currentRuleRecord: RuleRawRecord | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, isCorrection: boolean) => void;
  onRetryProcessing: () => void;
  validateFile: (file: File) => boolean;
}

export function RuleActions({
  hasRules,
  isUploading,
  isRetrying,
  currentRuleRecord,
  onFileUpload,
  onRetryProcessing,
  validateFile
}: RuleActionsProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, isCorrection: boolean) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      onFileUpload(event, isCorrection);
    }
  };

  if (!hasRules) {
    return (
      <div className="flex-1">
        <label htmlFor="rules-upload" className="cursor-pointer">
          <Button 
            variant="outline" 
            className="w-full" 
            disabled={isUploading}
            asChild
          >
            <span>
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Processando..." : "Upload das Regras"}
            </span>
          </Button>
        </label>
        <Input
          id="rules-upload"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => handleFileChange(e, false)}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1">
        <label htmlFor="rules-correction" className="cursor-pointer">
          <Button 
            variant="outline" 
            className="w-full" 
            disabled={isUploading}
            asChild
          >
            <span>
              <FileCheck className="h-4 w-4 mr-2" />
              {isUploading ? "Processando..." : "Corrigir Regras"}
            </span>
          </Button>
        </label>
        <Input
          id="rules-correction"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => handleFileChange(e, true)}
          className="hidden"
        />
      </div>

      {currentRuleRecord?.processing_status === 'failed' && (
        <Button
          variant="outline"
          onClick={onRetryProcessing}
          disabled={isRetrying}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Reprocessando...' : 'Nova Tentativa'}</span>
        </Button>
      )}
    </>
  );
}
