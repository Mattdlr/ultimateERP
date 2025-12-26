-- ============================================
-- PART REVISION HISTORY SYSTEM
-- ============================================
-- This schema adds support for tracking part revision history
-- and separating general notes from revision-specific notes

-- Add general notes column to parts table (applies to all revisions)
ALTER TABLE parts ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create part_revisions table to track revision history
CREATE TABLE IF NOT EXISTS part_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  revision_number TEXT NOT NULL, -- e.g., "01", "02", "03"
  part_number TEXT NOT NULL, -- Full part number at time of revision
  description TEXT,
  finished_weight DECIMAL(10, 4),
  revision_notes TEXT, -- Notes specific to this revision
  -- Snapshot of part data at this revision
  uom TEXT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_code TEXT,
  stock_material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  stock_form TEXT,
  stock_dimensions JSONB,
  -- Tracking
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(part_id, revision_number)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_part_revisions_part_id ON part_revisions(part_id);
CREATE INDEX IF NOT EXISTS idx_part_revisions_created_at ON part_revisions(created_at DESC);

-- Enable RLS
ALTER TABLE part_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for authenticated users" ON part_revisions
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON part_revisions
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON part_revisions
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Comment
COMMENT ON TABLE part_revisions IS 'Stores historical revision data for parts, allowing tracking of changes across revisions';
COMMENT ON COLUMN parts.notes IS 'General notes that apply to all revisions of this part';
COMMENT ON COLUMN parts.revision_notes IS 'Notes specific to the current revision';
