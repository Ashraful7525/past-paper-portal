import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testContributionEndpoints() {
  console.log('🌐 Testing Contribution API Endpoints on Port 3000\n');
  
  try {
    // First, let's test if the server is responding
    console.log('1️⃣ Testing server connectivity...');
    const healthCheck = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (healthCheck.status === 401) {
      console.log('✅ Server is running on port 3000 (401 Unauthorized as expected without token)');
    } else {
      console.log(`⚠️  Unexpected response: ${healthCheck.status}`);
      const responseText = await healthCheck.text();
      console.log('Response:', responseText);
    }
    
    console.log('\n2️⃣ Testing contribution endpoints availability...');
    
    // Test contribution endpoint without auth (should return 401)
    const contributionTest = await fetch(`${API_BASE}/auth/contribution`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (contributionTest.status === 401) {
      console.log('✅ GET /api/auth/contribution endpoint is available');
    } else {
      console.log(`❌ Unexpected response for contribution endpoint: ${contributionTest.status}`);
    }
    
    // Test recalculate endpoint without auth (should return 401)
    const recalcTest = await fetch(`${API_BASE}/auth/recalculate-contribution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (recalcTest.status === 401) {
      console.log('✅ POST /api/auth/recalculate-contribution endpoint is available');
    } else {
      console.log(`❌ Unexpected response for recalculate endpoint: ${recalcTest.status}`);
    }
    
    console.log('\n3️⃣ To test with authentication:');
    console.log('   a) Login to your frontend application');
    console.log('   b) Copy the JWT token from browser localStorage/sessionStorage');
    console.log('   c) Use these curl commands:');
    console.log('');
    console.log('# Get contribution data');
    console.log('curl -X GET "http://localhost:3000/api/auth/contribution" \\');
    console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
    console.log('  -H "Content-Type: application/json"');
    console.log('');
    console.log('# Recalculate contribution');
    console.log('curl -X POST "http://localhost:3000/api/auth/recalculate-contribution" \\');
    console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
    console.log('  -H "Content-Type: application/json"');
    
    console.log('\n4️⃣ PowerShell commands (Windows):');
    console.log('');
    console.log('# Get contribution data');
    console.log('Invoke-WebRequest -Uri "http://localhost:3000/api/auth/contribution" `');
    console.log('  -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"; "Content-Type"="application/json"} `');
    console.log('  -Method GET');
    console.log('');
    console.log('# Recalculate contribution');
    console.log('Invoke-WebRequest -Uri "http://localhost:3000/api/auth/recalculate-contribution" `');
    console.log('  -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"; "Content-Type"="application/json"} `');
    console.log('  -Method POST');
    
  } catch (error) {
    console.error('❌ Failed to connect to server:', error.message);
    console.log('Make sure your backend server is running on port 3000');
  }
}

testContributionEndpoints();