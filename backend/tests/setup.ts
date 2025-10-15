import 'reflect-metadata';
import { DataSource } from 'typeorm';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'sqlite://:memory:';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

// Create in-memory test database
const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: [
    'src/models/*.ts'
  ],
  synchronize: true,
  logging: false
});

// Global test setup
beforeAll(async () => {
  await testDataSource.initialize();
  console.log('Test database initialized');
});

// Global test teardown
afterAll(async () => {
  await testDataSource.destroy();
  console.log('Test database destroyed');
});

// Export for use in tests
export { testDataSource };
