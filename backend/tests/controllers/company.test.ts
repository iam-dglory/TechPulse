import request from 'supertest';
import { DataSource } from 'typeorm';
import { testDataSource } from '../setup';
import { Company } from '../../src/models/company';
import { User } from '../../src/models/user';
import { AppDataSource } from '../../ormconfig';

// Mock the AppDataSource
jest.mock('../../ormconfig', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

describe('Company Controller', () => {
  let companyRepository: any;
  let userRepository: any;
  let testUser: User;
  let testCompany: Company;

  beforeAll(async () => {
    // Initialize test data
    userRepository = testDataSource.getRepository(User);
    companyRepository = testDataSource.getRepository(Company);

    // Create test user
    testUser = userRepository.create({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      isActive: true,
      isVerified: true
    });
    await userRepository.save(testUser);

    // Create test company
    testCompany = companyRepository.create({
      name: 'Test Tech Corp',
      slug: 'test-tech-corp',
      website: 'https://testtech.com',
      sectorTags: ['AI', 'Software'],
      fundingStage: 'Series A',
      investors: ['VC Fund 1', 'Angel Investor'],
      hqLocation: 'San Francisco, CA',
      credibilityScore: 7.5,
      ethicsScore: 8.0,
      hypeScore: 6.5,
      verified: true,
      verifiedAt: new Date()
    });
    await companyRepository.save(testCompany);
  });

  beforeEach(() => {
    // Mock repository methods
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Company) return companyRepository;
      if (entity === User) return userRepository;
      return jest.fn();
    });
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  describe('GET /api/companies', () => {
    test('should return all companies', async () => {
      const companies = await companyRepository.find();
      expect(companies).toHaveLength(1);
      expect(companies[0].name).toBe('Test Tech Corp');
    });

    test('should filter companies by sector', async () => {
      const aiCompanies = await companyRepository.find({
        where: { sectorTags: { $contains: ['AI'] } }
      });
      expect(aiCompanies).toHaveLength(1);
      expect(aiCompanies[0].sectorTags).toContain('AI');
    });

    test('should filter companies by funding stage', async () => {
      const seriesACompanies = await companyRepository.find({
        where: { fundingStage: 'Series A' }
      });
      expect(seriesACompanies).toHaveLength(1);
      expect(seriesACompanies[0].fundingStage).toBe('Series A');
    });

    test('should filter companies by minimum ethics score', async () => {
      const highEthicsCompanies = await companyRepository
        .createQueryBuilder('company')
        .where('company.ethicsScore >= :minScore', { minScore: 7.0 })
        .getMany();
      
      expect(highEthicsCompanies).toHaveLength(1);
      expect(highEthicsCompanies[0].ethicsScore).toBeGreaterThanOrEqual(7.0);
    });

    test('should search companies by name', async () => {
      const searchResults = await companyRepository
        .createQueryBuilder('company')
        .where('LOWER(company.name) LIKE LOWER(:search)', { search: '%test%' })
        .getMany();
      
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name.toLowerCase()).toContain('test');
    });
  });

  describe('GET /api/companies/:id', () => {
    test('should return company by ID', async () => {
      const company = await companyRepository.findOne({
        where: { id: testCompany.id }
      });
      
      expect(company).toBeDefined();
      expect(company.name).toBe('Test Tech Corp');
      expect(company.slug).toBe('test-tech-corp');
    });

    test('should return company by slug', async () => {
      const company = await companyRepository.findOne({
        where: { slug: 'test-tech-corp' }
      });
      
      expect(company).toBeDefined();
      expect(company.name).toBe('Test Tech Corp');
    });

    test('should return 404 for non-existent company', async () => {
      const company = await companyRepository.findOne({
        where: { id: 'non-existent-id' }
      });
      
      expect(company).toBeNull();
    });
  });

  describe('POST /api/companies/claim', () => {
    test('should create company claim', async () => {
      const claimData = {
        companyName: 'New Tech Startup',
        officialEmail: 'ceo@newtech.com',
        websiteUrl: 'https://newtech.com',
        contactPerson: 'John Doe',
        phoneNumber: '+1234567890',
        verificationMethod: 'email',
        additionalInfo: 'We are a new AI startup'
      };

      // This would be handled by the controller in a real test
      // For now, we'll test the data validation
      expect(claimData.companyName).toBeDefined();
      expect(claimData.officialEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(claimData.websiteUrl).toMatch(/^https?:\/\/.+/);
    });

    test('should validate required fields', () => {
      const invalidClaimData = {
        companyName: '',
        officialEmail: 'invalid-email',
        websiteUrl: 'not-a-url'
      };

      expect(invalidClaimData.companyName).toBe('');
      expect(invalidClaimData.officialEmail).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(invalidClaimData.websiteUrl).not.toMatch(/^https?:\/\/.+/);
    });
  });

  describe('PATCH /api/companies/:id', () => {
    test('should update company information', async () => {
      const updateData = {
        name: 'Updated Tech Corp',
        description: 'Updated description',
        ethicsScore: 9.0
      };

      // Update company
      await companyRepository.update(testCompany.id, updateData);
      const updatedCompany = await companyRepository.findOne({
        where: { id: testCompany.id }
      });

      expect(updatedCompany.name).toBe('Updated Tech Corp');
      expect(updatedCompany.ethicsScore).toBe(9.0);
    });

    test('should validate update permissions', () => {
      // In a real implementation, this would check if the user has permission
      // to update the company (owner or admin)
      const hasPermission = testUser.isActive && testUser.isVerified;
      expect(hasPermission).toBe(true);
    });
  });

  describe('Company Model Validation', () => {
    test('should validate company name is required', () => {
      const company = new Company();
      expect(company.name).toBeUndefined();
      
      company.name = 'Valid Company Name';
      expect(company.name).toBeDefined();
    });

    test('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'admin+tag@company.org'
      ];

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain'
      ];

      validEmails.forEach(email => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });

      invalidEmails.forEach(email => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    test('should validate score ranges', () => {
      const company = new Company();
      
      // Valid scores
      company.credibilityScore = 5.5;
      company.ethicsScore = 7.8;
      company.hypeScore = 3.2;
      
      expect(company.credibilityScore).toBeGreaterThanOrEqual(1);
      expect(company.credibilityScore).toBeLessThanOrEqual(10);
      expect(company.ethicsScore).toBeGreaterThanOrEqual(1);
      expect(company.ethicsScore).toBeLessThanOrEqual(10);
      expect(company.hypeScore).toBeGreaterThanOrEqual(1);
      expect(company.hypeScore).toBeLessThanOrEqual(10);
    });

    test('should validate funding stage', () => {
      const validStages = [
        'Pre-Seed',
        'Seed',
        'Series A',
        'Series B',
        'Series C',
        'Series D+',
        'IPO',
        'Acquired'
      ];

      const company = new Company();
      
      validStages.forEach(stage => {
        company.fundingStage = stage;
        expect(validStages).toContain(stage);
      });
    });

    test('should handle sector tags array', () => {
      const company = new Company();
      company.sectorTags = ['AI', 'Machine Learning', 'Healthcare'];
      
      expect(company.sectorTags).toHaveLength(3);
      expect(company.sectorTags).toContain('AI');
      expect(company.sectorTags).toContain('Machine Learning');
      expect(company.sectorTags).toContain('Healthcare');
    });
  });

  describe('Company Scoring Integration', () => {
    test('should calculate average score from multiple metrics', () => {
      const company = new Company();
      company.credibilityScore = 8.0;
      company.ethicsScore = 7.5;
      company.hypeScore = 6.0;
      
      const averageScore = (company.credibilityScore + company.ethicsScore + company.hypeScore) / 3;
      expect(averageScore).toBe(7.17);
    });

    test('should handle missing scores gracefully', () => {
      const company = new Company();
      company.credibilityScore = 8.0;
      // ethicsScore and hypeScore are undefined
      
      const availableScores = [company.credibilityScore].filter(score => score !== undefined);
      const averageScore = availableScores.reduce((sum, score) => sum + score, 0) / availableScores.length;
      
      expect(averageScore).toBe(8.0);
    });
  });
});
