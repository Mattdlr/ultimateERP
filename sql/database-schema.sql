-- ============================================
-- WORKSHOP ERP - COMPLETE DATABASE SCHEMA
-- ============================================
-- This is a comprehensive schema file for Supabase deployment
-- It includes all tables, indexes, RLS policies, functions, and seed data
-- Run this in the Supabase SQL Editor to set up the complete database
--
-- Generated: 2025-12-26
-- ============================================

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- CUSTOMERS TABLE (Legacy - being replaced by contacts)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- SUPPLIERS TABLE (Legacy - being replaced by contacts)
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  lead_time INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- UNIFIED CONTACTS TABLE
-- Replaces separate customers and suppliers tables
-- Supports both local-only contacts and Xero-synced contacts
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Contact Information
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  contact TEXT, -- Contact person name
  address TEXT,

  -- Contact Roles
  is_customer BOOLEAN DEFAULT false,
  is_supplier BOOLEAN DEFAULT false,

  -- Xero Integration (for future sync)
  xero_contact_id UUID, -- Xero's contact ID
  sync_status TEXT DEFAULT 'local_only' CHECK (sync_status IN ('synced', 'local_only', 'pending_push')),
  last_synced_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT contact_must_have_role CHECK (is_customer = true OR is_supplier = true)
);

-- PROJECTS TABLE
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  date_started DATE NOT NULL,
  due_date DATE NOT NULL,
  actual_finish_date DATE,
  value DECIMAL(12, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'on-hold', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- PROJECT NOTES TABLE
CREATE TABLE project_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_by_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- PROJECT CHECK-INS TABLE
CREATE TABLE project_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- CHECK-IN ITEMS TABLE
CREATE TABLE checkin_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkin_id UUID NOT NULL REFERENCES project_checkins(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- DELIVERY NOTES TABLE
CREATE TABLE delivery_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  delivery_note_number TEXT,
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- DELIVERY NOTE ITEMS TABLE
CREATE TABLE delivery_note_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_note_id UUID NOT NULL REFERENCES delivery_notes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- MATERIALS TABLE
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  density DECIMAL(10, 2) NOT NULL, -- kg/m³
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- PARTS TABLE
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('manufactured', 'purchased', 'assembly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'obsolete')),
  notes TEXT, -- General notes that apply to all revisions
  revision_notes TEXT, -- Notes specific to current revision
  finished_weight DECIMAL(10, 4),
  -- For purchased parts
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_code TEXT,
  -- For manufactured parts - stock material
  stock_material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  stock_form TEXT CHECK (stock_form IN ('round_bar', 'flat_bar', 'plate', 'hex_bar', 'tube')),
  stock_dimensions JSONB, -- Stores dimensions based on form
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- PART CUSTOMERS JUNCTION TABLE
-- Many-to-many relationship between parts and customers
-- Tracks which customers own which parts
CREATE TABLE IF NOT EXISTS part_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(part_id, customer_id)
);

-- PART REVISIONS TABLE
CREATE TABLE IF NOT EXISTS part_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  revision_number TEXT NOT NULL, -- e.g., "01", "02", "03"
  part_number TEXT NOT NULL, -- Full part number at time of revision
  description TEXT,
  finished_weight DECIMAL(10, 4),
  revision_notes TEXT, -- Notes specific to this revision
  -- Snapshot of part data at this revision
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

-- BOM RELATIONS TABLE
CREATE TABLE bom_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- MACHINES TABLE
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mill', 'lathe', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- OPERATIONS TABLE
CREATE TABLE operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  op_number TEXT NOT NULL,
  machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
  program_name TEXT,
  description TEXT,
  cycle_time INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- USER PROFILES TABLE (extends Supabase auth)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Customer indexes
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);

-- Supplier indexes
CREATE INDEX idx_suppliers_deleted_at ON suppliers(deleted_at);

-- Contact indexes
CREATE INDEX IF NOT EXISTS idx_contacts_is_customer ON contacts(is_customer) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_is_supplier ON contacts(is_supplier) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_xero_id ON contacts(xero_contact_id) WHERE xero_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_sync_status ON contacts(sync_status);
CREATE INDEX IF NOT EXISTS idx_contacts_deleted_at ON contacts(deleted_at);

-- Project indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_customer ON projects(customer_id);
CREATE INDEX idx_projects_number ON projects(project_number);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);

