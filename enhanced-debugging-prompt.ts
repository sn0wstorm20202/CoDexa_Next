export const ENHANCED_DEBUGGING_PROMPT = `

🚨🚨🚨 CRITICAL RUNTIME DEBUGGING SYSTEM 🚨🚨🚨

PROBLEM IDENTIFIED: Files exist but website shows Next.js default page!
This means RUNTIME ERROR, not file structure error.

🔍 MANDATORY RUNTIME DEBUGGING WORKFLOW:

STEP 1: BEFORE EDITING ANY EXISTING WEBSITE
1. 📖 READ app/page.tsx to understand current structure
2. 🔍 IDENTIFY all current components and their dependencies
3. 💾 CREATE MENTAL BACKUP of working structure
4. 🚫 NEVER replace entire working files - EDIT only specific parts

STEP 2: RUNTIME ERROR DETECTION
When user reports "Next.js default page showing":

A) CHECK FOR COMPILATION ERRORS:
   - Look for TypeScript errors in components
   - Check for missing semicolons in "use client"; directives
   - Verify all import paths are correct
   - Ensure all exports match their imports

B) CHECK FOR RUNTIME ERRORS:
   - React component errors (hooks in wrong places)
   - Client/Server component boundary violations
   - Missing "use client"; directives for interactive components
   - Circular dependency issues

C) CHECK FOR NEXT.JS SPECIFIC ISSUES:
   - app/page.tsx must have default export
   - layout.tsx must wrap content properly
   - No "use client" in layout.tsx
   - All pages must be valid React components

STEP 3: AUTOMATIC RECOVERY PROTOCOL

🚑 IF WEBSITE BREAKS DURING EDITING:

IMMEDIATE ACTION:
1. 🛑 STOP all current work
2. 📄 READ current app/page.tsx content
3. 🔍 IDENTIFY what was changed in the last edit
4. ↩️ REVERT the breaking change
5. 🏗️ REBUILD the working state
6. ✏️ RE-APPLY user's request in smaller steps

🔧 COMMON RUNTIME FIXES:

ERROR: Next.js default page appears
FIX: Ensure app/page.tsx has valid default export function

ERROR: White screen
FIX: Check for React component errors, add error boundaries

ERROR: Build errors
FIX: Check TypeScript errors, fix import/export mismatches

ERROR: "use client" errors
FIX: Add "use client"; to components with hooks/events

STEP 4: PROGRESSIVE EDITING STRATEGY

Instead of large changes, use MICRO-EDITS:

🔄 MICRO-EDIT WORKFLOW:
1. Make ONE small change
2. Test that website still loads
3. If working: continue to next change
4. If broken: immediately revert and try different approach

EXAMPLES OF MICRO-EDITS:
- Add one new component
- Modify text in existing component
- Change styling of one element
- Add one new prop to existing component

🚫 AVOID MACRO-EDITS:
- Replacing entire components
- Changing multiple files at once
- Restructuring the entire page layout
- Adding multiple new dependencies simultaneously

STEP 5: TESTING AND VERIFICATION

After EACH edit (no matter how small):
1. ✅ Check that website loads (not Next.js default page)
2. ✅ Check browser console for errors
3. ✅ Verify existing functionality still works
4. ✅ Confirm new changes are visible

STEP 6: ERROR RECOVERY TEMPLATES

TEMPLATE 1: Restore Working Page
\`\`\`tsx
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Add your components here */}
    </div>
  );
}
\`\`\`

TEMPLATE 2: Add Error Boundary
\`\`\`tsx
'use client';

import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error}: {error: Error}) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2>Something went wrong:</h2>
      <pre className="text-red-600">{error.message}</pre>
    </div>
  );
}

export default function SafeHomePage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {/* Your components here */}
    </ErrorBoundary>
  );
}
\`\`\`

STEP 7: MANDATORY PRE-COMPLETION CHECKS

NEVER mark task as complete until ALL verified:
✅ Website loads and displays correctly (NOT Next.js default page)
✅ No errors in browser console
✅ No compilation errors in terminal
✅ All existing functionality preserved
✅ User's requested changes implemented
✅ All components render without errors
✅ Navigation and interactions work

🔥 ZERO TOLERANCE POLICY:
If website shows Next.js default page = IMMEDIATE FAILURE
Must fix and restore working website before proceeding

🎯 SUCCESS METRIC:
User sees their custom website, NOT Next.js welcome screen

`;

// Additional debugging utilities
export const DEBUG_COMMANDS = `
# Run these commands to diagnose issues:

# 1. Check for build errors
npm run build

# 2. Check for TypeScript errors
npx tsc --noEmit

# 3. Check file structure
node debug-website-editing.js

# 4. Restart dev server
# (Only if absolutely necessary - usually hot reload should work)
`;

export const COMPONENT_SAFETY_CHECKLIST = `
Before modifying any component, verify:
□ Does it have "use client"; if it uses hooks?
□ Are all imports valid and pointing to existing files?
□ Does it have a proper default export?
□ Is the JSX syntax correct?
□ Are all props properly typed?
□ Does it handle edge cases gracefully?
`;
