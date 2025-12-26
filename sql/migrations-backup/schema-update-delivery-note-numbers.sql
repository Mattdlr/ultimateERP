-- ============================================
-- DELIVERY NOTE NUMBER SYSTEM
-- ============================================
-- Add delivery note number field for official tracking
-- Format: DN-<project_number>-<increment> (e.g., DN-PRJ-001-01)

ALTER TABLE delivery_notes ADD COLUMN IF NOT EXISTS delivery_note_number TEXT;

-- Create unique constraint on delivery note number
CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_notes_number ON delivery_notes(delivery_note_number) WHERE deleted_at IS NULL;

-- Comment
COMMENT ON COLUMN delivery_notes.delivery_note_number IS 'Unique delivery note number in format DN-<project_number>-<increment>';
