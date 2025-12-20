-- Workshop ERP Database Schema for Supabase
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS TABLE
-- ============================================
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECT NOTES TABLE
-- ============================================
CREATE TABLE project_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUPPLIERS TABLE
-- ============================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  lead_time INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MATERIALS TABLE
-- ============================================
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  density DECIMAL(10, 2) NOT NULL, -- kg/m³
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARTS TABLE
-- ============================================
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('manufactured', 'purchased', 'assembly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'obsolete')),
  uom TEXT DEFAULT 'EA',
  revision_notes TEXT,
  finished_weight DECIMAL(10, 4),
  -- For purchased parts
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_code TEXT,
  -- For manufactured parts - stock material
  stock_material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  stock_form TEXT CHECK (stock_form IN ('round_bar', 'flat_bar', 'plate', 'hex_bar', 'tube')),
  stock_dimensions JSONB, -- Stores dimensions based on form
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOM RELATIONS TABLE
-- ============================================
CREATE TABLE bom_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- ============================================
-- MACHINES TABLE
-- ============================================
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mill', 'lathe', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OPERATIONS TABLE
-- ============================================
CREATE TABLE operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  op_number TEXT NOT NULL,
  machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
  program_name TEXT,
  description TEXT,
  cycle_time INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PROFILES TABLE (extends Supabase auth)
-- ============================================
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
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_customer ON projects(customer_id);
CREATE INDEX idx_projects_number ON projects(project_number);
CREATE INDEX idx_parts_number ON parts(part_number);
CREATE INDEX idx_parts_type ON parts(type);
CREATE INDEX idx_parts_status ON parts(status);
CREATE INDEX idx_bom_parent ON bom_relations(parent_id);
CREATE INDEX idx_bom_child ON bom_relations(child_id);
CREATE INDEX idx_operations_part ON operations(part_id);
CREATE INDEX idx_project_notes_project ON project_notes(project_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Authenticated users can read/write all data
-- (All 5 team members have full access)

CREATE POLICY "Authenticated users can read customers" ON customers
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert customers" ON customers
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update customers" ON customers
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete customers" ON customers
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read projects" ON projects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert projects" ON projects
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects" ON projects
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete projects" ON projects
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read project_notes" ON project_notes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert project_notes" ON project_notes
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete project_notes" ON project_notes
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read suppliers" ON suppliers
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert suppliers" ON suppliers
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update suppliers" ON suppliers
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete suppliers" ON suppliers
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read materials" ON materials
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert materials" ON materials
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update materials" ON materials
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete materials" ON materials
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read parts" ON parts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert parts" ON parts
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update parts" ON parts
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete parts" ON parts
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read bom_relations" ON bom_relations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert bom_relations" ON bom_relations
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update bom_relations" ON bom_relations
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete bom_relations" ON bom_relations
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read machines" ON machines
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert machines" ON machines
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update machines" ON machines
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete machines" ON machines
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read operations" ON operations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert operations" ON operations
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update operations" ON operations
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete operations" ON operations
  FOR DELETE TO authenticated USING (true);

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
-- SEED DATA: Default Machines
-- ============================================
INSERT INTO machines (name, type) VALUES
  ('Haas VF3', 'mill'),
  ('Haas VF6', 'mill'),
  ('Matsuura MX850', 'mill'),
  ('Hardinge Talent', 'lathe'),
  ('Lynx 220', 'lathe'),
  ('Newen Seat Cutter', 'other');

-- ============================================
-- SEED DATA: Default Materials
-- ============================================
INSERT INTO materials (name, density) VALUES
  ('Aluminium 6082-T6', 2700),
  ('Aluminium 7075-T6', 2810),
  ('Mild Steel', 7850),
  ('4140 Steel', 7850),
  ('Stainless 304', 8000),
  ('Stainless 316', 8000),
  ('Titanium 6Al-4V', 4430),
  ('Brass', 8500);
