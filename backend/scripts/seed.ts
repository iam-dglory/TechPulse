import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from '../ormconfig';
import { Company } from '../models/company';
import { Story } from '../models/story';
import { User } from '../models/user';
import { Product } from '../models/product';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

interface SeedCompany {
  name: string;
  slug: string;
  website: string;
  sectorTags: string[];
  fundingStage: 'Seed' | 'Series A' | 'Series B' | 'Series C+' | 'Public' | 'Acquired' | 'Bootstrapped';
  investors: string[];
  hqLocation: string;
  credibilityScore: number;
  ethicsScore: number;
  hypeScore: number;
  ethicsStatementUrl: string;
  privacyPolicyUrl: string;
  logoUrl?: string;
}

interface SeedStory {
  title: string;
  content: string;
  sourceUrl: string;
  sectorTag: string;
  hypeScore: number;
  ethicsScore: number;
  impactTags: string[];
  realityCheck?: string;
  companyName?: string;
}

interface SeedProduct {
  name: string;
  description: string;
  priceTiers: Array<{
    name: string;
    price: number;
    features: string[];
  }>;
  features: {
    core: string[];
    advanced: string[];
    integrations: string[];
  };
  targetUsers: string[];
  demoUrl: string;
}

const seedCompanies: SeedCompany[] = [
  {
    name: 'PixaAI',
    slug: 'pixaai',
    website: 'https://pixaai.com',
    sectorTags: ['AI', 'Computer Vision', 'Creative Tools'],
    fundingStage: 'Series A',
    investors: ['Andreessen Horowitz', 'Sequoia Capital'],
    hqLocation: 'San Francisco, CA',
    credibilityScore: 85,
    ethicsScore: 78,
    hypeScore: 72,
    ethicsStatementUrl: 'https://pixaai.com/ethics',
    privacyPolicyUrl: 'https://pixaai.com/privacy',
    logoUrl: 'https://pixaai.com/logo.png'
  },
  {
    name: 'SynthHealth',
    slug: 'synthhealth',
    website: 'https://synthhealth.ai',
    sectorTags: ['Healthcare AI', 'Medical Imaging', 'Diagnostics'],
    fundingStage: 'Series B',
    investors: ['GV (Google Ventures)', 'Khosla Ventures', 'HealthTech Capital'],
    hqLocation: 'Boston, MA',
    credibilityScore: 92,
    ethicsScore: 88,
    hypeScore: 65,
    ethicsStatementUrl: 'https://synthhealth.ai/ethics-policy',
    privacyPolicyUrl: 'https://synthhealth.ai/privacy-policy',
    logoUrl: 'https://synthhealth.ai/logo.png'
  },
  {
    name: 'RideEV',
    slug: 'rideev',
    website: 'https://rideev.com',
    sectorTags: ['Electric Vehicles', 'Autonomous Driving', 'Transportation'],
    fundingStage: 'Series C+',
    investors: ['Tesla Ventures', 'BMW i Ventures', 'Toyota AI Ventures'],
    hqLocation: 'Austin, TX',
    credibilityScore: 88,
    ethicsScore: 75,
    hypeScore: 85,
    ethicsStatementUrl: 'https://rideev.com/ethics-commitment',
    privacyPolicyUrl: 'https://rideev.com/privacy',
    logoUrl: 'https://rideev.com/logo.png'
  },
  {
    name: 'AgroSense',
    slug: 'agrosense',
    website: 'https://agrosense.io',
    sectorTags: ['AgTech', 'IoT', 'Precision Agriculture'],
    fundingStage: 'Series A',
    investors: ['IndieBio', 'AgFunder', 'Rural Innovation Fund'],
    hqLocation: 'Des Moines, IA',
    credibilityScore: 82,
    ethicsScore: 85,
    hypeScore: 68,
    ethicsStatementUrl: 'https://agrosense.io/ethical-practices',
    privacyPolicyUrl: 'https://agrosense.io/privacy',
    logoUrl: 'https://agrosense.io/logo.png'
  },
  {
    name: 'SecureCloud',
    slug: 'securecloud',
    website: 'https://securecloud.com',
    sectorTags: ['Cybersecurity', 'Cloud Infrastructure', 'Enterprise Security'],
    fundingStage: 'Public',
    investors: [],
    hqLocation: 'Seattle, WA',
    credibilityScore: 90,
    ethicsScore: 82,
    hypeScore: 58,
    ethicsStatementUrl: 'https://securecloud.com/ethics-and-compliance',
    privacyPolicyUrl: 'https://securecloud.com/privacy-policy',
    logoUrl: 'https://securecloud.com/logo.png'
  },
  {
    name: 'EduBot',
    slug: 'edubot',
    website: 'https://edubot.ai',
    sectorTags: ['EdTech', 'AI Tutoring', 'Personalized Learning'],
    fundingStage: 'Series B',
    investors: ['GSV Ventures', 'Reach Capital', 'Learn Capital'],
    hqLocation: 'Palo Alto, CA',
    credibilityScore: 86,
    ethicsScore: 89,
    hypeScore: 70,
    ethicsStatementUrl: 'https://edubot.ai/ai-ethics',
    privacyPolicyUrl: 'https://edubot.ai/privacy',
    logoUrl: 'https://edubot.ai/logo.png'
  },
  {
    name: 'CleanGrid',
    slug: 'cleangrid',
    website: 'https://cleangrid.energy',
    sectorTags: ['Clean Energy', 'Smart Grid', 'Renewable Energy'],
    fundingStage: 'Series A',
    investors: ['Breakthrough Energy Ventures', 'Energy Impact Partners'],
    hqLocation: 'Denver, CO',
    credibilityScore: 84,
    ethicsScore: 91,
    hypeScore: 63,
    ethicsStatementUrl: 'https://cleangrid.energy/sustainability-ethics',
    privacyPolicyUrl: 'https://cleangrid.energy/privacy',
    logoUrl: 'https://cleangrid.energy/logo.png'
  },
  {
    name: 'NovaRobotics',
    slug: 'novarobotics',
    website: 'https://novarobotics.com',
    sectorTags: ['Robotics', 'Industrial Automation', 'AI'],
    fundingStage: 'Series B',
    investors: ['SoftBank Vision Fund', 'Intel Capital', 'Qualcomm Ventures'],
    hqLocation: 'Pittsburgh, PA',
    credibilityScore: 87,
    ethicsScore: 79,
    hypeScore: 76,
    ethicsStatementUrl: 'https://novarobotics.com/robotics-ethics',
    privacyPolicyUrl: 'https://novarobotics.com/privacy-policy',
    logoUrl: 'https://novarobotics.com/logo.png'
  }
];

