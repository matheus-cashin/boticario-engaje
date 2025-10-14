import { supabase } from "@/integrations/supabase/client";

export interface ColumnMapping {
  columnNumber: number;
  originalName: string;
  suggestedField: string;
  confidence: number;
  dataType: string;
  validated: boolean;
}

export interface ProcessedFileData {
  fileId: string;
  campaignId: string;
  fileName: string;
  structure: {
    headerType: string;
    totalParticipants: number;
    totalColumns: number;
    metaLevels: string[];
  };
  metadata: {
    campaignName: string;
    period: string;
    campaignType: string;
  };
  columnMappings: ColumnMapping[];
  rawData: any[];
  ruleValidation?: {
    hasValidRules: boolean;
    message: string;
  };
}

/**
 * Busca dados do arquivo processado pelo n8n
 */
export async function getProcessedFileData(fileId: string): Promise<ProcessedFileData | null> {
  try {
    console.log('🔍 Buscando dados do arquivo:', fileId);
    
    // Buscar o arquivo
  const { data: file, error: fileError } = await supabase
    .from("campaign_files")
    .select("*")
    .eq("id", fileId)
    .is("deleted_at", null)
    .single();

    if (fileError || !file) {
      console.error("❌ Erro ao buscar arquivo:", fileError);
      return null;
    }

    console.log('✅ Arquivo encontrado:', {
      id: file.id,
      name: file.file_name,
      campaign_id: file.campaign_id,
      status: file.status
    });

    // Buscar a campanha relacionada (schedule)
    const { data: schedule, error: scheduleError } = await supabase
      .from("schedules")
      .select("*")
      .eq("id", file.schedule_id)
      .maybeSingle();

    if (scheduleError) {
      console.error("❌ Erro ao buscar schedule:", scheduleError);
      return null;
    }

    if (!schedule) {
      console.error("❌ Schedule não encontrado para schedule_id:", file.schedule_id);
      return null;
    }

    console.log('✅ Schedule encontrado:', {
      id: schedule.id,
      name: schedule.name
    });

    // Buscar regras da campanha
    const { data: rules, error: rulesError } = await supabase
      .from("company_rules")
      .select("*")
      .eq("schedule_id", file.schedule_id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('📋 Regras encontradas:', !!rules, rulesError ? 'Erro: ' + rulesError.message : '');

    // Extrair dados processados do arquivo
    const processingResult = (file.processing_result as any) || {};
    const rawData = Array.isArray(processingResult.data) ? processingResult.data : [];
    const detectedColumns = Array.isArray(processingResult.columns)
      ? processingResult.columns
      : [];
    
    console.log('📊 Dados processados:', {
      temProcessingResult: !!file.processing_result,
      totalLinhas: rawData.length,
      totalColunas: detectedColumns.length
    });
    
    // Validação de regras baseada na existência de regras completadas
    const hasValidRules = !!rules && !rulesError;
    const ruleValidationMessage = hasValidRules 
      ? '' 
      : 'Nenhuma regra foi definida para esta campanha. É necessário cadastrar as regras antes de prosseguir com a validação dos dados.';

    // Buscar mapeamento de colunas do processing_result se já existir
    let columnMappings = processingResult.columnMappings;
    
    // Se não existe mapeamento ou não foi feito por IA, tentar fazer agora
    if (!columnMappings || !processingResult.aiMappingDone) {
      columnMappings = await mapColumnsWithAI(fileId, detectedColumns);
    }

    // Montar estrutura de retorno
    const result = {
      fileId: file.id,
      campaignId: file.campaign_id,
      fileName: file.file_name,
      structure: {
        headerType: detectedColumns.length > 10 ? "Multi-nível" : "Simples",
        totalParticipants: rawData.length,
        totalColumns: detectedColumns.length,
        metaLevels: extractMetaLevels(detectedColumns),
      },
      metadata: {
        campaignName: schedule.name,
        period: `${new Date(schedule.start_date).toLocaleDateString("pt-BR")} - ${new Date(
          schedule.end_date
        ).toLocaleDateString("pt-BR")}`,
        campaignType: schedule.processing_mode || "manual",
      },
      columnMappings,
      rawData,
      ruleValidation: {
        hasValidRules,
        message: ruleValidationMessage
      }
    };

    console.log('✅ Dados preparados com sucesso:', {
      fileId: result.fileId,
      totalMappings: result.columnMappings.length,
      totalParticipants: result.structure.totalParticipants
    });

    return result;
  } catch (error) {
    console.error("Erro ao processar dados do arquivo:", error);
    return null;
  }
}

/**
 * Extrai níveis de meta dos nomes das colunas
 */
function extractMetaLevels(columns: string[]): string[] {
  const levels = new Set<string>();
  
  columns.forEach((col) => {
    const lower = col.toLowerCase();
    if (lower.includes("brasil")) levels.add("Brasil");
    if (lower.includes("divisional") || lower.includes("regional")) levels.add("Divisional");
    if (lower.includes("individual") || lower.includes("pessoal")) levels.add("Individual");
  });

  return Array.from(levels);
}

/**
 * Mapeia colunas detectadas para campos conhecidos usando IA
 */
async function mapColumnsWithAI(fileId: string, columns: string[]): Promise<ColumnMapping[]> {
  try {
    // Chamar edge function de mapeamento por IA
    const response = await supabase.functions.invoke('ai-column-mapper', {
      body: { fileId }
    });

    if (response.data?.mappings) {
      console.log('✅ Mapeamento por IA concluído');
      return response.data.mappings;
    }
  } catch (error) {
    console.error('⚠️ Erro no mapeamento por IA, usando fallback:', error);
  }

  // Fallback para mapeamento baseado em regras
  return mapColumns(columns);
}

/**
 * Mapeia colunas detectadas para campos conhecidos (fallback)
 */
function mapColumns(columns: string[]): ColumnMapping[] {
  return columns.map((col, index) => {
    const lower = col.toLowerCase();
    let suggestedField = "custom_field";
    let dataType = "string";
    let confidence = 70;

    // Nome/Identificação
    if (lower.includes("nome") || lower === "name") {
      suggestedField = "participant_name";
      confidence = 98;
    } else if (lower.includes("cpf") || lower.includes("id")) {
      suggestedField = "participant_id";
      confidence = 95;
    }
    // Contato
    else if (lower.includes("email") || lower.includes("e-mail")) {
      suggestedField = "email";
      dataType = "email";
      confidence = 99;
    } else if (lower.includes("telefone") || lower.includes("celular") || lower.includes("phone")) {
      suggestedField = "phone";
      dataType = "phone";
      confidence = 92;
    }
    // Hierarquia
    else if (lower.includes("regional") || lower.includes("divisional")) {
      suggestedField = "division";
      confidence = 97;
    } else if (lower.includes("gerente") || lower.includes("manager")) {
      suggestedField = "manager";
      confidence = 94;
    }
    // Atingimentos
    else if (lower.includes("atingimento") && lower.includes("brasil")) {
      suggestedField = "achievement_brazil";
      dataType = "percentage";
      confidence = 94;
    } else if (lower.includes("atingimento") && (lower.includes("divisional") || lower.includes("regional"))) {
      suggestedField = "achievement_division";
      dataType = "percentage";
      confidence = 93;
    } else if (lower.includes("atingimento") && lower.includes("individual")) {
      suggestedField = "achievement_individual";
      dataType = "percentage";
      confidence = 96;
    }
    // Vendas
    else if ((lower.includes("valor") || lower.includes("venda")) && !lower.includes("café") && !lower.includes("filtro")) {
      suggestedField = "total_sales";
      dataType = "currency";
      confidence = 91;
    } else if (lower.includes("café") || lower.includes("coffee")) {
      suggestedField = "sales_coffee";
      dataType = "currency";
      confidence = 88;
    } else if (lower.includes("filtro") || lower.includes("filter")) {
      suggestedField = "sales_filter";
      dataType = "currency";
      confidence = 87;
    }
    // Data
    else if (lower.includes("data") || lower.includes("date")) {
      suggestedField = "reference_date";
      dataType = "date";
      confidence = 85;
    }

    return {
      columnNumber: index + 1,
      originalName: col,
      suggestedField,
      confidence,
      dataType,
      validated: false,
    };
  });
}

/**
 * Salva o mapeamento de colunas validado
 */
export async function saveColumnMapping(fileId: string, mappings: ColumnMapping[]) {
  // Buscar dados atuais
  const currentFile = await getCampaignFile(fileId);
  const currentResult = (currentFile?.processing_result as any) || {};

  const { error } = await supabase
    .from("campaign_files")
    .update({
      processing_result: {
        ...currentResult,
        columnMappings: mappings,
      },
    })
    .eq("id", fileId);

  if (error) {
    console.error("Erro ao salvar mapeamento:", error);
    throw error;
  }
}

async function getCampaignFile(fileId: string) {
  const { data } = await supabase.from("campaign_files").select("*").eq("id", fileId).is("deleted_at", null).single();
  return data;
}
