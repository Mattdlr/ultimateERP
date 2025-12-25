-- ============================================
-- ROLLBACK CONTACTS MIGRATION
-- ============================================
-- This script undoes the changes from schema-contacts-migration.sql
-- Run this in Supabase SQL Editor to revert to separate customers/suppliers tables

-- ============================================
-- STEP 1: Restore Original Foreign Keys
-- ============================================
-- Restore projects table foreign key to reference customers
ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_customer_id_fkey,
  ADD CONSTRAINT projects_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT;

-- Restore parts table foreign key to reference suppliers
ALTER TABLE parts
  DROP CONSTRAINT IF EXISTS parts_supplier_id_fkey,
  ADD CONSTRAINT parts_supplier_id_fkey
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

-- ============================================
-- STEP 2: Drop Contacts Table
-- ============================================
-- This will CASCADE and remove any dependent objects
DROP TABLE IF EXISTS contacts CASCADE;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this script, verify:
-- 1. Contacts table is gone: SELECT * FROM contacts; (should error)
-- 2. Customers table still exists: SELECT COUNT(*) FROM customers;
-- 3. Suppliers table still exists: SELECT COUNT(*) FROM suppliers;
-- 4. Projects still reference customers: \d projects (in psql)
-- 5. Parts still reference suppliers: \d parts (in psql)

-- ============================================
-- NOTES
-- ============================================
-- This rollback is safe because schema-contacts-migration.sql did NOT drop
-- the original customers and suppliers tables. Your data is still there.
--
-- Any contacts you added AFTER running the migration will be lost.
-- If you created contacts that weren't in the original customers/suppliers
-- tables, you'll need to manually re-create them after rollback.
