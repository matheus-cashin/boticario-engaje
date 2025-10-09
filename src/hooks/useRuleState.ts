
import { useState } from "react";
import { CompanyRule } from "@/types/companyRules";

export function useRuleState() {
  const [step, setStep] = useState<'input' | 'processing' | 'confirmation'>('input');
  const [ruleText, setRuleText] = useState('');
  const [processedSummary, setProcessedSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [currentRuleId, setCurrentRuleId] = useState<string | null>(null);
  const [currentRule, setCurrentRule] = useState<CompanyRule | null>(null);
  const [hasExistingRule, setHasExistingRule] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetState = () => {
    console.log('🔄 Resetando estado');
    setStep('input');
    setRuleText('');
    setProcessedSummary('');
    setIsProcessing(false);
    setIsApplied(false);
    setCurrentRuleId(null);
    setCurrentRule(null);
    setHasExistingRule(false);
  };

  return {
    // State values
    step,
    ruleText,
    processedSummary,
    isProcessing,
    isApplied,
    currentRuleId,
    currentRule,
    hasExistingRule,
    isDeleting,
    
    // State setters
    setStep,
    setRuleText,
    setProcessedSummary,
    setIsProcessing,
    setIsApplied,
    setCurrentRuleId,
    setCurrentRule,
    setHasExistingRule,
    setIsDeleting,
    
    // Utility functions
    resetState
  };
}
