import { supabase } from "@/integrations/supabase/client";

export interface ValidationError {
  line: number;
  participantName: string;
  field: string;
  value: string;
  error: string;
}

export interface Anomaly {
  id: string;
  participantName: string;
  field: string;
  value: string;
  type: "outlier_positive" | "outlier_negative" | "suspicious";
  description: string;
}

export interface Duplicate {
  field: string;
  value: string;
  participants: Array<{
    name: string;
    line: number;
  }>;
}

export interface ValidationData {
  totalRecords: number;
  emailValidation: {
    total: number;
    valid: number;
    invalid: ValidationError[];
  };
  phoneValidation: {
    total: number;
    valid: number;
    invalid: ValidationError[];
  };
  cpfValidation: {
    provided: boolean;
    total?: number;
    valid?: number;
  };
  percentageValidation: {
    total: number;
    anomalousCount: number;
    anomalies: ValidationError[];
  };
  anomalies: Anomaly[];
  duplicates: Duplicate[];
  suggestions: string[];
}

/**
 * Valida dados do arquivo processado
 */
export async function validateFileData(fileId: string): Promise<ValidationData> {
  // Buscar arquivo
  const { data: file } = await supabase
    .from("campaign_files")
    .select("*")
    .eq("id", fileId)
    .single();

  if (!file || !file.processing_result) {
    throw new Error("Arquivo não encontrado ou não processado");
  }

  const processingResult = (file.processing_result as any) || {};
  const rawData = Array.isArray(processingResult.data) ? processingResult.data : [];
  const columnMappings = Array.isArray(processingResult.columnMappings)
    ? processingResult.columnMappings
    : [];

  // Mapear campos
  const nameField = columnMappings.find((m: any) => m.suggestedField === "participant_name")?.originalName;
  const emailField = columnMappings.find((m: any) => m.suggestedField === "email")?.originalName;
  const phoneField = columnMappings.find((m: any) => m.suggestedField === "phone")?.originalName;
  const cpfField = columnMappings.find((m: any) => m.suggestedField === "participant_id")?.originalName;

  // Validações
  const emailValidation = validateEmails(rawData, nameField, emailField);
  const phoneValidation = validatePhones(rawData, nameField, phoneField);
  const cpfValidation = cpfField ? validateCPFs(rawData, cpfField) : { provided: false };
  const percentageValidation = validatePercentages(rawData, columnMappings);
  const anomalies = detectAnomalies(rawData, columnMappings, nameField);
  const duplicates = findDuplicates(rawData, [emailField, phoneField, cpfField].filter(Boolean) as string[]);
  const suggestions = generateSuggestions(emailValidation, phoneValidation, anomalies);

  return {
    totalRecords: rawData.length,
    emailValidation,
    phoneValidation,
    cpfValidation,
    percentageValidation,
    anomalies,
    duplicates,
    suggestions,
  };
}

