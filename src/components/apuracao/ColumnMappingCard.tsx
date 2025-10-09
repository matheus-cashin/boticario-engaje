import { useState } from "react";
import { Edit2, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBar } from "./ConfidenceBar";
import { motion, AnimatePresence } from "framer-motion";

interface ColumnMappingCardProps {
  columnNumber: number;
  originalName: string;
  suggestedField: string;
  confidence: number;
  dataType: string;
  validated: boolean;
  onEdit: () => void;
}

export function ColumnMappingCard({
  columnNumber,
  originalName,
  suggestedField,
  confidence,
  dataType,
  validated,
  onEdit,
}: ColumnMappingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDataTypeColor = () => {
    const colors: Record<string, string> = {
      string: "bg-blue-100 text-blue-800",
      email: "bg-purple-100 text-purple-800",
      phone: "bg-green-100 text-green-800",
      percentage: "bg-orange-100 text-orange-800",
      currency: "bg-yellow-100 text-yellow-800",
      date: "bg-pink-100 text-pink-800",
      number: "bg-gray-100 text-gray-800",
    };
    return colors[dataType] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
              {columnNumber}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-gray-900">{originalName}</p>
                {confidence < 70 && !validated && (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                {validated && <CheckCircle className="h-4 w-4 text-green-600" />}
              </div>
              <p className="text-sm text-gray-600 font-mono">{suggestedField}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={getDataTypeColor()}>
              {dataType}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t space-y-3">
                <ConfidenceBar confidence={confidence} />
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar Mapeamento
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
