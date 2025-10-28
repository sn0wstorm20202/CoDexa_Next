# 🚑 Error Recovery & Checkpoint System

## Purpose
This system enables the agent to detect, diagnose, and fix errors automatically during project generation, with checkpoint-based recovery.

---

## 🎯 Error Detection System

### **Continuous Monitoring**

The agent should constantly check for these error patterns:

#### **1. Module Not Found Errors**
```
❌ Error: Module not found: Can't resolve '@/components/ui/badge'
```

**Detection Pattern:**
- Look for "Module not found" in errors
- Identify missing file path
- Determine what needs to be created

**Auto-Fix:**
1. Extract missing module path
2. Create the missing file with proper exports
3. Retry the import
4. Verify error resolved

#### **2. Client Component Errors**
```
❌ Error: 'client-only' cannot be imported from a Server Component
```

**Detection Pattern:**
- Look for "client-only" error message
- Identify component causing error
- Check for client-side features (useState, onClick, etc.)

**Auto-Fix:**
1. Find the component file
2. Add "use client"; at the very top
3. Re-test the component
4. Verify error resolved

#### **3. Export Mismatch Errors**
```
❌ Error: Export 'ComponentName' does not exist
```

**Detection Pattern:**
- Look for "Export ... does not exist"
- Check import vs export pattern mismatch
- Identify if default vs named export issue

**Auto-Fix:**
1. Read the source file
2. Check actual export pattern
3. Fix import to match export type
4. Verify import works

#### **4. Type Errors**
```
❌ Error: Type 'X' does not exist
```

**Detection Pattern:**
- Look for type-related errors
- Identify missing type definition
- Check if types file exists

**Auto-Fix:**
1. Create or update lib/types.ts
2. Add missing type definition
3. Re-import the type
4. Verify type resolves

#### **5. 404 Route Errors**
```
❌ Error: 404 - Page not found at /products
```

**Detection Pattern:**
- User reports 404 error
- Route doesn't load
- Page file missing

**Auto-Fix:**
1. Identify missing route
2. Create app/[route]/page.tsx
3. Test route loads
4. Verify 404 resolved

#### **6. Syntax Errors**
```
❌ Error: Expected ',', '}' or <eof>
```

**Detection Pattern:**
- Look for parsing errors
- Check for missing semicolons
- Identify malformed code

**Auto-Fix:**
1. Locate syntax issue
2. Fix syntax (add semicolon, fix quotes, etc.)
3. Re-parse the file
4. Verify syntax valid

---

## 🔄 Checkpoint System

### **Checkpoint Levels**

#### **Checkpoint 0: Project Start**
```
STATE:
- No files created
- Clean slate

ROLLBACK ACTION:
- Nothing to roll back
- Start fresh
```

#### **Checkpoint 1: Foundation Complete**
```
STATE:
- lib/types.ts created
- lib/constants.ts created
- lib/supabase/client.ts created
- lib/utils.ts created
- Foundation tested and working

ROLLBACK ACTION:
- Keep foundation files
- Remove everything after
- Restart from core pages
```

#### **Checkpoint 2: Authentication Complete**
```
STATE:
- Foundation complete (Checkpoint 1)
- app/login/page.tsx created
- app/signup/page.tsx created
- Authentication tested and working

ROLLBACK ACTION:
- Keep foundation + auth
- Remove everything after
- Restart from core features
```

#### **Checkpoint 3: Core Pages Complete**
```
STATE:
- Foundation complete
- Authentication complete
- app/page.tsx created
- Main feature pages created
- Core functionality tested

ROLLBACK ACTION:
- Keep foundation + auth + core
- Remove advanced features
- Restart from advanced features
```

#### **Checkpoint 4: Components Complete**
```
STATE:
- All previous checkpoints
- All components created
- Components tested

ROLLBACK ACTION:
- Keep everything except admin
- Restart from admin panel
```

