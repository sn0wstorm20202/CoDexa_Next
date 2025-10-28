# 🔧 Comprehensive Debugging & Auto-Fix System

## Your Reported Issues

### **Issue 1: Preview Not Working** ❌
- Complex prompts (McDonald's) → Blank preview page
- No website showing in sandbox
- "Fragment view" not appearing

### **Issue 2: Database Not Working** ❌
- Backend integration failing
- Data not persisting
- Changes not reflecting in Supabase

### **Issue 3: Edit Mode Broken** ❌
- Shows Next.js default page when editing
- Cannot fetch existing website
- Loses current site state

### **Issue 4: Authentication Missing** ❌
- Login page not showing Google OAuth
- Redirect not working after login
- OAuth buttons missing

---

## 🚨 Root Causes Identified

### **1. Agent Creates Too Many Files at Once**
When you request McDonald's app (8+ pages), the agent tries to create 25+ files simultaneously:
- ❌ This overwhelms the sandbox
- ❌ Files created out of order
- ❌ Import errors cascade
- ❌ Compilation fails
- ❌ Result: Blank preview

**Solution:** Force phased creation (already added to prompt)

---

### **2. Missing "use client" Directives**
Generated pages use `useState`, `useEffect`, but missing `"use client"`:
```typescript
// ❌ WRONG - Missing "use client"
import { useState } from 'react';
export default function Page() {
  const [data, setData] = useState([]);
  // ...
}

// ✅ CORRECT
"use client";
import { useState } from 'react';
export default function Page() {
  const [data, setData] = useState([]);
  // ...
}
```

**Result:** Server component error → Blank page

---

### **3. Database Tables Not Created**
Agent generates UI code but **doesn't tell you to create database tables**:
- ❌ Code references `cart_items` table
- ❌ But table doesn't exist in Supabase
- ❌ All database operations fail silently
- ❌ No data shows up

**Solution:** Agent must output SQL schema first

---

### **4. Edit Mode Cannot Access Sandbox Files**
When you click "Edit", the system cannot:
- ❌ Read existing sandbox files
- ❌ Load current website state
- ❌ Show Next.js default instead

**Root cause:** Sandbox is isolated, files not accessible from edit mode

---

### **5. OAuth Code Not Generated**
Agent creates basic login but:
- ❌ No Google OAuth button added
- ❌ No `app/auth/callback/route.ts` created
- ❌ No `lib/supabase/server.ts` for OAuth

**Result:** Only email/password login appears

---

## ✅ COMPREHENSIVE FIX SYSTEM

I'll create an **automated debugging workflow** that runs after every generation:

### **Debug Workflow:**

```
1. GENERATION STARTS
   ↓
2. MONITOR FILE CREATION
   - Track files being created
   - Detect if too many at once
   - Force phased creation if needed
   ↓
3. AUTO-SCAN FOR ERRORS
   - Check for missing "use client"
   - Verify imports exist
   - Check export patterns
   ↓
4. AUTO-FIX DETECTED ERRORS
   - Add "use client" where needed
   - Create missing files
   - Fix import paths
   ↓
5. DATABASE VALIDATION
   - Check if database tables mentioned
   - Output SQL schema
   - Verify RLS policies
   ↓
6. AUTHENTICATION CHECK
   - Verify login page exists
   - Check for OAuth buttons
   - Ensure callback route exists
   ↓
7. SANDBOX HEALTH CHECK
   - Wait for compilation
   - Check if preview loads
   - Retry if blank
   ↓
8. POST-GENERATION VERIFICATION
   - Test main routes
   - Verify no 404s
   - Check console for errors
   ↓
9. REPORT TO USER
   - List what was created
   - Show SQL to run
   - Provide testing checklist
```

---

## 🛠️ Immediate Fixes You Need

### **FIX 1: For Current Broken Sites**

**Step 1: Check Sandbox Logs**
```bash
# Find your sandbox directory
cd E:\CODING\CoDexa_Next

# Look for error logs
# Check: generated/, sandbox-templates/, or temp directories
```

**Step 2: Manual Fix Current Site**

If your McDonald's site is broken:

1. **Add "use client" to all pages:**
   - Open each page file (menu/page.tsx, cart/page.tsx, etc.)
   - Add `"use client";` at the very top

2. **Create database tables:**
   - Go to Supabase SQL Editor
   - Run the schema from `MCDONALDS_COMPLETE_EXAMPLE.md`

3. **Add OAuth files:**
   - Follow `OAUTH_FIX_GUIDE.md`
   - Create `app/auth/callback/route.ts`
   - Create `lib/supabase/server.ts`
   - Update login page with Google button

---

### **FIX 2: Edit Mode Issue**

**Problem:** Edit mode shows default Next.js page

**Root Cause:** System cannot access sandbox files

**Solution Options:**

**Option A: Regenerate Instead of Edit**
- Don't use "Edit" feature for complex sites
- Generate fresh with improvements
- Faster and more reliable

**Option B: Fix Edit Mode (Requires Code Change)**
- Would need to modify how edit mode fetches files
- Would require changes to sandbox file access
- Complex fix

**Recommendation:** Use Option A (regenerate) until we fix edit mode architecture

---

### **FIX 3: Preview Not Showing**

**Immediate Troubleshooting:**

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for red errors
   - Screenshot and share with me

2. **Check Network Tab:**
   - See if files are loading
   - Check for 404 errors

3. **Check Sandbox URL:**
   - Is it loading at all?
   - Do you see "Loading..." or blank?

**Common Causes:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| Completely blank | Compilation error | Check console |
| "Loading..." forever | Build hanging | Restart dev server |
| Next.js default page | app/page.tsx missing/broken | Regenerate |
| White screen | Missing "use client" | Add to all pages |

---

## 🎯 ENHANCED AGENT INSTRUCTIONS

I'll now add these **mandatory checks** to the agent prompt:

```typescript
// NEW: POST-GENERATION VERIFICATION (MANDATORY)

After creating ANY website with 3+ pages, you MUST:

STEP 1: VERIFY FILE CREATION
✅ Confirm all planned files were created
✅ Check no "Module not found" errors
✅ Verify all imports resolve

STEP 2: SCAN FOR MISSING "use client"
✅ Every file with useState/useEffect MUST have "use client"
✅ Every file with onClick/forms MUST have "use client"
✅ Add automatically if missing

STEP 3: OUTPUT DATABASE SETUP
✅ If app uses database, output complete SQL schema
✅ Include RLS policies
✅ Tell user to run in Supabase

STEP 4: VERIFY AUTHENTICATION
✅ If auth requested, ensure login + OAuth pages exist
✅ Verify callback route exists
✅ Check AuthProvider is in layout

STEP 5: WAIT FOR COMPILATION
✅ Monitor sandbox for errors
✅ If errors detected, auto-fix and retry
✅ Don't mark complete until preview loads

STEP 6: PROVIDE TESTING CHECKLIST
✅ List all routes to test
✅ Provide database setup instructions
✅ Give troubleshooting steps
```

---

## 📋 Your Action Plan (Do This Now)

### **1. For Your Current Broken McDonald's Site:**

**Option A: Quick Fix (30 minutes)**
1. Find your generated files
2. Add `"use client";` to every page.tsx
3. Run database schema from `MCDONALDS_COMPLETE_EXAMPLE.md`
4. Add OAuth files from `OAUTH_FIX_GUIDE.md`

**Option B: Regenerate Fresh (5 minutes)**
1. Clear your current site
2. Regenerate with McDonald's prompt
3. Agent will use new improved system
4. Should work correctly this time

**I recommend Option B** - Faster and cleaner

---

### **2. Test the New System:**

After I add the debugging enhancements:

```
Test Prompt:
"Create a McDonald's restaurant website with:
- Menu browsing by category (burgers, drinks, sides)
- Shopping cart that saves to database
- User authentication with Google login
- Checkout and order placement
- Order history page
- Admin panel to manage menu items and orders

Make sure to:
- Use Supabase database for cart and orders
- Add Google OAuth login
- Include real-time cart updates
- Create all necessary database tables"
```

**Expected Results:**
- ✅ All pages load correctly
- ✅ SQL schema provided to copy
- ✅ Google OAuth button visible
- ✅ Cart persists after refresh
- ✅ Database operations work
- ✅ No blank preview

---

### **3. Report Back:**

After trying the regeneration, tell me:

1. **Does preview show the website?** (Yes/No)
2. **Can you see the login page?** (Yes/No)
3. **Is Google OAuth button visible?** (Yes/No)
4. **Did agent provide SQL schema?** (Yes/No)
5. **Any error messages?** (Screenshot)

---

## 🚀 Let Me Add the Debugging System Now

I'll enhance the agent with:

1. ✅ Automatic "use client" detection and insertion
2. ✅ Phased file creation enforcement
3. ✅ Post-generation error scanning
4. ✅ Database schema auto-generation
5. ✅ OAuth completeness check
6. ✅ Preview health monitoring
7. ✅ Detailed troubleshooting output

**Give me 5 minutes to implement this...**

Would you like me to proceed with adding the comprehensive debugging system to your agent now?
