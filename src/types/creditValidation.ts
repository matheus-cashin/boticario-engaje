
export interface ValidationResult {
  isValid: boolean;
  divergenceReasons: string[];
  creditStatus: "Pendente" | "Distribuído" | "Divergente";
}

export interface ParticipantData {
  participantId: string;
  name: string;
  amount: number;
  date: string;
}

export interface PartialData {
  uploadDate: string;
  participants: ParticipantData[];
  uploadType: "parcial" | "final";
}

export interface N8nValidationResponse {
  fileName: string;
  totalRows: number;
  summary: Array<{
    participantId: string;
    name: string;
    totalAmount: number;
    validEntries: number;
  }>;
  status: "pendente" | "divergente" | "distribuído";
  divergences: Array<{
    type: string;
    participantId: string;
    name: string;
    message: string;
    date?: string;
    oldAmount?: number;
    newAmount?: number;
  }>;
}
