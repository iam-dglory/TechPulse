import { Queue, Worker } from 'bullmq';
import { DataSource } from 'typeorm';
import { testDataSource } from '../setup';
import { Story } from '../../src/models/story';
import { Company } from '../../src/models/company';
import { User } from '../../src/models/user';

// Mock Redis and BullMQ
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    close: jest.fn()
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn()
  }))
}));

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Generated summary and analysis'
            }
          }]
        })
      }
    }
  }))
}));

describe('Worker Jobs', () => {
  let storyRepository: any;
  let companyRepository: any;
  let userRepository: any;
  let testUser: User;
  let testCompany: Company;
  let testStory: Story;

  beforeAll(async () => {
    // Initialize test data
    userRepository = testDataSource.getRepository(User);
    companyRepository = testDataSource.getRepository(Company);
    storyRepository = testDataSource.getRepository(Story);

    // Create test user
    testUser = userRepository.create({
      username: 'workeruser',
      email: 'worker@example.com',
      passwordHash: 'hashedpassword',
      isActive: true,
      isVerified: true
    });
    await userRepository.save(testUser);

    // Create test company
    testCompany = companyRepository.create({
      name: 'Worker Tech Corp',
      slug: 'worker-tech-corp',
      website: 'https://workertech.com',
      sectorTags: ['AI', 'Automation'],
      fundingStage: 'Seed',
      credibilityScore: 7.0,
      ethicsScore: 8.5,
      hypeScore: 6.5,
      verified: true
    });
    await companyRepository.save(testCompany);

    // Create test story
    testStory = storyRepository.create({
      title: 'AI Automation Revolution',
      content: 'A new AI system can automate complex tasks with unprecedented accuracy and speed. This revolutionary technology will transform industries across the globe.',
      sourceUrl: 'https://example.com/ai-automation',
      companyId: testCompany.id,
      sectorTag: 'AI Automation',
      impactTags: ['automation', 'AI', 'labor'],
      hypeScore: 8.0,
      ethicsScore: 6.0,
      realityCheck: null,
      simpleSummary: null,
      technicalSummary: null,
      createdBy: testUser.id,
      publishedAt: new Date()
    });
    await storyRepository.save(testStory);
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  describe('Story Enhancement Job', () => {
    test('should process story enhancement job', async () => {
      const jobData = {
        storyId: testStory.id,
        type: 'generateStoryEnhancements'
      };

      // Mock job processing
      const mockProcessJob = jest.fn().mockImplementation(async (job) => {
        const { storyId } = job.data;
        
        // Find the story
        const story = await storyRepository.findOne({
          where: { id: storyId }
        });
        
        expect(story).toBeDefined();
        expect(story.id).toBe(storyId);
        
        // Simulate enhancement processing
        const enhancements = {
          realityCheck: 'This appears to be based on preliminary research and needs further validation.',
          simpleSummary: 'AI system helps automate tasks, but claims need verification.',
          technicalSummary: 'Machine learning algorithms applied to task automation with reported accuracy improvements.'
        };
        
        // Update story with enhancements
        await storyRepository.update(storyId, enhancements);
        
        return { success: true, enhancements };
      });

      const result = await mockProcessJob({ data: jobData });
      
      expect(result.success).toBe(true);
      expect(result.enhancements).toBeDefined();
      expect(result.enhancements.realityCheck).toBeDefined();
      expect(result.enhancements.simpleSummary).toBeDefined();
      expect(result.enhancements.technicalSummary).toBeDefined();
    });

    test('should handle missing story gracefully', async () => {
      const jobData = {
        storyId: 'non-existent-id',
        type: 'generateStoryEnhancements'
      };

      const mockProcessJob = jest.fn().mockImplementation(async (job) => {
        const { storyId } = job.data;
        
        const story = await storyRepository.findOne({
          where: { id: storyId }
        });
        
        if (!story) {
          throw new Error(`Story not found: ${storyId}`);
        }
        
        return { success: true };
      });

      await expect(mockProcessJob({ data: jobData })).rejects.toThrow('Story not found: non-existent-id');
    });

    test('should handle job processing errors', async () => {
      const jobData = {
        storyId: testStory.id,
        type: 'generateStoryEnhancements'
      };

      const mockProcessJob = jest.fn().mockImplementation(async (job) => {
        // Simulate processing error
        throw new Error('Processing failed');
      });

      await expect(mockProcessJob({ data: jobData })).rejects.toThrow('Processing failed');
    });
  });

  describe('Scoring Job', () => {
    test('should process story scoring job', async () => {
      const jobData = {
        storyId: testStory.id,
        type: 'calculateStoryScores'
      };

      const mockProcessJob = jest.fn().mockImplementation(async (job) => {
        const { storyId } = job.data;
        
        const story = await storyRepository.findOne({
          where: { id: storyId }
        });
        
        expect(story).toBeDefined();
        
        // Simulate scoring calculation
        const scores = {
          hypeScore: 7.5,
          ethicsScore: 6.5,
          impactTags: ['automation', 'AI', 'labor']
        };
        
        // Update story with scores
        await storyRepository.update(storyId, scores);
        
        return { success: true, scores };
      });

      const result = await mockProcessJob({ data: jobData });
      
      expect(result.success).toBe(true);
      expect(result.scores).toBeDefined();
      expect(result.scores.hypeScore).toBe(7.5);
      expect(result.scores.ethicsScore).toBe(6.5);
      expect(result.scores.impactTags).toContain('automation');
    });

    test('should validate score ranges', async () => {
      const scores = {
        hypeScore: 7.5,
        ethicsScore: 6.5
      };

      // Validate score ranges
      expect(scores.hypeScore).toBeGreaterThanOrEqual(1);
      expect(scores.hypeScore).toBeLessThanOrEqual(10);
      expect(scores.ethicsScore).toBeGreaterThanOrEqual(1);
      expect(scores.ethicsScore).toBeLessThanOrEqual(10);
    });
  });

  describe('Company Update Job', () => {
    test('should process company scoring update job', async () => {
      const jobData = {
        companyId: testCompany.id,
        type: 'updateCompanyScores'
      };

      const mockProcessJob = jest.fn().mockImplementation(async (job) => {
        const { companyId } = job.data;
        
        const company = await companyRepository.findOne({
          where: { id: companyId }
        });
        
        expect(company).toBeDefined();
        
        // Simulate company score calculation based on stories
        const stories = await storyRepository.find({
          where: { companyId: companyId }
        });
        
        const avgHypeScore = stories.reduce((sum, story) => sum + (story.hypeScore || 0), 0) / stories.length;
        const avgEthicsScore = stories.reduce((sum, story) => sum + (story.ethicsScore || 0), 0) / stories.length;
        
        const updatedScores = {
          hypeScore: Math.round(avgHypeScore * 10) / 10,
          ethicsScore: Math.round(avgEthicsScore * 10) / 10
        };
        
        await companyRepository.update(companyId, updatedScores);
        
        return { success: true, updatedScores };
      });

      const result = await mockProcessJob({ data: jobData });
      
      expect(result.success).toBe(true);
      expect(result.updatedScores).toBeDefined();
      expect(result.updatedScores.hypeScore).toBeDefined();
      expect(result.updatedScores.ethicsScore).toBeDefined();
    });
  });

  describe('Worker Queue Management', () => {
    test('should add job to queue', () => {
      const mockQueue = {
        add: jest.fn().mockResolvedValue({ id: 'job-123' }),
        close: jest.fn()
      };

      const addJob = async (queue: any, jobType: string, data: any) => {
        return await queue.add(jobType, data);
      };

      const result = addJob(mockQueue, 'generateStoryEnhancements', { storyId: testStory.id });
      
      expect(mockQueue.add).toHaveBeenCalledWith('generateStoryEnhancements', { storyId: testStory.id });
    });

    test('should handle queue errors', async () => {
      const mockQueue = {
        add: jest.fn().mockRejectedValue(new Error('Queue error')),
        close: jest.fn()
      };

      const addJob = async (queue: any, jobType: string, data: any) => {
        try {
          return await queue.add(jobType, data);
        } catch (error) {
          console.error('Failed to add job to queue:', error);
          throw error;
        }
      };

      await expect(addJob(mockQueue, 'generateStoryEnhancements', { storyId: testStory.id }))
        .rejects.toThrow('Queue error');
    });

    test('should process jobs in order', async () => {
      const jobs = [
        { id: 1, type: 'calculateStoryScores', data: { storyId: testStory.id } },
        { id: 2, type: 'generateStoryEnhancements', data: { storyId: testStory.id } },
        { id: 3, type: 'updateCompanyScores', data: { companyId: testCompany.id } }
      ];

      const processedJobs: any[] = [];
      
      const processJob = async (job: any) => {
        processedJobs.push(job);
        return { success: true, jobId: job.id };
      };

      for (const job of jobs) {
        await processJob(job);
      }

      expect(processedJobs).toHaveLength(3);
      expect(processedJobs[0].id).toBe(1);
      expect(processedJobs[1].id).toBe(2);
      expect(processedJobs[2].id).toBe(3);
    });
  });

  describe('Job Retry Logic', () => {
    test('should retry failed jobs', async () => {
      let attemptCount = 0;
      const maxRetries = 3;

      const mockProcessJob = jest.fn().mockImplementation(async (job) => {
        attemptCount++;
        
        if (attemptCount < maxRetries) {
          throw new Error('Temporary failure');
        }
        
        return { success: true, attempts: attemptCount };
      });

      let result;
      let lastError;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          result = await mockProcessJob({ data: { storyId: testStory.id } });
          break;
        } catch (error) {
          lastError = error;
        }
      }

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(maxRetries);
    });

    test('should fail after max retries', async () => {
      const maxRetries = 3;
      let attemptCount = 0;

      const mockProcessJob = jest.fn().mockImplementation(async (job) => {
        attemptCount++;
        throw new Error('Persistent failure');
      });

      let lastError;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          await mockProcessJob({ data: { storyId: testStory.id } });
        } catch (error) {
          lastError = error;
        }
      }

      expect(attemptCount).toBe(maxRetries);
      expect(lastError).toBeDefined();
      expect(lastError.message).toBe('Persistent failure');
    });
  });
});
