/**
 * Analyzes prompt complexity and determines if multi-phase generation is needed
 */

export interface ComplexityAnalysis {
  isComplex: boolean;
  score: number;
  indicators: {
    length: number;
    features: number;
    databaseTables: number;
    components: number;
    technicalDetails: number;
  };
  recommendation: 'single-phase' | 'multi-phase';
  reasoning: string;
}

export interface ProjectPhase {
  phaseNumber: number;
  title: string;
  description: string;
  prompt: string;
  priority: 'critical' | 'important' | 'enhancement';
}

/**
 * Analyzes prompt complexity
 */
export function analyzePromptComplexity(prompt: string): ComplexityAnalysis {
  const indicators = {
    length: prompt.length,
    features: countFeatures(prompt),
    databaseTables: countDatabaseTables(prompt),
    components: countComponents(prompt),
    technicalDetails: countTechnicalDetails(prompt),
  };

  // Scoring system (weighted)
  let score = 0;
  
  // Length scoring (longer = more complex)
  if (indicators.length > 5000) score += 30;
  else if (indicators.length > 2000) score += 20;
  else if (indicators.length > 1000) score += 10;
  
  // Features scoring
  if (indicators.features > 10) score += 25;
  else if (indicators.features > 5) score += 15;
  else if (indicators.features > 3) score += 5;
  
  // Database tables scoring
  if (indicators.databaseTables > 5) score += 20;
  else if (indicators.databaseTables > 3) score += 10;
  else if (indicators.databaseTables > 0) score += 5;
  
  // Components scoring
  if (indicators.components > 15) score += 15;
  else if (indicators.components > 8) score += 10;
  else if (indicators.components > 5) score += 5;
  
  // Technical details scoring
  if (indicators.technicalDetails > 10) score += 10;
  else if (indicators.technicalDetails > 5) score += 5;

  // Determine recommendation
  const isComplex = score >= 40;
  const recommendation = isComplex ? 'multi-phase' : 'single-phase';
  
  let reasoning = '';
  if (isComplex) {
    reasoning = `Complex project detected (score: ${score}/100). `;
    if (indicators.length > 2000) reasoning += 'Very detailed prompt. ';
    if (indicators.features > 5) reasoning += `${indicators.features} features requested. `;
    if (indicators.databaseTables > 3) reasoning += `${indicators.databaseTables} database tables needed. `;
    reasoning += 'Recommend breaking into multiple phases for reliability.';
  } else {
    reasoning = `Simple project (score: ${score}/100). Can be generated in single phase.`;
  }

  return {
    isComplex,
    score,
    indicators,
    recommendation,
    reasoning,
  };
}

/**
 * Count explicit features mentioned
 */
