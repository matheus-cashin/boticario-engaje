-- Corrigir função update_updated_at_column com search_path (com CASCADE)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Recriar triggers que foram removidos pelo CASCADE
CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gerentes_campanha_updated_at
  BEFORE UPDATE ON gerentes_campanha
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON produtos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendedores_updated_at
  BEFORE UPDATE ON vendedores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campanhas_updated_at
  BEFORE UPDATE ON campanhas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regras_campanha_updated_at
  BEFORE UPDATE ON regras_campanha
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participacoes_updated_at
  BEFORE UPDATE ON participacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disparos_whatsapp_updated_at
  BEFORE UPDATE ON disparos_whatsapp
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();