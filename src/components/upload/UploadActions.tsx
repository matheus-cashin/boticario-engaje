
import { Button } from "@/components/ui/button";

interface UploadActionsProps {
  selectedFile: File | null;
  isUploading: boolean;
  onUpload: () => void;
  onClose: () => void;
}

export function UploadActions({ selectedFile, isUploading, onUpload, onClose }: UploadActionsProps) {
  return (
    <div className="flex justify-end space-x-3">
      <Button variant="outline" onClick={onClose} disabled={isUploading}>
        Cancelar
      </Button>
      <Button onClick={onUpload} disabled={!selectedFile || isUploading}>
        {isUploading ? "Enviando..." : "Fazer Upload"}
      </Button>
    </div>
  );
}