#### **Checkpoint 5: Project Complete**
```
STATE:
- All files created
- All features working
- Full testing passed

ROLLBACK ACTION:
- Project is complete
- Only minor fixes needed
```

---

## 🛠️ Error Recovery Workflow

### **Workflow for ANY Error:**

```
1. DETECT ERROR
   ↓
2. IDENTIFY CHECKPOINT
   (What was the last working state?)
   ↓
3. DIAGNOSE CAUSE
   (What caused this error?)
   ↓
4. ATTEMPT AUTO-FIX
   (Can this be fixed automatically?)
   ↓
5. TEST FIX
   (Did the fix resolve the error?)
   ↓
   YES → Continue forward
   NO → Try alternative fix
   ↓
   Still failing? → ROLLBACK to last checkpoint
   ↓
6. RETRY FROM CHECKPOINT
   (Redo steps with learned corrections)
```

---

## 🚨 Automatic Fix Strategies

### **Strategy 1: Dependency Resolution**

**Problem:** File imports non-existent dependency

**Fix:**
1. Create the missing dependency file
2. Add proper exports
3. Retry the import

**Example:**
```typescript
// Error: Module '@/lib/utils' not found

// Fix:
// 1. Create lib/utils.ts
export const formatDate = (date: Date) => {
  return date.toLocaleDateString();
};

// 2. Import now works
import { formatDate } from '@/lib/utils';
```

### **Strategy 2: Client Component Conversion**

**Problem:** Server component using client features

**Fix:**
1. Add "use client"; directive
2. Verify all client features now work

**Example:**
```typescript
// Error in: components/LoginForm.tsx
// Missing "use client"

// Fix: Add at top of file
"use client";

import { useState } from 'react';
// Now works correctly
```

### **Strategy 3: Export Pattern Correction**

**Problem:** Import/export pattern mismatch

**Fix:**
1. Identify export type in source
2. Correct import to match

**Example:**
```typescript
// Source file uses default export
export default function Button() { ... }

// Wrong import:
import { Button } from './button'; // ❌

// Fixed import:
import Button from './button'; // ✅
```

### **Strategy 4: Type Definition Creation**

**Problem:** Missing type definitions

**Fix:**
1. Create/update types file
2. Add missing types
3. Export properly

**Example:**
```typescript
// Error: Type 'Product' does not exist

// Fix: Create in lib/types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
}

// Now usable everywhere
import type { Product } from '@/lib/types';
```

---

## 🔍 Error Diagnosis Checklist

### **When Error Occurs:**

```
□ What is the exact error message?
□ Which file is causing the error?
□ What was the last successful action?
□ What checkpoint are we at?
□ Is this a known error pattern?
□ What fix strategy applies?
□ Can we auto-fix this?
□ Do we need to rollback?
```

---

## 📊 Error Recovery Log

### **Track all errors and fixes:**

```
ERROR LOG:

Timestamp: 2024-01-15 10:30:00
Error: Module not found: '@/components/ProductCard'
File: app/products/page.tsx
Checkpoint: Core Pages (Checkpoint 3)
Fix Applied: Created components/ProductCard.tsx
Result: ✅ SUCCESS - Error resolved
Recovery Time: 30 seconds

---

Timestamp: 2024-01-15 10:35:00
Error: 'client-only' cannot be imported
File: components/LoginForm.tsx
Checkpoint: Authentication (Checkpoint 2)
Fix Applied: Added "use client"; directive
Result: ✅ SUCCESS - Error resolved
Recovery Time: 10 seconds

---

Timestamp: 2024-01-15 10:40:00
Error: Multiple cascading errors in admin panel
File: app/admin/page.tsx
Checkpoint: Advanced Features (Checkpoint 4)
Fix Attempted: Various fixes tried
Result: ❌ FAILED - Multiple issues
Action Taken: ROLLBACK to Checkpoint 3
Recovery Time: 2 minutes

---

Timestamp: 2024-01-15 10:42:00
Status: Restarting admin panel creation from Checkpoint 3
Approach: Creating files in correct dependency order
Result: ✅ SUCCESS - Admin panel working
Recovery Time: 3 minutes
```

