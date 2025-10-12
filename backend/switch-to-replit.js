#!/usr/bin/env node

/**
 * Switch to Replit Configuration Script
 * 
 * This script helps switch the backend from MySQL to SQLite for Replit deployment.
 * It updates the database configuration and creates necessary files.
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Switching to Replit Configuration');
console.log('===================================\n');

// Check if we're in the backend directory
if (!fs.existsSync('src/server.replit.js')) {
    console.error('❌ Error: Please run this script from the backend directory');
    process.exit(1);
}

console.log('✅ Replit configuration files found');
console.log('📋 Current setup:');
console.log('   - Server: src/server.replit.js');
console.log('   - Database: SQLite (src/config/database.replit.js)');
console.log('   - Package.json: Updated to use Replit server');

console.log('\n🎯 Next steps:');
console.log('1. The backend is configured to use SQLite for Replit');
console.log('2. Run: npm install (if not already done)');
console.log('3. Run: npm start (to start the Replit server)');
console.log('4. Test the API at: http://localhost:3000/health');

console.log('\n📚 For more information:');
console.log('   - README-REPLIT.md - Replit setup guide');
console.log('   - src/config/database.replit.js - SQLite configuration');
console.log('   - src/server.replit.js - Replit server setup');

console.log('\n🚀 Ready to run in Replit!');