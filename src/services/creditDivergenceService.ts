
import { supabase } from "@/integrations/supabase/client";

export class CreditDivergenceService {
  /**
   * Registra divergências encontradas na tabela de créditos
   */
  static async registerDivergence(
    scheduleId: string,
    participantId: string,
    uploadBatchId: string,
    divergenceReasons: string[]
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('credits')
        .insert({
          schedule_id: scheduleId,
          participant_id: participantId,
          upload_batch_id: uploadBatchId,
          credit_type: 'divergence',
          status: 'divergente',
          amount: 0,
          divergence_reason: divergenceReasons.join('; '),
          description: 'Crédito marcado como divergente devido a inconsistências na validação'
        });
      
      if (error) {
        console.error('Erro ao registrar divergência:', error);
        throw error;
      }
      
      console.log('✅ Divergência registrada com sucesso');
    } catch (error) {
      console.error('❌ Falha ao registrar divergência:', error);
      throw error;
    }
  }
}
