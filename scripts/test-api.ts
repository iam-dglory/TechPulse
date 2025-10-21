/**
 * API Testing Script
 *
 * Tests all major API endpoints to verify functionality
 *
 * Usage:
 *   npx ts-node scripts/test-api.ts
 *   BASE_URL=https://your-domain.com npx ts-node scripts/test-api.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  message: string;
  duration: number;
}

/**
 * Test an API endpoint
 */
async function testEndpoint(
  method: string,
  path: string,
  options?: RequestInit
): Promise<TestResult> {
  const startTime = Date.now();
  const url = `${BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    return {
      endpoint: path,
      method,
      status: response.status,
      success: response.ok,
      message: data.message || data.error?.message || 'No message',
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      endpoint: path,
      method,
      status: 0,
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      duration,
    };
  }
}

/**
 * Format test result with emojis
 */
function formatResult(result: TestResult): string {
  const emoji = result.success ? '✅' : '❌';
  const statusColor = result.success ? '\x1b[32m' : '\x1b[31m'; // Green or Red
  const reset = '\x1b[0m';

  return `${emoji} ${result.method.padEnd(6)} ${result.endpoint.padEnd(40)} ${statusColor}${result.status}${reset} (${result.duration}ms)`;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n🧪 API Testing Script');
  console.log('='.repeat(80));
  console.log(`Base URL: ${BASE_URL}\n`);

  const tests: Array<{ name: string; test: () => Promise<TestResult> }> = [
    {
      name: 'GET /api/companies (limit 5)',
      test: () => testEndpoint('GET', '/api/companies?limit=5'),
    },
    {
      name: 'GET /api/companies (with filters)',
      test: () => testEndpoint('GET', '/api/companies?industry=technology&sort=score&limit=10'),
    },
    {
      name: 'GET /api/news (limit 5)',
      test: () => testEndpoint('GET', '/api/news?limit=5'),
    },
    {
      name: 'GET /api/news (with filters)',
      test: () => testEndpoint('GET', '/api/news?industry=technology&limit=10'),
    },
    {
      name: 'GET /api/companies/[slug] (test slug)',
      test: () => testEndpoint('GET', '/api/companies/openai'),
    },
    {
      name: 'GET /api/promises (with company filter)',
      test: () => testEndpoint('GET', '/api/promises?company_id=00000000-0000-0000-0000-000000000000'),
    },
    {
      name: 'POST /api/votes (without auth - should fail 401)',
      test: () =>
        testEndpoint('POST', '/api/votes', {
          body: JSON.stringify({
            company_id: '00000000-0000-0000-0000-000000000000',
            vote_type: 'ethics',
            score: 8,
          }),
        }),
    },
    {
      name: 'POST /api/auth/login (invalid credentials - should fail 401)',
      test: () =>
        testEndpoint('POST', '/api/auth/login', {
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrongpassword',
          }),
        }),
    },
    {
      name: 'GET /api/user/dashboard (without auth - should fail 401)',
      test: () => testEndpoint('GET', '/api/user/dashboard'),
    },
  ];

  const results: TestResult[] = [];

  // Run all tests sequentially
  for (const { name, test } of tests) {
    console.log(`Testing: ${name}...`);
    const result = await test();
    results.push(result);
    console.log(formatResult(result));
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Test Summary');
  console.log('='.repeat(80));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Pass Rate: ${passRate}%`);

  const avgDuration = (results.reduce((sum, r) => sum + r.duration, 0) / total).toFixed(0);
  console.log(`Average Duration: ${avgDuration}ms`);

  // Expected failures (tests that should fail)
  console.log('\n📋 Expected Failures (401 Unauthorized):');
  const expectedFailures = results.filter(
    (r) => r.endpoint.includes('/votes') || r.endpoint.includes('/dashboard') || r.endpoint.includes('/auth/login')
  );

  expectedFailures.forEach((r) => {
    if (r.status === 401 || r.status === 400) {
      console.log(`  ✅ ${r.endpoint} correctly returned ${r.status}`);
    } else {
      console.log(`  ⚠️  ${r.endpoint} returned ${r.status} (expected 401)`);
    }
  });

  // Actual failures (unexpected)
  const unexpectedFailures = results.filter(
    (r) =>
      !r.success &&
      !r.endpoint.includes('/votes') &&
      !r.endpoint.includes('/dashboard') &&
      !r.endpoint.includes('/auth/login')
  );

  if (unexpectedFailures.length > 0) {
    console.log('\n⚠️  Unexpected Failures:');
    unexpectedFailures.forEach((r) => {
      console.log(`  ❌ ${r.endpoint} - ${r.message}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log(passRate === '100' ? '🎉 All tests passed!' : '⚠️  Some tests failed. Check the output above.');
  console.log('='.repeat(80) + '\n');

  // Exit with appropriate code
  process.exit(failed > unexpectedFailures.length ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
