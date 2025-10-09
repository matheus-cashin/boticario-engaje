
import { ValidationResult, PartialData } from "@/types/creditValidation";
import { PartialDataService } from "./partialDataService";
import { ParticipantValidator } from "./validators/participantValidator";
import { DateValidator } from "./validators/dateValidator";
import { ValueValidator } from "./validators/valueValidator";
import { CreditDivergenceService } from "./creditDivergenceService";
import { ExcelProcessor } from "@/utils/excelProcessor";

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

export class CreditValidationService {
  
  /**
   * Valida uma nova parcial contra as parciais anteriores
   * Retorna formato compatível com o agente N8N
   */
  static async validatePartial(
    campaignId: string,
    fileId: string,
    processedData: any
  ): Promise<ValidationResult & { n8nResponse?: N8nValidationResponse }> {
    console.log('🔍 Iniciando validação de crédito para campanha:', campaignId);
    
    const divergenceReasons: string[] = [];
    const divergences: N8nValidationResponse['divergences'] = [];
    
    try {
      // 1. Processar dados do Excel usando o processador real
      const excelData = ExcelProcessor.processN8nData(processedData);
      
      // 2. Validar dados do Excel
      const excelValidationErrors = ExcelProcessor.validateExcelData(excelData.participants);
      if (excelValidationErrors.length > 0) {
        divergenceReasons.push(...excelValidationErrors);
        excelValidationErrors.forEach(error => {
          divergences.push({
            type: "Campo obrigatório ausente",
            participantId: "N/A",
            name: "N/A",
            message: error
          });
        });
      }

      // 3. Converter para formato PartialData
      const newPartialData: PartialData = {
        uploadDate: new Date().toISOString(),
        uploadType: processedData.auditType === "Final" ? "final" : "parcial",
        participants: excelData.participants.map(p => ({
          participantId: p.participantId,
          name: p.name,
          amount: p.amount,
          date: p.date
        }))
      };
      
      // 4. Buscar parciais anteriores
      const previousPartials = await PartialDataService.getPreviousPartials(campaignId);
      console.log('📋 Parciais anteriores encontradas:', previousPartials.length);
      
      // 5. Verificar se créditos já foram distribuídos
      const distributionStatus = await this.checkDistributionStatus(campaignId);
      
      // 6. Validações específicas seguindo as regras do prompt
      
      // Validar remoção de participantes (NÃO permitido)
      const participantValidation = ParticipantValidator.validateParticipants(newPartialData, previousPartials);
      if (!participantValidation.isValid) {
        divergenceReasons.push(...participantValidation.reasons);
        // Adicionar divergências específicas de remoção
        await this.addParticipantRemovalDivergences(newPartialData, previousPartials, divergences);
      }
      
      // Validar progressão de datas (apenas datas >= última parcial)
      const dateValidation = DateValidator.validateDateProgression(newPartialData, previousPartials);
      if (!dateValidation.isValid) {
        divergenceReasons.push(...dateValidation.reasons);
        await this.addDateDivergences(newPartialData, previousPartials, divergences);
      }
      
      // Validar imutabilidade de valores (valores já reportados NÃO podem mudar)
      const valueValidation = ValueValidator.validateValueConsistency(newPartialData, previousPartials);
      if (!valueValidation.isValid) {
        divergenceReasons.push(...valueValidation.reasons);
        await this.addValueChangeDivergences(newPartialData, previousPartials, divergences);
      }
      
      // 7. Calcular totais por participante
      const summary = this.calculateParticipantSummary(newPartialData);
      
      // 8. Determinar status final
      let status: "pendente" | "divergente" | "distribuído" = "pendente";
      if (distributionStatus.isDistributed) {
        status = "distribuído";
      } else if (divergenceReasons.length > 0) {
        status = "divergente";
      }
      
      const isValid = divergenceReasons.length === 0 && !distributionStatus.isDistributed;
      const creditStatus = status === "distribuído" ? "Distribuído" : (isValid ? "Pendente" : "Divergente");
      
      // 9. Montar resposta no formato N8N
      const n8nResponse: N8nValidationResponse = {
        fileName: excelData.metadata.fileName,
        totalRows: excelData.metadata.totalRows,
        summary,
        status,
        divergences
      };
      
      console.log('✅ Validação concluída:', { isValid, creditStatus, divergenceReasons });
      
      return {
        isValid,
        divergenceReasons,
        creditStatus,
        n8nResponse
      };
      
    } catch (error) {
      console.error('❌ Erro na validação:', error);
      return {
        isValid: false,
        divergenceReasons: ['Erro interno na validação'],
        creditStatus: "Divergente"
      };
    }
  }
  
