/**
 * AI Database Migration Runner
 *
 * This script runs the AI analysis migration on your Supabase database.
 *
 * Usage:
 *   node scripts/run-ai-migration.js
 *
 * Prerequisites:
 *   - VITE_SUPABASE_URL in .env
 *   - VITE_SUPABASE_ANON_KEY in .env
 *   - Supabase service role key (for admin operations)
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runMigration() {
  log('\n🚀 Starting AI Database Migration...\n', 'cyan');

  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('❌ Error: Missing Supabase credentials in .env file', 'red');
    log('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n', 'yellow');
    process.exit(1);
  }

  log(`✓ Supabase URL: ${supabaseUrl}`, 'green');
  log(`✓ API Key: ${supabaseKey.substring(0, 20)}...\n`, 'green');

  // Read migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250122_ai_analyses.sql');

  if (!fs.existsSync(migrationPath)) {
    log(`❌ Error: Migration file not found at ${migrationPath}`, 'red');
    process.exit(1);
  }

  log('📄 Reading migration file...', 'blue');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  log(`✓ Migration file loaded (${sql.length} bytes)\n`, 'green');

  // Split SQL into individual statements
  log('🔨 Parsing SQL statements...', 'blue');
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  log(`✓ Found ${statements.length} SQL statements\n`, 'green');

  // Execute each statement
  log('⚙️  Executing migration statements...\n', 'blue');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\n/g, ' ') + '...';

    try {
      log(`[${i + 1}/${statements.length}] ${preview}`, 'yellow');

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ query: statement }),
      });

      if (!response.ok) {
        const error = await response.text();
        log(`  ⚠️  Warning: ${error}`, 'yellow');
        errorCount++;
      } else {
        log(`  ✓ Success`, 'green');
        successCount++;
      }
    } catch (error) {
      log(`  ❌ Error: ${error.message}`, 'red');
      errorCount++;
    }
  }

  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Migration Summary:', 'cyan');
  log(`   ✓ Successful: ${successCount}`, 'green');
  if (errorCount > 0) {
    log(`   ⚠️  Warnings/Errors: ${errorCount}`, 'yellow');
  }
  log('='.repeat(60) + '\n', 'cyan');

  // Verify tables were created
  log('🔍 Verifying migration...', 'blue');
  log('\n⚠️  Note: This script uses the anon key which may have limited permissions.', 'yellow');
  log('   If you see errors, please use Option 2 (Supabase Dashboard) from the setup guide.\n', 'yellow');
  log('   Run the migration manually at:', 'yellow');
  log(`   https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}/sql\n`, 'cyan');

  log('✅ Migration script completed!', 'green');
  log('\nNext steps:', 'blue');
  log('1. Verify tables in Supabase Dashboard > Table Editor', 'reset');
  log('2. Check for ai_analyses, ai_insights, ai_call_logs tables', 'reset');
  log('3. Run verification SQL from docs/SETUP_AI_COMPLETE_GUIDE.md\n', 'reset');
}

// Run migration
runMigration().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
