# ⚡ Quick Start Guide

## 🎯 Setup in 5 Minutes

### 1. ✅ Local Setup (Done!)
- Supabase packages installed
- Environment configured
- Integration ready

### 2. 📋 Supabase Dashboard (You need to do)

Go to your Supabase project dashboard:

#### A. Run SQL (Required)
```sql
-- In SQL Editor, run:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### B. Configure Auth (Required)
- Go to **Authentication** → **URL Configuration**
- Site URL: `http://localhost:3000`
- Redirect URLs: Add `https://*.e2b.dev/**`

#### C. Create Storage (Optional)
- Go to **Storage**
- Create bucket: `uploads`
- Make it public

### 3. 🚀 Test It

```bash
npm run dev
```

Go to http://localhost:3000/builder and try:
```
"Create a simple todo list"
```

---

## 📝 What You Need to Complete

| Task | Location | Time | Required? |
|------|----------|------|-----------|
| Run SQL extensions | SQL Editor | 1 min | ✅ Yes |
| Configure auth URLs | Authentication | 1 min | ✅ Yes |
| Create storage bucket | Storage | 1 min | ⬜ Optional |

---

## 🎯 Quick Commands

```bash
# Start dev server
npm run dev

# Check Supabase packages
npm list @supabase/supabase-js @supabase/ssr

# View env vars
Get-Content .env.local
```

---

## 🧪 Test Prompts

**Beginner:**
```
"Create a simple note-taking app"
```

**With Database:**
```
"Build a todo list that saves items"
```

**With Auth:**
```
"Create a blog with user login"
```

**Full-Stack:**
```
"Build a chat app with authentication and real-time messages"
```

---

## 📚 Full Documentation

- **SETUP_COMPLETE.md** - Complete setup guide
- **SUPABASE_CHECKLIST.md** - Detailed checklist
- **SUPABASE_SETUP.md** - In-depth instructions
- **supabase-setup.sql** - SQL to run

---

## 🎉 Ready!

Once you complete the 2 Supabase dashboard tasks above, you can build **fully functional websites** with:

✅ Real databases
✅ User authentication
✅ File uploads
✅ Real-time features

**Start building now:** http://localhost:3000/builder
