import cron from 'node-cron';
import { editorialReminderService } from './editorialReminderService';

class CronService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Initialize all scheduled jobs
   */
  initializeJobs(): void {
    console.log('🕐 Initializing scheduled jobs...');

    // Editorial reminder job - runs every Monday at 9 AM
    this.scheduleEditorialReminders();
    
    // Weekly graveyard review job - runs every Friday at 2 PM
    this.scheduleGraveyardReview();

    // Monthly cleanup job - runs on the 1st of every month at 6 AM
    this.scheduleMonthlyCleanup();

    console.log('✅ All scheduled jobs initialized');
  }

  /**
   * Schedule editorial reminder job
   */
  private scheduleEditorialReminders(): void {
    const job = cron.schedule('0 9 * * 1', async () => {
      console.log('📝 Running editorial reminder job...');
      try {
        await editorialReminderService.sendEditorialReminders();
        console.log('✅ Editorial reminder job completed successfully');
      } catch (error) {
        console.error('❌ Editorial reminder job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set('editorial-reminders', job);
    console.log('📅 Editorial reminders scheduled for Mondays at 9 AM UTC');
  }

  /**
   * Schedule graveyard review job
   */
  private scheduleGraveyardReview(): void {
    const job = cron.schedule('0 14 * * 5', async () => {
      console.log('⚰️ Running graveyard review job...');
      try {
        const storiesForGraveyard = await editorialReminderService.findStoriesForGraveyard();
        
        if (storiesForGraveyard.length > 0) {
          console.log(`📋 Found ${storiesForGraveyard.length} stories that might need graveyard entries:`);
          storiesForGraveyard.forEach(story => {
            console.log(`  - ${story.storyTitle} (${story.companyName || 'No Company'}) - Hype: ${story.hypeScore}/10 - ${story.daysSincePublication} days old`);
          });
          
          // TODO: Send notification to admin about stories that might need graveyard entries
          console.log('📧 Admin notification would be sent here');
        } else {
          console.log('✅ No stories found that need graveyard review');
        }
      } catch (error) {
        console.error('❌ Graveyard review job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set('graveyard-review', job);
    console.log('📅 Graveyard review scheduled for Fridays at 2 PM UTC');
  }

  /**
   * Schedule monthly cleanup job
   */
  private scheduleMonthlyCleanup(): void {
    const job = cron.schedule('0 6 1 * *', async () => {
      console.log('🧹 Running monthly cleanup job...');
      try {
        // TODO: Implement cleanup tasks
        // - Archive old logs
        // - Clean up temporary files
        // - Update statistics
        // - Database maintenance
        
        console.log('✅ Monthly cleanup completed successfully');
      } catch (error) {
        console.error('❌ Monthly cleanup job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set('monthly-cleanup', job);
    console.log('📅 Monthly cleanup scheduled for 1st of every month at 6 AM UTC');
  }

  /**
   * Get status of all scheduled jobs
   */
  getJobStatus(): Record<string, { scheduled: boolean; running: boolean }> {
    const status: Record<string, { scheduled: boolean; running: boolean }> = {};
    
    this.jobs.forEach((job, name) => {
      status[name] = {
        scheduled: job.getStatus() === 'scheduled',
        running: job.getStatus() === 'scheduled'
      };
    });

    return status;
  }

  /**
   * Start a specific job
   */
  startJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (job) {
      job.start();
      console.log(`▶️ Started job: ${jobName}`);
      return true;
    }
    console.log(`❌ Job not found: ${jobName}`);
    return false;
  }

  /**
   * Stop a specific job
   */
  stopJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      console.log(`⏹️ Stopped job: ${jobName}`);
      return true;
    }
    console.log(`❌ Job not found: ${jobName}`);
    return false;
  }

  /**
   * Run a job immediately (for testing)
   */
  async runJobNow(jobName: string): Promise<boolean> {
    switch (jobName) {
      case 'editorial-reminders':
        console.log('🔄 Running editorial reminders job now...');
        try {
          await editorialReminderService.sendEditorialReminders();
          console.log('✅ Editorial reminders job completed');
          return true;
        } catch (error) {
          console.error('❌ Editorial reminders job failed:', error);
          return false;
        }
      
      case 'graveyard-review':
        console.log('🔄 Running graveyard review job now...');
        try {
          const storiesForGraveyard = await editorialReminderService.findStoriesForGraveyard();
          console.log(`📋 Found ${storiesForGraveyard.length} stories for graveyard review`);
          return true;
        } catch (error) {
          console.error('❌ Graveyard review job failed:', error);
          return false;
        }
      
      default:
        console.log(`❌ Unknown job: ${jobName}`);
        return false;
    }
  }

  /**
   * Stop all jobs
   */
  stopAllJobs(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    });
  }

  /**
   * Restart all jobs
   */
  restartAllJobs(): void {
    this.stopAllJobs();
    this.initializeJobs();
  }
}

export const cronService = new CronService();
export default cronService;
