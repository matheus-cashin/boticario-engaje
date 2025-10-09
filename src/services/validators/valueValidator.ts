
import { PartialData } from "@/types/creditValidation";

export class ValueValidator {
  /**
   * Valida consistência de valores entre parciais
   * REGRA: Valores já reportados NÃO podem ser alterados
   */
  static validateValueConsistency(
    newPartial: PartialData,
    previousPartials: PartialData[]
  ): { isValid: boolean; reasons: string[] } {
    const reasons: string[] = [];
    
    if (previousPartials.length === 0) {
      return { isValid: true, reasons: [] };
    }
    
    // Criar mapa de valores por participante e data das parciais anteriores
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
    
    // Verificar se valores anteriores foram alterados na nova parcial
    let changedValuesCount = 0;
    const changedEntries: string[] = [];
    
    newPartial.participants.forEach(participant => {
      const key = `${participant.participantId}_${participant.date}`;
      const previousValue = previousValues.get(key);
      
      if (previousValue && previousValue.amount !== participant.amount) {
        changedValuesCount++;
        const difference = participant.amount - previousValue.amount;
        const changeType = difference > 0 ? "aumentado" : "diminuído";
        
        changedEntries.push(
          `${participant.name} (${participant.date}): ${changeType} de R$ ${previousValue.amount.toFixed(2)} para R$ ${participant.amount.toFixed(2)}`
        );
        
        console.log(`⚠️ VALOR ALTERADO: ${participant.name} na data ${participant.date}: ${previousValue.amount} → ${participant.amount}`);
      }
    });
    
    if (changedValuesCount > 0) {
      reasons.push(`ERRO CRÍTICO: ${changedValuesCount} valor(es) de parciais anteriores foram alterados - operação não permitida`);
      reasons.push(...changedEntries);
    }
    
    return {
      isValid: reasons.length === 0,
      reasons
    };
  }
}