---

## 🚀 Rollback Procedures

### **How to Rollback to a Checkpoint:**

#### **Step 1: Identify Safe Checkpoint**
```
Current State: Errors in Phase 5 (Admin)
Last Safe State: Checkpoint 3 (Core Pages Complete)
Decision: Rollback to Checkpoint 3
```

#### **Step 2: Preserve Working Files**
```
Keep:
✅ lib/types.ts
✅ lib/supabase/client.ts
✅ app/login/page.tsx
✅ app/signup/page.tsx
✅ app/page.tsx
✅ app/products/page.tsx

Remove:
❌ app/admin/page.tsx (broken)
❌ app/admin/orders/page.tsx (broken)
❌ Related broken components
```

#### **Step 3: Learn from Errors**
```
Analysis:
- What went wrong?
- Why did files break?
- What dependencies were missing?
- What order should we use?

Corrections:
- Create dependency files first
- Test each file before continuing
- Use proper export patterns
```

#### **Step 4: Retry with Corrections**
```
New Approach:
1. Create lib/admin-utils.ts first (dependency)
2. Create admin components next
3. Finally create admin pages
4. Test each step

Result: ✅ Works correctly this time
```

---

## 🎯 Prevention Strategies

### **Prevent Errors Before They Happen:**

#### **1. Pre-Import Validation**
```
Before writing any import:
□ Does the imported file exist?
□ Does it have the expected export?
□ Is the import path correct?
□ Is the export type correct (default vs named)?
```

#### **2. Client Component Detection**
```
Before creating any component:
□ Does it use useState/useEffect?
□ Does it have onClick/onSubmit?
□ Does it use browser APIs?
□ If YES → Add "use client"
```

#### **3. Dependency Order Verification**
```
Before creating files:
□ Map all dependencies
□ Create dependency graph
□ Follow correct creation order
□ Test after each file
```

#### **4. Type Checking**
```
Before using any type:
□ Is the type defined?
□ Is it exported properly?
□ Is it imported correctly?
□ Does it match usage?
```

---

## ✅ Success Criteria

**Error recovery is successful when:**
- Error detected within 1 attempt
- Fix applied automatically
- Error resolved without manual intervention
- Project continues forward
- OR clean rollback to checkpoint completed
- No recurring errors

---

## 🎓 Recovery Examples

### **Example 1: Quick Fix**
```
Error: Missing "use client" in LoginForm.tsx
Detection: Immediate (client-only error)
Checkpoint: Authentication (Checkpoint 2)
Fix: Add "use client"; at top
Result: ✅ Fixed in 10 seconds
Action: Continue forward
```

### **Example 2: Dependency Fix**
```
Error: Module '@/lib/utils' not found
Detection: Immediate (module not found)
Checkpoint: Core Pages (Checkpoint 3)
Fix: Create lib/utils.ts with required exports
Result: ✅ Fixed in 30 seconds
Action: Continue forward
```

### **Example 3: Rollback Required**
```
Error: Multiple breaking errors in admin panel
Detection: After several failed fixes
Checkpoint: Advanced Features (Checkpoint 4)
Fix Attempts: 3 failed attempts
Result: ❌ Cannot fix incrementally
Action: Rollback to Checkpoint 3
Retry: Recreate admin panel with correct approach
Final Result: ✅ Success after rollback
Total Time: 5 minutes
```

---

## 🚀 Integration

This error recovery system works with:
1. **Complex Project Handling** - Errors detected at each phase
2. **File Dependency Analyzer** - Prevents dependency errors
3. **Progress Tracking** - Shows where errors occur
4. **Template Library** - Uses tested patterns to avoid errors

---

**Use this system to automatically detect and fix errors, keeping projects on track!**
