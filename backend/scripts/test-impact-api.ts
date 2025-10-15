/**
 * Test script for Impact Calculation API endpoints
 * Run with: npm run test:impact-api
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error';
  message: string;
  responseTime: number;
  statusCode?: number;
}

class ImpactAPITester {
  private results: TestResult[] = [];
  private authToken: string = '';

  async runTests(): Promise<void> {
    console.log('🚀 Starting Impact Calculation API Tests...\n');

    try {
      // Test 1: Get stories without recommendations (baseline)
      await this.testGetStoriesBaseline();

      // Test 2: Get stories with customer-service recommendations
      await this.testGetStoriesWithRecommendations();

      // Test 3: Get stories with healthcare recommendations
      await this.testGetStoriesWithHealthcareRecommendations();

      // Test 4: Test invalid industry recommendations
      await this.testInvalidIndustryRecommendations();

      // Test 5: Test industry mapping configuration
      await this.testIndustryMapping();

      // Print results
      this.printResults();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  private async testGetStoriesBaseline(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${BASE_URL}/stories?limit=5`, {
        timeout: 10000,
      });

      const responseTime = Date.now() - startTime;
      
      this.results.push({
        endpoint: '/stories (baseline)',
        method: 'GET',
        status: 'success',
        message: `Retrieved ${response.data.data.stories.length} stories`,
        responseTime,
        statusCode: response.status,
      });

      console.log('✅ Baseline stories test passed');
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      this.results.push({
        endpoint: '/stories (baseline)',
        method: 'GET',
        status: 'error',
        message: error.response?.data?.message || error.message,
        responseTime,
        statusCode: error.response?.status,
      });

      console.log('❌ Baseline stories test failed:', error.response?.data?.message || error.message);
    }
  }

  private async testGetStoriesWithRecommendations(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${BASE_URL}/stories?recommendedFor=customer-service&limit=5`, {
        timeout: 10000,
      });

      const responseTime = Date.now() - startTime;
      const data = response.data.data;
      
      this.results.push({
        endpoint: '/stories?recommendedFor=customer-service',
        method: 'GET',
        status: 'success',
        message: `Retrieved ${data.stories.length} recommended stories (threshold: ${data.recommendationInfo?.threshold || 'N/A'})`,
        responseTime,
        statusCode: response.status,
      });

      console.log('✅ Customer service recommendations test passed');
      console.log(`   📊 Found ${data.stories.length} recommended stories`);
      if (data.recommendationInfo) {
        console.log(`   🎯 Threshold: ${data.recommendationInfo.threshold}`);
        console.log(`   📈 Total eligible: ${data.recommendationInfo.totalEligible}`);
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      this.results.push({
        endpoint: '/stories?recommendedFor=customer-service',
        method: 'GET',
        status: 'error',
        message: error.response?.data?.message || error.message,
        responseTime,
        statusCode: error.response?.status,
      });

      console.log('❌ Customer service recommendations test failed:', error.response?.data?.message || error.message);
    }
  }

  private async testGetStoriesWithHealthcareRecommendations(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${BASE_URL}/stories?recommendedFor=healthcare&sort=top&limit=3`, {
        timeout: 10000,
      });

      const responseTime = Date.now() - startTime;
      const data = response.data.data;
      
      this.results.push({
        endpoint: '/stories?recommendedFor=healthcare',
        method: 'GET',
        status: 'success',
        message: `Retrieved ${data.stories.length} healthcare stories (threshold: ${data.recommendationInfo?.threshold || 'N/A'})`,
        responseTime,
        statusCode: response.status,
      });

      console.log('✅ Healthcare recommendations test passed');
      console.log(`   🏥 Found ${data.stories.length} healthcare stories`);
      if (data.recommendationInfo) {
        console.log(`   🎯 Threshold: ${data.recommendationInfo.threshold}`);
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      this.results.push({
        endpoint: '/stories?recommendedFor=healthcare',
        method: 'GET',
        status: 'error',
        message: error.response?.data?.message || error.message,
        responseTime,
        statusCode: error.response?.status,
      });

      console.log('❌ Healthcare recommendations test failed:', error.response?.data?.message || error.message);
    }
  }

  private async testInvalidIndustryRecommendations(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${BASE_URL}/stories?recommendedFor=invalid-industry&limit=5`, {
        timeout: 10000,
      });

      const responseTime = Date.now() - startTime;
      const data = response.data.data;
      
      this.results.push({
        endpoint: '/stories?recommendedFor=invalid-industry',
        method: 'GET',
        status: 'success',
        message: `Handled invalid industry gracefully: ${data.stories.length} stories returned`,
        responseTime,
        statusCode: response.status,
      });

      console.log('✅ Invalid industry handling test passed');
      console.log(`   🔄 Gracefully handled invalid industry: ${data.stories.length} stories returned`);
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      this.results.push({
        endpoint: '/stories?recommendedFor=invalid-industry',
        method: 'GET',
        status: 'error',
        message: error.response?.data?.message || error.message,
        responseTime,
        statusCode: error.response?.status,
      });

      console.log('❌ Invalid industry handling test failed:', error.response?.data?.message || error.message);
    }
  }

  private async testIndustryMapping(): Promise<void> {
    console.log('\n🧪 Testing Industry Mapping Configuration...');
    
    const industries = [
      'customer-service',
      'healthcare', 
      'education',
      'finance',
      'technology',
      'retail',
      'manufacturing',
      'transportation',
      'government',
      'non-profit',
      'freelance'
    ];

    let successCount = 0;
    let totalCount = 0;

    for (const industry of industries) {
      totalCount++;
      const startTime = Date.now();
      
      try {
        const response = await axios.get(`${BASE_URL}/stories?recommendedFor=${industry}&limit=1`, {
          timeout: 5000,
        });

        const responseTime = Date.now() - startTime;
        const data = response.data.data;
        
        if (data.recommendationInfo) {
          successCount++;
          console.log(`   ✅ ${industry}: threshold ${data.recommendationInfo.threshold}, eligible: ${data.recommendationInfo.totalEligible}`);
        } else {
          console.log(`   ⚠️  ${industry}: no recommendation info returned`);
        }
      } catch (error: any) {
        console.log(`   ❌ ${industry}: ${error.response?.data?.message || error.message}`);
      }
    }

    this.results.push({
      endpoint: '/stories (industry mapping)',
      method: 'GET',
      status: successCount === totalCount ? 'success' : 'error',
      message: `Industry mapping test: ${successCount}/${totalCount} industries working`,
      responseTime: 0,
    });

    console.log(`\n📊 Industry Mapping Results: ${successCount}/${totalCount} industries configured correctly`);
  }

  private printResults(): void {
    console.log('\n📋 Test Results Summary:');
    console.log('=' .repeat(60));
    
    const successCount = this.results.filter(r => r.status === 'success').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📊 Total: ${this.results.length}`);
    
    console.log('\n📝 Detailed Results:');
    this.results.forEach(result => {
      const status = result.status === 'success' ? '✅' : '❌';
      const time = `${result.responseTime}ms`;
      const code = result.statusCode ? ` (${result.statusCode})` : '';
      
      console.log(`${status} ${result.method} ${result.endpoint}${code} - ${time}`);
      console.log(`   ${result.message}`);
      console.log('');
    });

    if (errorCount === 0) {
      console.log('🎉 All tests passed! Impact Calculation API is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please check the server logs and configuration.');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new ImpactAPITester();
  tester.runTests().catch(console.error);
}

export default ImpactAPITester;

