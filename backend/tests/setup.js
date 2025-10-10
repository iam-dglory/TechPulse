// Test setup file
const { pool } = require('../src/config/database');

// Clean up database after each test
afterEach(async () => {
  // Clean up test data
  await pool.execute('DELETE FROM favorites WHERE user_id > 0');
  await pool.execute('DELETE FROM user_preferences WHERE user_id > 0');
  await pool.execute('DELETE FROM articles WHERE id > 0');
  await pool.execute('DELETE FROM users WHERE id > 0');
});

// Close database connection after all tests
afterAll(async () => {
  await pool.end();
});
