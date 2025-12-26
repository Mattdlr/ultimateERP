-- ============================================
-- DELIVERY NOTES SYSTEM
-- ============================================
-- Create tables for delivery notes and their line items

-- Delivery Notes table
CREATE TABLE delivery_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Delivery Note Items table
CREATE TABLE delivery_note_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_note_id UUID NOT NULL REFERENCES delivery_notes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for better query performance
CREATE INDEX idx_delivery_notes_project_id ON delivery_notes(project_id);
CREATE INDEX idx_delivery_notes_deleted_at ON delivery_notes(deleted_at);
CREATE INDEX idx_delivery_note_items_delivery_note_id ON delivery_note_items(delivery_note_id);
CREATE INDEX idx_delivery_note_items_deleted_at ON delivery_note_items(deleted_at);

-- Row Level Security policies
ALTER TABLE delivery_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_note_items ENABLE ROW LEVEL SECURITY;

-- Delivery notes policies
CREATE POLICY "Enable read access for authenticated users" ON delivery_notes
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Enable insert for authenticated users" ON delivery_notes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON delivery_notes
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Delivery note items policies
CREATE POLICY "Enable read access for authenticated users" ON delivery_note_items
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Enable insert for authenticated users" ON delivery_note_items
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON delivery_note_items
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
