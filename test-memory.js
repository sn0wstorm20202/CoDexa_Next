// Quick test script to validate memory functions
// Run with: node test-memory.js

const { extractContextFromMessage, isModificationRequest } = require('./src/inngest/memory.ts');

console.log('🧪 Testing Memory Functions...\n');

// Test 1: Context extraction from new request
console.log('Test 1: New landing page request');
const test1 = extractContextFromMessage("Make a red landing page");
console.log('Result:', test1);
console.log('');

// Test 2: Context extraction from modification request
console.log('Test 2: Modification request');
const previousContext = {
  lastContext: 'Creating landing page',
  currentTask: 'creating red landing page',
  domainInfo: { colors: ['red'], components: ['landing page'] },
  recentMessages: []
};

const test2 = extractContextFromMessage("Change to yellow", previousContext);
console.log('Result:', test2);
console.log('');

// Test 3: Modification detection
console.log('Test 3: Modification detection');
console.log('Is "Make a red page" modification?', isModificationRequest("Make a red page"));
console.log('Is "Change to yellow" modification?', isModificationRequest("Change to yellow"));
console.log('Is "Make it responsive" modification?', isModificationRequest("Make it responsive"));
console.log('');

console.log('✅ Memory function tests completed!');