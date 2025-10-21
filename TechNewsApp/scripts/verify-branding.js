#!/usr/bin/env node

/**
 * TexhPulze Branding Verification Script
 * 
 * This script verifies that all branding assets and configurations are properly set up
 * for Expo build system.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 TexhPulze Branding Verification');
console.log('==================================\n');

// Check if we're in the right directory
if (!fs.existsSync('app.config.js')) {
    console.error('❌ Error: Please run this script from the TechNewsApp directory');
    process.exit(1);
}

let allGood = true;

// Verify app.config.js
console.log('📱 Checking app.config.js...');
try {
    const configContent = fs.readFileSync('app.config.js', 'utf8');
    
    // Check for branding paths
    const checks = [
        { pattern: './assets/branding/icon.png', name: 'App icon path' },
        { pattern: './assets/branding/splash.png', name: 'Splash screen path' },
        { pattern: 'backgroundColor.*#000000', name: 'Splash background color' },
        { pattern: 'adaptiveIcon.*foregroundImage.*branding/icon.png', name: 'Android adaptive icon' },
        { pattern: 'favicon.*branding/favicon.png', name: 'Web favicon path' }
    ];
    
    checks.forEach(check => {
        if (configContent.includes(check.pattern.split(' ')[0])) {
            console.log(`✅ ${check.name}: Configured`);
        } else {
            console.log(`❌ ${check.name}: Not found`);
            allGood = false;
        }
    });
    
} catch (error) {
    console.error('❌ Error reading app.config.js:', error.message);
    allGood = false;
}

console.log('\n🎨 Checking branding assets...');

// Check branding assets
const assets = [
    { path: 'assets/branding/icon.png', name: 'Main app icon', required: true },
    { path: 'assets/branding/splash.png', name: 'Splash screen', required: true },
    { path: 'assets/branding/adaptive-icon.png', name: 'Android adaptive icon', required: true },
    { path: 'assets/branding/favicon.png', name: 'Web favicon', required: true },
    { path: 'assets/branding/icon.svg', name: 'Icon SVG source', required: false },
    { path: 'assets/branding/splash.svg', name: 'Splash SVG source', required: false }
];

assets.forEach(asset => {
    if (fs.existsSync(asset.path)) {
        const content = fs.readFileSync(asset.path, 'utf8');
        if (content.includes('PLACEHOLDER')) {
            console.log(`⚠️  ${asset.name}: Placeholder file (needs replacement)`);
            if (asset.required) allGood = false;
        } else {
            console.log(`✅ ${asset.name}: Ready`);
        }
    } else {
        if (asset.required) {
            console.log(`❌ ${asset.name}: Missing`);
            allGood = false;
        } else {
            console.log(`ℹ️  ${asset.name}: Optional file missing`);
        }
    }
});

console.log('\n📁 Checking directory structure...');

// Check directory structure
const dirs = [
    'assets',
    'assets/branding',
    'scripts'
];

dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`✅ ${dir}/: Directory exists`);
    } else {
        console.log(`❌ ${dir}/: Directory missing`);
        allGood = false;
    }
});

console.log('\n📋 Summary:');
console.log('============');

if (allGood) {
    console.log('🎉 All branding configurations are properly set up!');
    console.log('✅ Ready for Expo build');
    console.log('\n🚀 Next steps:');
    console.log('1. Replace placeholder PNG files with actual assets');
    console.log('2. Run: expo start (to test locally)');
    console.log('3. Run: expo build:android (to build for Android)');
    console.log('4. Run: expo build:ios (to build for iOS)');
} else {
    console.log('⚠️  Some issues found that need to be addressed');
    console.log('\n🔧 Fix these issues before building:');
    console.log('1. Replace placeholder PNG files with actual assets');
    console.log('2. Ensure all required files are present');
    console.log('3. Verify app.config.js paths are correct');
}

console.log('\n📚 For detailed instructions, see:');
console.log('   assets/branding/BRANDING-GUIDE.md');
console.log('\n🛠️  Asset generation:');
console.log('   Run: node assets/branding/generate-assets.js');
