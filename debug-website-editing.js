/**
 * Website Editing Debug & Recovery Script
 * Diagnoses and fixes issues when editing existing Next.js websites
 */

const fs = require('fs');
const path = require('path');

class WebsiteEditingDebugger {
  constructor() {
    this.logFile = 'website-editing-debug.log';
    this.backupDir = '.website-backups';
    this.criticalFiles = [
      'src/app/page.tsx',
      'src/app/layout.tsx',
      'src/components',
      'package.json',
      'next.config.ts'
    ];
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    
    console.log(logMessage.trim());
    fs.appendFileSync(this.logFile, logMessage);
  }

  // Step 1: Check if website is currently working
  checkWebsiteStatus() {
    this.log('🔍 CHECKING WEBSITE STATUS', 'INFO');
    
    const checks = {
      pageExists: fs.existsSync('src/app/page.tsx'),
      layoutExists: fs.existsSync('src/app/layout.tsx'),
      componentsDir: fs.existsSync('src/components'),
      packageJson: fs.existsSync('package.json')
    };

    this.log(`📄 Page exists: ${checks.pageExists}`);
    this.log(`🏗️ Layout exists: ${checks.layoutExists}`);
    this.log(`🧩 Components dir exists: ${checks.componentsDir}`);
    this.log(`📦 Package.json exists: ${checks.packageJson}`);

    return checks;
  }

  // Step 2: Analyze current page.tsx structure
  analyzePageStructure() {
    this.log('🔍 ANALYZING PAGE STRUCTURE', 'INFO');
    
    if (!fs.existsSync('src/app/page.tsx')) {
      this.log('❌ page.tsx does not exist!', 'ERROR');
      return null;
    }

    const pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
    
    // Extract imports
    const imports = pageContent.match(/import.*from.*/g) || [];
    this.log(`📥 Found ${imports.length} imports:`);
    imports.forEach(imp => this.log(`  - ${imp}`));

    // Check for default export
    const hasDefaultExport = pageContent.includes('export default');
    this.log(`📤 Has default export: ${hasDefaultExport}`);

    // Check for components
    const componentMatches = pageContent.match(/<[A-Z]\w+/g) || [];
    const components = [...new Set(componentMatches.map(c => c.substring(1)))];
    this.log(`🧩 Found ${components.length} components:`);
    components.forEach(comp => this.log(`  - ${comp}`));

    return {
      content: pageContent,
      imports,
      hasDefaultExport,
      components
    };
  }

  // Step 3: Verify all imports exist
  verifyImports(pageAnalysis) {
    this.log('🔍 VERIFYING IMPORTS', 'INFO');
    
    if (!pageAnalysis) return false;

    let allImportsValid = true;

    pageAnalysis.imports.forEach(importStatement => {
      const match = importStatement.match(/from\s+['"]([^'"]+)['"]/);
      if (!match) return;

      const importPath = match[1];
      
      // Skip external packages
      if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
        return;
      }

      // Convert @/ to src/
      let actualPath = importPath.replace('@/', 'src/');
      
      // Add .tsx extension if it's a local import
      if (!actualPath.includes('.')) {
        if (fs.existsSync(`${actualPath}.tsx`)) {
          actualPath += '.tsx';
        } else if (fs.existsSync(`${actualPath}.ts`)) {
          actualPath += '.ts';
        } else if (fs.existsSync(`${actualPath}/index.tsx`)) {
          actualPath += '/index.tsx';
        } else if (fs.existsSync(`${actualPath}/index.ts`)) {
          actualPath += '/index.ts';
        }
      }

      const exists = fs.existsSync(actualPath);
      this.log(`  ${exists ? '✅' : '❌'} ${importPath} -> ${actualPath}`);
      
      if (!exists) {
        allImportsValid = false;
        this.log(`❌ MISSING IMPORT: ${importPath}`, 'ERROR');
      }
    });

