export interface HypeScoreResult {
  score: number; // 1-10 scale
  confidence: number; // 0-1 confidence in the score
  breakdown: {
    marketingLanguage: number;
    superlatives: number;
    claims: number;
    punctuation: number;
    ratio: number;
  };
  reasoning: string[];
}

export interface StoryContent {
  title: string;
  content: string;
  sourceUrl?: string;
}

export class HypeScorer {
  private marketingWords = [
    // Superlatives
    'revolutionary', 'unprecedented', 'groundbreaking', 'game-changing', 'cutting-edge',
    'innovative', 'breakthrough', 'milestone', 'first-ever', 'never-before',
    'revolutionary', 'transformative', 'disruptive', 'paradigm-shifting',
    
    // Marketing buzzwords
    'amazing', 'incredible', 'stunning', 'remarkable', 'extraordinary',
    'phenomenal', 'outstanding', 'exceptional', 'spectacular', 'fantastic',
    'mind-blowing', 'jaw-dropping', 'life-changing', 'world-changing',
    
    // Intensity words
    'massive', 'huge', 'enormous', 'tremendous', 'gigantic',
    'colossal', 'monumental', 'epic', 'legendary', 'historic',
    
    // Future promises
    'will revolutionize', 'will transform', 'will change everything',
    'the future of', 'next generation', 'state-of-the-art',
    'industry-leading', 'world-class', 'best-in-class'
  ];

  private superlatives = [
    'best', 'worst', 'first', 'last', 'only', 'most', 'least',
    'greatest', 'smallest', 'largest', 'fastest', 'slowest',
    'highest', 'lowest', 'newest', 'oldest', 'youngest',
    'strongest', 'weakest', 'smartest', 'dumbest'
  ];

  private claimWords = [
    'revolutionary', 'unprecedented', 'never seen before', 'first of its kind',
    'world\'s first', 'industry first', 'breakthrough', 'game-changer',
    'paradigm shift', 'disrupts', 'transforms', 'revolutionizes',
    'changes everything', 'redefines', 'reinvents'
  ];

  private technicalWords = [
    'algorithm', 'model', 'data', 'analysis', 'research', 'study',
    'methodology', 'framework', 'architecture', 'implementation',
    'optimization', 'efficiency', 'performance', 'accuracy',
    'precision', 'recall', 'metrics', 'benchmark', 'evaluation',
    'testing', 'validation', 'verification', 'peer-reviewed',
    'scientific', 'empirical', 'statistical', 'mathematical'
  ];

  /**
   * Calculate hype score for story content
   */
  calculateHypeScore(storyContent: StoryContent): HypeScoreResult {
    const text = `${storyContent.title} ${storyContent.content}`.toLowerCase();
    
    // Calculate individual components
    const marketingLanguage = this.calculateMarketingLanguageDensity(text);
    const superlatives = this.calculateSuperlativeCount(text);
    const claims = this.calculateClaimIntensity(text);
    const punctuation = this.calculatePunctuationIntensity(text);
    const ratio = this.calculateMarketingToTechnicalRatio(text);
    
    // Weighted scoring (1-10 scale)
    const weights = {
      marketingLanguage: 0.25,
      superlatives: 0.20,
      claims: 0.25,
      punctuation: 0.15,
      ratio: 0.15
    };
    
    const weightedScore = 
      (marketingLanguage * weights.marketingLanguage) +
      (superlatives * weights.superlatives) +
      (claims * weights.claims) +
      (punctuation * weights.punctuation) +
      (ratio * weights.ratio);
    
    // Normalize to 1-10 scale
    const score = Math.min(10, Math.max(1, Math.round(weightedScore * 10)));
    
    // Calculate confidence based on content length and consistency
    const confidence = this.calculateConfidence(text, storyContent);
    
    // Generate reasoning
    const reasoning = this.generateReasoning({
      marketingLanguage,
      superlatives,
      claims,
      punctuation,
      ratio
    }, text);
    
    return {
      score,
      confidence,
      breakdown: {
        marketingLanguage: Math.round(marketingLanguage * 10),
        superlatives: Math.round(superlatives * 10),
        claims: Math.round(claims * 10),
        punctuation: Math.round(punctuation * 10),
        ratio: Math.round(ratio * 10)
      },
      reasoning
    };
  }

  /**
   * Calculate marketing language density (0-1)
   */
  private calculateMarketingLanguageDensity(text: string): number {
    const words = text.split(/\s+/).length;
    const marketingCount = this.marketingWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    // Normalize by word count, cap at 0.3 (30% marketing words is very high)
    return Math.min(0.3, marketingCount / words);
  }

