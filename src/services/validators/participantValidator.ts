
import { PartialData } from "@/types/creditValidation";

export class ParticipantValidator {
  /**
   * Valida consistência de participantes
   * REGRA: NÃO permitir remoção de participantes de parciais anteriores
   */
  static validateParticipants(
    newPartial: PartialData,
    previousPartials: PartialData[]
  ): { isValid: boolean; reasons: string[] } {
    const reasons: string[] = [];
    
    if (previousPartials.length === 0) {
      return { isValid: true, reasons: [] };
    }
    
    // Obter TODOS os participantes únicos de TODAS as parciais anteriores
    const allPreviousParticipantIds = new Set<string>();
    previousPartials.forEach(partial => {
      partial.participants.forEach(participant => {
        allPreviousParticipantIds.add(participant.participantId);
      });
    });
    
    const newParticipantIds = new Set(
      newPartial.participants.map(p => p.participantId)
    );
    
    // Verificar participantes removidos (ESTRITAMENTE PROIBIDO)
    const removedParticipants = [...allPreviousParticipantIds].filter(
      id => !newParticipantIds.has(id)
    );
    
    if (removedParticipants.length > 0) {
      reasons.push(`ERRO CRÍTICO: ${removedParticipants.length} participante(s) removido(s) - operação não permitida`);
      removedParticipants.forEach(participantId => {
        reasons.push(`Participante ${participantId} foi removido da lista`);
      });
    }
    
    // Permitir novos participantes (isso é válido)
    const addedParticipants = [...newParticipantIds].filter(
      id => !allPreviousParticipantIds.has(id)
    );
    
    if (addedParticipants.length > 0) {
      console.log(`✅ ${addedParticipants.length} novo(s) participante(s) adicionado(s) - permitido`);
    }
    
    return {
      isValid: reasons.length === 0,
      reasons
    };
  }
}
