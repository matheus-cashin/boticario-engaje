
import { supabase } from "@/integrations/supabase/client";
import { PartialData, ParticipantData } from "@/types/creditValidation";

export class PartialDataService {
  /**
   * Busca parciais anteriores de um schedule
   */
  static async getPreviousPartials(scheduleId: string): Promise<PartialData[]> {
    try {
      // Buscar uploads do schedule
      const { data: uploads, error: uploadsError } = await supabase
        .from('upload_logs')
        .select('*')
        .eq('schedule_id', scheduleId)
        .eq('status', 'processed')
        .order('uploaded_at', { ascending: true });
      
      if (uploadsError) {
        console.error('Erro ao buscar uploads:', uploadsError);
        throw uploadsError;
      }
      
      if (!uploads || uploads.length === 0) {
        return [];
      }
      
      // Buscar dados de vendas para cada upload
      const partialsData: PartialData[] = [];
      
      for (const upload of uploads) {
        const { data: salesData, error: salesError } = await supabase
          .from('sales_data')
          .select(`
            participant_id,
            amount,
            sale_date,
            participants (
              name,
              phone
            )
          `)
          .eq('upload_batch_id', upload.id)
          .is('deleted_at', null);
        
        if (salesError) {
          console.error('Erro ao buscar dados de vendas:', salesError);
          continue;
        }
        
        const participants: ParticipantData[] = salesData?.map((sale: any) => ({
          participantId: sale.participant_id,
          name: sale.participants?.name || '',
          amount: sale.amount,
          date: sale.sale_date
        })) || [];
        
        partialsData.push({
          uploadDate: upload.uploaded_at || '',
          uploadType: upload.upload_type as "parcial" | "final",
          participants
        });
      }
      
      return partialsData;
      
    } catch (error) {
      console.error('Erro ao buscar parciais anteriores:', error);
      throw error;
    }
  }
}