  /**
   * Calculate superlative usage (0-1)
   */
  private calculateSuperlativeCount(text: string): number {
    const superlativeCount = this.superlatives.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    // Normalize: 0-5 superlatives = 0-1 score
    return Math.min(1, superlativeCount / 5);
  }

  /**
   * Calculate claim intensity (0-1)
   */
  private calculateClaimIntensity(text: string): number {
    const claimCount = this.claimWords.reduce((count, phrase) => {
      const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    // Normalize: 0-3 claims = 0-1 score
    return Math.min(1, claimCount / 3);
  }

  /**
   * Calculate punctuation intensity (0-1)
   */
  private calculatePunctuationIntensity(text: string): number {
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const ellipsisCount = (text.match(/\.{3,}/g) || []).length;
    
    const totalPunctuation = exclamationCount + questionCount + ellipsisCount;
    const words = text.split(/\s+/).length;
    
    // Normalize: 0-0.1 punctuation per word = 0-1 score
    return Math.min(1, totalPunctuation / words / 0.1);
  }

  /**
   * Calculate marketing to technical ratio (0-1)
   */
  private calculateMarketingToTechnicalRatio(text: string): number {
    const marketingCount = this.marketingWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    const technicalCount = this.technicalWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    if (technicalCount === 0) {
      return marketingCount > 0 ? 1 : 0; // All marketing, no technical = high hype
    }
    
    const ratio = marketingCount / technicalCount;
    // Normalize: ratio > 2 = high hype (0.5-1), ratio < 0.5 = low hype (0-0.5)
    return Math.min(1, Math.max(0, (ratio - 0.5) / 1.5 + 0.5));
  }

  /**
   * Calculate confidence in the score (0-1)
   */
  private calculateConfidence(text: string, storyContent: StoryContent): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence with content length
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 100) confidence += 0.2;
    if (wordCount > 300) confidence += 0.1;
    
    // Increase confidence with title presence
    if (storyContent.title && storyContent.title.length > 10) {
      confidence += 0.1;
    }
    
    // Increase confidence with source URL
    if (storyContent.sourceUrl) {
      confidence += 0.1;
    }
    
    // Decrease confidence if very short content
    if (wordCount < 50) {
      confidence -= 0.3;
    }
    
    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(breakdown: any, text: string): string[] {
    const reasoning: string[] = [];
    
    if (breakdown.marketingLanguage > 7) {
      reasoning.push('High density of marketing language detected');
    } else if (breakdown.marketingLanguage < 3) {
      reasoning.push('Low marketing language density');
    }
    
    if (breakdown.superlatives > 7) {
      reasoning.push('Excessive use of superlatives');
    } else if (breakdown.superlatives < 3) {
      reasoning.push('Minimal superlative usage');
    }
    
    if (breakdown.claims > 7) {
      reasoning.push('Multiple revolutionary/breakthrough claims detected');
    } else if (breakdown.claims < 3) {
      reasoning.push('Few or no breakthrough claims');
    }
    
    if (breakdown.punctuation > 7) {
      reasoning.push('High punctuation intensity (exclamation marks, questions)');
    } else if (breakdown.punctuation < 3) {
      reasoning.push('Low punctuation intensity');
    }
    
    if (breakdown.ratio > 7) {
      reasoning.push('High marketing-to-technical content ratio');
    } else if (breakdown.ratio < 3) {
      reasoning.push('Technical content outweighs marketing language');
    }
    
    // Add specific examples
    const foundMarketingWords = this.marketingWords.filter(word => 
      text.includes(word.toLowerCase())
    );
    
    if (foundMarketingWords.length > 0) {
      reasoning.push(`Marketing terms found: ${foundMarketingWords.slice(0, 3).join(', ')}`);
    }
    
    return reasoning;
  }

  /**
   * Get hype level description
   */
  getHypeLevelDescription(score: number): string {
    if (score >= 8) return 'Extremely High Hype';
    if (score >= 6) return 'High Hype';
    if (score >= 4) return 'Moderate Hype';
    if (score >= 2) return 'Low Hype';
    return 'Minimal Hype';
  }

  /**
   * Check if content is likely clickbait
   */
  isClickbait(storyContent: StoryContent): boolean {
    const title = storyContent.title.toLowerCase();
    const content = storyContent.content.toLowerCase();
    
    const clickbaitPatterns = [
      /you won't believe/i,
      /shocking/i,
      /this will blow your mind/i,
      /doctors hate this/i,
      /what happens next/i,
      /number \d+ will shock you/i,
      /one weird trick/i,
      /click here/i,
      /find out why/i
    ];
    
    const hasClickbaitPattern = clickbaitPatterns.some(pattern => 
      pattern.test(title) || pattern.test(content)
    );
    
    const hypeResult = this.calculateHypeScore(storyContent);
    
    return hasClickbaitPattern || hypeResult.score >= 8;
  }
}


