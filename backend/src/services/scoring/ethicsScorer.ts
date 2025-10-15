export interface EthicsScoreResult {
  score: number; // 1-10 scale
  confidence: number; // 0-1 confidence in the score
  impactTags: string[];
  breakdown: {
    privacy: number;
    labor: number;
    environment: number;
    safety: number;
    transparency: number;
  };
  reasoning: string[];
  recommendations: string[];
}

export interface StoryContent {
  title: string;
  content: string;
  sourceUrl?: string;
  companyId?: string;
}

export interface CompanyData {
  id: string;
  name: string;
  ethicsStatementUrl?: string;
  privacyPolicyUrl?: string;
  sectorTags: string[];
}

export class EthicsScorer {
  private privacyKeywords = [
    'privacy', 'data protection', 'gdpr', 'ccpa', 'personal data',
    'user consent', 'data minimization', 'anonymization', 'encryption',
    'opt-out', 'data deletion', 'right to be forgotten', 'transparency'
  ];

  private laborKeywords = [
    'automation', 'job displacement', 'workers', 'employment', 'labor',
    'human workers', 'job loss', 'reskilling', 'training', 'fair wages',
    'working conditions', 'union', 'collective bargaining', 'benefits'
  ];

  private environmentKeywords = [
    'carbon footprint', 'emissions', 'energy consumption', 'sustainable',
    'green', 'environmental impact', 'climate', 'renewable energy',
    'waste reduction', 'eco-friendly', 'carbon neutral', 'sustainability'
  ];

  private safetyKeywords = [
    'safety', 'risk', 'harmful', 'dangerous', 'bias', 'discrimination',
    'fairness', 'equity', 'inclusive', 'accessible', 'vulnerable',
    'child safety', 'mental health', 'wellbeing', 'security'
  ];

  private transparencyKeywords = [
    'transparency', 'open source', 'audit', 'independent evaluation',
    'peer review', 'third-party', 'verification', 'accountability',
    'explainable', 'interpretable', 'black box', 'algorithmic transparency'
  ];

  private negativeIndicators = [
    'data selling', 'surveillance', 'tracking', 'monitoring',
    'no privacy policy', 'data harvesting', 'behavioral targeting',
    'dark patterns', 'manipulation', 'addiction', 'exploitation'
  ];

  /**
   * Calculate ethics score for story content
   */
  calculateEthicsScore(storyContent: StoryContent, companyData?: CompanyData): EthicsScoreResult {
    const text = `${storyContent.title} ${storyContent.content}`.toLowerCase();
    
    // Calculate individual components
    const privacy = this.calculatePrivacyScore(text, companyData);
    const labor = this.calculateLaborScore(text);
    const environment = this.calculateEnvironmentScore(text);
    const safety = this.calculateSafetyScore(text);
    const transparency = this.calculateTransparencyScore(text, companyData);
    
    // Weighted scoring (1-10 scale)
    const weights = {
      privacy: 0.25,
      labor: 0.20,
      environment: 0.15,
      safety: 0.25,
      transparency: 0.15
    };
    
    const weightedScore = 
      (privacy * weights.privacy) +
      (labor * weights.labor) +
      (environment * weights.environment) +
      (safety * weights.safety) +
      (transparency * weights.transparency);
    
    // Apply negative indicators penalty
    const negativePenalty = this.calculateNegativePenalty(text);
    const finalScore = Math.max(1, weightedScore - negativePenalty);
    
    // Normalize to 1-10 scale
    const score = Math.min(10, Math.max(1, Math.round(finalScore * 10)));
    
    // Calculate confidence
    const confidence = this.calculateConfidence(text, companyData);
    
    // Generate impact tags
    const impactTags = this.generateImpactTags({
      privacy,
      labor,
      environment,
      safety,
      transparency
    });
    
    // Generate reasoning and recommendations
    const reasoning = this.generateReasoning({
      privacy,
      labor,
      environment,
      safety,
      transparency
    }, text, companyData);
    
    const recommendations = this.generateRecommendations({
      privacy,
      labor,
      environment,
      safety,
      transparency
    }, companyData);
    
    return {
      score,
      confidence,
      impactTags,
      breakdown: {
        privacy: Math.round(privacy * 10),
        labor: Math.round(labor * 10),
        environment: Math.round(environment * 10),
        safety: Math.round(safety * 10),
        transparency: Math.round(transparency * 10)
      },
      reasoning,
      recommendations
    };
  }

