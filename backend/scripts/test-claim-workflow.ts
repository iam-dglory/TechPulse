#!/usr/bin/env ts-node

/**
 * Test script to demonstrate the company claim approval workflow
 * Run with: npm run seed && ts-node scripts/test-claim-workflow.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    isAdmin: boolean;
  };
}

interface CompanyClaimResponse {
  success: boolean;
  message: string;
  data?: {
    claimId: string;
    status: string;
  };
}

async function login(email: string, password: string): Promise<string> {
  try {
    const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });

    if (!response.data.success || !response.data.token) {
      throw new Error('Login failed');
    }

    console.log(`✅ Logged in as: ${response.data.user.email} (Admin: ${response.data.user.isAdmin})`);
    return response.data.token;
  } catch (error) {
    console.error(`❌ Login failed for ${email}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

async function createCompanyClaim(token: string, companyName: string, ownerEmail: string): Promise<string> {
  try {
    const response = await axios.post<CompanyClaimResponse>(`${API_BASE_URL}/companies/claim`, {
      companyName,
      officialEmail: ownerEmail,
      websiteUrl: `https://${companyName.toLowerCase()}.com`,
      contactPerson: `${companyName} CEO`,
      phoneNumber: '+1234567890',
      verificationMethod: 'email',
      additionalInfo: `I am the legitimate owner of ${companyName} and can provide verification documents.`
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    console.log(`✅ Company claim created for ${companyName}: ${response.data.data?.claimId}`);
    return response.data.data?.claimId || 'unknown';
  } catch (error) {
    console.error(`❌ Failed to create claim for ${companyName}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

async function getPendingClaims(adminToken: string): Promise<any[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/claims?status=pending`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (response.data.success) {
      console.log(`📋 Found ${response.data.data?.claims?.length || 0} pending claims`);
      return response.data.data?.claims || [];
    }
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch pending claims:', error.response?.data?.message || error.message);
    return [];
  }
}

async function approveClaim(adminToken: string, claimId: string, reviewNotes?: string): Promise<void> {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/claims/${claimId}/approve`, {
      reviewNotes: reviewNotes || 'Claim approved after verification'
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (response.data.success) {
      console.log(`✅ Claim ${claimId} approved successfully`);
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error(`❌ Failed to approve claim ${claimId}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

async function rejectClaim(adminToken: string, claimId: string, reviewNotes?: string): Promise<void> {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/claims/${claimId}/reject`, {
      reviewNotes: reviewNotes || 'Claim rejected due to insufficient verification'
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (response.data.success) {
      console.log(`✅ Claim ${claimId} rejected`);
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error(`❌ Failed to reject claim ${claimId}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

async function demonstrateClaimWorkflow(): Promise<void> {
  console.log('🏢 TexhPulze Company Claim Workflow Demo');
  console.log('═'.repeat(50));
  
  try {
    // Step 1: Login as company owner
    console.log('\n1️⃣ Logging in as company owner...');
    const ownerToken = await login('ceo@pixaai.com', 'owner123');
    
    // Step 2: Create a company claim
    console.log('\n2️⃣ Creating company claim...');
    const claimId = await createCompanyClaim(ownerToken, 'PixaAI', 'ceo@pixaai.com');
    
    // Step 3: Login as admin
    console.log('\n3️⃣ Logging in as admin...');
    const adminToken = await login('admin@texhpulze.local', 'admin123');
    
    // Step 4: View pending claims
    console.log('\n4️⃣ Fetching pending claims...');
    const pendingClaims = await getPendingClaims(adminToken);
    
    if (pendingClaims.length > 0) {
      console.log('📋 Pending claims:');
      pendingClaims.forEach((claim, index) => {
        console.log(`   ${index + 1}. ${claim.companyName} - ${claim.status} (${claim.createdAt})`);
        console.log(`      Email: ${claim.officialEmail}`);
        console.log(`      Contact: ${claim.contactPerson}`);
        console.log(`      Info: ${claim.additionalInfo}`);
      });
    }
    
    // Step 5: Approve the claim
    console.log('\n5️⃣ Approving claim...');
    await approveClaim(adminToken, claimId, 'Verified through email confirmation and domain ownership');
    
    // Step 6: Create another claim to demonstrate rejection
    console.log('\n6️⃣ Creating another claim for rejection demo...');
    const owner2Token = await login('founder@synthhealth.com', 'owner123');
    const claimId2 = await createCompanyClaim(owner2Token, 'SynthHealth', 'founder@synthhealth.com');
    
    // Step 7: Reject the second claim
    console.log('\n7️⃣ Rejecting claim (demo)...');
    await rejectClaim(adminToken, claimId2, 'Insufficient documentation provided');
    
    // Step 8: Check final status
    console.log('\n8️⃣ Final status check...');
    const finalClaims = await getPendingClaims(adminToken);
    console.log(`📊 Remaining pending claims: ${finalClaims.length}`);
    
    console.log('\n🎉 Claim workflow demo completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Company owner created claim');
    console.log('   ✅ Admin reviewed pending claims');
    console.log('   ✅ Admin approved valid claim');
    console.log('   ✅ Admin rejected invalid claim');
    
  } catch (error) {
    console.error('\n💥 Demo failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the database is seeded: npm run seed');
    console.log('   2. Make sure the API server is running: npm run dev:ts');
    console.log('   3. Check the API_BASE_URL environment variable');
    console.log('   4. Verify the admin and owner users were created correctly');
  }
}

// Run the demo
if (require.main === module) {
  demonstrateClaimWorkflow()
    .then(() => {
      console.log('\n✅ Demo completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Demo failed:', error);
      process.exit(1);
    });
}

export default demonstrateClaimWorkflow;
