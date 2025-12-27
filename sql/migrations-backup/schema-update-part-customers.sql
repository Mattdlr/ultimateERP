-- ============================================
-- PART CUSTOMERS MIGRATION
-- ============================================
-- Creates a junction table for many-to-many relationship between parts and customers
-- Removes UOM field from parts table
-- Generated: 2025-12-27
-- ============================================

-- Create part_customers junction table
CREATE TABLE IF NOT EXISTS part_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(part_id, customer_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_part_customers_part_id ON part_customers(part_id);
CREATE INDEX IF NOT EXISTS idx_part_customers_customer_id ON part_customers(customer_id);

-- Enable RLS
ALTER TABLE part_customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON part_customers
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert part_customers" ON part_customers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete part_customers" ON part_customers
  FOR DELETE TO authenticated USING (true);

-- Remove UOM column from parts table (optional - you may want to keep existing data)
-- ALTER TABLE parts DROP COLUMN IF EXISTS uom;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE part_customers IS 'Junction table for many-to-many relationship between parts and customers. Tracks which customers own which parts.';
COMMENT ON COLUMN part_customers.part_id IS 'Reference to the part';
COMMENT ON COLUMN part_customers.customer_id IS 'Reference to the customer who owns this part';
