import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { AppDataSource } from '../../../ormconfig';
import { Story } from '../../models/story';
import { Company } from '../../models/company';
import { ScoringPipeline, StoryContent, CompanyData } from '../scoring';

export interface StoryEnhancementJobData {
  storyId: string;
  priority?: number;
  delay?: number;
}

export interface StoryEnhancementResult {
  success: boolean;
  storyId: string;
  enhancedScores?: {
    hypeScore: number;
    ethicsScore: number;
    realityCheck?: string;
    eli5Summary?: string;
  };
  error?: string;
  processingTime: number;
}

class QueueService {
  private redis: Redis;
  private storyEnhancementQueue: Queue<StoryEnhancementJobData>;
  private storyEnhancementWorker: Worker<StoryEnhancementJobData>;
  private scoringPipeline: ScoringPipeline;
  private queueEvents: QueueEvents;

  constructor() {
    // Initialize Redis connection
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    // Initialize scoring pipeline
    this.scoringPipeline = new ScoringPipeline();

    // Initialize queue
    this.storyEnhancementQueue = new Queue<StoryEnhancementJobData>('story-enhancement', {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    // Initialize queue events for monitoring
    this.queueEvents = new QueueEvents('story-enhancement', {
      connection: this.redis,
    });

    // Initialize worker
    this.storyEnhancementWorker = new Worker<StoryEnhancementJobData>(
      'story-enhancement',
      this.processStoryEnhancement.bind(this),
      {
        connection: this.redis,
        concurrency: 5,
        removeOnComplete: 100,
        removeOnFail: 50,
      }
    );

    this.setupEventListeners();
  }

  /**
   * Add story enhancement job to queue
   */
  async addStoryEnhancementJob(data: StoryEnhancementJobData): Promise<Job<StoryEnhancementJobData>> {
    const job = await this.storyEnhancementQueue.add(
      'generateStoryEnhancements',
      data,
      {
        priority: data.priority || 0,
        delay: data.delay || 0,
        jobId: `story-enhancement-${data.storyId}`,
      }
    );

    console.log(`📝 Story enhancement job queued: ${job.id} for story ${data.storyId}`);
    return job;
  }

  /**
   * Process story enhancement job
   */
  private async processStoryEnhancement(job: Job<StoryEnhancementJobData>): Promise<StoryEnhancementResult> {
    const { storyId } = job.data;
    const startTime = Date.now();

    console.log(`🔄 Processing story enhancement for story ${storyId}`);

    try {
      // Get story from database
      const storyRepository = AppDataSource.getRepository(Story);
      const companyRepository = AppDataSource.getRepository(Company);

      const story = await storyRepository.findOne({
        where: { id: storyId },
        relations: ['company']
      });

      if (!story) {
        throw new Error(`Story ${storyId} not found`);
      }

      // Prepare story content and company data
      const storyContent: StoryContent = {
        title: story.title,
        content: story.content,
        sourceUrl: story.sourceUrl,
        companyId: story.companyId
      };

      let companyData: CompanyData | undefined;
      if (story.company) {
        companyData = {
          id: story.company.id,
          name: story.company.name,
          ethicsStatementUrl: story.company.ethicsStatementUrl,
          privacyPolicyUrl: story.company.privacyPolicyUrl,
          sectorTags: story.company.sectorTags,
          credibilityScore: story.company.credibilityScore,
          ethicsScore: story.company.ethicsScore
        };
      }

      // Enhance scores using OpenAI if available
      const enhancedScores = await this.scoringPipeline.scoreStoryWithEnhancement(
        storyContent,
        companyData
      );

      // Update story with enhanced scores
      if (enhancedScores.enhanced) {
        story.hypeScore = enhancedScores.hypeScore;
        story.ethicsScore = enhancedScores.ethicsScore;
        
        if (enhancedScores.realityCheck) {
          story.realityCheck = enhancedScores.realityCheck;
        }

        // Store ELI5 summary in a separate field (you might need to add this to your Story model)
        // story.eli5Summary = enhancedScores.eli5Summary;

        await storyRepository.save(story);
        console.log(`✅ Story ${storyId} enhanced successfully`);
      } else {
        console.log(`⚠️ Story ${storyId} processed with local scores only`);
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        storyId,
        enhancedScores: {
          hypeScore: enhancedScores.hypeScore,
          ethicsScore: enhancedScores.ethicsScore,
          realityCheck: enhancedScores.realityCheck,
          eli5Summary: enhancedScores.eli5Summary
        },
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error(`❌ Story enhancement failed for ${storyId}:`, errorMessage);

      return {
        success: false,
        storyId,
        error: errorMessage,
        processingTime
      };
    }
  }

  /**
   * Setup event listeners for monitoring
   */
  private setupEventListeners(): void {
    // Worker events
    this.storyEnhancementWorker.on('completed', (job, result) => {
      console.log(`✅ Job ${job.id} completed for story ${job.data.storyId}`);
    });

    this.storyEnhancementWorker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed for story ${job?.data.storyId}:`, err.message);
    });

    this.storyEnhancementWorker.on('error', (err) => {
      console.error('🚨 Worker error:', err);
    });

    // Queue events
    this.queueEvents.on('waiting', ({ jobId }) => {
      console.log(`⏳ Job ${jobId} waiting to be processed`);
    });

    this.queueEvents.on('active', ({ jobId }) => {
      console.log(`🔄 Job ${jobId} started processing`);
    });

    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      console.log(`✅ Job ${jobId} completed with result:`, returnvalue);
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      console.error(`❌ Job ${jobId} failed:`, failedReason);
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const waiting = await this.storyEnhancementQueue.getWaiting();
    const active = await this.storyEnhancementQueue.getActive();
    const completed = await this.storyEnhancementQueue.getCompleted();
    const failed = await this.storyEnhancementQueue.getFailed();
    const delayed = await this.storyEnhancementQueue.getDelayed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: this.storyEnhancementQueue.isPaused() ? 1 : 0
    };
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<Job<StoryEnhancementJobData> | undefined> {
    return await this.storyEnhancementQueue.getJob(jobId);
  }

  /**
   * Pause queue
   */
  async pauseQueue(): Promise<void> {
    await this.storyEnhancementQueue.pause();
    console.log('⏸️ Queue paused');
  }

  /**
   * Resume queue
   */
  async resumeQueue(): Promise<void> {
    await this.storyEnhancementQueue.resume();
    console.log('▶️ Queue resumed');
  }

  /**
   * Clean queue (remove old jobs)
   */
  async cleanQueue(): Promise<void> {
    await this.storyEnhancementQueue.clean(1000 * 60 * 60, 100, 'completed'); // Remove completed jobs older than 1 hour
    await this.storyEnhancementQueue.clean(1000 * 60 * 60 * 24, 50, 'failed'); // Remove failed jobs older than 24 hours
    console.log('🧹 Queue cleaned');
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    await this.storyEnhancementWorker.close();
    await this.storyEnhancementQueue.close();
    await this.queueEvents.close();
    await this.redis.quit();
    console.log('🔌 Queue service closed');
  }

  /**
   * Test Redis connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.redis.ping();
      console.log('✅ Redis connection successful');
      return true;
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const queueService = new QueueService();
export default queueService;


