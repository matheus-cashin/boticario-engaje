
import { useState } from "react";
import { RuleRawRecord } from "@/types/rules";

export function useRulesState() {
  const [rulesSummary, setRulesSummary] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [hasRules, setHasRules] = useState(false);
  const [currentRuleRecord, setCurrentRuleRecord] = useState<RuleRawRecord | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  return {
    rulesSummary,
    setRulesSummary,
    isUploading,
    setIsUploading,
    hasRules,
    setHasRules,
    currentRuleRecord,
    setCurrentRuleRecord,
    isRetrying,
    setIsRetrying
  };
}
