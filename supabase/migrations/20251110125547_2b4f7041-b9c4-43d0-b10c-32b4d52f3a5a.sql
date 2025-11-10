-- Adicionar coluna de orçamento na tabela schedules
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS budget numeric DEFAULT NULL;

COMMENT ON COLUMN schedules.budget IS 'Orçamento total da campanha para distribuição de prêmios';