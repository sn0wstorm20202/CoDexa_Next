# 🚀 Supabase Setup Guide for CoDexa

CoDexa now supports **fully functional websites** with real backend powered by Supabase!

## Features Enabled

✅ **PostgreSQL Database** - Create tables, relationships, queries
✅ **Authentication** - Login, signup, OAuth providers  
✅ **File Storage** - Upload images, documents, media
✅ **Realtime** - Live updates, subscriptions, presence
✅ **Row Level Security** - Multi-tenant data isolation
✅ **Edge Functions** - Serverless API endpoints

---

## 📋 Prerequisites

1. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
2. **New Supabase Project** - Create a project in your dashboard
3. **Environment Variables** - Copy your project credentials

---

## ⚙️ Configuration Steps

### Step 1: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `CoDexa Backend` (or any name)
   - **Database Password**: Strong password (save it!)
   - **Region**: Choose closest to you
4. Wait ~2 minutes for project creation

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon/public** key (safe for client-side)
   - **service_role** key (keep secret!)

### Step 3: Add to Environment Variables

Create/update `.env.local` in your CoDexa project root:

\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Existing variables (keep these)
DATABASE_URL=your-existing-database-url
OPENAI_API_KEY=your-openai-key
E2B_API_KEY=your-e2b-key
# ... other vars
\`\`\`

### Step 4: Enable Required Extensions

In Supabase SQL Editor, run:

\`\`\`sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geo features (optional)
CREATE EXTENSION IF NOT EXISTS postgis;
\`\`\`

### Step 5: Configure Storage

1. In Supabase dashboard, go to **Storage**
2. Create a bucket named **"uploads"**
3. Set it to **Public** (or Private for user files)
4. Add storage policies:

\`\`\`sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow public read access
CREATE POLICY "Public files are readable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');
\`\`\`

### Step 6: Enable Realtime (Optional)

1. In Supabase dashboard, go to **Database** → **Replication**
2. Enable realtime for tables you want live updates on
3. Example: Enable for `messages`, `notifications` tables

### Step 7: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. **Site URL**: Set to your CoDexa URL (e.g., `http://localhost:3000`)
3. **Redirect URLs**: Add:
   - `http://localhost:3000/**`
   - `https://*.e2b.dev/**` (for sandbox auth)
   - Your production URL
4. Enable auth providers:
   - ✅ Email/Password (enabled by default)
   - ✅ Google OAuth (optional - requires Google Cloud setup)
   - ✅ GitHub OAuth (optional - requires GitHub OAuth app)

### Step 8: Restart Your Dev Server

\`\`\`bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
\`\`\`

---

## 🧪 Testing the Integration

### Test 1: Environment Variables

Create a test page to verify credentials are loaded:

\`\`\`typescript
// app/test-supabase/page.tsx
'use client';

export default function TestSupabase() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Supabase Configuration Test</h1>
      <div className="space-y-2">
        <div>URL Configured: {hasUrl ? '✅ Yes' : '❌ No'}</div>
        <div>Anon Key Configured: {hasKey ? '✅ Yes' : '❌ No'}</div>
      </div>
    </div>
  );
}
\`\`\`

### Test 2: Create a Simple Table

In Supabase SQL Editor:

\`\`\`sql
-- Create a test table
CREATE TABLE test_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE test_items ENABLE ROW LEVEL SECURITY;

-- Create policy for testing
CREATE POLICY "Allow all operations for testing"
  ON test_items FOR ALL
  USING (true)
  WITH CHECK (true);
\`\`\`

### Test 3: Use CoDexa to Create an App

Try these prompts:

1. **"Create a simple todo list"**
   - Should generate app with Supabase CRUD operations
   
2. **"Add authentication to my app"**
   - Should generate login/signup pages
   
3. **"Add file upload for profile pictures"**
   - Should generate upload component with Supabase Storage

---

## 🏗️ Architecture Overview

\`\`\`
┌─────────────────────────────────────┐
│  CoDexa Backend (Your Server)       │
│  - Manages Supabase project         │
│  - Creates tables via SQL           │
│  - Configures auth & storage        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Supabase Cloud (Single Project)    │
│  - PostgreSQL Database               │
│  - Authentication Service            │
│  - Storage Buckets                   │
│  - Realtime Server                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  E2B Sandbox (Generated Website)    │
│  - Gets Supabase credentials         │
│  - Connects to shared Supabase       │
│  - URL: https://xyz.e2b.dev          │
└─────────────────────────────────────┘
\`\`\`

---

## 🔒 Security Best Practices

### 1. Never Expose Service Role Key

❌ **DON'T**: Include in client-side code or `.env.local` in sandbox
✅ **DO**: Keep in your CoDexa backend only

### 2. Always Use Row Level Security (RLS)

\`\`\`sql
-- Always enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Add project isolation policy
CREATE POLICY "Project data isolation"
  ON your_table FOR ALL
  USING (project_id = current_setting('app.project_id')::uuid);
\`\`\`

### 3. Validate User Input

\`\`\`typescript
// Example: Validate before inserting
const { error } = await supabase
  .from('posts')
  .insert({
    title: sanitize(userInput.title), // Sanitize input
    content: userInput.content
  });
\`\`\`

### 4. Use Auth Policies

\`\`\`sql
-- Only allow users to edit their own data
CREATE POLICY "Users can edit own data"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
\`\`\`

---

## 🎯 Example Use Cases

### 1. Blog with Authentication

**User prompt**: "Create a blog with authentication"

**CoDexa generates**:
- `auth_users` table (using Supabase Auth)
- `posts` table with RLS
- Login/signup pages
- Protected `/dashboard` route
- Create post form
- Public blog listing

### 2. File Upload Gallery

**User prompt**: "Make an image gallery with upload"

**CoDexa generates**:
- `images` table with metadata
- Supabase Storage bucket
- Upload component with progress
- Gallery grid with images
- Delete functionality

### 3. Real-time Chat

**User prompt**: "Build a chat app"

**CoDexa generates**:
- `messages` table
- Realtime subscription
- Live message updates
- Typing indicators
- Online status

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

**Solution**: Check `.env.local` file exists and has correct variables

### Error: "Failed to fetch"

**Solution**: 
1. Check Supabase project is not paused
2. Verify URLs in Supabase auth settings
3. Check network/firewall

### Error: "RLS policy violation"

**Solution**:
1. Disable RLS temporarily for testing: `ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;`
2. Or create permissive policy: `CREATE POLICY "Allow all" ON your_table USING (true);`

### Sandbox Can't Connect

**Solution**:
1. Add `https://*.e2b.dev` to Supabase auth redirect URLs
2. Check env vars are injected (look for `.env.local` in sandbox)

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)

---

## ✅ Setup Complete!

You're now ready to generate **fully functional websites** with CoDexa!

Try creating your first full-stack app:
\`\`\`
"Create a task manager with authentication and real-time updates"
\`\`\`

🎉 **Happy Building!**
