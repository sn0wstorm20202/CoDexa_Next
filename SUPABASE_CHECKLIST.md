# ✅ Supabase Setup Checklist

## Local Setup (CoDexa)
- [x] ✅ Supabase packages installed
- [x] ✅ Client utilities created
- [x] ✅ Agent helper implemented
- [x] ✅ Sandbox integration configured
- [x] ✅ `.env.local` configured with credentials

## Supabase Dashboard Setup

### 1. SQL Extensions (Required)
**Go to:** Supabase Dashboard → SQL Editor

**Action:** Copy and run `supabase-setup.sql` file

This will:
- ✅ Enable UUID extension
- ✅ Enable PostGIS (optional)
- ✅ Create helper functions

**Status:** ⬜ Not done / ✅ Done

---

### 2. Storage Bucket (Optional - for file uploads)
**Go to:** Supabase Dashboard → Storage

**Action:** Create bucket named `uploads`

**Settings:**
- Public: ✅ Yes (for public files) or ❌ No (for private files)
- File size limit: 50MB

**Status:** ⬜ Not done / ✅ Done

---

### 3. Authentication URLs (Required for auth features)
**Go to:** Supabase Dashboard → Authentication → Settings

**Site URL:** `http://localhost:3000`

**Redirect URLs - Add these:**
```
http://localhost:3000/**
https://*.e2b.dev/**
```

**Status:** ⬜ Not done / ✅ Done

---

### 4. Auth Providers (Optional)
**Go to:** Supabase Dashboard → Authentication → Providers

**Enable:**
- ✅ Email (enabled by default)
- ⬜ Google (requires Google Cloud setup)
- ⬜ GitHub (requires GitHub OAuth app)

**Status:** ⬜ Not configured / ✅ Configured

---

### 5. Realtime (Optional - for live updates)
**Go to:** Supabase Dashboard → Database → Replication

**Action:** Enable realtime for tables you want live updates

**Commonly enabled for:**
- messages
- notifications
- chat_rooms

**Status:** ⬜ Not configured / ✅ Configured

---

## Testing

### Test 1: Environment Variables
```bash
npm run dev
```
- ⬜ Server starts without errors
- ⬜ No "Missing Supabase environment variables" warnings

### Test 2: Create Test Project
**Go to:** http://localhost:3000/builder

**Try:** "Create a simple todo list"

**Expected:**
- ⬜ Project generates successfully
- ⬜ Sandbox URL works
- ⬜ No Supabase connection errors

### Test 3: Check Supabase Dashboard
**Go to:** Supabase Dashboard → Table Editor

**Expected:**
- ⬜ No new tables yet (until you generate app with database)
- ⬜ Can manually create test table

---

## Quick Test Commands

### Verify .env.local is loaded:
```bash
# In PowerShell
Get-Content .env.local
```

### Check if Supabase packages are installed:
```bash
npm list @supabase/supabase-js @supabase/ssr
```

### Start dev server:
```bash
npm run dev
```

---

## Common Issues

### ❌ "Missing Supabase environment variables"
**Fix:** Check `.env.local` has all 3 variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### ❌ "Failed to fetch" in sandbox
**Fix:** Add `https://*.e2b.dev/**` to Supabase redirect URLs

### ❌ "RLS policy violation"
**Fix:** Temporarily disable RLS for testing:
```sql
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

---

## ✅ All Done?

If all checkboxes are checked, you're ready to build!

**Try your first full-stack app:**
```
"Create a blog with authentication and file uploads"
```

🎉 **Happy building with CoDexa + Supabase!**