const seedStories: SeedStory[] = [
  {
    title: 'PixaAI Launches Revolutionary AI Image Generator with Built-in Bias Detection',
    content: 'PixaAI has unveiled their latest AI image generation tool that includes real-time bias detection and mitigation. The system can identify potential biases in generated content related to race, gender, and cultural representation before images are finalized. "We believe AI should enhance creativity while promoting inclusivity," said CEO Sarah Chen. The tool has already been adopted by major design agencies and is showing promising results in reducing biased content generation by 40%.',
    sourceUrl: 'https://techcrunch.com/2025/01/pixaai-bias-detection-ai-image-generator',
    sectorTag: 'AI Ethics',
    hypeScore: 75,
    ethicsScore: 85,
    impactTags: ['positive', 'innovation', 'bias-mitigation'],
    realityCheck: 'Verified by independent AI ethics researchers. Bias reduction metrics confirmed through third-party testing.',
    companyName: 'PixaAI'
  },
  {
    title: 'SynthHealth AI Diagnostic Tool Raises Privacy Concerns Among Medical Professionals',
    content: 'Medical professionals are expressing concerns about SynthHealth\'s new AI diagnostic assistant that analyzes patient data to provide diagnostic suggestions. While the company claims HIPAA compliance, some doctors worry about data sharing practices and the potential for AI recommendations to influence clinical judgment. The tool processes thousands of medical images daily, raising questions about data retention and patient consent procedures.',
    sourceUrl: 'https://medicalnews.com/2025/01/synthhealth-privacy-concerns',
    sectorTag: 'Healthcare AI',
    hypeScore: 68,
    ethicsScore: 45,
    impactTags: ['concern', 'privacy', 'healthcare'],
    realityCheck: 'HIPAA compliance claims need independent verification. Medical AI regulation is still evolving.',
    companyName: 'SynthHealth'
  },
  {
    title: 'RideEV Autonomous Vehicle Fleet Completes 1 Million Miles with Zero Accidents',
    content: 'RideEV has announced that their autonomous vehicle fleet has successfully completed over 1 million miles of testing with zero accidents caused by the AI system. The company attributes this success to their advanced sensor fusion technology and conservative driving algorithms. "Safety is our top priority," stated CTO Marcus Rodriguez. The achievement comes as RideEV prepares for commercial deployment in select cities next year.',
    sourceUrl: 'https://autonews.com/2025/01/rideev-million-miles-autonomous',
    sectorTag: 'Autonomous Vehicles',
    hypeScore: 82,
    ethicsScore: 78,
    impactTags: ['milestone', 'safety', 'autonomous-driving'],
    realityCheck: 'Achievement verified by independent safety auditors. Testing conditions and environments should be considered.',
    companyName: 'RideEV'
  },
  {
    title: 'AgroSense Precision Farming Platform Helps Reduce Pesticide Use by 30%',
    content: 'AgroSense\'s IoT-based precision farming platform has demonstrated significant environmental benefits, helping farmers reduce pesticide use by an average of 30% while maintaining crop yields. The system uses AI to analyze soil conditions, weather patterns, and crop health to provide targeted recommendations. Early adopters report both cost savings and improved sustainability metrics.',
    sourceUrl: 'https://agritechnews.com/2025/01/agrosense-pesticide-reduction',
    sectorTag: 'AgTech',
    hypeScore: 58,
    ethicsScore: 88,
    impactTags: ['sustainability', 'environment-positive', 'precision-agriculture'],
    realityCheck: 'Results verified by agricultural extension services. Long-term impact studies ongoing.',
    companyName: 'AgroSense'
  },
  {
    title: 'SecureCloud Faces Backlash Over Data Retention Policies in New Privacy Update',
    content: 'SecureCloud\'s updated privacy policy has sparked controversy among users and privacy advocates. The new policy extends data retention periods and includes broader data sharing permissions with third-party partners. Privacy experts argue that these changes contradict the company\'s previous commitments to user privacy. The update comes amid growing concerns about cloud security and data sovereignty.',
    sourceUrl: 'https://privacywatch.com/2025/01/securecloud-policy-backlash',
    sectorTag: 'Cybersecurity',
    hypeScore: 72,
    ethicsScore: 35,
    impactTags: ['privacy-concern', 'policy-change', 'backlash'],
    realityCheck: 'Privacy policy changes verified. User consent mechanisms for existing data unclear.',
    companyName: 'SecureCloud'
  },
  {
    title: 'EduBot AI Tutor Shows Promise in Personalized Learning but Raises Equity Questions',
    content: 'EduBot\'s AI-powered tutoring system has shown impressive results in personalized learning, with students showing 25% improvement in test scores. However, educators are raising concerns about equity, as the system\'s effectiveness varies significantly based on student background and access to technology. The company is working on solutions to address the digital divide, but critics argue more needs to be done.',
    sourceUrl: 'https://edtechweekly.com/2025/01/edubot-equity-concerns',
    sectorTag: 'EdTech',
    hypeScore: 65,
    ethicsScore: 72,
    impactTags: ['promising', 'equity-concern', 'personalized-learning'],
    realityCheck: 'Learning outcomes verified by independent education researchers. Equity concerns are valid and acknowledged by company.',
    companyName: 'EduBot'
  }
];

