import { AppDataSource } from '../../ormconfig';
import { Company, Product, Story } from '../models';

export async function seedSampleData(): Promise<void> {
  try {
    await AppDataSource.initialize();
    
    const companyRepository = AppDataSource.getRepository(Company);
    const productRepository = AppDataSource.getRepository(Product);
    const storyRepository = AppDataSource.getRepository(Story);

    // Sample companies
    const companies = [
      {
        name: 'OpenAI',
        slug: 'openai',
        logoUrl: 'https://openai.com/logo.png',
        website: 'https://openai.com',
        sectorTags: ['AI', 'Machine Learning', 'Language Models'],
        fundingStage: 'private' as const,
        investors: ['Microsoft', 'Sequoia Capital', 'Andreessen Horowitz'],
        hqLocation: 'San Francisco, CA',
        ethicsStatementUrl: 'https://openai.com/ethics',
        privacyPolicyUrl: 'https://openai.com/privacy',
        credibilityScore: 85.5,
        ethicsScore: 78.2,
        hypeScore: 92.1,
        verified: true,
        verifiedAt: new Date(),
      },
      {
        name: 'Anthropic',
        slug: 'anthropic',
        logoUrl: 'https://anthropic.com/logo.png',
        website: 'https://anthropic.com',
        sectorTags: ['AI Safety', 'Language Models', 'Research'],
        fundingStage: 'series-c' as const,
        investors: ['Google', 'Amazon', 'Salesforce'],
        hqLocation: 'San Francisco, CA',
        ethicsStatementUrl: 'https://anthropic.com/ethics',
        privacyPolicyUrl: 'https://anthropic.com/privacy',
        credibilityScore: 88.3,
        ethicsScore: 91.7,
        hypeScore: 76.4,
        verified: true,
        verifiedAt: new Date(),
      },
      {
        name: 'Tesla',
        slug: 'tesla',
        logoUrl: 'https://tesla.com/logo.png',
        website: 'https://tesla.com',
        sectorTags: ['Electric Vehicles', 'Autonomous Driving', 'Energy'],
        fundingStage: 'public' as const,
        investors: ['Public Markets'],
        hqLocation: 'Austin, TX',
        ethicsStatementUrl: 'https://tesla.com/ethics',
        privacyPolicyUrl: 'https://tesla.com/privacy',
        credibilityScore: 72.1,
        ethicsScore: 65.8,
        hypeScore: 88.9,
        verified: true,
        verifiedAt: new Date(),
      },
    ];

    const savedCompanies = [];
    for (const companyData of companies) {
      const company = companyRepository.create(companyData);
      const savedCompany = await companyRepository.save(company);
      savedCompanies.push(savedCompany);
      console.log(`Created company: ${savedCompany.name}`);
    }

    // Sample products
    const products = [
      {
        companyId: savedCompanies[0].id, // OpenAI
        name: 'ChatGPT',
        description: 'AI-powered conversational assistant for various tasks',
        priceTiers: [
          {
            name: 'Free',
            price: 0,
            currency: 'USD',
            features: ['Basic conversations', 'Limited usage'],
            billingCycle: 'monthly' as const,
          },
          {
            name: 'Plus',
            price: 20,
            currency: 'USD',
            features: ['Unlimited conversations', 'Priority access', 'GPT-4 access'],
            billingCycle: 'monthly' as const,
          },
        ],
        features: {
          core: ['Text generation', 'Question answering', 'Code assistance'],
          advanced: ['Image analysis', 'File uploads', 'Custom instructions'],
          integrations: ['API access', 'Browser plugin', 'Mobile app'],
          support: ['Community support', 'Priority support'],
        },
        targetUsers: ['Developers', 'Content creators', 'Students', 'Professionals'],
        demoUrl: 'https://chat.openai.com',
      },
      {
        companyId: savedCompanies[1].id, // Anthropic
        name: 'Claude',
        description: 'AI assistant focused on helpfulness and safety',
        priceTiers: [
          {
            name: 'Free',
            price: 0,
            currency: 'USD',
            features: ['Basic conversations', 'Limited context'],
            billingCycle: 'monthly' as const,
          },
          {
            name: 'Pro',
            price: 20,
            currency: 'USD',
            features: ['Extended context', 'Priority access', 'Advanced reasoning'],
            billingCycle: 'monthly' as const,
          },
        ],
        features: {
          core: ['Text analysis', 'Writing assistance', 'Research help'],
          advanced: ['Document analysis', 'Code review', 'Creative writing'],
          integrations: ['API access', 'Slack integration', 'Browser extension'],
          support: ['Email support', 'Community forum'],
        },
        targetUsers: ['Researchers', 'Writers', 'Analysts', 'Students'],
        demoUrl: 'https://claude.ai',
      },
    ];

    for (const productData of products) {
      const product = productRepository.create(productData);
      await productRepository.save(product);
      console.log(`Created product: ${product.name}`);
    }

    // Sample stories
    const stories = [
      {
        title: 'OpenAI Faces Criticism Over AI Training Data Transparency',
        content: 'Recent reports reveal concerns about OpenAI\'s data collection practices for training their language models. Critics argue that the company lacks transparency in how it sources and uses training data, raising ethical questions about user privacy and consent.',
        sourceUrl: 'https://example.com/openai-transparency-issues',
        companyId: savedCompanies[0].id,
        sectorTag: 'AI Ethics',
        hypeScore: 75.2,
        ethicsScore: 45.8,
        realityCheck: 'Multiple sources confirm these concerns, with several AI researchers and privacy advocates raising similar issues.',
        impactTags: ['privacy', 'transparency', 'ethics', 'breaking'],
        createdBy: 'tech-ethics-reporter',
        publishedAt: new Date(),
      },
      {
        title: 'Anthropic Leads Industry in AI Safety Research',
        content: 'Anthropic continues to set the standard for AI safety research, publishing groundbreaking papers on constitutional AI and alignment. Their approach to building AI systems that are helpful, harmless, and honest is gaining recognition across the industry.',
        sourceUrl: 'https://example.com/anthropic-ai-safety',
        companyId: savedCompanies[1].id,
        sectorTag: 'AI Safety',
        hypeScore: 68.4,
        ethicsScore: 89.1,
        realityCheck: 'Anthropic\'s research is peer-reviewed and published in top-tier conferences, with independent verification of their claims.',
        impactTags: ['safety', 'research', 'positive', 'milestone'],
        createdBy: 'ai-research-analyst',
        publishedAt: new Date(),
      },
      {
        title: 'Tesla Autopilot Under Investigation for Safety Violations',
        content: 'Federal regulators are investigating multiple incidents involving Tesla\'s Autopilot system. The investigation focuses on whether the company adequately addresses safety concerns and communicates limitations to users.',
        sourceUrl: 'https://example.com/tesla-autopilot-investigation',
        companyId: savedCompanies[2].id,
        sectorTag: 'Autonomous Vehicles',
        hypeScore: 82.6,
        ethicsScore: 38.7,
        realityCheck: 'Official NHTSA investigation confirmed, with multiple documented cases of system failures.',
        impactTags: ['safety', 'regulation', 'critical', 'investigation'],
        createdBy: 'transportation-reporter',
        publishedAt: new Date(),
      },
    ];

    for (const storyData of stories) {
      const story = storyRepository.create(storyData);
      await storyRepository.save(story);
      console.log(`Created story: ${story.title}`);
    }

    console.log('Sample data seeded successfully!');
  } catch (error) {
    console.error('Error seeding sample data:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedSampleData()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
