-- ============================================
-- SOFT DELETES IMPLEMENTATION
-- ============================================
-- This migration adds soft delete functionality to protect against data loss
-- Records are marked as deleted rather than actually removed from the database

-- Add deleted_at column to main entity tables
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE project_notes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE project_checkins ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE checkin_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE operations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_project_notes_deleted_at ON project_notes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_suppliers_deleted_at ON suppliers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_materials_deleted_at ON materials(deleted_at);
CREATE INDEX IF NOT EXISTS idx_parts_deleted_at ON parts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_machines_deleted_at ON machines(deleted_at);
CREATE INDEX IF NOT EXISTS idx_project_checkins_deleted_at ON project_checkins(deleted_at);
CREATE INDEX IF NOT EXISTS idx_checkin_items_deleted_at ON checkin_items(deleted_at);
CREATE INDEX IF NOT EXISTS idx_operations_deleted_at ON operations(deleted_at);

-- ============================================
-- UPDATE RLS POLICIES TO HIDE DELETED ITEMS
-- ============================================

-- Customers policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON customers;
CREATE POLICY "Enable read access for authenticated users" ON customers
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON customers;
CREATE POLICY "Enable soft delete for authenticated users" ON customers
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Projects policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON projects;
CREATE POLICY "Enable read access for authenticated users" ON projects
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON projects;
CREATE POLICY "Enable soft delete for authenticated users" ON projects
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Suppliers policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON suppliers;
CREATE POLICY "Enable read access for authenticated users" ON suppliers
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON suppliers;
CREATE POLICY "Enable soft delete for authenticated users" ON suppliers
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Materials policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON materials;
CREATE POLICY "Enable read access for authenticated users" ON materials
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON materials;
CREATE POLICY "Enable soft delete for authenticated users" ON materials
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Parts policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON parts;
CREATE POLICY "Enable read access for authenticated users" ON parts
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON parts;
CREATE POLICY "Enable soft delete for authenticated users" ON parts
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Machines policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON machines;
CREATE POLICY "Enable read access for authenticated users" ON machines
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON machines;
CREATE POLICY "Enable soft delete for authenticated users" ON machines
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Project notes policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON project_notes;
CREATE POLICY "Enable read access for authenticated users" ON project_notes
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- Project checkins policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON project_checkins;
CREATE POLICY "Enable read access for authenticated users" ON project_checkins
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON project_checkins;
CREATE POLICY "Enable soft delete for authenticated users" ON project_checkins
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Checkin items policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON checkin_items;
CREATE POLICY "Enable read access for authenticated users" ON checkin_items
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- Operations policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON operations;
CREATE POLICY "Enable read access for authenticated users" ON operations
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON operations;
CREATE POLICY "Enable soft delete for authenticated users" ON operations
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- PREVENT HARD DELETES
-- ============================================
-- Block all DELETE operations to prevent accidental data loss
-- Note: You can comment these out if you want admins to be able to hard delete

-- DROP POLICY IF EXISTS "Block all deletes" ON customers;
-- CREATE POLICY "Block all deletes" ON customers FOR DELETE USING (false);

-- DROP POLICY IF EXISTS "Block all deletes" ON projects;
-- CREATE POLICY "Block all deletes" ON projects FOR DELETE USING (false);

-- DROP POLICY IF EXISTS "Block all deletes" ON suppliers;
-- CREATE POLICY "Block all deletes" ON suppliers FOR DELETE USING (false);

-- DROP POLICY IF EXISTS "Block all deletes" ON materials;
-- CREATE POLICY "Block all deletes" ON materials FOR DELETE USING (false);

-- DROP POLICY IF EXISTS "Block all deletes" ON parts;
-- CREATE POLICY "Block all deletes" ON parts FOR DELETE USING (false);

-- DROP POLICY IF EXISTS "Block all deletes" ON machines;
-- CREATE POLICY "Block all deletes" ON machines FOR DELETE USING (false);

-- DROP POLICY IF EXISTS "Block all deletes" ON project_checkins;
-- CREATE POLICY "Block all deletes" ON project_checkins FOR DELETE USING (false);

-- DROP POLICY IF EXISTS "Block all deletes" ON operations;
-- CREATE POLICY "Block all deletes" ON operations FOR DELETE USING (false);