  /**
   * Calculate privacy score (0-1)
   */
  private calculatePrivacyScore(text: string, companyData?: CompanyData): number {
    let score = 0.5; // Base score
    
    // Positive indicators
    const positiveCount = this.privacyKeywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    score += Math.min(0.3, positiveCount * 0.05);
    
    // Company-specific checks
    if (companyData) {
      if (companyData.privacyPolicyUrl) score += 0.1;
      if (companyData.ethicsStatementUrl) score += 0.1;
      
      // Check for privacy-related sectors
      const privacySectors = ['privacy', 'security', 'data protection'];
      if (companyData.sectorTags.some(tag => 
        privacySectors.some(ps => tag.toLowerCase().includes(ps))
      )) {
        score += 0.1;
      }
    }
    
    return Math.min(1, score);
  }

  /**
   * Calculate labor score (0-1)
   */
  private calculateLaborScore(text: string): number {
    let score = 0.5; // Base score
    
    // Check for labor-related concerns
    const laborCount = this.laborKeywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    // Automation without mitigation is negative
    const automationMention = /automation|automated|ai.*replace/i.test(text);
    const mitigationMention = /reskilling|training|support|transition|mitigation/i.test(text);
    
    if (automationMention && !mitigationMention) {
      score -= 0.3;
    } else if (automationMention && mitigationMention) {
      score += 0.2;
    }
    
    // Positive labor indicators
    if (laborCount > 0) {
      score += Math.min(0.2, laborCount * 0.03);
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate environment score (0-1)
   */
  private calculateEnvironmentScore(text: string): number {
    let score = 0.5; // Base score
    
    const environmentCount = this.environmentKeywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    // Energy consumption concerns
    const energyMention = /energy|power|electricity|compute/i.test(text);
    const efficiencyMention = /efficient|optimize|reduce|minimize/i.test(text);
    
    if (energyMention && efficiencyMention) {
      score += 0.2;
    } else if (energyMention && !efficiencyMention) {
      score -= 0.1;
    }
    
    if (environmentCount > 0) {
      score += Math.min(0.3, environmentCount * 0.05);
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate safety score (0-1)
   */
  private calculateSafetyScore(text: string): number {
    let score = 0.5; // Base score
    
    const safetyCount = this.safetyKeywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    // Bias and discrimination concerns
    const biasMention = /bias|discriminat|unfair|unequal/i.test(text);
    const fairnessMention = /fair|equitable|inclusive|diverse/i.test(text);
    
    if (biasMention && fairnessMention) {
      score += 0.2; // Acknowledging bias and addressing it
    } else if (biasMention && !fairnessMention) {
      score -= 0.3; // Bias without mitigation
    } else if (fairnessMention && !biasMention) {
      score += 0.1; // Proactive fairness
    }
    
    if (safetyCount > 0) {
      score += Math.min(0.2, safetyCount * 0.03);
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate transparency score (0-1)
   */
  private calculateTransparencyScore(text: string, companyData?: CompanyData): number {
    let score = 0.5; // Base score
    
    const transparencyCount = this.transparencyKeywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    // Open source indicators
    const openSourceMention = /open source|open-source|github|public/i.test(text);
    if (openSourceMention) score += 0.2;
    
    // Audit and evaluation mentions
    const auditMention = /audit|evaluation|review|assessment/i.test(text);
    const independentMention = /independent|third-party|external/i.test(text);
    
    if (auditMention && independentMention) {
      score += 0.2;
    } else if (auditMention || independentMention) {
      score += 0.1;
    }
    
    if (transparencyCount > 0) {
      score += Math.min(0.1, transparencyCount * 0.02);
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate negative indicators penalty
   */
  private calculateNegativePenalty(text: string): number {
    const negativeCount = this.negativeIndicators.reduce((count, indicator) => {
      const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    // Each negative indicator reduces score by 0.1
    return Math.min(0.5, negativeCount * 0.1);
  }

  /**
   * Calculate confidence in the score
   */
  private calculateConfidence(text: string, companyData?: CompanyData): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence with content length
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 200) confidence += 0.2;
    if (wordCount > 500) confidence += 0.1;
    
    // Increase confidence with company data
    if (companyData) {
      confidence += 0.1;
      if (companyData.ethicsStatementUrl) confidence += 0.1;
      if (companyData.privacyPolicyUrl) confidence += 0.1;
    }
    
    // Decrease confidence if very short content
    if (wordCount < 100) {
      confidence -= 0.2;
    }
    
    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Generate impact tags based on scores
   */
  private generateImpactTags(breakdown: any): string[] {
    const tags: string[] = [];
    
    if (breakdown.privacy > 0.7) tags.push('privacy-positive');
    else if (breakdown.privacy < 0.3) tags.push('privacy-concern');
    
    if (breakdown.labor > 0.7) tags.push('labor-positive');
    else if (breakdown.labor < 0.3) tags.push('labor-concern');
    
    if (breakdown.environment > 0.7) tags.push('environment-positive');
    else if (breakdown.environment < 0.3) tags.push('environment-concern');
    
    if (breakdown.safety > 0.7) tags.push('safety-positive');
    else if (breakdown.safety < 0.3) tags.push('safety-concern');
    
    if (breakdown.transparency > 0.7) tags.push('transparency-positive');
    else if (breakdown.transparency < 0.3) tags.push('transparency-concern');
    
    return tags;
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(breakdown: any, text: string, companyData?: CompanyData): string[] {
    const reasoning: string[] = [];
    
    if (breakdown.privacy > 0.7) {
      reasoning.push('Strong privacy protections mentioned');
    } else if (breakdown.privacy < 0.3) {
      reasoning.push('Privacy concerns or lack of privacy measures');
    }
    
    if (breakdown.labor > 0.7) {
      reasoning.push('Positive labor practices or worker support mentioned');
    } else if (breakdown.labor < 0.3) {
      reasoning.push('Labor concerns or automation without mitigation');
    }
    
    if (breakdown.environment > 0.7) {
      reasoning.push('Environmental sustainability considerations present');
    } else if (breakdown.environment < 0.3) {
      reasoning.push('Limited environmental considerations');
    }
    
    if (breakdown.safety > 0.7) {
      reasoning.push('Strong safety and fairness measures');
    } else if (breakdown.safety < 0.3) {
      reasoning.push('Safety or fairness concerns identified');
    }
    
    if (breakdown.transparency > 0.7) {
      reasoning.push('High transparency and accountability measures');
    } else if (breakdown.transparency < 0.3) {
      reasoning.push('Limited transparency or accountability');
    }
    
    // Company-specific reasoning
    if (companyData) {
      if (companyData.privacyPolicyUrl) {
        reasoning.push('Company has privacy policy available');
      }
      if (companyData.ethicsStatementUrl) {
        reasoning.push('Company has ethics statement available');
      }
    }
    
    return reasoning;
  }

  /**
   * Generate recommendations for improvement
   */
  private generateRecommendations(breakdown: any, companyData?: CompanyData): string[] {
    const recommendations: string[] = [];
    
    if (breakdown.privacy < 0.5) {
      recommendations.push('Consider implementing stronger privacy protections');
    }
    
    if (breakdown.labor < 0.5) {
      recommendations.push('Address potential labor displacement with training programs');
    }
    
    if (breakdown.environment < 0.5) {
      recommendations.push('Implement environmental sustainability measures');
    }
    
    if (breakdown.safety < 0.5) {
      recommendations.push('Strengthen safety measures and bias mitigation');
    }
    
    if (breakdown.transparency < 0.5) {
      recommendations.push('Increase transparency and allow independent audits');
    }
    
    if (!companyData?.privacyPolicyUrl) {
      recommendations.push('Publish a clear privacy policy');
    }
    
    if (!companyData?.ethicsStatementUrl) {
      recommendations.push('Create and publish an ethics statement');
    }
    
    return recommendations;
  }

  /**
   * Get ethics level description
   */
  getEthicsLevelDescription(score: number): string {
    if (score >= 8) return 'Excellent Ethics';
    if (score >= 6) return 'Good Ethics';
    if (score >= 4) return 'Moderate Ethics';
    if (score >= 2) return 'Poor Ethics';
    return 'Very Poor Ethics';
  }

  /**
   * Check if content raises red flags
   */
  hasRedFlags(storyContent: StoryContent): boolean {
    const text = `${storyContent.title} ${storyContent.content}`.toLowerCase();
    
    const redFlagPatterns = [
      /data selling/i,
      /surveillance/i,
      /no privacy/i,
      /tracking without consent/i,
      /manipulation/i,
      /addiction/i,
      /exploitation/i
    ];
    
    return redFlagPatterns.some(pattern => pattern.test(text));
  }
}