-- Project notes indexes
CREATE INDEX idx_project_notes_project ON project_notes(project_id);
CREATE INDEX idx_project_notes_deleted_at ON project_notes(deleted_at);

-- Project checkins indexes
CREATE INDEX idx_checkins_project ON project_checkins(project_id);
CREATE INDEX idx_project_checkins_deleted_at ON project_checkins(deleted_at);

-- Checkin items indexes
CREATE INDEX idx_checkin_items_checkin ON checkin_items(checkin_id);
CREATE INDEX idx_checkin_items_deleted_at ON checkin_items(deleted_at);

-- Delivery notes indexes
CREATE INDEX idx_delivery_notes_project_id ON delivery_notes(project_id);
CREATE INDEX idx_delivery_notes_deleted_at ON delivery_notes(deleted_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_notes_number ON delivery_notes(delivery_note_number) WHERE deleted_at IS NULL;

-- Delivery note items indexes
CREATE INDEX idx_delivery_note_items_delivery_note_id ON delivery_note_items(delivery_note_id);
CREATE INDEX idx_delivery_note_items_deleted_at ON delivery_note_items(deleted_at);

-- Materials indexes
CREATE INDEX idx_materials_deleted_at ON materials(deleted_at);

-- Part indexes
CREATE INDEX idx_parts_number ON parts(part_number);
CREATE INDEX idx_parts_type ON parts(type);
CREATE INDEX idx_parts_status ON parts(status);
CREATE INDEX idx_parts_deleted_at ON parts(deleted_at);

-- Part revisions indexes
CREATE INDEX IF NOT EXISTS idx_part_revisions_part_id ON part_revisions(part_id);
CREATE INDEX IF NOT EXISTS idx_part_revisions_created_at ON part_revisions(created_at DESC);

-- Part customers indexes
CREATE INDEX IF NOT EXISTS idx_part_customers_part_id ON part_customers(part_id);
CREATE INDEX IF NOT EXISTS idx_part_customers_customer_id ON part_customers(customer_id);

-- BOM indexes
CREATE INDEX idx_bom_parent ON bom_relations(parent_id);
CREATE INDEX idx_bom_child ON bom_relations(child_id);

-- Machine indexes
CREATE INDEX idx_machines_deleted_at ON machines(deleted_at);

-- Operations indexes
CREATE INDEX idx_operations_part ON operations(part_id);
CREATE INDEX idx_operations_deleted_at ON operations(deleted_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_note_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Customers policies (with soft delete support)
CREATE POLICY "Enable read access for authenticated users" ON customers
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert customers" ON customers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers" ON customers
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable soft delete for authenticated users" ON customers
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Suppliers policies (with soft delete support)
CREATE POLICY "Enable read access for authenticated users" ON suppliers
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert suppliers" ON suppliers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update suppliers" ON suppliers
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable soft delete for authenticated users" ON suppliers
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Contacts policies
CREATE POLICY "contacts_select_policy" ON contacts
  FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "contacts_insert_policy" ON contacts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "contacts_update_policy" ON contacts
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "contacts_delete_policy" ON contacts
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Projects policies (with soft delete support)
CREATE POLICY "Enable read access for authenticated users" ON projects
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert projects" ON projects
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects" ON projects
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable soft delete for authenticated users" ON projects
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Project notes policies (with soft delete support)
CREATE POLICY "Enable read access for authenticated users" ON project_notes
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert project_notes" ON project_notes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete project_notes" ON project_notes
  FOR DELETE TO authenticated USING (true);

-- Project checkins policies (with soft delete support)
CREATE POLICY "Enable read access for authenticated users" ON project_checkins
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert project_checkins" ON project_checkins
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete project_checkins" ON project_checkins
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable soft delete for authenticated users" ON project_checkins
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Checkin items policies (with soft delete support)
CREATE POLICY "Enable read access for authenticated users" ON checkin_items
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert checkin_items" ON checkin_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete checkin_items" ON checkin_items
  FOR DELETE TO authenticated USING (true);

-- Delivery notes policies (with soft delete support)
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

-- Delivery note items policies (with soft delete support)
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

-- Materials policies (with soft delete support)
CREATE POLICY "Enable read access for authenticated users" ON materials
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert materials" ON materials
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update materials" ON materials
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable soft delete for authenticated users" ON materials
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Parts policies (with soft delete support)
CREATE POLICY "Enable read access for authenticated users" ON parts
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert parts" ON parts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update parts" ON parts
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable soft delete for authenticated users" ON parts
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Part revisions policies
CREATE POLICY "Enable read access for authenticated users" ON part_revisions
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON part_revisions
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON part_revisions
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Part customers policies
CREATE POLICY "Enable read access for authenticated users" ON part_customers
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert part_customers" ON part_customers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete part_customers" ON part_customers
  FOR DELETE TO authenticated USING (true);

-- BOM relations policies
CREATE POLICY "Authenticated users can read bom_relations" ON bom_relations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert bom_relations" ON bom_relations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update bom_relations" ON bom_relations
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete bom_relations" ON bom_relations
  FOR DELETE TO authenticated USING (true);

-- Machines policies (with soft delete support)
CREATE POLICY "Enable read access for authenticated users" ON machines
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert machines" ON machines
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update machines" ON machines
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable soft delete for authenticated users" ON machines
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Operations policies (with soft delete support)
CREATE POLICY "Enable read access for authenticated users" ON operations
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert operations" ON operations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update operations" ON operations
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable soft delete for authenticated users" ON operations
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- User profiles policies
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to auto-generate project numbers
CREATE OR REPLACE FUNCTION generate_project_number()
RETURNS TEXT AS $$
DECLARE
  max_num INTEGER;
  new_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(project_number AS INTEGER)), 0) + 1 INTO max_num FROM projects;
  new_num := LPAD(max_num::TEXT, 4, '0');
  RETURN new_num;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Add updated_at triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_operations_updated_at BEFORE UPDATE ON operations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA
