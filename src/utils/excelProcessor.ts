
// Utilitário para processar arquivos Excel e extrair dados dos participantes

export interface ExcelParticipantData {
  participantId: string;
  name: string;
  amount: number;
  date: string;
  phone?: string;
  employeeId?: string;
  product?: string;
  category?: string;
}

export interface ProcessedExcelData {
  participants: ExcelParticipantData[];
  metadata: {
    fileName: string;
    totalRows: number;
    processedRows: number;
    errors: string[];
  };
}

export class ExcelProcessor {
  /**
   * Processa um arquivo Excel e extrai dados dos participantes
   * Esta versão aguarda o processamento do n8n através do webhook
   */
  static async processFile(file: File): Promise<ProcessedExcelData> {
    console.log('📊 Processando arquivo Excel:', file.name);
    
    // Em produção, o processamento será feito pelo n8n
    // Esta função será chamada quando o n8n retornar os dados processados
    
    return {
      participants: [],
      metadata: {
        fileName: file.name,
        totalRows: 0,
        processedRows: 0,
        errors: ['Arquivo enviado para processamento. Aguarde o retorno do n8n.']
      }
    };
  }

  /**
   * Processa dados já processados pelo n8n
   */
  static processN8nData(n8nResult: any): ProcessedExcelData {
    console.log('📊 Processando resultado do n8n:', n8nResult);
    
    try {
      const participants: ExcelParticipantData[] = [];
      const errors: string[] = [];
      
      if (n8nResult.data && Array.isArray(n8nResult.data)) {
        n8nResult.data.forEach((row: any, index: number) => {
          try {
            // Validar campos obrigatórios
            if (!row.participantId || !row.name || !row.amount || !row.date) {
              errors.push(`Linha ${index + 2}: Campos obrigatórios ausentes (ID, Nome, Valor ou Data)`);
              return;
            }

            participants.push({
              participantId: String(row.participantId),
              name: String(row.name),
              amount: parseFloat(row.amount) || 0,
              date: String(row.date),
              phone: row.phone ? String(row.phone) : undefined,
              employeeId: row.employeeId ? String(row.employeeId) : undefined,
              product: row.product ? String(row.product) : undefined,
              category: row.category ? String(row.category) : undefined
            });
          } catch (error) {
            errors.push(`Linha ${index + 2}: Erro ao processar dados - ${error}`);
          }
        });
      }

      return {
        participants,
        metadata: {
          fileName: n8nResult.fileName || 'arquivo-processado.xlsx',
          totalRows: n8nResult.totalRows || participants.length + errors.length,
          processedRows: participants.length,
          errors
        }
      };
    } catch (error) {
      console.error('❌ Erro ao processar dados do n8n:', error);
      return {
        participants: [],
        metadata: {
          fileName: 'erro-processamento.xlsx',
          totalRows: 0,
          processedRows: 0,
          errors: [`Erro no processamento: ${error}`]
        }
      };
    }
  }

  /**
   * Valida os dados extraídos do Excel
   */
  static validateExcelData(data: ExcelParticipantData[]): string[] {
    const errors: string[] = [];
    
    data.forEach((participant, index) => {
      if (!participant.participantId) {
        errors.push(`Linha ${index + 2}: ID do participante é obrigatório`);
      }
      
      if (!participant.name) {
        errors.push(`Linha ${index + 2}: Nome do participante é obrigatório`);
      }
      
      if (!participant.amount || participant.amount <= 0) {
        errors.push(`Linha ${index + 2}: Valor deve ser maior que zero`);
      }
      
      if (!participant.date) {
        errors.push(`Linha ${index + 2}: Data é obrigatória`);
      }

      // Validar formato da data
      if (participant.date && !isValidDate(participant.date)) {
        errors.push(`Linha ${index + 2}: Formato de data inválido`);
      }
    });
    
    return errors;
  }
}

function isValidDate(dateString: string): boolean {
  // Aceitar formatos: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
  const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$|^\d{2}-\d{2}-\d{4}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