function countFeatures(prompt: string): number {
  const featureKeywords = [
    'authentication', 'auth', 'login', 'signup', 'sign up', 'sign in',
    'cart', 'checkout', 'payment', 'order',
    'search', 'filter', 'sort',
    'crud', 'create', 'read', 'update', 'delete',
    'upload', 'download',
    'notification', 'email',
    'dashboard', 'admin',
    'profile', 'settings',
    'real-time', 'realtime', 'live',
    'analytics', 'reporting',
    'responsive', 'mobile',
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  return featureKeywords.filter(keyword => lowerPrompt.includes(keyword)).length;
}

/**
 * Count database tables mentioned or implied
 */
function countDatabaseTables(prompt: string): number {
  // Look for SQL table definitions or explicit mentions
  const sqlTablePattern = /CREATE TABLE|create table|\btable\b/gi;
  const sqlMatches = prompt.match(sqlTablePattern) || [];
  
  // Look for common table names
  const commonTables = [
    'users', 'profiles', 'products', 'items', 'orders', 'cart',
    'categories', 'posts', 'comments', 'messages', 'notifications',
    'payments', 'transactions', 'reviews', 'ratings',
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  const impliedTables = commonTables.filter(table => 
    lowerPrompt.includes(table + ' table') || 
    lowerPrompt.includes(table + ' schema') ||
    lowerPrompt.includes('`' + table + '`')
  ).length;
  
  return Math.max(sqlMatches.length / 2, impliedTables); // Rough estimate
}

/**
 * Count React components mentioned or implied
 */
function countComponents(prompt: string): number {
  // Look for explicit component mentions
  const componentPattern = /\b([A-Z][a-zA-Z]+Component|[A-Z][a-zA-Z]+Card|[A-Z][a-zA-Z]+Modal|[A-Z][a-zA-Z]+Form)\b/g;
  const explicitComponents = prompt.match(componentPattern) || [];
  
  // Common UI elements that typically become components
  const uiElements = [
    'header', 'footer', 'navbar', 'sidebar', 'menu',
    'card', 'modal', 'dialog', 'form', 'button',
    'hero', 'banner', 'carousel', 'slider',
    'list', 'grid', 'table',
    'profile', 'avatar', 'badge',
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  const impliedComponents = uiElements.filter(element => lowerPrompt.includes(element)).length;
  
  return explicitComponents.length + Math.min(impliedComponents, 10);
}

/**
 * Count technical specification details
 */
function countTechnicalDetails(prompt: string): number {
  const technicalKeywords = [
    'database schema', 'sql', 'postgresql', 'mysql',
    'api', 'endpoint', 'route',
    'rls', 'row level security', 'policy', 'policies',
    'migration', 'seed data',
    'typescript', 'interface', 'type',
    'env', 'environment variable',
    'deployment', 'build', 'vite', 'webpack',
    'css', 'tailwind', 'styling',
    'responsive', 'breakpoint',
    'optimization', 'performance',
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  return technicalKeywords.filter(keyword => lowerPrompt.includes(keyword)).length;
}

/**
 * Decompose complex prompt into sequential phases
 */
export function decomposeIntoPhases(prompt: string, analysis: ComplexityAnalysis): ProjectPhase[] {
  if (!analysis.isComplex) {
    // Single phase for simple projects
    return [{
      phaseNumber: 1,
      title: 'Complete Implementation',
      description: 'Build the full application in one go',
      prompt: prompt,
      priority: 'critical',
    }];
  }

  // Multi-phase for complex projects
  const phases: ProjectPhase[] = [];
  
  // Extract core requirements
  const coreFeatures = extractCoreFeatures(prompt);
  const databaseNeeded = analysis.indicators.databaseTables > 0;
  const authNeeded = prompt.toLowerCase().includes('auth') || 
                     prompt.toLowerCase().includes('login') || 
                     prompt.toLowerCase().includes('user');

  // Phase 1: Foundation
  let phase1Prompt = 'Build the foundation:\n\n';
  
  if (databaseNeeded) {
    phase1Prompt += '- Set up Supabase with essential database tables\n';
  }
  
  if (authNeeded) {
    phase1Prompt += '- Implement user authentication (signup/login)\n';
  }
  
  phase1Prompt += `- Create basic UI structure with navigation\n`;
  phase1Prompt += `- Add core data model (${Math.min(3, analysis.indicators.databaseTables)} essential tables)\n`;
  phase1Prompt += `- Implement basic CRUD operations\n\n`;
  phase1Prompt += `Keep it simple and functional. Focus on core features only.\n\n`;
  phase1Prompt += `Original request summary: ${prompt.substring(0, 300)}...`;

  phases.push({
    phaseNumber: 1,
    title: 'Foundation & Core Features',
    description: 'Database, authentication, basic structure',
    prompt: phase1Prompt,
    priority: 'critical',
  });

  // Phase 2: Main Features
  const mainFeatures = coreFeatures.filter((_, i) => i < 3);
  let phase2Prompt = 'Enhance the existing app with main features:\n\n';
  mainFeatures.forEach(feature => {
    phase2Prompt += `- ${feature}\n`;
  });
  phase2Prompt += `\nBuild on top of the existing foundation. Add these features while maintaining existing functionality.`;

  phases.push({
    phaseNumber: 2,
    title: 'Main Features',
    description: mainFeatures.join(', '),
    prompt: phase2Prompt,
    priority: 'important',
  });

  // Phase 3: Polish & Enhancement
  const enhancementFeatures = coreFeatures.filter((_, i) => i >= 3);
  if (enhancementFeatures.length > 0 || analysis.indicators.components > 10) {
    let phase3Prompt = 'Polish and enhance the application:\n\n';
    
    if (enhancementFeatures.length > 0) {
      enhancementFeatures.forEach(feature => {
        phase3Prompt += `- ${feature}\n`;
      });
    }
    
    phase3Prompt += '- Improve UI/UX and add animations\n';
    phase3Prompt += '- Make fully responsive (mobile/tablet/desktop)\n';
    phase3Prompt += '- Add loading states and error handling\n';
    phase3Prompt += '- Optimize performance\n';

    phases.push({
      phaseNumber: 3,
      title: 'Polish & Enhancement',
      description: 'UI improvements, responsiveness, optimization',
      prompt: phase3Prompt,
      priority: 'enhancement',
    });
  }

  return phases;
}

/**
 * Extract core features from prompt
 */
function extractCoreFeatures(prompt: string): string[] {
  const features: string[] = [];
  
  // Simple extraction based on common patterns
  const lines = prompt.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Look for bullet points or numbered lists
    if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      const feature = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').trim();
      if (feature.length > 5 && feature.length < 100) {
        features.push(feature);
      }
    }
  }
  
  // If no explicit list found, extract from keywords
  if (features.length === 0) {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('menu') || lowerPrompt.includes('product')) {
      features.push('Product/menu browsing system');
    }
    if (lowerPrompt.includes('cart') || lowerPrompt.includes('shopping')) {
      features.push('Shopping cart functionality');
    }
    if (lowerPrompt.includes('order') || lowerPrompt.includes('checkout')) {
      features.push('Order placement and checkout');
    }
    if (lowerPrompt.includes('search')) {
      features.push('Search functionality');
    }
    if (lowerPrompt.includes('filter')) {
      features.push('Filtering and sorting');
    }
    if (lowerPrompt.includes('profile') || lowerPrompt.includes('account')) {
      features.push('User profile management');
    }
    if (lowerPrompt.includes('admin') || lowerPrompt.includes('dashboard')) {
      features.push('Admin dashboard');
    }
  }
  
  return features.slice(0, 8); // Max 8 features
}
