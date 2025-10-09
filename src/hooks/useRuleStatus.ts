import { useState, useEffect, useRef } from "react";
import { ruleStorageService } from "@/services/ruleStorage";
import { companyRulesService } from "@/services/companyRulesService";
import { supabase } from "@/integrations/supabase/client";

export function useRuleStatus(campaignId: string) {
  const [hasRule, setHasRule] = useState(false);
  const [ruleStatus, setRuleStatus] = useState<'completed' | 'processing' | 'failed' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [optimisticStatus, setOptimisticStatus] = useState<'completed' | 'processing' | 'failed' | null>(null);
  const isMounted = useRef(true);
  const channelRef = useRef<any>(null);

  const checkRuleStatus = async () => {
    if (!isMounted.current) return;
    
    try {
      setIsLoading(true);
      
      // Primeiro verificar na nova tabela company_rules
      const companyRule = await companyRulesService.getLatestRuleForCampaign(campaignId);
      
      if (!isMounted.current) return;
      
      if (companyRule && companyRule.status === 'completed') {
        setHasRule(true);
        setRuleStatus('completed');
        return;
      }
      
      // Se não encontrar na company_rules, verificar na rule_raw
      const existingRule = await ruleStorageService.loadExistingRules(campaignId);
      
      if (!isMounted.current) return;
      
      if (existingRule) {
        // Verificar se a regra foi excluída pelo usuário
        const isDeletedRule = existingRule.processing_status === 'failed' && 
                             existingRule.error_message?.includes('Regra excluída pelo usuário');
        
        if (isDeletedRule) {
          setHasRule(false);
          setRuleStatus(null);
        } else {
          setHasRule(true);
          setRuleStatus(existingRule.processing_status as 'completed' | 'processing' | 'failed');
        }
      } else {
        setHasRule(false);
        setRuleStatus(null);
      }
    } catch (error) {
      console.error('Erro ao verificar status da regra:', error);
      if (isMounted.current) {
        setHasRule(false);
        setRuleStatus(null);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    checkRuleStatus();

    // Limpar canal anterior se existir
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Configurar real-time apenas para company_rules (mais eficiente)
    const channelName = `company_rules_${campaignId}_${Date.now()}`;
    const companyRulesChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_rules',
          filter: `campaign_id=eq.${campaignId}`
        },
        () => {
          if (isMounted.current) {
            checkRuleStatus();
          }
        }
      )
      .subscribe();

    channelRef.current = companyRulesChannel;

    return () => {
      isMounted.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [campaignId]);

  const setOptimisticCompleted = () => {
    setOptimisticStatus('completed');
    setHasRule(true);
    // Limpar o estado otimista após a verificação real
    setTimeout(() => {
      setOptimisticStatus(null);
    }, 3000);
  };

  return {
    hasRule,
    ruleStatus: optimisticStatus || ruleStatus,
    isLoading,
    refresh: checkRuleStatus,
    setOptimisticCompleted
  };
}
