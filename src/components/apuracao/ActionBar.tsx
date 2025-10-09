import { useState, useEffect } from "react";
import { Download, CreditCard, Send, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

interface ActionBarProps {
  onExport: (format: "pdf" | "excel" | "csv") => void;
  onProcessPayments: () => void;
  onSendCommunications: () => void;
  onViewAll: () => void;
}

export function ActionBar({
  onExport,
  onProcessPayments,
  onSendCommunications,
  onViewAll,
}: ActionBarProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isSticky && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-md"
        >
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">GOL DE OURO</h2>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white z-50">
                  <DropdownMenuItem onClick={() => onExport("pdf")}>
                    Exportar como PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport("excel")}>
                    Exportar como Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport("csv")}>
                    Exportar como CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                className="gap-2 text-orange-600 hover:bg-orange-50"
                onClick={onProcessPayments}
              >
                <CreditCard className="h-4 w-4" />
                Processar Pagamentos
              </Button>

              <Button className="gap-2" onClick={onSendCommunications}>
                <Send className="h-4 w-4" />
                Enviar Comunicações
              </Button>

              <Button variant="outline" className="gap-2" onClick={onViewAll}>
                <Users className="h-4 w-4" />
                Ver Todos
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
