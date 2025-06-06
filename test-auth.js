// Authentication testing script for both development and production domains
import axios from 'axios';

// Test configuration for different environments
const environments = {
  development: 'http://localhost:5000',
  production: process.env.DEPLOYMENT_URL || 'https://your-app.replit.app'
};

// Test user credentials
const testUser = {
  username: 'auth-test-user@example.com',
  password: 'SecureTestPassword123!',
  userType: 'client',
  birthDate: '1990-01-01'
};

async function testAuthentication(baseUrl, envName) {
  console.log(`\n=== Testing Authentication for ${envName} (${baseUrl}) ===`);
  
  const axiosInstance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    timeout: 10000
  });

  try {
    // Test 1: Check initial user state (should be 401)
    console.log('1. Testing initial user state...');
    try {
      await axiosInstance.get('/api/user');
      console.log('❌ Initial user check failed - should return 401');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Initial user state correct (401 Unauthorized)');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 2: Register new user
    console.log('2. Testing user registration...');
    try {
      const registerResponse = await axiosInstance.post('/api/register', testUser);
      console.log('✅ Registration successful');
      console.log('   User ID:', registerResponse.data.id);
      console.log('   Username:', registerResponse.data.username);
      console.log('   User Type:', registerResponse.data.userType);
      
      // Verify password is not in response
      if (registerResponse.data.password) {
        console.log('❌ Security issue: Password leaked in registration response');
      } else {
        console.log('✅ Security check passed: No password in response');
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message?.includes('already exists')) {
        console.log('⚠️ User already exists, proceeding with login test');
      } else {
        console.log('❌ Registration failed:', error.response?.data || error.message);
        return;
      }
    }

    // Test 3: Login
    console.log('3. Testing user login...');
    try {
      const loginResponse = await axiosInstance.post('/api/login', {
        username: testUser.username,
        password: testUser.password
      });
      console.log('✅ Login successful');
      console.log('   User ID:', loginResponse.data.id);
      console.log('   Username:', loginResponse.data.username);
      
      // Verify password is not in response
      if (loginResponse.data.password) {
        console.log('❌ Security issue: Password leaked in login response');
      } else {
        console.log('✅ Security check passed: No password in response');
      }
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data || error.message);
      return;
    }

    // Test 4: Check authenticated user state
    console.log('4. Testing authenticated user state...');
    try {
      const userResponse = await axiosInstance.get('/api/user');
      console.log('✅ Authenticated user retrieval successful');
      console.log('   User ID:', userResponse.data.id);
      console.log('   Username:', userResponse.data.username);
      
      // Verify password is not in response
      if (userResponse.data.password) {
        console.log('❌ Security issue: Password leaked in user response');
      } else {
        console.log('✅ Security check passed: No password in response');
      }
    } catch (error) {
      console.log('❌ Authenticated user check failed:', error.response?.data || error.message);
    }

    // Test 5: Test protected endpoint
    console.log('5. Testing protected endpoint access...');
    try {
      const journalResponse = await axiosInstance.get('/api/journal');
      console.log('✅ Protected endpoint accessible');
      console.log('   Journal entries count:', journalResponse.data.length);
    } catch (error) {
      console.log('❌ Protected endpoint failed:', error.response?.data || error.message);
    }

    // Test 6: Logout
    console.log('6. Testing logout...');
    try {
      await axiosInstance.post('/api/logout');
      console.log('✅ Logout successful');
    } catch (error) {
      console.log('❌ Logout failed:', error.response?.data || error.message);
    }

    // Test 7: Verify logged out state
    console.log('7. Testing post-logout state...');
    try {
      await axiosInstance.get('/api/user');
      console.log('❌ Post-logout check failed - should return 401');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Post-logout state correct (401 Unauthorized)');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log(`\n✅ Authentication test completed for ${envName}`);

  } catch (error) {
    console.log(`\n❌ Authentication test failed for ${envName}:`, error.message);
  }
}

async function runAllTests() {
  console.log('🔐 Starting comprehensive authentication tests...');
  
  // Test development environment
  await testAuthentication(environments.development, 'Development');
  
  // Test production environment if URL is provided
  if (process.env.DEPLOYMENT_URL) {
    await testAuthentication(environments.production, 'Production');
  } else {
    console.log('\n⚠️ DEPLOYMENT_URL not set, skipping production tests');
    console.log('   Set DEPLOYMENT_URL environment variable to test production authentication');
  }
  
  console.log('\n🎯 Authentication testing complete!');
}

// Run tests
runAllTests().catch(console.error);