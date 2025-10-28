# 🔍 File Dependency Analyzer System

## Purpose
This guide teaches the agent to automatically analyze file dependencies and determine the correct creation order.

---

## 🧠 Dependency Analysis Algorithm

### **Step 1: Parse the Request**
Identify all files mentioned or implied in the user's request:
- Pages (routes)
- Components
- Types/interfaces
- Utilities
- Database models
- API routes

### **Step 2: Build Dependency Graph**

For each file, determine what it imports:

```
Example Request: "Create a blog with posts, comments, and admin panel"

Dependency Graph:
┌─────────────────────┐
│ lib/types.ts        │ ← No dependencies (Foundation)
└─────────────────────┘
          ↑
          │ imports
┌─────────────────────┐
│ lib/supabase/       │ ← Depends on types
│ client.ts           │
└─────────────────────┘
          ↑
          │ imports
┌─────────────────────┐
│ components/         │ ← Depends on types & Supabase
│ PostCard.tsx        │
└─────────────────────┘
          ↑
          │ imports
┌─────────────────────┐
│ app/page.tsx        │ ← Depends on PostCard
└─────────────────────┘
```

### **Step 3: Determine Creation Order**

**Rule:** Files with zero dependencies → created first  
**Rule:** Files importing others → created after dependencies

**Creation Order:**
1. lib/types.ts (no dependencies)
2. lib/supabase/client.ts (depends on types)
3. components/PostCard.tsx (depends on types + Supabase)
4. app/page.tsx (depends on PostCard)

---

## 📊 Dependency Levels

### **Level 0: Foundation (No Dependencies)**
- Types/interfaces
- Constants
- Configuration files

**Examples:**
- `lib/types.ts`
- `lib/constants.ts`
- `lib/config.ts`

### **Level 1: Core Services (Depends on Level 0)**
- Supabase client
- Utility functions
- Helper libraries

**Examples:**
- `lib/supabase/client.ts`
- `lib/utils.ts`
- `lib/helpers.ts`

### **Level 2: Leaf Components (Depends on Level 0-1)**
- UI components with no local component imports
- Simple presentational components

**Examples:**
- `components/ui/badge.tsx`
- `components/ProductCard.tsx`
- `components/UserAvatar.tsx`

### **Level 3: Container Components (Depends on Level 0-2)**
- Components that import other components
- Feature components

**Examples:**
- `components/ProductList.tsx` (imports ProductCard)
- `components/Dashboard.tsx` (imports multiple Level 2 components)

### **Level 4: Pages (Depends on Level 0-3)**
- Route pages
- Main application entry points

**Examples:**
- `app/page.tsx`
- `app/products/page.tsx`
- `app/dashboard/page.tsx`

---

## 🛠️ Automated Dependency Detection

### **Keywords to Watch For:**

**Imports Types/Interfaces:**
```typescript
import type { User, Product } from '@/lib/types'
// → Depends on lib/types.ts
```

**Imports Supabase:**
```typescript
import { createClient } from '@/lib/supabase/client'
// → Depends on lib/supabase/client.ts
```

**Imports Components:**
```typescript
import UserCard from './components/UserCard'
// → Depends on components/UserCard.tsx
```

**Imports Utils:**
```typescript
import { formatDate } from '@/lib/utils'
// → Depends on lib/utils.ts
```

---

## 🚨 Automatic Dependency Resolution

### **Before Creating Any File:**

**Ask these questions:**
1. Does this file import from local files?
2. If YES → Have those files been created yet?
3. If NO → Create dependencies FIRST

### **Example Workflow:**

**Request:** Create `app/products/page.tsx`

**Analysis:**
```typescript
// This page will need:
import type { Product } from '@/lib/types' // → Dependency 1
import { createClient } from '@/lib/supabase/client' // → Dependency 2
import ProductCard from '@/components/ProductCard' // → Dependency 3
```

**Resolution Order:**
1. Create `lib/types.ts` first (defines Product type)
2. Create `lib/supabase/client.ts` second (Supabase setup)
3. Create `components/ProductCard.tsx` third (uses Product type)
4. Finally create `app/products/page.tsx` (imports all above)

---

## 🎯 Quick Reference: Common Patterns

