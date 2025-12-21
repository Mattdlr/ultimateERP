-- ============================================
-- PROJECT CHECK-INS SCHEMA UPDATE
-- Run this in Supabase SQL Editor to add check-in functionality
-- ============================================

-- Table for check-in events (when parts are received for a project)
CREATE TABLE project_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for individual items in each check-in
CREATE TABLE checkin_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkin_id UUID NOT NULL REFERENCES project_checkins(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_checkins_project ON project_checkins(project_id);
CREATE INDEX idx_checkin_items_checkin ON checkin_items(checkin_id);

-- Enable RLS
ALTER TABLE project_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Authenticated users can read/write all data
CREATE POLICY "Authenticated users can read project_checkins" ON project_checkins
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert project_checkins" ON project_checkins
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete project_checkins" ON project_checkins
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read checkin_items" ON checkin_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert checkin_items" ON checkin_items
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete checkin_items" ON checkin_items
  FOR DELETE TO authenticated USING (true);
