
-- Alterar a coluna file_content de bytea para text para armazenar base64
ALTER TABLE public.rule_raw 
ALTER COLUMN file_content TYPE text 
USING encode(file_content, 'base64');

-- Criar função para migrar dados existentes do formato hexadecimal para base64
CREATE OR REPLACE FUNCTION migrate_hex_to_base64()
RETURNS void AS $$
DECLARE
    rec RECORD;
    decoded_data bytea;
    base64_data text;
BEGIN
    -- Percorrer todos os registros que podem ter dados em hexadecimal
    FOR rec IN 
        SELECT id, file_content 
        FROM rule_raw 
        WHERE file_content IS NOT NULL 
        AND length(file_content) > 0
    LOOP
        BEGIN
            -- Tentar decodificar como hexadecimal primeiro
            decoded_data := decode(rec.file_content, 'hex');
            base64_data := encode(decoded_data, 'base64');
            
            -- Atualizar com dados em base64
            UPDATE rule_raw 
            SET file_content = base64_data 
            WHERE id = rec.id;
            
        EXCEPTION
            WHEN others THEN
                -- Se falhar, assumir que já está em base64 e manter como está
                CONTINUE;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar a migração
SELECT migrate_hex_to_base64();

-- Remover a função após o uso
DROP FUNCTION migrate_hex_to_base64();