const seedProducts: Record<string, SeedProduct[]> = {
  'PixaAI': [
    {
      name: 'PixaStudio Pro',
      description: 'Professional AI image generation tool with bias detection and creative controls.',
      priceTiers: [
        {
          name: 'Starter',
          price: 29,
          features: ['1000 images/month', 'Basic bias detection', 'Standard templates']
        },
        {
          name: 'Pro',
          price: 99,
          features: ['10000 images/month', 'Advanced bias detection', 'Custom models', 'API access']
        },
        {
          name: 'Enterprise',
          price: 499,
          features: ['Unlimited images', 'Custom bias training', 'White-label options', 'Priority support']
        }
      ],
      features: {
        core: ['AI image generation', 'Bias detection', 'Style transfer'],
        advanced: ['Custom model training', 'Batch processing', 'API integration'],
        integrations: ['Adobe Creative Suite', 'Figma', 'Sketch']
      },
      targetUsers: ['Designers', 'Marketers', 'Content creators'],
      demoUrl: 'https://pixaai.com/demo'
    }
  ],
  'SynthHealth': [
    {
      name: 'DiagnosticAI Assistant',
      description: 'AI-powered diagnostic support tool for medical professionals.',
      priceTiers: [
        {
          name: 'Individual',
          price: 199,
          features: ['100 scans/month', 'Basic diagnostic suggestions', 'HIPAA compliance']
        },
        {
          name: 'Clinic',
          price: 999,
          features: ['1000 scans/month', 'Advanced analytics', 'Team collaboration']
        },
        {
          name: 'Hospital',
          price: 4999,
          features: ['Unlimited scans', 'Custom training', 'Integration support']
        }
      ],
      features: {
        core: ['Medical image analysis', 'Diagnostic suggestions', 'Patient data management'],
        advanced: ['Pattern recognition', 'Risk assessment', 'Treatment recommendations'],
        integrations: ['EMR systems', 'PACS', 'Hospital information systems']
      },
      targetUsers: ['Radiologists', 'Doctors', 'Medical technicians'],
      demoUrl: 'https://synthhealth.ai/demo'
    }
  ],
  'RideEV': [
    {
      name: 'Autonomous Fleet Management',
      description: 'Complete autonomous vehicle fleet management and monitoring system.',
      priceTiers: [
        {
          name: 'Pilot',
          price: 0,
          features: ['Up to 5 vehicles', 'Basic monitoring', 'Standard support']
        },
        {
          name: 'Fleet',
          price: 2500,
          features: ['Up to 50 vehicles', 'Advanced analytics', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 10000,
          features: ['Unlimited vehicles', 'Custom integrations', '24/7 support']
        }
      ],
      features: {
        core: ['Vehicle monitoring', 'Route optimization', 'Safety management'],
        advanced: ['Predictive maintenance', 'Fleet analytics', 'Autonomous driving'],
        integrations: ['Fleet management systems', 'City infrastructure', 'Payment systems']
      },
      targetUsers: ['Fleet operators', 'City planners', 'Transportation companies'],
      demoUrl: 'https://rideev.com/demo'
    }
  ]
};

async function seedDatabase(): Promise<void> {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    // Clear existing data (optional - for development)
    console.log('🧹 Clearing existing data...');
    await AppDataSource.manager.clear(Story);
    await AppDataSource.manager.clear(Product);
    await AppDataSource.manager.clear(Company);
    await AppDataSource.manager.clear(User);
    console.log('✅ Existing data cleared');

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const adminUser = AppDataSource.manager.create(User, {
      email: 'admin@texhpulze.local',
      username: 'admin',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      isVerified: true,
      isAdmin: true
    });
    await AppDataSource.manager.save(adminUser);
    console.log('✅ Admin user created: admin@texhpulze.local (password: admin123)');

    // Create company owner users for claim testing
    console.log('👥 Creating company owner users...');
    const companyOwners = [];
    const ownerData = [
      { email: 'ceo@pixaai.com', username: 'pixaai_ceo', company: 'PixaAI' },
      { email: 'founder@synthhealth.com', username: 'synthhealth_founder', company: 'SynthHealth' },
      { email: 'owner@rideev.com', username: 'rideev_owner', company: 'RideEV' }
    ];

    for (const ownerInfo of ownerData) {
      const ownerPasswordHash = await bcrypt.hash('owner123', 12);
      const ownerUser = AppDataSource.manager.create(User, {
        email: ownerInfo.email,
        username: ownerInfo.username,
        passwordHash: ownerPasswordHash,
        firstName: ownerInfo.company,
        lastName: 'Owner',
        isActive: true,
        isVerified: true,
        isAdmin: false
      });
      const savedOwner = await AppDataSource.manager.save(ownerUser);
      companyOwners.push({ user: savedOwner, company: ownerInfo.company });
      console.log(`   ✅ Created owner: ${ownerInfo.email} (password: owner123) for ${ownerInfo.company}`);
    }

    // Create companies
    console.log('🏢 Creating companies...');
    const companies: Company[] = [];
    
    for (const companyData of seedCompanies) {
      const company = AppDataSource.manager.create(Company, {
        ...companyData,
        verified: true,
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedCompany = await AppDataSource.manager.save(company);
      companies.push(savedCompany);
      console.log(`   ✅ Created company: ${company.name}`);
    }

    // Create products
    console.log('📦 Creating products...');
    for (const [companyName, products] of Object.entries(seedProducts)) {
      const company = companies.find(c => c.name === companyName);
      if (!company) continue;

      for (const productData of products) {
        const product = AppDataSource.manager.create(Product, {
          companyId: company.id,
          name: productData.name,
          description: productData.description,
          priceTiers: productData.priceTiers,
          features: productData.features,
          targetUsers: productData.targetUsers,
          demoUrl: productData.demoUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await AppDataSource.manager.save(product);
        console.log(`   ✅ Created product: ${product.name} for ${company.name}`);
      }
    }

    // Create stories
    console.log('📰 Creating stories...');
    for (const storyData of seedStories) {
      const company = companies.find(c => c.name === storyData.companyName);
      
      const story = AppDataSource.manager.create(Story, {
        title: storyData.title,
        content: storyData.content,
        sourceUrl: storyData.sourceUrl,
        companyId: company?.id,
        sectorTag: storyData.sectorTag,
        hypeScore: storyData.hypeScore,
        ethicsScore: storyData.ethicsScore,
        realityCheck: storyData.realityCheck,
        impactTags: storyData.impactTags,
        createdBy: adminUser.id,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await AppDataSource.manager.save(story);
      console.log(`   ✅ Created story: ${story.title}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Companies: ${companies.length}`);
    console.log(`   - Products: ${Object.values(seedProducts).flat().length}`);
    console.log(`   - Stories: ${seedStories.length}`);
    console.log(`   - Users: ${1 + companyOwners.length} (1 admin + ${companyOwners.length} company owners)`);
    
    console.log('\n🔐 Admin Login Credentials:');
    console.log('   Email: admin@texhpulze.local');
    console.log('   Password: admin123');
    
    console.log('\n👥 Company Owner Login Credentials:');
    companyOwners.forEach(({ user, company }) => {
      console.log(`   ${company}: ${user.email} (password: owner123)`);
    });

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
