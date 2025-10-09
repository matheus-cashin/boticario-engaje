
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AuditTypeSelectorProps {
  auditType: "Parcial" | "Final";
  onAuditTypeChange: (value: "Parcial" | "Final") => void;
}

export function AuditTypeSelector({ auditType, onAuditTypeChange }: AuditTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Tipo de Apuração</Label>
      <RadioGroup value={auditType} onValueChange={(value) => onAuditTypeChange(value as "Parcial" | "Final")}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Parcial" id="parcial" />
          <Label htmlFor="parcial">Apuração Parcial</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Final" id="final" />
          <Label htmlFor="final">Apuração Final</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
