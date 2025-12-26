-- Add user email tracking to project notes
ALTER TABLE project_notes ADD COLUMN IF NOT EXISTS created_by_email TEXT;

-- Update existing notes to have the current user's email (if available)
-- Note: This will leave existing notes without email, which is fine
-- Going forward, all new notes will include the email
