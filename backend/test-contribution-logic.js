import ContributionManager from './models/ContributionManager.js';

// Test the contribution system functionality
async function testContributionSystem() {
  console.log('🧪 Testing Contribution System Functionality\n');
  
  // Test 1: Reputation Tier Calculation
  console.log('1️⃣ Testing Reputation Tiers:');
  const testPoints = [0, 50, 150, 750, 2500, 7500];
  testPoints.forEach(points => {
    const tier = ContributionManager.getReputationTier(points);
    console.log(`   ${points} points → ${tier} tier`);
  });
  
  // Test 2: Streak Multiplier Calculation
  console.log('\n2️⃣ Testing Streak Multipliers:');
  const testStreaks = [0, 1, 3, 5, 7, 10, 15];
  testStreaks.forEach(streak => {
    const multiplier = ContributionManager.getStreakMultiplier(streak);
    const bonus = ((multiplier - 1) * 100).toFixed(1);
    console.log(`   ${streak} day streak → +${bonus}% bonus (${multiplier.toFixed(2)}x)`);
  });
  
  // Test 3: Point System Configuration
  console.log('\n3️⃣ Point System Configuration:');
  console.log(`   Post created: ${ContributionManager.POINTS.POST_CREATED} points`);
  console.log(`   Solution created: ${ContributionManager.POINTS.SOLUTION_CREATED} points`);
  console.log(`   Comment created: ${ContributionManager.POINTS.COMMENT_CREATED} points`);
  console.log(`   Upvote received: ${ContributionManager.POINTS.UPVOTE_RECEIVED} points`);
  console.log(`   Downvote received: ${ContributionManager.POINTS.DOWNVOTE_RECEIVED} points`);
  console.log(`   Bookmark received: ${ContributionManager.POINTS.BOOKMARK_RECEIVED} points`);
  
  // Test 4: Quality Multipliers
  console.log('\n4️⃣ Quality Multipliers:');
  console.log(`   Verified content: ${ContributionManager.MULTIPLIERS.VERIFIED_CONTENT}x`);
  console.log(`   Approved solution: ${ContributionManager.MULTIPLIERS.APPROVED_SOLUTION}x`);
  console.log(`   Featured post: ${ContributionManager.MULTIPLIERS.FEATURED_POST}x`);
  console.log(`   Streak bonus per day: +${ContributionManager.MULTIPLIERS.STREAK_BONUS * 100}%`);
  
  console.log('\n✅ All tests completed successfully!');
}

// Run the tests
testContributionSystem().catch(console.error);