### **Pattern 1: Simple Page**
```
Order:
1. lib/types.ts
2. app/page.tsx
```

### **Pattern 2: Page with Components**
```
Order:
1. lib/types.ts
2. components/FeatureCard.tsx
3. app/page.tsx
```

### **Pattern 3: Page with Database**
```
Order:
1. lib/types.ts
2. lib/supabase/client.ts
3. app/page.tsx
```

### **Pattern 4: Complex Multi-Page App**
```
Order:
1. lib/types.ts
2. lib/constants.ts
3. lib/supabase/client.ts
4. lib/utils.ts
5. components/ui/badge.tsx
6. components/ProductCard.tsx
7. components/Dashboard.tsx
8. app/login/page.tsx
9. app/signup/page.tsx
10. app/page.tsx
11. app/products/page.tsx
12. app/admin/page.tsx
```

---

## 🚫 Common Dependency Mistakes

### **Mistake 1: Circular Dependencies**
```
❌ WRONG:
- dashboard.tsx imports from user-profile.tsx
- user-profile.tsx imports from dashboard.tsx
→ Creates circular dependency!

✅ CORRECT:
- Extract shared logic to lib/utils.ts
- Both import from utils.ts
```

### **Mistake 2: Creating Pages Before Components**
```
❌ WRONG:
1. Create app/page.tsx (imports ProductCard)
2. Create components/ProductCard.tsx
→ Module not found error!

✅ CORRECT:
1. Create components/ProductCard.tsx
2. Create app/page.tsx (imports ProductCard)
```

### **Mistake 3: Creating Components Before Types**
```
❌ WRONG:
1. Create components/UserCard.tsx (uses User type)
2. Create lib/types.ts (defines User type)
→ Type error!

✅ CORRECT:
1. Create lib/types.ts (defines User type)
2. Create components/UserCard.tsx (uses User type)
```

---

## 🔄 Mental Checklist for Agent

Before creating each file, run this checklist:

```
□ What does this file import from local files?
□ Have those local files been created yet?
□ If NO → Add those files to creation queue first
□ If YES → Safe to create this file
□ Double-check: Are there nested dependencies?
```

---

## ✅ Success Criteria

**Your dependency analysis is correct when:**
- No "Module not found" errors occur
- No "Type 'X' does not exist" errors
- All files create successfully in order
- No circular dependency warnings
- Each file's imports resolve correctly

---

## 🎓 Practice Example

**User Request:** "Create an e-commerce app with products, cart, and checkout"

**Your Analysis:**

```
Files Needed:
1. lib/types.ts (Product, CartItem, Order types)
2. lib/supabase/client.ts (database connection)
3. lib/utils.ts (formatPrice, calculateTotal helpers)
4. components/ProductCard.tsx (displays product)
5. components/CartItem.tsx (displays cart item)
6. app/page.tsx (product listing - imports ProductCard)
7. app/cart/page.tsx (cart view - imports CartItem)
8. app/checkout/page.tsx (checkout form)

Dependency Graph:
lib/types.ts → (no dependencies) [Level 0]
lib/supabase/client.ts → depends on types [Level 1]
lib/utils.ts → depends on types [Level 1]
components/ProductCard.tsx → depends on types, utils [Level 2]
components/CartItem.tsx → depends on types, utils [Level 2]
app/page.tsx → depends on ProductCard, types, supabase [Level 4]
app/cart/page.tsx → depends on CartItem, types, supabase [Level 4]
app/checkout/page.tsx → depends on types, supabase, utils [Level 4]

Creation Order:
1. lib/types.ts
2. lib/supabase/client.ts
3. lib/utils.ts
4. components/ProductCard.tsx
5. components/CartItem.tsx
6. app/page.tsx
7. app/cart/page.tsx
8. app/checkout/page.tsx
```

**Result:** No dependency errors, all files create successfully! ✅

---

## 🚀 Integration with Complex Project System

This dependency analyzer works alongside the Complex Project Handling System:

1. **Phase 1:** Use this analyzer to map dependencies
2. **Phase 2:** Group files by dependency level
3. **Phase 3:** Create files level by level
4. **Phase 4:** Test after each level completes
5. **Phase 5:** Verify no import errors

---

**Use this system EVERY TIME you create multiple files!**
