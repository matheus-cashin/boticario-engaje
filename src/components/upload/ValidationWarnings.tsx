
import { AlertTriangle } from "lucide-react";

interface ValidationWarningsProps {
  warnings: string[];
}

export function ValidationWarnings({ warnings }: ValidationWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start space-x-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-yellow-800">Divergências Detectadas</h4>
          <ul className="text-sm text-yellow-700 mt-1 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
