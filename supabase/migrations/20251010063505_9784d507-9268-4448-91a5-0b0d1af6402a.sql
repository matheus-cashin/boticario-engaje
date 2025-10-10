-- Passo 1: Adicionar coluna schedule_id na tabela company_rules (permite NULL temporariamente)
ALTER TABLE company_rules 
ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES schedules(id);

-- Passo 2: Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_company_rules_schedule_id 
ON company_rules(schedule_id);

-- Passo 3: Migrar dados existentes vinculando campaign_id (string) com schedules
UPDATE company_rules cr
SET schedule_id = s.id
FROM schedules s
WHERE cr.campaign_id = s.campaign_id
AND cr.schedule_id IS NULL;

-- Passo 4: Log de registros que não puderam ser migrados
DO $$
DECLARE
  unmigrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unmigrated_count
  FROM company_rules
  WHERE schedule_id IS NULL;
  
  IF unmigrated_count > 0 THEN
    RAISE NOTICE 'ATENÇÃO: % registros em company_rules não puderam ser migrados automaticamente', unmigrated_count;
    RAISE NOTICE 'Esses registros têm campaign_id que não corresponde a nenhum schedule.campaign_id';
  ELSE
    RAISE NOTICE '✅ Todos os registros foram migrados com sucesso!';
  END IF;
END $$;

-- Passo 5: Comentários para documentação
COMMENT ON COLUMN company_rules.schedule_id IS 'UUID que referencia o schedule (campanha) ao qual a regra pertence. Deve ser preenchido para todas as novas regras.';
COMMENT ON COLUMN company_rules.campaign_id IS 'String identificador legível da campanha (mantido para compatibilidade)';