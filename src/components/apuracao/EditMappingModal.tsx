import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";

interface EditMappingModalProps {
  open: boolean;
  onClose: () => void;
  columnName: string;
  currentField: string;
  currentDataType: string;
  onSave: (field: string, dataType: string, ignore: boolean) => void;
}

const dataTypes = [
  { value: "string", label: "Texto" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Telefone" },
  { value: "percentage", label: "Percentual" },
  { value: "currency", label: "Moeda" },
  { value: "date", label: "Data" },
  { value: "number", label: "Número" },
];

export function EditMappingModal({
  open,
  onClose,
  columnName,
  currentField,
  currentDataType,
  onSave,
}: EditMappingModalProps) {
  const [field, setField] = useState(currentField);
  const [dataType, setDataType] = useState(currentDataType);
  const [ignore, setIgnore] = useState(false);

  const handleSave = () => {
    onSave(field, dataType, ignore);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Editar Mapeamento</DialogTitle>
          <DialogDescription>
            Coluna: <span className="font-semibold">{columnName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="field">Nome do Campo</Label>
            <Input
              id="field"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="nome_do_campo"
              className="font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dataType">Tipo de Dado</Label>
            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger id="dataType" className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {dataTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="ignore">Ignorar esta coluna</Label>
            <Switch id="ignore" checked={ignore} onCheckedChange={setIgnore} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
