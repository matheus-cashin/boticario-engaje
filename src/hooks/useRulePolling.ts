
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseRulePollingProps {
  ruleId: string | null;
  isActive: boolean;
  onCompleted: (summary: string) => void;
  onFailed: (error: string) => void;
}

export function useRulePolling({ ruleId, isActive, onCompleted, onFailed }: UseRulePollingProps) {
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    console.log('⏹️ Parando polling');
    setIsPolling(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startPolling = () => {
    if (!ruleId || !isActive || isPolling) return;

    console.log('🔄 Iniciando polling para regra:', ruleId);
    setIsPolling(true);

    // Timeout de 5 minutos para evitar polling infinito
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ Timeout do polling atingido');
      stopPolling();
      onFailed('Timeout: O processamento demorou mais que o esperado (5 minutos).');
    }, 5 * 60 * 1000);

    // Polling a cada 2 segundos
    intervalRef.current = setInterval(async () => {
      try {
        console.log('🔍 Verificando status da regra:', ruleId);
        
        const { data, error } = await supabase
          .from('rule_raw')
          .select('processing_status, processed_summary, error_message')
          .eq('id', ruleId)
          .single();

        if (error) {
          console.error('❌ Erro no polling:', error);
          return;
        }

        console.log('📊 Status da regra:', {
          id: ruleId,
          status: data.processing_status,
          hasSummary: !!data.processed_summary,
          summaryLength: data.processed_summary?.length || 0
        });

        if (data.processing_status === 'completed') {
          console.log('✅ Regra processada com sucesso');
          stopPolling();
          const summary = data.processed_summary || 'Regra processada com sucesso.';
          onCompleted(summary);
        } else if (data.processing_status === 'failed') {
          console.log('❌ Processamento falhou');
          stopPolling();
          const errorMessage = data.error_message || 'Erro no processamento da regra.';
          onFailed(errorMessage);
        }
      } catch (error) {
        console.error('❌ Erro inesperado no polling:', error);
      }
    }, 2000);
  };

  useEffect(() => {
    if (isActive && ruleId) {
      console.log('🚀 Condições para polling atendidas:', { isActive, ruleId });
      startPolling();
    } else {
      console.log('⏹️ Condições para polling não atendidas:', { isActive, ruleId });
      stopPolling();
    }

    return () => stopPolling();
  }, [ruleId, isActive]);

  return {
    isPolling,
    startPolling,
    stopPolling
  };
}
