#!/usr/bin/env ts-node

import { spawn } from 'child_process';
import path from 'path';

/**
 * Comprehensive test runner for TexhPulze backend
 * Runs all test suites and provides detailed reporting
 */

interface TestSuite {
  name: string;
  path: string;
  description: string;
}

const testSuites: TestSuite[] = [
  {
    name: 'Scoring Logic Tests',
    path: 'tests/services/scoring.test.ts',
    description: 'Tests for HypeScorer and EthicsScorer algorithms'
  },
  {
    name: 'Company CRUD Tests',
    path: 'tests/controllers/company.test.ts',
    description: 'Tests for company creation, retrieval, updates, and validation'
  },
  {
    name: 'Story Creation Tests',
    path: 'tests/controllers/story.test.ts',
    description: 'Tests for story creation, scoring, and content validation'
  },
  {
    name: 'Worker Job Tests',
    path: 'tests/worker/index.test.ts',
    description: 'Tests for background job processing and queue management'
  }
];

async function runTestSuite(suite: TestSuite): Promise<boolean> {
  console.log(`\n🧪 Running ${suite.name}...`);
  console.log(`📝 ${suite.description}`);
  console.log('─'.repeat(60));

  return new Promise((resolve) => {
    const jest = spawn('npx', ['jest', suite.path, '--verbose', '--no-coverage'], {
      cwd: process.cwd(),
      stdio: 'inherit'
    });

    jest.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${suite.name} passed\n`);
        resolve(true);
      } else {
        console.log(`❌ ${suite.name} failed\n`);
        resolve(false);
      }
    });

    jest.on('error', (error) => {
      console.error(`💥 Error running ${suite.name}:`, error.message);
      resolve(false);
    });
  });
}

async function runAllTests(): Promise<void> {
  console.log('🚀 TexhPulze Backend Test Suite');
  console.log('═'.repeat(60));
  console.log('Running comprehensive tests for scoring logic, CRUD operations, and worker jobs...\n');

  const startTime = Date.now();
  const results: { suite: TestSuite; passed: boolean }[] = [];

  // Run each test suite
  for (const suite of testSuites) {
    const passed = await runTestSuite(suite);
    results.push({ suite, passed });
  }

  // Generate summary report
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('📊 Test Results Summary');
  console.log('═'.repeat(60));
  
  const passedSuites = results.filter(r => r.passed).length;
  const totalSuites = results.length;
  
  results.forEach(({ suite, passed }) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} ${suite.name}`);
  });
  
  console.log('\n📈 Overall Results:');
  console.log(`   Passed: ${passedSuites}/${totalSuites} test suites`);
  console.log(`   Duration: ${duration.toFixed(2)} seconds`);
  console.log(`   Success Rate: ${((passedSuites / totalSuites) * 100).toFixed(1)}%`);

  if (passedSuites === totalSuites) {
    console.log('\n🎉 All tests passed! TexhPulze backend is ready for production.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
    process.exit(1);
  }
}

async function runSpecificTest(testName: string): Promise<void> {
  const suite = testSuites.find(s => 
    s.name.toLowerCase().includes(testName.toLowerCase())
  );

  if (!suite) {
    console.error(`❌ Test suite "${testName}" not found.`);
    console.log('Available test suites:');
    testSuites.forEach(s => console.log(`  - ${s.name}`));
    process.exit(1);
  }

  const passed = await runTestSuite(suite);
  process.exit(passed ? 0 : 1);
}

async function runScoringTests(): Promise<void> {
  console.log('🧮 Running Scoring Logic Tests...\n');
  
  const passed = await runTestSuite({
    name: 'Scoring Logic Tests',
    path: 'tests/services/scoring.test.ts',
    description: 'Tests for HypeScorer and EthicsScorer algorithms with seeded examples'
  });

  if (passed) {
    console.log('✅ Scoring tests completed successfully!');
    console.log('📋 Test Coverage:');
    console.log('   - HypeScorer: Marketing language detection, technical content scoring');
    console.log('   - EthicsScorer: Privacy analysis, impact tag identification');
    console.log('   - Integration: Consistent scoring across multiple runs');
    console.log('   - Edge Cases: Empty content, special characters, long text');
  }

  process.exit(passed ? 0 : 1);
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'all':
    runAllTests();
    break;
  case 'scoring':
    runScoringTests();
    break;
  case 'company':
    runSpecificTest('Company CRUD Tests');
    break;
  case 'story':
    runSpecificTest('Story Creation Tests');
    break;
  case 'worker':
    runSpecificTest('Worker Job Tests');
    break;
  default:
    console.log('🧪 TexhPulze Backend Test Runner');
    console.log('Usage: ts-node tests/run-tests.ts <command>');
    console.log('\nCommands:');
    console.log('  all      - Run all test suites');
    console.log('  scoring  - Run scoring logic tests only');
    console.log('  company  - Run company CRUD tests only');
    console.log('  story    - Run story creation tests only');
    console.log('  worker   - Run worker job tests only');
    console.log('\nExamples:');
    console.log('  npm run test:scoring');
    console.log('  npm run test:backend');
    process.exit(0);
}
