# Multi-Phase Generation System

## 🎯 Overview

CoDexa now intelligently handles complex prompts by breaking them into manageable phases. This prevents errors, improves reliability, and ensures complete apps are generated successfully.

## 🚀 How It Works

### 1. **Complexity Analysis**
When you submit a prompt, the system analyzes it based on:
- **Length**: Character count
- **Features**: Authentication, cart, search, etc.
- **Database Tables**: Number of tables needed
- **Components**: UI elements and React components
- **Technical Details**: SQL, RLS policies, deployment specs

**Scoring System:**
- 0-39: Simple (single-phase generation)
- 40+: Complex (multi-phase generation)

### 2. **Automatic Decomposition**
Complex prompts are broken into phases:

**Phase 1: Foundation & Core**
- Database schema (3 essential tables)
- User authentication
- Basic UI structure
- Core CRUD operations

**Phase 2: Main Features**
- Primary functionality
- Advanced operations
- Integration features

**Phase 3: Polish & Enhancement**
- UI/UX improvements
- Responsive design
- Performance optimization
- Error handling

### 3. **Phase Execution**
- Only Phase 1 runs automatically
- Subsequent phases require user approval
- Each phase builds on previous work
- Files are incrementally updated, not regenerated

## 📊 Example: McDonald's Clone

**Your original prompt** (6000+ characters with detailed specs):
- Complexity Score: 85/100
- Classified as: Complex
- Phases Generated: 3

**Phase 1 Prompt** (automatically created):
```
Build the foundation:
- Set up Supabase with essential database tables
- Implement user authentication (signup/login)
- Create basic UI structure with navigation
- Add core data model (3 essential tables)
- Implement basic CRUD operations

Keep it simple and functional. Focus on core features only.

Original request summary: McDonald's Website Clone - Complete Design & Functionality Specification 🎯 Project Overview Project Name: McDelivery Clone Objective: Fully functional McDonald's ordering website...
```

**Why This Works:**
✅ AI focuses on core features only
✅ Shorter prompt = less confusion
✅ No component definition errors
✅ Complete, working foundation
✅ Ready for Phase 2 enhancements

## 🎨 Database Tracking

New fields added to `Fragment` model:
```prisma
isMultiPhase      Boolean  @default(false)
currentPhase      Int      @default(1)
totalPhases       Int      @default(1)
phaseDescription  String?
complexityScore   Int      @default(0)
```

## 🔍 How to Use

### Simple Prompts
Just type naturally:
```
Build a todo app with authentication
```
→ Single phase, generates immediately

### Complex Prompts
Paste your detailed specs:
```
[Your 6000-character McDonald's specification]
```
→ Auto-detected as complex
→ Phase 1 generates automatically
→ UI shows "Phase 1/3" progress
→ Continue with Phase 2 after reviewing

## 🛠 Technical Implementation

### Files Created:
1. `src/inngest/prompt-analyzer.ts` - Complexity analysis logic
2. Updated `src/inngest/function.ts` - Integration with agent
3. Updated `prisma/schema.prisma` - Phase tracking fields
4. Updated `src/supabase-prompt.ts` - Multi-phase awareness

### Key Functions:
- `analyzePromptComplexity()` - Returns complexity score and recommendation
- `decomposeIntoPhases()` - Breaks prompt into sequential phases
- `extractCoreFeatures()` - Identifies main features from prompt

## ✅ Benefits

**For Simple Projects:**
- No change in behavior
- Fast, direct generation

**For Complex Projects:**
- ✅ Prevents overwhelming the AI
- ✅ Reduces "undefined component" errors
- ✅ Avoids token limit issues
- ✅ Ensures working foundation before features
- ✅ Better error recovery
- ✅ Clearer progress tracking

## 🧪 Testing

Try these prompts:

**Simple (should be single-phase):**
```
Create a landing page for a coffee shop
```

**Medium (might be multi-phase):**
```
Build a blog with authentication, posts, comments, and user profiles
```

**Complex (definitely multi-phase):**
```
[Paste your McDonald's specification]
```

## 📈 Future Enhancements

- [ ] UI progress indicator (Phase 1/3 with progress bar)
- [ ] Auto-retry on errors
- [ ] "Continue to Phase 2" button
- [ ] Phase history and rollback
- [ ] Real-time phase generation logs

## 🎉 Result

**Before**: Complex prompts → Black screen, errors, incomplete apps
**After**: Complex prompts → Phase 1 foundation → Working app → Add Phase 2 features → Polish in Phase 3

Your McDonald's clone will now generate successfully! 🍔
