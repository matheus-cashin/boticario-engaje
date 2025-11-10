import { supabase } from "@/integrations/supabase/client";

export const calculatePrizes = async (scheduleId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('calculate-prizes', {
      body: { scheduleId }
    });

    if (error) {
      console.error('❌ Erro ao calcular prêmios:', error);
      throw error;
    }

    console.log('✅ Prêmios calculados com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro na chamada da função:', error);
    throw error;
  }
};
