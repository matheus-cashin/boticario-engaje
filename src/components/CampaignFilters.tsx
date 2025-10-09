
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface FilterValues {
  arquivo: string;
  dataEnvio: Date | undefined;
  campanha: string;
  aprovacao: string;
  credito: string;
}

interface CampaignFiltersProps {
  onFiltersChange: (filters: FilterValues) => void;
}

export function CampaignFilters({ onFiltersChange }: CampaignFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    arquivo: "",
    dataEnvio: undefined,
    campanha: "",
    aprovacao: "",
    credito: "",
  });

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onFiltersChange(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterValues = {
      arquivo: "",
      dataEnvio: undefined,
      campanha: "",
      aprovacao: "",
      credito: "",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="bg-card p-6 rounded-lg border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label htmlFor="arquivo">Arquivo</Label>
          <Input
            id="arquivo"
            placeholder="Pesquise pelo nome do arquivo"
            className="w-full"
            value={filters.arquivo}
            onChange={(e) => handleFilterChange("arquivo", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="data-envio">Data de envio *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dataEnvio && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dataEnvio ? format(filters.dataEnvio, "dd/MM/yyyy") : "dd/mm/aaaa"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dataEnvio}
                onSelect={(date) => handleFilterChange("dataEnvio", date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="campanha">Campanha</Label>
          <Input
            id="campanha"
            placeholder="Nome da campanha"
            className="w-full"
            value={filters.campanha}
            onChange={(e) => handleFilterChange("campanha", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="aprovacao">Aprovação de resultado</Label>
          <Select value={filters.aprovacao} onValueChange={(value) => handleFilterChange("aprovacao", value === "todos" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="em-processamento">Em processamento</SelectItem>
              <SelectItem value="rejeitado">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="credito">Crédito</Label>
          <Select value={filters.credito} onValueChange={(value) => handleFilterChange("credito", value === "todos" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Distribuído">Distribuído</SelectItem>
              <SelectItem value="Divergente">Divergente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end mt-4 space-x-2">
        <Button 
          variant="outline"
          onClick={handleClearFilters}
          className="px-8"
        >
          Limpar
        </Button>
        <Button 
          onClick={handleSearch}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8"
        >
          Buscar
        </Button>
      </div>
    </div>
  );
}
