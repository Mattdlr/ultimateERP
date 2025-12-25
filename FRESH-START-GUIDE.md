# Fresh Start Guide - Complete Reset

This guide will help you completely reset and rebuild your ultimateERP database and application from scratch.

## ⚠️ WARNING

**This will DELETE ALL your current data!** Only proceed if you want to start completely fresh.

---

## Step 1: Reset the Database

### Option A: Using Supabase Dashboard (Recommended)

1. Go to [app.supabase.com](https://app.supabase.com)
2. Open your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**
5. Copy and paste the contents of **`reset-database.sql`**
6. Click **"Run"** or press `Ctrl+Enter`
7. Wait for completion (should say "Success")

### Option B: Using Supabase CLI

```bash
supabase db reset
```

---

## Step 2: Create Clean Schema

1. Still in **SQL Editor**, click **"New query"**
2. Copy and paste the contents of **`clean-schema.sql`**
3. Click **"Run"** or press `Ctrl+Enter`
4. Wait for completion (this creates all tables, indexes, and policies)

### Verify Schema Creation

Run this query to verify all tables were created:

```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

You should see:
- bom_relations
- checkin_items
- checkins
- customers
- delivery_note_items
- delivery_notes
- machines
- materials
- operations
- parts
- project_notes
- projects
- suppliers

---

## Step 3: Verify Application Code

The App.jsx should already be using the correct table structure. The application includes:

### Features:
- ✅ **Projects** - with project numbers, customers, dates, and value
- ✅ **Project Details** - tabbed view (Details, Check-ins, Delivery Notes)
- ✅ **Project Duplication** - create multiple identical projects
- ✅ **Customers** - company info, contact person, email, phone, address
- ✅ **Suppliers** - supplier info, lead times
- ✅ **Parts** - manufactured, purchased, and assemblies
- ✅ **Bill of Materials (BOM)** - parent-child relationships
- ✅ **Part Revisions** - incrementable part numbers
- ✅ **Stock Materials** - with weight calculations
- ✅ **Operations** - manufacturing sequences
- ✅ **Machines** - mills, lathes, etc.
- ✅ **Materials** - stock materials with density
- ✅ **Check-ins** - track project progress
- ✅ **Delivery Notes** - printable delivery documentation
- ✅ **Soft Deletes** - safely remove items without data loss

### Fixed Issues:
- ✅ Number inputs now allow deletion for editing
- ✅ Projects sorted by project number ascending
- ✅ Dialog closes when creating multiple projects
- ✅ Customer editable after project creation

---

## Step 4: Start Fresh

1. **Clear browser cache** (to remove any old state)
   - Chrome/Edge: `Ctrl+Shift+Delete` → Clear cached images and files
   - Firefox: `Ctrl+Shift+Delete` → Cached Web Content

2. **Restart your dev server**:
   ```bash
   npm run dev
   ```

3. **Open the application**: `http://localhost:5173`

4. **You should see**:
   - Empty navigation (no projects, parts, etc.)
   - All views accessible but empty
   - Ready to add your first data!

---

## Step 5: Add Sample Data (Optional)

Want to add some test data? Here are some SQL snippets:

### Add Sample Customers

```sql
INSERT INTO customers (name, email, phone, contact, address)
VALUES
  ('Acme Corporation', 'info@acme.com', '01234 567890', 'John Smith', '123 Business St, London'),
  ('Global Industries', 'contact@global.com', '01234 567891', 'Jane Doe', '456 Industry Ave, Manchester');
```

### Add Sample Suppliers

```sql
INSERT INTO suppliers (name, email, phone, contact, lead_time)
VALUES
  ('Metal Suppliers Ltd', 'sales@metal.com', '01234 567892', 'Bob Johnson', 7),
  ('Fasteners Direct', 'info@fasteners.com', '01234 567893', 'Alice Brown', 3);
```

### Add Sample Materials

```sql
INSERT INTO materials (name, density)
VALUES
  ('Mild Steel', 7850),
  ('Aluminium 6082', 2700),
  ('Stainless Steel 316', 8000);
```

### Add Sample Machines

```sql
INSERT INTO machines (name, type)
VALUES
  ('Haas VF3 CNC Mill', 'mill'),
  ('Colchester Lathe', 'lathe');
```

---

## Troubleshooting

### "Permission denied" errors

**Problem**: RLS policies blocking access

**Solution**: Make sure you're logged in to Supabase. Check auth status:
```javascript
const { data: { user } } = await supabase.auth.getUser()
console.log(user)
```

### Tables not showing up

**Problem**: Schema didn't run completely

**Solution**:
1. Check SQL Editor for errors
2. Re-run `clean-schema.sql`
3. Check that all tables exist: `SELECT * FROM pg_tables WHERE schemaname = 'public';`

### Foreign key constraint errors

**Problem**: Trying to delete items that are referenced

**Solution**: This is intentional! The system prevents:
- Deleting customers with projects
- Deleting suppliers with parts
- Deleting parts in BOMs
- Etc.

Use soft delete instead (sets `deleted_at` timestamp).

### App shows old data

**Problem**: Browser cache or localStorage

**Solution**:
1. Clear browser cache completely
2. Open DevTools → Application → Clear all storage
3. Hard refresh: `Ctrl+Shift+R`

---

## What's Different from Before

### Database:
- ✅ Clean schema (no migrations to worry about)
- ✅ All indexes optimized
- ✅ Proper RLS policies
- ✅ Foreign key constraints
- ✅ Check constraints for data integrity

### No Xero Integration:
- ❌ Removed all Xero code
- ❌ No contacts table (using separate customers/suppliers)
- ✅ Cleaner, simpler codebase

### Bug Fixes:
- ✅ Number inputs now editable
- ✅ Project sorting fixed
- ✅ Modal behavior correct
- ✅ All foreign keys valid

---

## Next Steps

After completing this fresh start:

1. **Add your core data**:
   - Customers
   - Suppliers
   - Materials
   - Machines

2. **Create your first project**

3. **Build your parts catalog**

4. **Set up BOMs for assemblies**

5. **Start tracking with check-ins and delivery notes**

---

## Support

If you encounter any issues:

1. Check the browser console for errors (F12)
2. Check Supabase logs for database errors
3. Verify all migrations ran successfully
4. Make sure you're authenticated

Your database is now clean and optimized! 🎉
