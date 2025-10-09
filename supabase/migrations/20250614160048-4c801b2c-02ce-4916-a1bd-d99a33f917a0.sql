
-- Primeiro, vamos verificar qual é a constraint que está falhando
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'schedules_status_check';

-- Vamos também verificar a estrutura da tabela schedules para entender os valores permitidos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'schedules' AND table_schema = 'public'
ORDER BY ordinal_position;
