
import { PartialData } from "@/types/creditValidation";

export class DateValidator {
  /**
   * Valida progressão cronológica das datas
   * REGRA: Apenas aceitar vendas com datas iguais ou posteriores à última parcial
   */
  static validateDateProgression(
    newPartial: PartialData,
    previousPartials: PartialData[]
  ): { isValid: boolean; reasons: string[] } {
    const reasons: string[] = [];
    
    if (previousPartials.length === 0) {
      return { isValid: true, reasons: [] };
    }
    
    // Encontrar a data mais recente de TODAS as parciais anteriores
    const allPreviousDates = previousPartials.flatMap(p => 
      p.participants.map(participant => new Date(participant.date))
    );
    
    if (allPreviousDates.length === 0) {
      return { isValid: true, reasons: [] };
    }
    
    const maxPreviousDate = new Date(Math.max(...allPreviousDates.map(d => d.getTime())));
    console.log(`📅 Data mais recente das parciais anteriores: ${maxPreviousDate.toISOString()}`);
    
    // Verificar cada entrada da nova parcial
    let invalidDatesCount = 0;
    const invalidEntries: string[] = [];
    
    newPartial.participants.forEach(participant => {
      const participantDate = new Date(participant.date);
      
      // REGRA RIGOROSA: Data deve ser >= à última parcial
      if (participantDate < maxPreviousDate) {
        invalidDatesCount++;
        const daysDiff = Math.ceil((maxPreviousDate.getTime() - participantDate.getTime()) / (1000 * 60 * 60 * 24));
        invalidEntries.push(`${participant.name} (${participant.date}) - ${daysDiff} dia(s) anterior à última parcial`);
      }
    });
    
    if (invalidDatesCount > 0) {
      reasons.push(`ERRO: ${invalidDatesCount} entrada(s) com datas anteriores à última parcial não são permitidas`);
      reasons.push(...invalidEntries);
    }
    
    return {
      isValid: reasons.length === 0,
      reasons
    };
  }
}