-- ============================================

-- Default Machines
INSERT INTO machines (name, type) VALUES
  ('Haas VF3', 'mill'),
  ('Haas VF6', 'mill'),
  ('Matsuura MX850', 'mill'),
  ('Hardinge Talent', 'lathe'),
  ('Lynx 220', 'lathe'),
  ('Newen Seat Cutter', 'other');

-- Default Materials
INSERT INTO materials (name, density) VALUES
  ('Aluminium 6082-T6', 2700),
  ('Aluminium 7075-T6', 2810),
  ('Mild Steel', 7850),
  ('4140 Steel', 7850),
  ('Stainless 304', 8000),
  ('Stainless 316', 8000),
  ('Titanium 6Al-4V', 4430),
  ('Brass', 8500);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE contacts IS 'Unified contacts table for customers, suppliers, and future Xero sync';
COMMENT ON COLUMN contacts.is_customer IS 'True if contact is a customer';
COMMENT ON COLUMN contacts.is_supplier IS 'True if contact is a supplier';
COMMENT ON COLUMN contacts.xero_contact_id IS 'Xero contact UUID for synced contacts';
COMMENT ON COLUMN contacts.sync_status IS 'Sync status: synced (from Xero), local_only (ERP only), pending_push (needs push to Xero)';
COMMENT ON TABLE part_revisions IS 'Stores historical revision data for parts, allowing tracking of changes across revisions';
COMMENT ON COLUMN parts.notes IS 'General notes that apply to all revisions of this part';
COMMENT ON COLUMN parts.revision_notes IS 'Notes specific to the current revision';
COMMENT ON COLUMN delivery_notes.delivery_note_number IS 'Unique delivery note number in format DN-<project_number>-<increment>';

-- ============================================
-- MIGRATION NOTES
-- ============================================
--
-- This schema includes:
-- 1. Core ERP tables (projects, parts, operations, etc.)
-- 2. Unified contacts system (replacing separate customers/suppliers)
-- 3. Project check-ins functionality
-- 4. Delivery notes system
-- 5. Part revision tracking
-- 6. Soft delete support on all major tables
-- 7. Row Level Security (RLS) policies
-- 8. Performance indexes
-- 9. Automated triggers for timestamps
-- 10. Seed data for machines and materials
--
-- To migrate existing data from customers/suppliers to contacts table,
-- refer to schema-contacts-migration.sql for the migration script.
--
-- ============================================
