#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envExample = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database URL (for direct connections if needed)
DATABASE_URL=your_supabase_database_url`;

const envLocalPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envLocalPath)) {
  fs.writeFileSync(envLocalPath, envExample);
  console.log('✅ Created .env.local file');
  console.log('📝 Please update the environment variables with your Supabase credentials');
} else {
  console.log('⚠️  .env.local already exists');
}

console.log('\n🔧 Next steps:');
console.log('1. Go to https://supabase.com and create a new project');
console.log('2. Copy your project URL and anon key from the API settings');
console.log('3. Update the .env.local file with your credentials');
console.log('4. Run the SQL schema from supabase/schema.sql in your Supabase SQL editor');
console.log('5. Start the development server with: npm run dev');








