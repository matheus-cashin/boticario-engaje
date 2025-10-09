
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Download, FileSearch } from "lucide-react";

interface FileActionsDropdownProps {
  fileStatus: 'pending' | 'processing' | 'completed' | 'failed';
  creditStatus: string;
  isDownloading: boolean;
  onDownload: () => void;
  onDistribute: () => void;
  onDelete: () => void;
  onViewAnalysis?: () => void;
}

export function FileActionsDropdown({ 
  fileStatus, 
  creditStatus, 
  isDownloading, 
  onDownload, 
  onDistribute, 
  onDelete,
  onViewAnalysis
}: FileActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onViewAnalysis && (
          <DropdownMenuItem onClick={onViewAnalysis}>
            <FileSearch className="h-4 w-4 mr-2" />
            Ver análise
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onDownload} disabled={isDownloading}>
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? "Baixando..." : "Baixar arquivo"}
        </DropdownMenuItem>
        {fileStatus === 'completed' && creditStatus === 'Pendente' && (
          <DropdownMenuItem onClick={onDistribute}>
            Distribuir lote
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={onDelete}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir arquivo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