    return allImportsValid;
  }

  // Step 4: Create backup before editing
  createBackup() {
    this.log('💾 CREATING BACKUP', 'INFO');
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `backup-${timestamp}`);
    
    this.criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const backupFilePath = path.join(backupPath, file);
        fs.mkdirSync(path.dirname(backupFilePath), { recursive: true });
        fs.copyFileSync(file, backupFilePath);
        this.log(`💾 Backed up: ${file}`);
      }
    });

    this.log(`💾 Backup created at: ${backupPath}`);
    return backupPath;
  }

  // Step 5: Detect what changed and broke
  detectBreakage() {
    this.log('🕵️ DETECTING BREAKAGE', 'INFO');
    
    const status = this.checkWebsiteStatus();
    const pageAnalysis = this.analyzePageStructure();
    
    if (!status.pageExists) {
      this.log('💥 CRITICAL: page.tsx was deleted!', 'ERROR');
      return 'PAGE_DELETED';
    }

    if (!pageAnalysis || !pageAnalysis.hasDefaultExport) {
      this.log('💥 CRITICAL: page.tsx has no default export!', 'ERROR');
      return 'NO_DEFAULT_EXPORT';
    }

    if (!this.verifyImports(pageAnalysis)) {
      this.log('💥 CRITICAL: Broken imports detected!', 'ERROR');
      return 'BROKEN_IMPORTS';
    }

    // Check if page.tsx is empty or malformed
    if (pageAnalysis.content.trim().length < 100) {
      this.log('💥 CRITICAL: page.tsx appears to be empty or minimal!', 'ERROR');
      return 'EMPTY_PAGE';
    }

    this.log('🤔 No obvious breakage detected in file structure', 'WARN');
    return 'UNKNOWN';
  }

  // Step 6: Generate recovery instructions
  generateRecoveryInstructions(breakageType) {
    this.log('🚑 GENERATING RECOVERY INSTRUCTIONS', 'INFO');
    
    const instructions = {
      PAGE_DELETED: [
        '1. Restore page.tsx from backup or recreate it',
        '2. Ensure it has a default export function',
        '3. Import all necessary components',
        '4. Test that it renders correctly'
      ],
      NO_DEFAULT_EXPORT: [
        '1. Add "export default function HomePage()" to page.tsx',
        '2. Wrap your JSX in the function return statement',
        '3. Ensure proper React component structure'
      ],
      BROKEN_IMPORTS: [
        '1. Check each import statement in page.tsx',
        '2. Verify imported files exist at correct paths',
        '3. Fix import paths or create missing components',
        '4. Ensure export/import patterns match'
      ],
      EMPTY_PAGE: [
        '1. Restore page.tsx content from backup',
        '2. Or recreate the page with proper structure',
        '3. Add all necessary imports and components',
        '4. Test functionality'
      ],
      UNKNOWN: [
        '1. Check browser console for runtime errors',
        '2. Check Next.js terminal output for build errors',
        '3. Verify all components render without errors',
        '4. Check for client/server component issues'
      ]
    };

    this.log('🚑 RECOVERY INSTRUCTIONS:');
    instructions[breakageType].forEach((instruction, i) => {
      this.log(`   ${instruction}`);
    });

    return instructions[breakageType];
  }

  // Main diagnostic function
  diagnose() {
    this.log('🚀 STARTING WEBSITE EDITING DIAGNOSIS', 'INFO');
    this.log('=====================================');
    
    // Step 1: Check current status
    const status = this.checkWebsiteStatus();
    
    // Step 2: Analyze page structure
    const pageAnalysis = this.analyzePageStructure();
    
    // Step 3: Verify imports
    if (pageAnalysis) {
      this.verifyImports(pageAnalysis);
    }
    
    // Step 4: Detect specific breakage
    const breakageType = this.detectBreakage();
    
    // Step 5: Generate recovery plan
    const recovery = this.generateRecoveryInstructions(breakageType);
    
    this.log('=====================================');
    this.log('🏁 DIAGNOSIS COMPLETE', 'INFO');
    
    return {
      status,
      pageAnalysis,
      breakageType,
      recovery
    };
  }
}

// Run the debugger
const websiteDebugger = new WebsiteEditingDebugger();
const result = websiteDebugger.diagnose();

// Export for use in other scripts
module.exports = WebsiteEditingDebugger;