  /**
   * Verifica se créditos já foram distribuídos
   */
  private static async checkDistributionStatus(campaignId: string): Promise<{ isDistributed: boolean }> {
    // TODO: Implementar consulta real ao Supabase
    // Por enquanto retorna sempre false
    return { isDistributed: false };
  }
  
  /**
   * Calcula totais por participante
   */
  private static calculateParticipantSummary(partialData: PartialData) {
    const participantTotals = new Map<string, { name: string; totalAmount: number; validEntries: number }>();
    
    partialData.participants.forEach(participant => {
      const existing = participantTotals.get(participant.participantId);
      if (existing) {
        existing.totalAmount += participant.amount;
        existing.validEntries += 1;
      } else {
        participantTotals.set(participant.participantId, {
          name: participant.name,
          totalAmount: participant.amount,
          validEntries: 1
        });
      }
    });
    
    return Array.from(participantTotals.entries()).map(([participantId, data]) => ({
      participantId,
      name: data.name,
      totalAmount: data.totalAmount,
      validEntries: data.validEntries
    }));
  }
  
  /**
   * Adiciona divergências específicas de remoção de participantes
   */
  private static async addParticipantRemovalDivergences(
    newPartial: PartialData,
    previousPartials: PartialData[],
    divergences: N8nValidationResponse['divergences']
  ) {
    if (previousPartials.length === 0) return;
    
    const lastPartial = previousPartials[previousPartials.length - 1];
    const lastParticipantIds = new Set(lastPartial.participants.map(p => p.participantId));
    const newParticipantIds = new Set(newPartial.participants.map(p => p.participantId));
    
    // Encontrar participantes removidos
    for (const participantId of lastParticipantIds) {
      if (!newParticipantIds.has(participantId)) {
        const removedParticipant = lastPartial.participants.find(p => p.participantId === participantId);
        divergences.push({
          type: "Remoção de participante",
          participantId,
          name: removedParticipant?.name || "Nome não encontrado",
          message: "Participante removido em relação à parcial anterior"
        });
      }
    }
  }
  
  /**
   * Adiciona divergências específicas de datas
   */
  private static async addDateDivergences(
    newPartial: PartialData,
    previousPartials: PartialData[],
    divergences: N8nValidationResponse['divergences']
  ) {
    if (previousPartials.length === 0) return;
    
    const allPreviousDates = previousPartials.flatMap(p => 
      p.participants.map(participant => new Date(participant.date))
    );
    const maxPreviousDate = new Date(Math.max(...allPreviousDates.map(d => d.getTime())));
    
    newPartial.participants.forEach(participant => {
      const participantDate = new Date(participant.date);
      if (participantDate < maxPreviousDate) {
        divergences.push({
          type: "Data retroativa",
          participantId: participant.participantId,
          name: participant.name,
          date: participant.date,
          message: `Data ${participant.date} é anterior à última parcial enviada`
        });
      }
    });
  }
  
  /**
   * Adiciona divergências específicas de alteração de valores
   */
  private static async addValueChangeDivergences(
    newPartial: PartialData,
    previousPartials: PartialData[],
    divergences: N8nValidationResponse['divergences']
  ) {
    const previousValues = new Map<string, { amount: number; date: string; name: string }>();
    
    previousPartials.forEach(partial => {
      partial.participants.forEach(participant => {
        const key = `${participant.participantId}_${participant.date}`;
        previousValues.set(key, {
          amount: participant.amount,
          date: participant.date,
          name: participant.name
        });
      });
    });
    
    newPartial.participants.forEach(participant => {
      const key = `${participant.participantId}_${participant.date}`;
      const previousValue = previousValues.get(key);
      
      if (previousValue && previousValue.amount !== participant.amount) {
        divergences.push({
          type: "Alteração de valor",
          participantId: participant.participantId,
          name: participant.name,
          date: participant.date,
          oldAmount: previousValue.amount,
          newAmount: participant.amount,
          message: "Valor alterado para data já reportada em parcial anterior"
        });
      }
    });
  }
  
  /**
   * Registra divergências encontradas na tabela de créditos
   */
  static async registerDivergence(
    scheduleId: string,
    participantId: string,
    uploadBatchId: string,
    divergenceReasons: string[]
  ): Promise<void> {
    return CreditDivergenceService.registerDivergence(
      scheduleId,
      participantId,
      uploadBatchId,
      divergenceReasons
    );
  }
}

// Re-export types for backward compatibility
export type { ValidationResult, PartialData, ParticipantData } from "@/types/creditValidation";
