-- Migração para corrigir dados existentes de vendas (VERSÃO CORRIGIDA)
-- Etapa 1: Corrigir campaign_files com schedule_id null

DO $$
DECLARE
  file_record RECORD;
  schedule_uuid UUID;
BEGIN
  -- Para cada arquivo com schedule_id null mas com campaign_id preenchido
  FOR file_record IN 
    SELECT id, campaign_id 
    FROM campaign_files 
    WHERE schedule_id IS NULL 
    AND campaign_id IS NOT NULL
  LOOP
    -- Tentar encontrar a schedule correspondente
    -- Primeiro tenta como UUID direto
    BEGIN
      schedule_uuid := file_record.campaign_id::UUID;
      
      -- Verificar se existe essa schedule
      IF EXISTS (SELECT 1 FROM schedules WHERE id = schedule_uuid) THEN
        -- Atualizar o arquivo com o schedule_id correto
        UPDATE campaign_files 
        SET schedule_id = schedule_uuid,
            updated_at = NOW()
        WHERE id = file_record.id;
        
        RAISE NOTICE 'Arquivo % corrigido com schedule_id %', file_record.id, schedule_uuid;
      END IF;
    EXCEPTION
      WHEN invalid_text_representation THEN
        -- Se não é um UUID válido, tentar buscar pelo campaign_id
        SELECT id INTO schedule_uuid
        FROM schedules 
        WHERE campaign_id = file_record.campaign_id 
        LIMIT 1;
        
        IF FOUND THEN
          UPDATE campaign_files 
          SET schedule_id = schedule_uuid,
              updated_at = NOW()
          WHERE id = file_record.id;
          
          RAISE NOTICE 'Arquivo % corrigido via campaign_id lookup: %', file_record.id, schedule_uuid;
        END IF;
    END;
  END LOOP;
END $$;

-- Etapa 2: Corrigir sales_data com schedule_id null usando source_file_id
UPDATE sales_data sd
SET schedule_id = cf.schedule_id
FROM campaign_files cf
WHERE sd.source_file_id = cf.id
  AND sd.schedule_id IS NULL
  AND cf.schedule_id IS NOT NULL;

-- Etapa 3: Consolidar participantes duplicados
-- Identificar e mesclar participantes com mesmo nome e phone mas schedule_id diferente
DO $$
DECLARE
  participant_group RECORD;
  main_participant_id UUID;
  duplicate_ids UUID[];
BEGIN
  FOR participant_group IN
    SELECT name, phone, array_agg(id) as ids, array_agg(schedule_id) as schedule_ids
    FROM participants
    WHERE schedule_id IS NOT NULL
    GROUP BY name, phone
    HAVING COUNT(*) > 1
  LOOP
    -- Pegar o primeiro participante como principal
    main_participant_id := participant_group.ids[1];
    duplicate_ids := participant_group.ids[2:array_length(participant_group.ids, 1)];
    
    -- Atualizar vendas dos duplicados para apontar para o principal
    UPDATE sales_data
    SET participant_id = main_participant_id
    WHERE participant_id = ANY(duplicate_ids);
    
    -- Atualizar créditos dos duplicados
    UPDATE credits
    SET participant_id = main_participant_id
    WHERE participant_id = ANY(duplicate_ids);
    
    -- Remover participantes duplicados
    DELETE FROM participants
    WHERE id = ANY(duplicate_ids);
    
    RAISE NOTICE 'Participante % consolidado (removidos: %)', main_participant_id, duplicate_ids;
  END LOOP;
END $$;

-- Etapa 4: Recalcular current_progress de todos os participantes
UPDATE participants p
SET current_progress = COALESCE(
  (
    SELECT SUM(sd.amount)
    FROM sales_data sd
    WHERE sd.participant_id = p.id
      AND sd.schedule_id = p.schedule_id
  ), 
  0
),
updated_at = NOW()
WHERE schedule_id IS NOT NULL;

-- Etapa 5: Adicionar constraint para prevenir schedule_id null em novos registros
-- (Apenas para campaign_files de tipo 'sales')
ALTER TABLE campaign_files 
  ADD CONSTRAINT check_sales_files_have_schedule 
  CHECK (
    upload_type != 'sales' OR schedule_id IS NOT NULL
  );

-- Logs de resultados
DO $$
DECLARE
  files_corrected INTEGER;
  sales_corrected INTEGER;
  participants_with_progress INTEGER;
BEGIN
  SELECT COUNT(*) INTO files_corrected
  FROM campaign_files
  WHERE schedule_id IS NOT NULL;
  
  SELECT COUNT(*) INTO sales_corrected
  FROM sales_data
  WHERE schedule_id IS NOT NULL;
  
  SELECT COUNT(*) INTO participants_with_progress
  FROM participants
  WHERE current_progress > 0;
  
  RAISE NOTICE '=== RESUMO DA MIGRAÇÃO ===';
  RAISE NOTICE 'Arquivos com schedule_id: %', files_corrected;
  RAISE NOTICE 'Vendas com schedule_id: %', sales_corrected;
  RAISE NOTICE 'Participantes com progresso: %', participants_with_progress;
END $$;