/**
 * Analyzes user requirements to determine if backend/database is needed
 */

interface RequirementAnalysis {
  needsBackend: boolean;
  needsDatabase: boolean;
  dbType: 'sqlite' | 'postgres' | null;
  architecture: 'frontend' | 'fullstack';
  confidence: number;
  reasoning: string;
  features: string[];
}

const BACKEND_KEYWORDS = [
  'database', 'db', 'store', 'save', 'persist', 'login', 'signup', 'authentication',
  'auth', 'user', 'users', 'account', 'profile', 'api', 'backend', 'server',
  'crud', 'create', 'update', 'delete', 'fetch', 'load', 'data', 'record',
  'order', 'orders', 'product', 'products', 'cart', 'checkout', 'payment',
  'comment', 'post', 'blog', 'article', 'message', 'chat', 'form submission'
];

const SIMPLE_APP_KEYWORDS = [
  'landing page', 'portfolio', 'showcase', 'display', 'static', 'presentation',
  'brochure', 'marketing', 'homepage', 'about page', 'contact form (no storage)'
];

const COMPLEX_APP_INDICATORS = [
  'e-commerce', 'store', 'shop', 'social', 'network', 'dashboard',
  'admin panel', 'crm', 'management system', 'multi-user', 'collaboration'
];

/**
 * Analyzes a user message to determine architecture requirements
 */
export function analyzeRequirements(userMessage: string): RequirementAnalysis {
  const lowerMessage = userMessage.toLowerCase();
  
  // Count keyword matches
  const backendKeywordMatches = BACKEND_KEYWORDS.filter(keyword => 
    lowerMessage.includes(keyword)
  );
  
  const simpleAppMatches = SIMPLE_APP_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword)
  );
  
  const complexAppMatches = COMPLEX_APP_INDICATORS.filter(keyword =>
    lowerMessage.includes(keyword)
  );

  // Decision logic
  let needsBackend = false;
  let needsDatabase = false;
  let dbType: 'sqlite' | 'postgres' | null = null;
  let confidence = 0;
  let reasoning = '';
  const features: string[] = [];

  // Simple app detection
  if (simpleAppMatches.length > 0 && backendKeywordMatches.length === 0) {
    needsBackend = false;
    needsDatabase = false;
    confidence = 0.9;
    reasoning = `Detected as simple ${simpleAppMatches.join(', ')} - no backend needed`;
    features.push('Static frontend only');
  }
  // Complex app detection
  else if (complexAppMatches.length > 0) {
    needsBackend = true;
    needsDatabase = true;
    dbType = 'postgres'; // Complex apps get PostgreSQL
    confidence = 0.95;
    reasoning = `Detected complex application (${complexAppMatches.join(', ')}) - requires full-stack with PostgreSQL`;
    features.push('Full-stack architecture', 'PostgreSQL database', 'REST API', 'Data persistence');
  }
  // Backend keyword detection
  else if (backendKeywordMatches.length >= 3) {
    needsBackend = true;
    needsDatabase = true;
    dbType = 'sqlite'; // Default to SQLite for medium complexity
    confidence = 0.85;
    reasoning = `Multiple backend indicators found (${backendKeywordMatches.slice(0, 3).join(', ')}) - requires backend with SQLite`;
    features.push('Full-stack architecture', 'SQLite database', 'REST API');
  }
  else if (backendKeywordMatches.length > 0) {
    needsBackend = true;
    needsDatabase = true;
    dbType = 'sqlite';
    confidence = 0.7;
    reasoning = `Some backend indicators found (${backendKeywordMatches.join(', ')}) - suggesting backend with SQLite`;
    features.push('Full-stack architecture', 'SQLite database');
  }
  // Default to frontend only
  else {
    needsBackend = false;
    needsDatabase = false;
    confidence = 0.8;
    reasoning = 'No clear backend requirements detected - frontend only';
    features.push('Frontend only');
  }

  // Determine architecture
  const architecture = needsBackend ? 'fullstack' : 'frontend';

  return {
    needsBackend,
    needsDatabase,
    dbType,
    architecture,
    confidence,
    reasoning,
    features
  };
}

/**
 * Generates a user-friendly explanation of the architecture decision
 */
export function explainArchitectureDecision(analysis: RequirementAnalysis): string {
  const { architecture, reasoning, features, dbType } = analysis;

  if (architecture === 'frontend') {
    return `I'll build this as a **frontend-only** application since ${reasoning}. This means:\n- React + Vite + Tailwind CSS\n- No backend server needed\n- Perfect for static/client-side apps`;
  }

  return `I'll build this as a **full-stack** application since ${reasoning}. This includes:\n- **Frontend:** React + Vite + Tailwind CSS (port 3000)\n- **Backend:** Express API server (port 8000)\n- **Database:** ${dbType === 'sqlite' ? 'SQLite (file-based, great for quick apps)' : 'PostgreSQL (production-ready, scalable)'}\n- **Features:** ${features.join(', ')}`;
}

/**
 * Example usage in agent function
 */
export function getArchitectureRecommendation(userMessage: string): {
  analysis: RequirementAnalysis;
  explanation: string;
  shouldAskUser: boolean;
} {
  const analysis = analyzeRequirements(userMessage);
  const explanation = explainArchitectureDecision(analysis);
  
  // Ask user for confirmation if confidence is low
  const shouldAskUser = analysis.confidence < 0.75;

  return {
    analysis,
    explanation,
    shouldAskUser
  };
}
