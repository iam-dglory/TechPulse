import { DataSource } from 'typeorm';
import { testDataSource } from './setup';
import { User } from '../src/models/user';
import { Company } from '../src/models/company';
import { Story } from '../src/models/story';

export async function seedTestData() {
  const userRepository = testDataSource.getRepository(User);
  const companyRepository = testDataSource.getRepository(Company);
  const storyRepository = testDataSource.getRepository(Story);

  // Create test users
  const testUsers = [
    {
      username: 'testuser1',
      email: 'user1@example.com',
      passwordHash: 'hashedpassword1',
      isActive: true,
      isVerified: true
    },
    {
      username: 'testuser2',
      email: 'user2@example.com',
      passwordHash: 'hashedpassword2',
      isActive: true,
      isVerified: true
    },
    {
      username: 'adminuser',
      email: 'admin@example.com',
      passwordHash: 'hashedpassword3',
      isActive: true,
      isVerified: true,
      isAdmin: true
    }
  ];

  const users = [];
  for (const userData of testUsers) {
    const user = userRepository.create(userData);
    users.push(await userRepository.save(user));
  }

  // Create test companies
  const testCompanies = [
    {
      name: 'AI Innovations Inc',
      slug: 'ai-innovations-inc',
      website: 'https://aiinnovations.com',
      sectorTags: ['AI', 'Machine Learning', 'Healthcare'],
      fundingStage: 'Series A',
      investors: ['Tech Ventures', 'Health Fund'],
      hqLocation: 'San Francisco, CA',
      credibilityScore: 8.5,
      ethicsScore: 7.8,
      hypeScore: 6.2,
      verified: true,
      verifiedAt: new Date()
    },
    {
      name: 'Blockchain Solutions Ltd',
      slug: 'blockchain-solutions-ltd',
      website: 'https://blockchainsolutions.com',
      sectorTags: ['Blockchain', 'Finance', 'Security'],
      fundingStage: 'Series B',
      investors: ['Crypto Fund', 'Fintech Ventures'],
      hqLocation: 'New York, NY',
      credibilityScore: 7.2,
      ethicsScore: 8.1,
      hypeScore: 5.8,
      verified: true,
      verifiedAt: new Date()
    },
    {
      name: 'GreenTech Startup',
      slug: 'greentech-startup',
      website: 'https://greentech.com',
      sectorTags: ['Clean Energy', 'Sustainability', 'Environment'],
      fundingStage: 'Seed',
      investors: ['Green Fund', 'Climate Ventures'],
      hqLocation: 'Austin, TX',
      credibilityScore: 6.8,
      ethicsScore: 9.2,
      hypeScore: 4.5,
      verified: false
    }
  ];

  const companies = [];
  for (const companyData of testCompanies) {
    const company = companyRepository.create(companyData);
    companies.push(await companyRepository.save(company));
  }

  // Create test stories
  const testStories = [
    {
      title: 'Revolutionary AI System Diagnoses Diseases with 99% Accuracy!',
      content: 'A groundbreaking AI system developed by AI Innovations Inc can now diagnose diseases with unprecedented accuracy. This revolutionary technology uses deep learning algorithms trained on millions of medical records and represents a paradigm shift in healthcare diagnostics. The system is absolutely incredible and will transform medicine forever!',
      sourceUrl: 'https://example.com/ai-diagnostics',
      companyId: companies[0].id,
      sectorTag: 'Healthcare AI',
      impactTags: ['healthcare', 'AI', 'medical'],
      hypeScore: 8.5,
      ethicsScore: 7.2,
      realityCheck: 'While promising, the 99% accuracy claim needs validation through peer-reviewed studies and clinical trials.',
      simpleSummary: 'AI helps doctors diagnose diseases, but needs more testing.',
      technicalSummary: 'Deep learning model trained on medical datasets shows improved diagnostic accuracy in controlled studies.',
      createdBy: users[0].id,
      publishedAt: new Date()
    },
    {
      title: 'Blockchain Technology Improves Supply Chain Transparency',
      content: 'Blockchain Solutions Ltd has implemented a new blockchain-based supply chain tracking system that provides complete transparency and traceability. The system ensures data integrity and prevents fraud while maintaining user privacy through advanced encryption.',
      sourceUrl: 'https://example.com/blockchain-supply-chain',
      companyId: companies[1].id,
      sectorTag: 'Blockchain',
      impactTags: ['supply-chain', 'transparency', 'security'],
      hypeScore: 5.8,
      ethicsScore: 8.5,
      realityCheck: 'The technology shows promise for supply chain transparency, but adoption challenges remain.',
      simpleSummary: 'Blockchain helps track products from source to store.',
      technicalSummary: 'Distributed ledger technology applied to supply chain management with cryptographic verification.',
      createdBy: users[1].id,
      publishedAt: new Date()
    },
    {
      title: 'Solar Panel Efficiency Breakthrough Announced',
      content: 'GreenTech Startup has developed new solar panel technology that increases efficiency by 25%. The innovation uses advanced materials and manufacturing techniques to capture more sunlight and convert it to electricity more effectively.',
      sourceUrl: 'https://example.com/solar-efficiency',
      companyId: companies[2].id,
      sectorTag: 'Clean Energy',
      impactTags: ['renewable-energy', 'environment', 'innovation'],
      hypeScore: 6.2,
      ethicsScore: 9.1,
      realityCheck: 'The efficiency claims are based on laboratory tests and need real-world validation.',
      simpleSummary: 'New solar panels work better and help the environment.',
      technicalSummary: 'Advanced photovoltaic materials and cell architecture improve energy conversion efficiency.',
      createdBy: users[0].id,
      publishedAt: new Date()
    },
    {
      title: 'AI System Replaces 500 Customer Service Workers',
      content: 'A major corporation has deployed an AI system that replaces 500 human customer service representatives. The system uses natural language processing and machine learning to handle customer inquiries with 90% satisfaction rates. This automation will reduce costs and improve efficiency.',
      sourceUrl: 'https://example.com/ai-customer-service',
      companyId: companies[0].id,
      sectorTag: 'AI Automation',
      impactTags: ['automation', 'labor', 'customer-service'],
      hypeScore: 7.8,
      ethicsScore: 4.2,
      realityCheck: 'While automation can improve efficiency, the impact on workers and service quality needs careful consideration.',
      simpleSummary: 'AI handles customer questions, but many workers lost jobs.',
      technicalSummary: 'Natural language processing and machine learning applied to customer service automation.',
      createdBy: users[1].id,
      publishedAt: new Date()
    },
    {
      title: 'New Privacy-First Analytics Platform Launches',
      content: 'A new analytics platform has launched with a focus on privacy-first data collection. The platform implements end-to-end encryption, data minimization principles, and provides users with complete control over their data. All data processing is transparent and auditable.',
      sourceUrl: 'https://example.com/privacy-analytics',
      companyId: companies[1].id,
      sectorTag: 'Privacy Tech',
      impactTags: ['privacy', 'data-protection', 'analytics'],
      hypeScore: 4.5,
      ethicsScore: 9.5,
      realityCheck: 'The privacy-focused approach is commendable, but market adoption remains to be seen.',
      simpleSummary: 'New tool helps websites understand users while protecting privacy.',
      technicalSummary: 'Analytics platform with differential privacy and user-controlled data collection.',
      createdBy: users[0].id,
      publishedAt: new Date()
    }
  ];

  const stories = [];
  for (const storyData of testStories) {
    const story = storyRepository.create(storyData);
    stories.push(await storyRepository.save(story));
  }

  return {
    users,
    companies,
    stories
  };
}

export async function cleanupTestData() {
  const userRepository = testDataSource.getRepository(User);
  const companyRepository = testDataSource.getRepository(Company);
  const storyRepository = testDataSource.getRepository(Story);

  // Clean up in reverse order due to foreign key constraints
  await storyRepository.clear();
  await companyRepository.clear();
  await userRepository.clear();
}
