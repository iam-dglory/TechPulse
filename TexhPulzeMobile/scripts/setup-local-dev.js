#!/usr/bin/env node

/**
 * TexhPulze Mobile - Local Development Setup Script
 * 
 * This script helps configure the mobile app for local development
 * by detecting the local IP address and updating the API configuration.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * Get local IP address
 */
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        // Prefer Wi-Fi interfaces, but fall back to any available
        if (name.toLowerCase().includes('wi-fi') || 
            name.toLowerCase().includes('wlan') ||
            name.toLowerCase().includes('ethernet') ||
            name.toLowerCase().includes('en0')) {
          return iface.address;
        }
      }
    }
  }
  
  // Fallback: return first non-internal IPv4 address
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return '192.168.1.100'; // Default fallback
}

/**
 * Update API configuration with local IP
 */
function updateApiConfig(ipAddress) {
  const configPath = path.join(__dirname, '..', 'src', 'config', 'api.ts');
  
  if (!fs.existsSync(configPath)) {
    console.error('❌ API config file not found:', configPath);
    return false;
  }
  
  try {
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Update the IP address in the DEVELOPMENT_CONFIG
    const ipRegex = /baseUrl:\s*"http:\/\/[\d\.]+:8090\/api"/;
    const newBaseUrl = `baseUrl: "http://${ipAddress}:8090/api"`;
    
    if (ipRegex.test(content)) {
      content = content.replace(ipRegex, newBaseUrl);
      fs.writeFileSync(configPath, content);
      console.log('✅ Updated API configuration with IP:', ipAddress);
      return true;
    } else {
      console.error('❌ Could not find baseUrl pattern in config file');
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating API config:', error.message);
    return false;
  }
}

/**
 * Display network information
 */
function displayNetworkInfo() {
  console.log('\n🌐 Network Information:');
  console.log('====================');
  
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    console.log(`\n📡 ${name}:`);
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4') {
        const type = iface.internal ? '🔒 Internal' : '🌍 External';
        console.log(`  ${type}: ${iface.address}`);
      }
    }
  }
}

/**
 * Test backend connectivity
 */
async function testBackendConnectivity(ipAddress) {
  console.log(`\n🔍 Testing backend connectivity at http://${ipAddress}:8090...`);
  
  try {
    const response = await fetch(`http://${ipAddress}:8090/health`);
    if (response.ok) {
      console.log('✅ Backend is accessible');
      return true;
    } else {
      console.log('❌ Backend returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend not accessible:', error.message);
    return false;
  }
}

/**
 * Main setup function
 */
async function main() {
  console.log('🚀 TexhPulze Mobile - Local Development Setup');
  console.log('===============================================\n');
  
  // Display network information
  displayNetworkInfo();
  
  // Get local IP address
  const ipAddress = getLocalIPAddress();
  console.log(`\n🎯 Detected IP Address: ${ipAddress}`);
  
  // Update API configuration
  const configUpdated = updateApiConfig(ipAddress);
  
  if (!configUpdated) {
    console.log('\n❌ Setup failed. Please manually update the API configuration.');
    process.exit(1);
  }
  
  // Test backend connectivity
  const backendAccessible = await testBackendConnectivity(ipAddress);
  
  console.log('\n📋 Next Steps:');
  console.log('==============');
  console.log('1. Make sure your backend is running:');
  console.log('   cd backend && npm run dev');
  console.log('');
  console.log('2. Start the mobile development server:');
  console.log('   npx expo start --lan --port 8095');
  console.log('');
  console.log('3. Scan the QR code with Expo Go app');
  console.log('');
  
  if (!backendAccessible) {
    console.log('⚠️  Warning: Backend is not accessible at the detected IP.');
    console.log('   Make sure your backend is running and accessible.');
    console.log('   Check firewall settings if needed.');
  }
  
  console.log('\n🎉 Setup complete! Your mobile app is configured for local development.');
}

// Run the setup
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getLocalIPAddress,
  updateApiConfig,
  testBackendConnectivity
};
