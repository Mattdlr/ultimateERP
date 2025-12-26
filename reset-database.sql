-- ============================================
-- DATABASE RESET SCRIPT
-- ============================================
-- WARNING: This will DELETE ALL DATA in your database!
-- Only run this if you want to start completely fresh.
--
-- This script drops all tables and objects to give you a clean slate.
-- After running this, run the clean-schema.sql to rebuild everything.

-- ============================================
-- DISABLE RLS (to allow dropping)
-- ============================================
ALTER TABLE IF EXISTS projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS machines DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS parts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bom_relations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checkins DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checkin_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS delivery_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS delivery_note_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS xero_credentials DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS xero_sync_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS part_revisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projet_checkins DISABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP ALL TABLES (CASCADE to remove dependencies)
-- ============================================
DROP TABLE IF EXISTS delivery_note_items CASCADE;
DROP TABLE IF EXISTS delivery_notes CASCADE;
DROP TABLE IF EXISTS checkin_items CASCADE;
DROP TABLE IF EXISTS checkins CASCADE;
DROP TABLE IF EXISTS projet_checkins CASCADE;
DROP TABLE IF EXISTS project_notes CASCADE;
DROP TABLE IF EXISTS operations CASCADE;
DROP TABLE IF EXISTS bom_relations CASCADE;
DROP TABLE IF EXISTS part_revisions CASCADE;
DROP TABLE IF EXISTS parts CASCADE;
DROP TABLE IF EXISTS machines CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS xero_sync_log CASCADE;
DROP TABLE IF EXISTS xero_credentials CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this script, verify all tables are gone:
-- Run: SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- Should return empty or only system tables

-- ============================================
-- NEXT STEP
-- ============================================
-- Now run: clean-schema.sql to rebuild everything from scratch
