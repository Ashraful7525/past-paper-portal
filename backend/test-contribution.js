// Test script for contribution system
const API_BASE = 'http://localhost:5000/api';

// You'll need to replace this with a valid JWT token from your login
const TEST_TOKEN = 'your-jwt-token-here';

async function testContributionSystem() {
  console.log('🧪 Testing Contribution System...\n');

  try {
    // Test 1: Get contribution data
    console.log('1️⃣ Testing GET /api/auth/contribution');
    const contributionResponse = await fetch(`${API_BASE}/auth/contribution`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (contributionResponse.ok) {
      const contributionData = await contributionResponse.json();
      console.log('✅ Contribution data retrieved successfully:');
      console.log(JSON.stringify(contributionData, null, 2));
    } else {
      console.log('❌ Failed to get contribution data:', contributionResponse.status);
      const error = await contributionResponse.text();
      console.log('Error details:', error);
    }

    console.log('\n');

    // Test 2: Test recalculate contribution
    console.log('2️⃣ Testing POST /api/auth/recalculate-contribution');
    const recalcResponse = await fetch(`${API_BASE}/auth/recalculate-contribution`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (recalcResponse.ok) {
      const recalcData = await recalcResponse.json();
      console.log('✅ Contribution recalculated successfully:');
      console.log(JSON.stringify(recalcData, null, 2));
    } else {
      console.log('❌ Failed to recalculate contribution:', recalcResponse.status);
      const error = await recalcResponse.text();
      console.log('Error details:', error);
    }

  } catch (error) {
    console.error('🚨 Test failed with error:', error.message);
  }
}

// Test the reputation tier calculation
function testReputationTiers() {
  console.log('\n🏆 Testing Reputation Tier System:');
  
  const testPoints = [0, 50, 150, 750, 2500, 7500];
  
  // Import ContributionManager to test tier calculation
  import('./models/ContributionManager.js').then(({ default: ContributionManager }) => {
    testPoints.forEach(points => {
      const tier = ContributionManager.getReputationTier(points);
      console.log(`${points} points → ${tier} tier`);
    });
  });
}

// Test streak calculation
function testStreakSystem() {
  console.log('\n🔥 Testing Streak System:');
  
  import('./models/ContributionManager.js').then(({ default: ContributionManager }) => {
    const testStreaks = [0, 1, 3, 5, 7, 10];
    
    testStreaks.forEach(streak => {
      const multiplier = ContributionManager.getStreakMultiplier(streak);
      const bonus = ((multiplier - 1) * 100).toFixed(1);
      console.log(`${streak} day streak → ${bonus}% bonus (${multiplier}x multiplier)`);
    });
  });
}

console.log('🚀 Contribution System Test Suite');
console.log('=================================\n');

// Show point system
console.log('📊 Point System:');
console.log('• Post created: 5 points');
console.log('• Solution created: 10 points');
console.log('• Comment created: 2 points');
console.log('• Upvote received: 3 points');
console.log('• Downvote received: -1 point');
console.log('• Bookmark received: 2 points');
console.log('• View received: 0.1 points\n');

console.log('🏆 Reputation Tiers:');
console.log('• Bronze: 0-99 points');
console.log('• Silver: 100-499 points');
console.log('• Gold: 500-1,499 points');
console.log('• Platinum: 1,500-4,999 points');
console.log('• Diamond: 5,000+ points\n');

// Run tests
testReputationTiers();
testStreakSystem();

console.log('\n🧪 To test API endpoints:');
console.log('1. Login to get a JWT token');
console.log('2. Replace TEST_TOKEN variable above');
console.log('3. Uncomment and run: testContributionSystem();');

// Uncomment this line after setting your JWT token:
// testContributionSystem();