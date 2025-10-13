#!/usr/bin/env node

/**
 * Quick website status check
 * Run this to verify if your website is working or showing Next.js default page
 */

const fs = require('fs');
const { exec } = require('child_process');

console.log('🔍 QUICK WEBSITE STATUS CHECK');
console.log('=====================================');

// Check critical files
const criticalFiles = {
  'src/app/page.tsx': 'Main page component',
  'src/app/layout.tsx': 'Layout component',
  'src/components': 'Components directory',
  'package.json': 'Package configuration'
};

console.log('\n📁 File Status:');
for (const [file, description] of Object.entries(criticalFiles)) {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file} - ${description}`);
}

// Check page.tsx content
if (fs.existsSync('src/app/page.tsx')) {
  const content = fs.readFileSync('src/app/page.tsx', 'utf8');
  const hasDefaultExport = content.includes('export default');
  const hasFunction = content.includes('function') || content.includes('=>');
  
  console.log('\n📄 Page.tsx Analysis:');
  console.log(`  ${hasDefaultExport ? '✅' : '❌'} Has default export`);
  console.log(`  ${hasFunction ? '✅' : '❌'} Has function component`);
  
  if (content.length < 100) {
    console.log('  ⚠️  File seems too short (potential issue)');
  }
}

// Check for common issues
console.log('\n🔍 Common Issue Check:');

// Check for build errors
console.log('  📊 Running build check...');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.log('  ❌ Build errors detected');
    console.log('     Run: npm run build (to see details)');
  } else {
    console.log('  ✅ Build check passed');
  }
});

// Check TypeScript
exec('npx tsc --noEmit', (error, stdout, stderr) => {
  if (error) {
    console.log('  ❌ TypeScript errors detected');
    console.log('     Run: npx tsc --noEmit (to see details)');
  } else {
    console.log('  ✅ TypeScript check passed');
  }
});

console.log('\n🚀 Next Steps:');
console.log('  1. Check if localhost:3000 shows your website (not Next.js default)');
console.log('  2. If showing default page, run: node debug-website-editing.js');
console.log('  3. Check browser console for runtime errors');
console.log('  4. Make micro-edits instead of large changes');

console.log('\n=====================================');
console.log('📝 For detailed diagnosis, run: node debug-website-editing.js');