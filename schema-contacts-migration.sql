-- ============================================
-- UNIFIED CONTACTS TABLE
-- ============================================
-- This replaces separate customers and suppliers tables
-- Supports both local-only contacts and Xero-synced contacts

-- Create contacts table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_is_customer ON contacts(is_customer) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_is_supplier ON contacts(is_supplier) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_xero_id ON contacts(xero_contact_id) WHERE xero_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_sync_status ON contacts(sync_status);
CREATE INDEX IF NOT EXISTS idx_contacts_deleted_at ON contacts(deleted_at);

-- ============================================
-- DATA MIGRATION
-- ============================================
-- Migrate existing customers to contacts
INSERT INTO contacts (id, name, email, phone, contact, address, is_customer, is_supplier, sync_status, created_at, deleted_at)
SELECT
  id,
  name,
  email,
  phone,
  contact,
  address,
  true as is_customer, -- Mark as customer
  false as is_supplier,
  'local_only' as sync_status,
  created_at,
  deleted_at
FROM customers
WHERE id NOT IN (SELECT id FROM contacts); -- Avoid duplicates if script is run multiple times

-- Migrate existing suppliers to contacts
-- Note: If a supplier has the same name as a customer, merge them
INSERT INTO contacts (id, name, email, phone, contact, address, is_customer, is_supplier, sync_status, created_at, deleted_at)
SELECT
  s.id,
  s.name,
  s.email,
  s.phone,
  s.contact,
  NULL as address, -- Suppliers don't have address in current schema
  false as is_customer,
  true as is_supplier, -- Mark as supplier
  'local_only' as sync_status,
  s.created_at,
  s.deleted_at
FROM suppliers s
WHERE s.id NOT IN (SELECT id FROM contacts) -- Avoid duplicates
ON CONFLICT (id) DO NOTHING;

-- Update any contacts that exist as both customer and supplier
-- (This handles cases where same company is in both tables with different IDs)
UPDATE contacts c1
SET is_supplier = true
FROM suppliers s
WHERE c1.name = s.name
  AND c1.is_customer = true
  AND c1.deleted_at IS NULL
  AND s.deleted_at IS NULL;

-- ============================================
-- UPDATE FOREIGN KEY REFERENCES
-- ============================================
-- Note: We'll keep the existing customer_id and supplier_id columns
-- but they now reference the contacts table

-- Update projects table foreign key to reference contacts
ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_customer_id_fkey,
  ADD CONSTRAINT projects_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES contacts(id) ON DELETE RESTRICT;

-- Update parts table foreign key to reference contacts
ALTER TABLE parts
  DROP CONSTRAINT IF EXISTS parts_supplier_id_fkey,
  ADD CONSTRAINT parts_supplier_id_fkey
    FOREIGN KEY (supplier_id) REFERENCES contacts(id) ON DELETE SET NULL;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all contacts
CREATE POLICY contacts_select_policy ON contacts
  FOR SELECT
  USING (deleted_at IS NULL);

-- Policy: Authenticated users can insert contacts
CREATE POLICY contacts_insert_policy ON contacts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update contacts
CREATE POLICY contacts_update_policy ON contacts
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete (soft delete) contacts
CREATE POLICY contacts_delete_policy ON contacts
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- OPTIONAL: Drop old tables after migration
-- ============================================
-- Uncomment these lines after verifying the migration was successful
-- and updating all application code to use contacts table

-- DROP TABLE IF EXISTS customers CASCADE;
-- DROP TABLE IF EXISTS suppliers CASCADE;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE contacts IS 'Unified contacts table for customers, suppliers, and future Xero sync';
COMMENT ON COLUMN contacts.is_customer IS 'True if contact is a customer';
COMMENT ON COLUMN contacts.is_supplier IS 'True if contact is a supplier';
COMMENT ON COLUMN contacts.xero_contact_id IS 'Xero contact UUID for synced contacts';
COMMENT ON COLUMN contacts.sync_status IS 'Sync status: synced (from Xero), local_only (ERP only), pending_push (needs push to Xero)';
