-- ============================================
-- CLEAN DATABASE SCHEMA
-- ============================================
-- Complete database schema for ultimateERP
-- Run this AFTER reset-database.sql for a fresh start
--
-- Features:
-- - Projects with check-ins and delivery notes
-- - Parts with BOM, revisions, and operations
-- - Customers and Suppliers
-- - Materials and Machines
-- - Soft deletes on all tables
-- - Row Level Security (RLS)

-- ============================================
-- ENABLE UUID EXTENSION
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  contact TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);

-- ============================================
-- SUPPLIERS TABLE
-- ============================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  contact TEXT,
  lead_time INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_suppliers_deleted_at ON suppliers(deleted_at);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  date_started DATE,
  due_date DATE,
  actual_finish_date DATE,
  value DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'on-hold', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX idx_projects_project_number ON projects(project_number);

-- ============================================
-- PROJECT NOTES TABLE
-- ============================================
CREATE TABLE project_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_notes_project_id ON project_notes(project_id);

-- ============================================
-- MATERIALS TABLE
-- ============================================
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  density DECIMAL(10,3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_materials_deleted_at ON materials(deleted_at);

-- ============================================
-- MACHINES TABLE
-- ============================================
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'mill' CHECK (type IN ('mill', 'lathe', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_machines_deleted_at ON machines(deleted_at);

-- ============================================
-- PARTS TABLE
-- ============================================
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('manufactured', 'purchased', 'assembly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'obsolete')),
  uom TEXT DEFAULT 'EA',

  -- For purchased parts
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_code TEXT,

  -- For manufactured parts
  stock_material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  stock_form TEXT CHECK (stock_form IN ('round_bar', 'flat_bar', 'plate', 'hex_bar', 'tube')),
  stock_dimensions JSONB,
  finished_weight DECIMAL(10,3),

  -- Notes
  notes TEXT,
  revision_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_parts_type ON parts(type);
CREATE INDEX idx_parts_status ON parts(status);
CREATE INDEX idx_parts_supplier_id ON parts(supplier_id);
CREATE INDEX idx_parts_material_id ON parts(stock_material_id);
CREATE INDEX idx_parts_deleted_at ON parts(deleted_at);
CREATE INDEX idx_parts_part_number ON parts(part_number);

-- ============================================
-- BOM RELATIONS TABLE
-- ============================================
CREATE TABLE bom_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  child_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

CREATE INDEX idx_bom_relations_parent_id ON bom_relations(parent_id);
CREATE INDEX idx_bom_relations_child_id ON bom_relations(child_id);

-- ============================================
-- OPERATIONS TABLE
-- ============================================
CREATE TABLE operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  operation_type TEXT NOT NULL,
  machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
  description TEXT,
  setup_time INTEGER DEFAULT 0,
  cycle_time DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_operations_part_id ON operations(part_id);
CREATE INDEX idx_operations_machine_id ON operations(machine_id);

-- ============================================
-- CHECK-INS TABLE
-- ============================================
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_checkins_project_id ON checkins(project_id);
CREATE INDEX idx_checkins_deleted_at ON checkins(deleted_at);

-- ============================================
-- CHECK-IN ITEMS TABLE
-- ============================================
CREATE TABLE checkin_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkin_id UUID REFERENCES checkins(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checkin_items_checkin_id ON checkin_items(checkin_id);

-- ============================================
-- DELIVERY NOTES TABLE
-- ============================================
CREATE TABLE delivery_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  delivery_note_number TEXT UNIQUE NOT NULL,
  delivery_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_delivery_notes_project_id ON delivery_notes(project_id);
CREATE INDEX idx_delivery_notes_deleted_at ON delivery_notes(deleted_at);
CREATE INDEX idx_delivery_notes_number ON delivery_notes(delivery_note_number);

-- ============================================
-- DELIVERY NOTE ITEMS TABLE
-- ============================================
CREATE TABLE delivery_note_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_note_id UUID REFERENCES delivery_notes(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('part', 'custom')),
  part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_delivery_note_items_delivery_note_id ON delivery_note_items(delivery_note_id);
CREATE INDEX idx_delivery_note_items_part_id ON delivery_note_items(part_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_note_items ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY customers_select_policy ON customers FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY customers_insert_policy ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY customers_update_policy ON customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY customers_delete_policy ON customers FOR DELETE USING (auth.role() = 'authenticated');

-- Suppliers policies
CREATE POLICY suppliers_select_policy ON suppliers FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY suppliers_insert_policy ON suppliers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY suppliers_update_policy ON suppliers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY suppliers_delete_policy ON suppliers FOR DELETE USING (auth.role() = 'authenticated');

-- Projects policies
CREATE POLICY projects_select_policy ON projects FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY projects_insert_policy ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY projects_update_policy ON projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY projects_delete_policy ON projects FOR DELETE USING (auth.role() = 'authenticated');

-- Project notes policies
CREATE POLICY project_notes_select_policy ON project_notes FOR SELECT USING (true);
CREATE POLICY project_notes_insert_policy ON project_notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY project_notes_update_policy ON project_notes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY project_notes_delete_policy ON project_notes FOR DELETE USING (auth.role() = 'authenticated');

-- Materials policies
CREATE POLICY materials_select_policy ON materials FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY materials_insert_policy ON materials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY materials_update_policy ON materials FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY materials_delete_policy ON materials FOR DELETE USING (auth.role() = 'authenticated');

-- Machines policies
CREATE POLICY machines_select_policy ON machines FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY machines_insert_policy ON machines FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY machines_update_policy ON machines FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY machines_delete_policy ON machines FOR DELETE USING (auth.role() = 'authenticated');

-- Parts policies
CREATE POLICY parts_select_policy ON parts FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY parts_insert_policy ON parts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY parts_update_policy ON parts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY parts_delete_policy ON parts FOR DELETE USING (auth.role() = 'authenticated');

-- BOM relations policies
CREATE POLICY bom_relations_select_policy ON bom_relations FOR SELECT USING (true);
CREATE POLICY bom_relations_insert_policy ON bom_relations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY bom_relations_update_policy ON bom_relations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY bom_relations_delete_policy ON bom_relations FOR DELETE USING (auth.role() = 'authenticated');

-- Operations policies
CREATE POLICY operations_select_policy ON operations FOR SELECT USING (true);
CREATE POLICY operations_insert_policy ON operations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY operations_update_policy ON operations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY operations_delete_policy ON operations FOR DELETE USING (auth.role() = 'authenticated');

-- Check-ins policies
CREATE POLICY checkins_select_policy ON checkins FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY checkins_insert_policy ON checkins FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY checkins_update_policy ON checkins FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY checkins_delete_policy ON checkins FOR DELETE USING (auth.role() = 'authenticated');

-- Check-in items policies
CREATE POLICY checkin_items_select_policy ON checkin_items FOR SELECT USING (true);
CREATE POLICY checkin_items_insert_policy ON checkin_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY checkin_items_update_policy ON checkin_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY checkin_items_delete_policy ON checkin_items FOR DELETE USING (auth.role() = 'authenticated');

-- Delivery notes policies
CREATE POLICY delivery_notes_select_policy ON delivery_notes FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY delivery_notes_insert_policy ON delivery_notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY delivery_notes_update_policy ON delivery_notes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY delivery_notes_delete_policy ON delivery_notes FOR DELETE USING (auth.role() = 'authenticated');

-- Delivery note items policies
CREATE POLICY delivery_note_items_select_policy ON delivery_note_items FOR SELECT USING (true);
CREATE POLICY delivery_note_items_insert_policy ON delivery_note_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY delivery_note_items_update_policy ON delivery_note_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY delivery_note_items_delete_policy ON delivery_note_items FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE customers IS 'Customer information for projects';
COMMENT ON TABLE suppliers IS 'Supplier information for purchased parts';
COMMENT ON TABLE projects IS 'Workshop projects with tracking';
COMMENT ON TABLE project_notes IS 'Notes attached to projects';
COMMENT ON TABLE materials IS 'Stock materials for manufactured parts';
COMMENT ON TABLE machines IS 'Workshop machines for operations';
COMMENT ON TABLE parts IS 'Parts catalog (manufactured, purchased, assemblies)';
COMMENT ON TABLE bom_relations IS 'Bill of materials relationships between parts';
COMMENT ON TABLE operations IS 'Manufacturing operations for parts';
COMMENT ON TABLE checkins IS 'Project check-ins for tracking progress';
COMMENT ON TABLE checkin_items IS 'Items checked in for a project';
COMMENT ON TABLE delivery_notes IS 'Delivery notes for completed work';
COMMENT ON TABLE delivery_note_items IS 'Items on a delivery note';

-- ============================================
-- COMPLETION
-- ============================================
-- Schema created successfully!
-- Your database is now ready to use with a clean structure.
