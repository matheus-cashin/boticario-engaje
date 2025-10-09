import { LucideIcon, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ValidationError {
  line: number;
  participantName: string;
  field: string;
  value: string;
  error: string;
}

interface ValidationCardProps {
  icon: LucideIcon;
  title: string;
  total: number;
  valid: number;
  errors?: ValidationError[];
  iconColor?: string;
}

export function ValidationCard({
  icon: Icon,
  title,
  total,
  valid,
  errors = [],
  iconColor = "text-blue-600",
}: ValidationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasErrors = errors.length > 0;
  const invalid = total - valid;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  hasErrors
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }
              >
                {valid}/{total} válidos
              </Badge>
            </div>
          </div>

          {hasErrors && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full gap-2"
              >
                Ver {invalid} erro{invalid !== 1 ? "s" : ""}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-2"
                  >
                    {errors.map((error, index) => (
                      <div
                        key={index}
                        className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              Linha {error.line}: {error.participantName}
                            </p>
                            <p className="text-gray-600 mt-1">{error.error}</p>
                            <p className="text-xs text-gray-500 font-mono mt-1 bg-white px-2 py-1 rounded">
                              {error.value || "(vazio)"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
