import { FileText, Users, ChevronRight, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface CampaignCardProps {
  id: string;
  name: string;
  campaignName: string;
  uploadDate: string;
  status: "Processada" | "Em análise" | "Rascunho";
  participants: number;
  onClick: () => void;
  onDelete?: (id: string) => void;
  index: number;
}

export function CampaignCard({
  id,
  name,
  campaignName,
  uploadDate,
  status,
  participants,
  onClick,
  onDelete,
  index,
}: CampaignCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "Processada":
        return { className: "bg-green-100 text-green-800", label: "Processada" };
      case "Em análise":
        return { className: "bg-blue-100 text-blue-800", label: "Em análise" };
      case "Rascunho":
        return { className: "bg-yellow-100 text-yellow-800", label: "Rascunho" };
    }
  };

  const statusConfig = getStatusConfig();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group relative"
        onClick={onClick}
      >
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle className="text-lg truncate cursor-default">{name}</CardTitle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <span className="text-sm text-gray-600">Campanha</span>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                TODAS
              </Badge>
              <Badge variant="outline" className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
              <span className="font-medium text-gray-900">{campaignName}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Data de upload</span>
            <span className="font-medium">
              {new Date(uploadDate).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Participantes</span>
            </div>
            <span className="font-semibold text-gray-900">{participants}</span>
          </div>
          <div className="pt-2 border-t flex items-center justify-end text-blue-600 group-hover:text-blue-700">
            <span className="text-sm font-medium">Abrir campanha</span>
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
