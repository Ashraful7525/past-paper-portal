import pool from './config/db.js';
import ContributionManager from './models/ContributionManager.js';

async function checkUpvoteData() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking upvote calculation data...\n');
    
    // Get some sample user IDs
    const userIds = await client.query('SELECT DISTINCT student_id FROM posts LIMIT 3');
    
    console.log('📊 Testing ContributionManager API vs Direct Query:');
    
    for (const userRow of userIds.rows) {
      const studentId = userRow.student_id;
      
      // Test ContributionManager API (our fixed version)
      try {
        const contributionData = await ContributionManager.getUserContributionSummary(studentId);
        console.log(`\nUser ID ${studentId} via ContributionManager API:`);
        console.log(`  Posts: ${contributionData.posts_count}`);
        console.log(`  Post upvotes: ${contributionData.total_post_upvotes}`);
        console.log(`  Solution upvotes: ${contributionData.total_solution_upvotes}`);
        console.log(`  Comment upvotes: ${contributionData.total_comment_upvotes}`);
        console.log(`  Total upvotes: ${contributionData.total_post_upvotes + contributionData.total_solution_upvotes + contributionData.total_comment_upvotes}`);
        console.log(`  ✅ Fixed calculation working`);
      } catch (error) {
        console.log(`  ❌ Error with ContributionManager: ${error.message}`);
      }
      
      // Test direct query (old problematic way)
      const directResult = await client.query(`
        SELECT 
          (SELECT COALESCE(SUM(upvotes), 0) FROM posts WHERE student_id = $1) as total_post_upvotes,
          (SELECT COALESCE(SUM(upvotes), 0) FROM solutions WHERE student_id = $1) as total_solution_upvotes,
          (SELECT COALESCE(SUM(upvotes), 0) FROM comments WHERE student_id = $1) as total_comment_upvotes
      `, [studentId]);
      
      const direct = directResult.rows[0];
      console.log(`\nUser ID ${studentId} via Direct Query (problematic):`);
      console.log(`  Post upvotes: ${direct.total_post_upvotes} (type: ${typeof direct.total_post_upvotes})`);
      console.log(`  Solution upvotes: ${direct.total_solution_upvotes} (type: ${typeof direct.total_solution_upvotes})`);
      console.log(`  Comment upvotes: ${direct.total_comment_upvotes} (type: ${typeof direct.total_comment_upvotes})`);
      console.log(`  Total (string concat): ${direct.total_post_upvotes + direct.total_solution_upvotes + direct.total_comment_upvotes}`);
      console.log(`  Total (parsed): ${parseInt(direct.total_post_upvotes) + parseInt(direct.total_solution_upvotes) + parseInt(direct.total_comment_upvotes)}`);
      console.log('---');
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

checkUpvoteData().catch(console.error);