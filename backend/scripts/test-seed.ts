import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from '../ormconfig';
import { Story } from '../models/story';
import { Company } from '../models/company';
import { User } from '../models/user';

// Load environment variables
dotenv.config();

async function testSeedData(): Promise<void> {
  console.log('🧪 Testing seeded data...');
  
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    // Test companies
    const companyCount = await AppDataSource.manager.count(Company);
    console.log(`📊 Companies in database: ${companyCount}`);
    
    if (companyCount > 0) {
      const companies = await AppDataSource.manager.find(Company, { take: 3 });
      console.log('🏢 Sample companies:');
      companies.forEach(company => {
        console.log(`   - ${company.name} (${company.sectorTags.join(', ')}) - ${company.fundingStage}`);
      });
    }

    // Test stories
    const storyCount = await AppDataSource.manager.count(Story);
    console.log(`📰 Stories in database: ${storyCount}`);
    
    if (storyCount > 0) {
      const stories = await AppDataSource.manager.find(Story, { 
        take: 3,
        relations: ['company']
      });
      console.log('📖 Sample stories:');
      stories.forEach(story => {
        console.log(`   - "${story.title}" (Hype: ${story.hypeScore}, Ethics: ${story.ethicsScore})`);
        if (story.company) {
          console.log(`     Company: ${story.company.name}`);
        }
      });
    }

    // Test users
    const userCount = await AppDataSource.manager.count(User);
    console.log(`👤 Users in database: ${userCount}`);

    console.log('\n✅ Seed data test completed successfully!');

  } catch (error) {
    console.error('❌ Seed data test failed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testSeedData()
    .then(() => {
      console.log('✅ Test process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test process failed:', error);
      process.exit(1);
    });
}

export default testSeedData;
