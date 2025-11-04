# Supabase Integration - Complete Setup Guide

## 🎉 What's Been Implemented

CoDexa now has **full Supabase integration** just like Lovable! Users can connect their Supabase project and generate fullstack apps with real databases, authentication, and more.

---

## ✅ Completed Features

### 1. **Database Schema**
- Added Supabase fields to Project model:
  - `supabaseUrl` - Project URL
  - `supabaseAnonKey` - Public anon key
  - `supabaseServiceKey` - Service role key (optional)
  - `supabaseProjectId` - Extracted project ID
  - `supabaseEnabled` - Connection status

### 2. **API Routes**
- `/api/supabase/connect` - Connect Supabase to project
- `/api/supabase/disconnect` - Disconnect Supabase  
- `/api/supabase/status` - Check connection status

### 3. **UI Component**
- `SupabaseIntegration` component in chat sidebar
- Collapsible "Integrations" section
- Connect/disconnect buttons
- Status indicators
- Modal dialog for entering credentials
- Link to Supabase dashboard

### 4. **AI Prompt**
- `SUPABASE_PROMPT` - Comprehensive guide teaching AI:
  - Database schema design with RLS policies
  - TypeScript type generation
  - Supabase client setup
  - Custom React hooks patterns
  - Auth, CRUD, Real-time, Storage examples

### 5. **AI Agent Tools**
- `injectSupabaseCredentials` - Auto-inject env variables
- `createSupabaseTables` - Design SQL schemas
- `generateSupabaseClient` - Generate client code
- `generateAuthHook` - Create useAuth() hook
- `generateDataHook` - Create CRUD hooks

### 6. **Agent Integration**
- Automatic Supabase detection
- Dynamic prompt switching (SUPABASE_PROMPT vs PROMPT)
- Conditional tool loading

---

## 🚀 How to Use

### Step 1: Start Development Server

```powershell
npm run dev
```

### Step 2: Create or Open a Project

Navigate to any project in CoDexa.

### Step 3: Connect Supabase

1. **Look in the chat sidebar** - scroll down to see "Integrations" section
2. **Click to expand** the Integrations section
3. **Click "Connect"** on the Supabase card
4. **Enter your credentials**:
   - **Project URL**: `https://xxxxx.supabase.co` (from Supabase Dashboard → Settings → API)
   - **Anon Key**: Your public anon key (from same location)
   - **Service Key** (optional): Your service role key for admin operations
5. **Click "Connect"** - status will show green checkmark when successful

### Step 4: Generate Fullstack App

Now when you ask CoDexa to build apps with backend features, it will automatically use Supabase!

**Example prompts:**
- "Build a todo app with user authentication"
- "Create a blog with posts and comments"
- "Make a task manager where users can create, edit, and delete tasks"

---

## 📝 What Gets Generated

When Supabase is connected and you request a fullstack app, CoDexa will generate:

### Frontend Files:
- `lib/supabase.ts` - Supabase client initialization
- `lib/database.types.ts` - TypeScript types from schema
- `hooks/useAuth.ts` - Authentication hook
- `hooks/use[Resource].ts` - CRUD hooks for each table
- `.env.local` - Environment variables (auto-injected)
- React components using the hooks

### SQL Schema:
The AI will design a SQL schema with:
- CREATE TABLE statements
- Row Level Security (RLS) policies
- Proper relationships and constraints

**Note:** The SQL schema is included in generated documentation. You should:
1. Copy the SQL from the generated app
2. Paste into Supabase SQL Editor
3. Run to create the tables

---

## 🎯 Example: Todo App with Auth

**User prompt:**
```
Build a todo app where users can sign up, log in, and manage their personal tasks
```

**What CoDexa generates:**

1. **SQL Schema** (`SETUP.md` in generated app):
```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

2. **Supabase Client** (`lib/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

3. **Auth Hook** (`hooks/useAuth.ts`):
```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // ... auth logic
  return { user, signUp, signIn, signOut };
}
```

4. **Data Hook** (`hooks/useTodos.ts`):
```typescript
export function useTodos() {
  const [todos, setTodos] = useState([]);
  // ... CRUD operations
  return { todos, createTodo, updateTodo, deleteTodo };
}
```

5. **UI Components**:
- Login/Signup forms
- Todo list
- Add todo form
- Complete/delete actions

---

## 🔧 Technical Details

### How It Works:

1. **User connects Supabase** → Credentials saved in CoDexa database
2. **User requests fullstack app** → Agent checks if Supabase is connected
3. **If connected** → Uses `SUPABASE_PROMPT` and Supabase tools
4. **AI generates**:
   - Designs SQL schema with RLS
   - Creates Supabase client
   - Generates React hooks
   - Builds UI components
   - Injects credentials into `.env.local`
5. **User runs SQL** in Supabase dashboard
6. **App works immediately** with real database!

### Security:

- **Anon key**: Exposed in frontend (safe, row-level security protects data)
- **Service key**: Never exposed to frontend, only used server-side
- **RLS policies**: Automatically generated to ensure users only access their own data
- **Credentials**: Encrypted in CoDexa database

### Architecture:

```
User Request
    ↓
Check Supabase Status
    ↓
[If Connected]
    ↓
Use SUPABASE_PROMPT + Supabase Tools
    ↓
Generate:
  - SQL Schema
  - Supabase Client
  - Auth Hook
  - Data Hooks
  - UI Components
    ↓
Inject .env.local
    ↓
Return Complete App
```

---

## 🧪 Testing

### Test 1: Connection
1. Connect Supabase with your credentials
2. Check status shows green checkmark
3. View Supabase dashboard link works

### Test 2: Simple CRUD App
**Prompt:** "Build a notes app where I can add, edit, and delete notes"

**Expected:**
- Generates `notes` table schema
- Creates `useNotes()` hook
- Builds UI with CRUD operations
- SQL included in documentation

### Test 3: Auth App
**Prompt:** "Build a todo app with user login"

**Expected:**
- Generates `todos` table with `user_id` foreign key
- Creates `useAuth()` and `useTodos()` hooks
- Builds login/signup forms
- RLS policies ensure user isolation

### Test 4: Real-time App
**Prompt:** "Build a collaborative task board where updates appear live"

**Expected:**
- Generates table schema
- Creates hook with Supabase Realtime subscription
- Updates appear without refresh

---

## 🐛 Troubleshooting

### Issue: "Supabase not connected" error
**Solution:** Make sure you've clicked "Connect" in the Integrations tab

### Issue: Tables don't exist
**Solution:** Copy SQL from generated app and run in Supabase SQL Editor

### Issue: Authentication not working
**Solution:** Check that:
- Supabase email auth is enabled (Dashboard → Authentication → Providers)
- Email confirmation is disabled for testing (Dashboard → Authentication → Email Templates)

### Issue: "Failed to connect" error
**Solution:** Verify credentials:
- URL format: `https://xxxxx.supabase.co`
- Anon key is the public one (not service key)

---

## 📦 Dependencies

Already installed:
- `@supabase/supabase-js` - Supabase JavaScript client

---

## 🎓 Learn More

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

---

## 🚢 Next Steps

The integration is **complete and ready to use!** 

1. Start your dev server
2. Connect your Supabase project
3. Start building fullstack apps with real databases!

**Happy coding! 🎉**
