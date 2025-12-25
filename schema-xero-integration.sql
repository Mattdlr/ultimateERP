-- ============================================
-- XERO INTEGRATION TABLES
-- ============================================

-- Table to store Xero OAuth credentials (encrypted)
CREATE TABLE IF NOT EXISTS xero_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  tenant_id TEXT NOT NULL, -- Xero organization ID
  tenant_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track sync history and status
CREATE TABLE IF NOT EXISTS xero_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_type TEXT NOT NULL, -- 'contacts', 'invoices', etc.
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  contacts_synced INTEGER DEFAULT 0,
  contacts_updated INTEGER DEFAULT 0,
  contacts_created INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE xero_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE xero_sync_log ENABLE ROW LEVEL SECURITY;

-- Policies for xero_credentials (admin only)
CREATE POLICY xero_credentials_select_policy ON xero_credentials
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY xero_credentials_insert_policy ON xero_credentials
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY xero_credentials_update_policy ON xero_credentials
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY xero_credentials_delete_policy ON xero_credentials
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Policies for sync log
CREATE POLICY xero_sync_log_select_policy ON xero_sync_log
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY xero_sync_log_insert_policy ON xero_sync_log
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_xero_sync_log_created_at ON xero_sync_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xero_sync_log_status ON xero_sync_log(status);

-- Comments
COMMENT ON TABLE xero_credentials IS 'Stores Xero OAuth tokens and tenant information';
COMMENT ON TABLE xero_sync_log IS 'Logs all Xero sync operations for auditing and status tracking';
