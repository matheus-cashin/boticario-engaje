-- Adicionar constraint UNIQUE para garantir que um funcionário
-- só pode aparecer uma vez por campanha (schedule)
-- Isso permite que o mesmo employee_id participe de múltiplas campanhas

ALTER TABLE public.participants 
ADD CONSTRAINT unique_employee_per_schedule 
UNIQUE (employee_id, schedule_id);

-- Criar índice para melhorar performance de consultas por employee_id
CREATE INDEX IF NOT EXISTS idx_participants_employee_id 
ON public.participants(employee_id) 
WHERE employee_id IS NOT NULL;