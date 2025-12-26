# SQL Database Schema

This folder contains all SQL schema files for the Workshop ERP system.

## Main Schema File

**`database-schema.sql`** - The complete, unified database schema for Supabase deployment.

This file includes:
- All core tables (projects, parts, operations, contacts, etc.)
- Row Level Security (RLS) policies
- Indexes for performance
- Functions and triggers
- Seed data (machines and materials)
- Soft delete support

### Deploying the Database

To set up a new database instance:
1. Open your Supabase project
2. Go to the SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Run the script

## Migration History

The `migrations-backup/` folder contains the original migration files that were merged to create the unified schema. These are preserved for reference and historical tracking:

- `supabase-schema.sql` - Original base schema
- `schema-contacts-migration.sql` - Unified contacts system
- `schema-update-checkins.sql` - Project check-ins functionality
- `schema-update-delivery-notes.sql` - Delivery notes system
- `schema-update-delivery-note-numbers.sql` - Delivery note numbering
- `schema-update-part-revisions.sql` - Part revision tracking
- `schema-update-note-user.sql` - User email tracking in notes
- `schema-update-soft-deletes.sql` - Soft delete implementation

**Note:** For new deployments, use `database-schema.sql` instead of running the individual migration files.
