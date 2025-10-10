const cron = require('node-cron');
const newsAggregator = require('./newsAggregator');

class CronService {
  constructor() {
    this.jobs = [];
  }

  // Start all cron jobs
  start() {
    console.log('🕐 Starting cron jobs...');

    // News aggregation job - runs every 2 hours
    const newsJob = cron.schedule('0 */2 * * *', async () => {
      console.log('⏰ Running scheduled news aggregation...');
      try {
        await newsAggregator.aggregateNews();
        console.log('✅ Scheduled news aggregation completed');
      } catch (error) {
        console.error('❌ Scheduled news aggregation failed:', error.message);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // Cleanup old articles job - runs daily at 2 AM
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Running scheduled cleanup...');
      try {
        await this.cleanupOldArticles();
        console.log('✅ Scheduled cleanup completed');
      } catch (error) {
        console.error('❌ Scheduled cleanup failed:', error.message);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.jobs.push(newsJob, cleanupJob);

    // Start all jobs
    this.jobs.forEach(job => job.start());

    console.log('✅ All cron jobs started successfully');
  }

  // Stop all cron jobs
  stop() {
    console.log('🛑 Stopping cron jobs...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('✅ All cron jobs stopped');
  }

  // Cleanup articles older than 30 days
  async cleanupOldArticles() {
    const { pool } = require('../config/database');
    
    try {
      const [result] = await pool.execute(
        'DELETE FROM articles WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
      );
      
      console.log(`🗑️ Cleaned up ${result.affectedRows} old articles`);
      return result.affectedRows;
    } catch (error) {
      console.error('Cleanup error:', error.message);
      throw error;
    }
  }

  // Manual trigger for news aggregation (for testing)
  async triggerNewsAggregation() {
    console.log('🔄 Manual news aggregation triggered');
    try {
      const result = await newsAggregator.aggregateNews();
      console.log('✅ Manual news aggregation completed');
      return result;
    } catch (error) {
      console.error('❌ Manual news aggregation failed:', error.message);
      throw error;
    }
  }

  // Get cron job status
  getStatus() {
    return {
      jobsCount: this.jobs.length,
      jobs: this.jobs.map((job, index) => ({
        id: index,
        running: job.running,
        scheduled: job.scheduled
      }))
    };
  }
}

module.exports = new CronService();