function validateEmails(data: any[], nameField?: string, emailField?: string) {
  if (!emailField) {
    return { total: 0, valid: 0, invalid: [] };
  }

  const invalid: ValidationError[] = [];
  let valid = 0;

  data.forEach((row, index) => {
    const email = row[emailField];
    const name = nameField ? row[nameField] : `Participante linha ${index + 2}`;

    if (!email) {
      invalid.push({
        line: index + 2,
        participantName: name,
        field: "email",
        value: "",
        error: "Campo vazio",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      invalid.push({
        line: index + 2,
        participantName: name,
        field: "email",
        value: email,
        error: "Formato inválido",
      });
    } else {
      valid++;
    }
  });

  return {
    total: data.length,
    valid,
    invalid,
  };
}

function validatePhones(data: any[], nameField?: string, phoneField?: string) {
  if (!phoneField) {
    return { total: 0, valid: 0, invalid: [] };
  }

  const invalid: ValidationError[] = [];
  let valid = 0;

  data.forEach((row, index) => {
    const phone = row[phoneField];
    const name = nameField ? row[nameField] : `Participante linha ${index + 2}`;

    if (!phone) {
      invalid.push({
        line: index + 2,
        participantName: name,
        field: "phone",
        value: "",
        error: "Campo vazio",
      });
      return;
    }

    // Remover caracteres não numéricos
    const cleaned = String(phone).replace(/\D/g, "");

    if (cleaned.length < 10 || cleaned.length > 11) {
      invalid.push({
        line: index + 2,
        participantName: name,
        field: "phone",
        value: phone,
        error: "Número incompleto ou inválido",
      });
    } else {
      valid++;
    }
  });

  return {
    total: data.length,
    valid,
    invalid,
  };
}

function validateCPFs(data: any[], cpfField: string) {
  let valid = 0;
  data.forEach((row) => {
    const cpf = String(row[cpfField] || "").replace(/\D/g, "");
    if (cpf.length === 11) valid++;
  });

  return {
    provided: true,
    total: data.length,
    valid,
  };
}

function validatePercentages(data: any[], columnMappings: any[]) {
  const percentageFields = columnMappings
    .filter((m) => m.dataType === "percentage")
    .map((m) => m.originalName);

  const anomalies: ValidationError[] = [];
  let total = 0;

  data.forEach((row, index) => {
    percentageFields.forEach((field) => {
      const value = parseFloat(row[field]) || 0;
      total++;

      if (value < 0) {
        anomalies.push({
          line: index + 2,
          participantName: row[columnMappings[0]?.originalName] || `Linha ${index + 2}`,
          field,
          value: `${value}%`,
          error: "Valor negativo detectado",
        });
      } else if (value > 300) {
        anomalies.push({
          line: index + 2,
          participantName: row[columnMappings[0]?.originalName] || `Linha ${index + 2}`,
          field,
          value: `${value}%`,
          error: "Valor muito acima da média esperada",
        });
      }
    });
  });

  return {
    total,
    anomalousCount: anomalies.length,
    anomalies,
  };
}

function detectAnomalies(data: any[], columnMappings: any[], nameField?: string): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const percentageFields = columnMappings.filter((m) => m.dataType === "percentage");

  data.forEach((row, index) => {
    const name = nameField ? row[nameField] : `Participante linha ${index + 2}`;

    percentageFields.forEach((fieldMap) => {
      const value = parseFloat(row[fieldMap.originalName]) || 0;

      if (value < 0) {
        anomalies.push({
          id: `${index}-${fieldMap.originalName}`,
          participantName: name,
          field: fieldMap.originalName,
          value: `${value}%`,
          type: "outlier_negative",
          description: "Percentual negativo - possível erro ou devolução",
        });
      } else if (value > 300) {
        anomalies.push({
          id: `${index}-${fieldMap.originalName}`,
          participantName: name,
          field: fieldMap.originalName,
          value: `${value}%`,
          type: "outlier_positive",
          description: "Valor muito acima da média - verificar se está correto",
        });
      } else if (value === 0) {
        anomalies.push({
          id: `${index}-${fieldMap.originalName}`,
          participantName: name,
          field: fieldMap.originalName,
          value: "0%",
          type: "suspicious",
          description: "Participante sem atingimento neste nível",
        });
      }
    });
  });

  return anomalies;
}

function findDuplicates(data: any[], fields: string[]): Duplicate[] {
  const duplicates: Duplicate[] = [];

  fields.forEach((field) => {
    const valueMap = new Map<string, Array<{ name: string; line: number }>>();

    data.forEach((row, index) => {
      const value = row[field];
      if (!value) return;

      if (!valueMap.has(value)) {
        valueMap.set(value, []);
      }
      valueMap.get(value)!.push({
        name: row[data[0]] || `Linha ${index + 2}`,
        line: index + 2,
      });
    });

    valueMap.forEach((participants, value) => {
      if (participants.length > 1) {
        duplicates.push({
          field,
          value,
          participants,
        });
      }
    });
  });

  return duplicates;
}

function generateSuggestions(
  emailValidation: any,
  phoneValidation: any,
  anomalies: Anomaly[]
): string[] {
  const suggestions: string[] = [];

  if (phoneValidation.invalid.length > 0) {
    suggestions.push("Normalizar telefones para formato padrão (XX) XXXXX-XXXX");
  }

  if (anomalies.length > 0) {
    suggestions.push(`Revisar manualmente os ${anomalies.length} casos com anomalias detectadas`);
  }

  if (emailValidation.invalid.length > 0) {
    suggestions.push("Validar emails inválidos antes de processar comunicações");
  }

  const outlierPositive = anomalies.filter((a) => a.type === "outlier_positive");
  if (outlierPositive.length > 0) {
    suggestions.push("Atingimentos acima de 300% merecem verificação adicional");
  }

  return suggestions;
}
