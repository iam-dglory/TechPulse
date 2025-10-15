import { HypeScorer } from '../../src/services/scoring/hypeScorer';
import { EthicsScorer } from '../../src/services/scoring/ethicsScorer';
import { StoryContent } from '../../src/services/scoring/scoringPipeline';

describe('Scoring Services', () => {
  describe('HypeScorer', () => {
    let hypeScorer: HypeScorer;

    beforeEach(() => {
      hypeScorer = new HypeScorer();
    });

    test('should score high for marketing-heavy content', () => {
      const content: StoryContent = {
        title: 'REVOLUTIONARY AI BREAKTHROUGH! This Will Change Everything Forever!',
        content: 'This is absolutely unprecedented! The most amazing, incredible, game-changing technology ever created! It will revolutionize the entire industry! This is a paradigm shift that will transform everything we know!',
        sourceUrl: 'https://example.com'
      };

      const score = hypeScorer.score(content);
      expect(score).toBeGreaterThan(7);
      expect(score).toBeLessThanOrEqual(10);
    });

    test('should score low for technical, factual content', () => {
      const content: StoryContent = {
        title: 'New Version 2.1.3 Released with Bug Fixes',
        content: 'The development team has released version 2.1.3 which includes fixes for memory leaks in the authentication module and improved error handling for database connections. The update also includes performance optimizations for the search algorithm.',
        sourceUrl: 'https://example.com'
      };

      const score = hypeScorer.score(content);
      expect(score).toBeLessThan(4);
      expect(score).toBeGreaterThanOrEqual(1);
    });

    test('should score medium for balanced content', () => {
      const content: StoryContent = {
        title: 'New Machine Learning Framework Shows Promise',
        content: 'Researchers have developed a new machine learning framework that demonstrates improved performance on benchmark datasets. The framework uses a novel approach to neural network optimization and shows 15% better accuracy than existing solutions.',
        sourceUrl: 'https://example.com'
      };

      const score = hypeScorer.score(content);
      expect(score).toBeGreaterThanOrEqual(4);
      expect(score).toBeLessThanOrEqual(7);
    });

    test('should penalize excessive exclamation marks', () => {
      const content: StoryContent = {
        title: 'Amazing Technology!!!',
        content: 'This is incredible!!! The best thing ever!!! You won\'t believe it!!! It\'s revolutionary!!!',
        sourceUrl: 'https://example.com'
      };

      const score = hypeScorer.score(content);
      expect(score).toBeGreaterThan(6); // Still high due to marketing words
    });

    test('should handle empty content gracefully', () => {
      const content: StoryContent = {
        title: '',
        content: '',
        sourceUrl: ''
      };

      const score = hypeScorer.score(content);
      expect(score).toBe(1); // Minimum score
    });
  });

  describe('EthicsScorer', () => {
    let ethicsScorer: EthicsScorer;

    beforeEach(() => {
      ethicsScorer = new EthicsScorer();
    });

    test('should score high for privacy-conscious content', () => {
      const content: StoryContent = {
        title: 'New Privacy-First Analytics Platform',
        content: 'Our new analytics platform implements end-to-end encryption, data minimization principles, and user consent mechanisms. We provide clear opt-out options and have undergone third-party privacy audits.',
        sourceUrl: 'https://example.com'
      };

      const result = ethicsScorer.score(content);
      expect(result.score).toBeGreaterThan(7);
      expect(result.impactTags).toContain('privacy');
    });

    test('should score low for privacy-violating content', () => {
      const content: StoryContent = {
        title: 'AI System Collects All User Data',
        content: 'Our AI system automatically collects and sells all user data without consent. We track everything users do and share it with advertisers. No privacy policy is provided.',
        sourceUrl: 'https://example.com'
      };

      const result = ethicsScorer.score(content);
      expect(result.score).toBeLessThan(3);
      expect(result.impactTags).toContain('privacy');
    });

    test('should identify labor impact', () => {
      const content: StoryContent = {
        title: 'AI Replaces 1000 Workers',
        content: 'Our new AI system will replace 1000 human workers across multiple departments. This automation will reduce labor costs by 80% and eliminate the need for human oversight.',
        sourceUrl: 'https://example.com'
      };

      const result = ethicsScorer.score(content);
      expect(result.impactTags).toContain('labor');
      expect(result.score).toBeLessThan(5);
    });

    test('should identify environmental impact', () => {
      const content: StoryContent = {
        title: 'Mining Cryptocurrency Causes Environmental Damage',
        content: 'The new cryptocurrency mining operation consumes 100MW of electricity and causes significant environmental damage. The carbon footprint is equivalent to a small country.',
        sourceUrl: 'https://example.com'
      };

      const result = ethicsScorer.score(content);
      expect(result.impactTags).toContain('environment');
      expect(result.score).toBeLessThan(5);
    });

    test('should score neutral for standard business content', () => {
      const content: StoryContent = {
        title: 'Company Announces Quarterly Results',
        content: 'The company announced its quarterly financial results, showing steady growth in revenue and customer acquisition. The team continues to focus on product development and market expansion.',
        sourceUrl: 'https://example.com'
      };

      const result = ethicsScorer.score(content);
      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.score).toBeLessThanOrEqual(6);
      expect(result.impactTags.length).toBe(0);
    });

    test('should identify safety concerns', () => {
      const content: StoryContent = {
        title: 'Autonomous Vehicle Crashes in Testing',
        content: 'During testing, the autonomous vehicle failed to detect pedestrians and crashed into a building. The safety systems were not properly calibrated and multiple safety violations were found.',
        sourceUrl: 'https://example.com'
      };

      const result = ethicsScorer.score(content);
      expect(result.impactTags).toContain('safety');
      expect(result.score).toBeLessThan(4);
    });

    test('should handle empty content gracefully', () => {
      const content: StoryContent = {
        title: '',
        content: '',
        sourceUrl: ''
      };

      const result = ethicsScorer.score(content);
      expect(result.score).toBe(5); // Neutral score
      expect(result.impactTags).toEqual([]);
    });
  });

  describe('Scoring Integration', () => {
    test('should provide consistent scoring across multiple runs', () => {
      const content: StoryContent = {
        title: 'Revolutionary AI Technology',
        content: 'This new AI technology is groundbreaking and will change everything.',
        sourceUrl: 'https://example.com'
      };

      const hypeScorer = new HypeScorer();
      const ethicsScorer = new EthicsScorer();

      const hypeScore1 = hypeScorer.score(content);
      const hypeScore2 = hypeScorer.score(content);
      const ethicsResult1 = ethicsScorer.score(content);
      const ethicsResult2 = ethicsScorer.score(content);

      expect(hypeScore1).toBe(hypeScore2);
      expect(ethicsResult1.score).toBe(ethicsResult2.score);
      expect(ethicsResult1.impactTags).toEqual(ethicsResult2.impactTags);
    });

    test('should handle edge cases in content analysis', () => {
      const hypeScorer = new HypeScorer();
      const ethicsScorer = new EthicsScorer();

      // Very long content
      const longContent: StoryContent = {
        title: 'Very Long Title That Goes On and On',
        content: 'This is a very long piece of content that goes on and on and on. '.repeat(100),
        sourceUrl: 'https://example.com'
      };

      expect(() => {
        const hypeScore = hypeScorer.score(longContent);
        const ethicsResult = ethicsScorer.score(longContent);
        expect(hypeScore).toBeGreaterThanOrEqual(1);
        expect(ethicsResult.score).toBeGreaterThanOrEqual(1);
      }).not.toThrow();

      // Content with special characters
      const specialContent: StoryContent = {
        title: 'Special Characters: @#$%^&*()',
        content: 'Content with émojis 🚀 and spëcial chäracters!',
        sourceUrl: 'https://example.com'
      };

      expect(() => {
        const hypeScore = hypeScorer.score(specialContent);
        const ethicsResult = ethicsScorer.score(specialContent);
        expect(hypeScore).toBeGreaterThanOrEqual(1);
        expect(ethicsResult.score).toBeGreaterThanOrEqual(1);
      }).not.toThrow();
    });
  });
});
