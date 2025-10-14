-- Add soft delete columns to relevant tables
ALTER TABLE campaign_files ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE sales_data ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE credits ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE rankings ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- Create indexes for better performance on deleted_at queries
CREATE INDEX IF NOT EXISTS idx_campaign_files_deleted_at ON campaign_files(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sales_data_deleted_at ON sales_data(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_credits_deleted_at ON credits(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rankings_deleted_at ON rankings(deleted_at) WHERE deleted_at IS NULL;

-- Function to soft delete related data when a campaign file is deleted
CREATE OR REPLACE FUNCTION soft_delete_campaign_file_data()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- When a campaign file is soft deleted, also soft delete related data
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- Soft delete sales data from this file
    UPDATE sales_data 
    SET deleted_at = NEW.deleted_at 
    WHERE source_file_id = NEW.id 
    AND deleted_at IS NULL;
    
    -- Soft delete credits from this file
    UPDATE credits 
    SET deleted_at = NEW.deleted_at 
    WHERE source_file_id = NEW.id 
    AND deleted_at IS NULL;
    
    -- Soft delete rankings that were processed by this file
    UPDATE rankings 
    SET deleted_at = NEW.deleted_at 
    WHERE source_file_id = NEW.id 
    AND deleted_at IS NULL;
  END IF;
  
  -- When a campaign file is restored (deleted_at set back to NULL), restore related data
  IF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
    -- Restore sales data from this file
    UPDATE sales_data 
    SET deleted_at = NULL 
    WHERE source_file_id = NEW.id 
    AND deleted_at = OLD.deleted_at;
    
    -- Restore credits from this file
    UPDATE credits 
    SET deleted_at = NULL 
    WHERE source_file_id = NEW.id 
    AND deleted_at = OLD.deleted_at;
    
    -- Restore rankings that were processed by this file
    UPDATE rankings 
    SET deleted_at = NULL 
    WHERE source_file_id = NEW.id 
    AND deleted_at = OLD.deleted_at;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for soft delete cascade
DROP TRIGGER IF EXISTS trigger_soft_delete_campaign_file_data ON campaign_files;
CREATE TRIGGER trigger_soft_delete_campaign_file_data
  AFTER UPDATE OF deleted_at ON campaign_files
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete_campaign_file_data();

-- Function to recalculate rankings when files are added/removed
CREATE OR REPLACE FUNCTION recalculate_schedule_rankings(p_schedule_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- This function can be called after file operations to trigger recalculation
  -- Implementation depends on your ranking calculation logic
  -- For now, it just marks that a recalculation might be needed
  
  UPDATE schedules 
  SET updated_at = now() 
  WHERE id = p_schedule_id;
END;
$$;