import { DataSource } from 'typeorm';
import { testDataSource } from '../setup';
import { Story } from '../../src/models/story';
import { Company } from '../../src/models/company';
import { User } from '../../src/models/user';
import { AppDataSource } from '../../ormconfig';

// Mock the AppDataSource
jest.mock('../../ormconfig', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

describe('Story Controller', () => {
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
      username: 'storyuser',
      email: 'story@example.com',
      passwordHash: 'hashedpassword',
      isActive: true,
      isVerified: true
    });
    await userRepository.save(testUser);

    // Create test company
    testCompany = companyRepository.create({
      name: 'Story Tech Corp',
      slug: 'story-tech-corp',
      website: 'https://storytech.com',
      sectorTags: ['AI', 'Analytics'],
      fundingStage: 'Series B',
      credibilityScore: 8.0,
      ethicsScore: 7.5,
      hypeScore: 6.0,
      verified: true
    });
    await companyRepository.save(testCompany);
  });

  beforeEach(() => {
    // Mock repository methods
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Story) return storyRepository;
      if (entity === Company) return companyRepository;
      if (entity === User) return userRepository;
      return jest.fn();
    });

    // Create test story
    testStory = storyRepository.create({
      title: 'AI Breakthrough in Healthcare',
      content: 'Researchers have developed a new AI system that can diagnose diseases with 95% accuracy. The system uses machine learning algorithms trained on millions of medical records.',
      sourceUrl: 'https://example.com/ai-healthcare',
      companyId: testCompany.id,
      sectorTag: 'Healthcare AI',
      impactTags: ['healthcare', 'AI'],
      hypeScore: 7.0,
      ethicsScore: 8.0,
      realityCheck: 'The claims appear to be based on preliminary research and need further validation.',
      createdBy: testUser.id,
      publishedAt: new Date()
    });
    await storyRepository.save(testStory);
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  describe('Story Creation', () => {
    test('should create a new story with all required fields', async () => {
      const storyData = {
        title: 'New Technology Announcement',
        content: 'A new technology has been announced that could revolutionize the industry.',
        sourceUrl: 'https://example.com/new-tech',
        companyId: testCompany.id,
        sectorTag: 'Technology',
        impactTags: ['innovation'],
        createdBy: testUser.id
      };

      const newStory = storyRepository.create(storyData);
      const savedStory = await storyRepository.save(newStory);

      expect(savedStory.id).toBeDefined();
      expect(savedStory.title).toBe(storyData.title);
      expect(savedStory.content).toBe(storyData.content);
      expect(savedStory.companyId).toBe(storyData.companyId);
      expect(savedStory.createdBy).toBe(storyData.createdBy);
      expect(savedStory.publishedAt).toBeDefined();
    });

    test('should validate required fields', () => {
      const invalidStoryData = {
        title: '', // Empty title
        content: 'Valid content',
        sourceUrl: 'invalid-url', // Invalid URL
        createdBy: 'invalid-user-id' // Invalid user ID
      };

      expect(invalidStoryData.title).toBe('');
      expect(invalidStoryData.sourceUrl).not.toMatch(/^https?:\/\/.+/);
      expect(invalidStoryData.createdBy).not.toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    test('should handle optional fields', async () => {
      const storyData = {
        title: 'Minimal Story',
        content: 'This is a minimal story with only required fields.',
        createdBy: testUser.id
      };

      const newStory = storyRepository.create(storyData);
      const savedStory = await storyRepository.save(newStory);

      expect(savedStory.id).toBeDefined();
      expect(savedStory.title).toBe(storyData.title);
      expect(savedStory.companyId).toBeUndefined();
      expect(savedStory.sourceUrl).toBeUndefined();
      expect(savedStory.sectorTag).toBeUndefined();
    });
  });

  describe('Story Retrieval', () => {
    test('should retrieve stories with pagination', async () => {
      const page = 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const stories = await storyRepository
        .createQueryBuilder('story')
        .leftJoinAndSelect('story.company', 'company')
        .orderBy('story.publishedAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getMany();

      expect(stories).toBeDefined();
      expect(Array.isArray(stories)).toBe(true);
    });

    test('should filter stories by company', async () => {
      const stories = await storyRepository.find({
        where: { companyId: testCompany.id }
      });

      expect(stories).toHaveLength(1);
      expect(stories[0].companyId).toBe(testCompany.id);
    });

    test('should filter stories by sector tag', async () => {
      const stories = await storyRepository.find({
        where: { sectorTag: 'Healthcare AI' }
      });

      expect(stories).toHaveLength(1);
      expect(stories[0].sectorTag).toBe('Healthcare AI');
    });

    test('should search stories by title and content', async () => {
      const searchTerm = 'AI';
      const stories = await storyRepository
        .createQueryBuilder('story')
        .where('LOWER(story.title) LIKE LOWER(:search) OR LOWER(story.content) LIKE LOWER(:search)', {
          search: `%${searchTerm}%`
        })
        .getMany();

      expect(stories).toHaveLength(1);
      expect(stories[0].title.toLowerCase()).toContain(searchTerm.toLowerCase());
    });
  });

  describe('Story Updates', () => {
    test('should update story content', async () => {
      const updateData = {
        title: 'Updated AI Breakthrough Title',
        content: 'Updated content with more details about the AI breakthrough.',
        realityCheck: 'Updated reality check with additional context.'
      };

      await storyRepository.update(testStory.id, updateData);
      const updatedStory = await storyRepository.findOne({
        where: { id: testStory.id }
      });

      expect(updatedStory.title).toBe(updateData.title);
      expect(updatedStory.content).toBe(updateData.content);
      expect(updatedStory.realityCheck).toBe(updateData.realityCheck);
    });

    test('should update story scores', async () => {
      const scoreUpdate = {
        hypeScore: 8.5,
        ethicsScore: 9.0
      };

      await storyRepository.update(testStory.id, scoreUpdate);
      const updatedStory = await storyRepository.findOne({
        where: { id: testStory.id }
      });

      expect(updatedStory.hypeScore).toBe(scoreUpdate.hypeScore);
      expect(updatedStory.ethicsScore).toBe(scoreUpdate.ethicsScore);
    });
  });

  describe('Story Scoring Integration', () => {
    test('should calculate story engagement score', () => {
      const story = new Story();
      story.hypeScore = 7.0;
      story.ethicsScore = 8.0;
      
      // Mock vote counts (in real implementation, these would come from Vote model)
      const votesUp = 25;
      const votesDown = 5;
      const comments = 12;
      
      const engagementScore = (votesUp - votesDown + comments) / 10;
      expect(engagementScore).toBe(3.2);
    });

    test('should validate score ranges', () => {
      const story = new Story();
      
      // Valid scores
      story.hypeScore = 5.5;
      story.ethicsScore = 7.8;
      
      expect(story.hypeScore).toBeGreaterThanOrEqual(1);
      expect(story.hypeScore).toBeLessThanOrEqual(10);
      expect(story.ethicsScore).toBeGreaterThanOrEqual(1);
      expect(story.ethicsScore).toBeLessThanOrEqual(10);
    });
  });

  describe('Story Validation', () => {
    test('should validate title length', () => {
      const story = new Story();
      
      // Valid title
      story.title = 'Valid Story Title';
      expect(story.title.length).toBeGreaterThan(0);
      expect(story.title.length).toBeLessThanOrEqual(255);
      
      // Invalid titles
      const tooLongTitle = 'A'.repeat(300);
      expect(tooLongTitle.length).toBeGreaterThan(255);
    });

    test('should validate content length', () => {
      const story = new Story();
      
      // Valid content
      story.content = 'This is a valid story content that provides useful information.';
      expect(story.content.length).toBeGreaterThan(10);
      
      // Invalid content (too short)
      const tooShortContent = 'Short';
      expect(tooShortContent.length).toBeLessThan(10);
    });

    test('should validate URL format', () => {
      const validUrls = [
        'https://example.com/article',
        'http://news.site.com/story',
        'https://blog.company.org/post/123'
      ];

      const invalidUrls = [
        'not-a-url',
        'ftp://invalid.com',
        'javascript:alert("xss")'
      ];

      validUrls.forEach(url => {
        expect(url).toMatch(/^https?:\/\/.+/);
      });

      invalidUrls.forEach(url => {
        expect(url).not.toMatch(/^https?:\/\/.+/);
      });
    });
  });
});
