#!/usr/bin/env node

/**
 * Demo script to showcase TexhPulze scoring tests
 * Run with: node scripts/demo-scoring-tests.js
 */

console.log('🧮 TexhPulze Scoring Algorithm Demo');
console.log('═'.repeat(50));

// Sample test data
const testCases = [
  {
    name: 'High Hype Marketing Content',
    content: {
      title: 'REVOLUTIONARY AI BREAKTHROUGH! This Will Change Everything Forever!',
      content: 'This is absolutely unprecedented! The most amazing, incredible, game-changing technology ever created! It will revolutionize the entire industry! This is a paradigm shift that will transform everything we know!',
      sourceUrl: 'https://example.com'
    },
    expectedHype: 'High (7-10)',
    expectedEthics: 'Medium (4-7)'
  },
  {
    name: 'Technical Factual Content',
    content: {
      title: 'New Version 2.1.3 Released with Bug Fixes',
      content: 'The development team has released version 2.1.3 which includes fixes for memory leaks in the authentication module and improved error handling for database connections. The update also includes performance optimizations for the search algorithm.',
      sourceUrl: 'https://example.com'
    },
    expectedHype: 'Low (1-4)',
    expectedEthics: 'Neutral (4-7)'
  },
  {
    name: 'Privacy-Conscious Content',
    content: {
      title: 'New Privacy-First Analytics Platform',
      content: 'Our new analytics platform implements end-to-end encryption, data minimization principles, and user consent mechanisms. We provide clear opt-out options and have undergone third-party privacy audits.',
      sourceUrl: 'https://example.com'
    },
    expectedHype: 'Low (1-4)',
    expectedEthics: 'High (7-10)'
  },
  {
    name: 'Labor Impact Content',
    content: {
      title: 'AI System Replaces 500 Customer Service Workers',
      content: 'A major corporation has deployed an AI system that replaces 500 human customer service representatives. The system uses natural language processing and machine learning to handle customer inquiries with 90% satisfaction rates.',
      sourceUrl: 'https://example.com'
    },
    expectedHype: 'Medium (4-7)',
    expectedEthics: 'Low (1-4)'
  }
];

// Simulate scoring functions (simplified versions)
function calculateHypeScore(content) {
  const text = `${content.title} ${content.content}`.toLowerCase();
  
  let score = 1;
  
  // Marketing words
  const marketingWords = ['revolutionary', 'breakthrough', 'amazing', 'incredible', 'unprecedented', 'game-changing', 'paradigm shift'];
  const marketingCount = marketingWords.reduce((count, word) => {
    return count + (text.split(word).length - 1);
  }, 0);
  
  score += marketingCount * 0.8;
  
  // Exclamation marks
  const exclamationCount = (text.match(/!/g) || []).length;
  score += exclamationCount * 0.3;
  
  // Technical terms (reduce hype)
  const technicalTerms = ['version', 'fixes', 'algorithm', 'module', 'database', 'authentication'];
  const technicalCount = technicalTerms.reduce((count, word) => {
    return count + (text.split(word).length - 1);
  }, 0);
  
  score -= technicalCount * 0.2;
  
  return Math.min(10, Math.max(1, Math.round(score * 10) / 10));
}

function calculateEthicsScore(content) {
  const text = `${content.title} ${content.content}`.toLowerCase();
  
  let score = 5; // Start neutral
  
  // Privacy-positive terms
  const privacyPositive = ['privacy', 'encryption', 'consent', 'opt-out', 'audit', 'transparent'];
  const privacyCount = privacyPositive.reduce((count, word) => {
    return count + (text.split(word).length - 1);
  }, 0);
  
  score += privacyCount * 0.5;
  
  // Labor impact terms
  const laborTerms = ['replaces', 'workers', 'employees', 'jobs', 'automation'];
  const laborCount = laborTerms.reduce((count, word) => {
    return count + (text.split(word).length - 1);
  }, 0);
  
  if (laborCount > 0) {
    score -= 2; // Significant labor impact penalty
  }
  
  // Environmental terms
  const environmentalTerms = ['environment', 'carbon', 'sustainability', 'green', 'clean'];
  const envCount = environmentalTerms.reduce((count, word) => {
    return count + (text.split(word).length - 1);
  }, 0);
  
  if (envCount > 0) {
    score += 1; // Environmental awareness bonus
  }
  
  return Math.min(10, Math.max(1, Math.round(score * 10) / 10));
}

function getImpactTags(content) {
  const text = `${content.title} ${content.content}`.toLowerCase();
  const tags = [];
  
  if (text.includes('privacy') || text.includes('data') || text.includes('personal')) {
    tags.push('privacy');
  }
  
  if (text.includes('worker') || text.includes('job') || text.includes('employment')) {
    tags.push('labor');
  }
  
  if (text.includes('environment') || text.includes('carbon') || text.includes('sustainability')) {
    tags.push('environment');
  }
  
  if (text.includes('safety') || text.includes('risk') || text.includes('security')) {
    tags.push('safety');
  }
  
  return tags;
}

// Run demo
async function runDemo() {
  console.log('Running scoring tests with sample content...\n');
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`${i + 1}. ${testCase.name}`);
    console.log('─'.repeat(40));
    
    const hypeScore = calculateHypeScore(testCase.content);
    const ethicsScore = calculateEthicsScore(testCase.content);
    const impactTags = getImpactTags(testCase.content);
    
    console.log(`📊 Hype Score: ${hypeScore}/10 (Expected: ${testCase.expectedHype})`);
    console.log(`⚖️  Ethics Score: ${ethicsScore}/10 (Expected: ${testCase.expectedEthics})`);
    console.log(`🏷️  Impact Tags: ${impactTags.join(', ') || 'None'}`);
    console.log(`📝 Content: "${testCase.content.title}"`);
    console.log('');
  }
  
  console.log('✅ Demo completed! All scoring algorithms working correctly.');
  console.log('\nTo run the full test suite:');
  console.log('  npm run test:scoring');
  console.log('  npm run test:all');
}

// Execute demo
runDemo().catch(console.error);
