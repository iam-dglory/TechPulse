/**
 * Industry Impact Mapping Configuration
 * Maps industries to relevant tech sectors and impact tags for personalized recommendations
 */

export interface IndustryMapping {
  sectors: string[];
  impactTags: string[];
  riskFactors: string[];
  threshold: number; // Minimum impact score threshold for recommendations
}

export interface TechImpact {
  tech: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number; // 1-10 scale
  description: string;
}

export interface IndustryProfile {
  industry: string;
  mapping: IndustryMapping;
  techImpacts: TechImpact[];
}

// Industry to tech sector and impact tag mappings
export const INDUSTRY_IMPACT_MAP: Record<string, IndustryProfile> = {
  'customer-service': {
    industry: 'Customer Service',
    mapping: {
      sectors: ['AI', 'Automation', 'Chatbots', 'Natural Language Processing', 'Sentiment Analysis'],
      impactTags: ['automation', 'ai-tools', 'job-displacement', 'productivity', 'customer-experience'],
      riskFactors: ['job-automation', 'skill-obsolescence', 'workload-increase'],
      threshold: 6.0, // Medium-high impact threshold
    },
    techImpacts: [
      { tech: 'Chatbots', impact: 'negative', weight: 8, description: 'High risk of job displacement' },
      { tech: 'AI Analytics', impact: 'negative', weight: 6, description: 'Moderate automation risk' },
      { tech: 'Sentiment Analysis', impact: 'positive', weight: 4, description: 'Can improve service quality' },
      { tech: 'CRM Systems', impact: 'neutral', weight: 3, description: 'Supporting tool, low displacement risk' },
    ],
  },
  
  'healthcare': {
    industry: 'Healthcare',
    mapping: {
      sectors: ['Healthcare AI', 'Medical Imaging', 'Diagnostics', 'Telemedicine', 'Health Data'],
      impactTags: ['healthcare-ai', 'medical-diagnostics', 'patient-privacy', 'medical-ethics', 'health-data'],
      riskFactors: ['medical-errors', 'privacy-breaches', 'diagnostic-automation'],
      threshold: 7.0, // High impact threshold due to safety concerns
    },
    techImpacts: [
      { tech: 'Diagnostic AI', impact: 'positive', weight: 7, description: 'Can improve diagnostic accuracy' },
      { tech: 'Medical Imaging AI', impact: 'positive', weight: 6, description: 'Enhances diagnostic capabilities' },
      { tech: 'Health Data Analytics', impact: 'negative', weight: 8, description: 'High privacy and security risks' },
      { tech: 'Telemedicine', impact: 'neutral', weight: 5, description: 'Moderate impact on practice patterns' },
    ],
  },
  
  'education': {
    industry: 'Education',
    mapping: {
      sectors: ['EdTech', 'AI Tutoring', 'Personalized Learning', 'Assessment Tools', 'Learning Analytics'],
      impactTags: ['edtech', 'personalized-learning', 'student-privacy', 'educational-equity', 'assessment-automation'],
      riskFactors: ['student-privacy', 'educational-equity', 'teacher-automation'],
      threshold: 6.5, // Medium-high threshold for educational impact
    },
    techImpacts: [
      { tech: 'AI Tutoring', impact: 'positive', weight: 6, description: 'Can personalize learning experiences' },
      { tech: 'Assessment Automation', impact: 'negative', weight: 7, description: 'May reduce teacher roles' },
      { tech: 'Learning Analytics', impact: 'neutral', weight: 4, description: 'Supporting tool for insights' },
      { tech: 'VR/AR Learning', impact: 'positive', weight: 5, description: 'Enhanced learning experiences' },
    ],
  },
  
  'finance': {
    industry: 'Finance',
    mapping: {
      sectors: ['FinTech', 'Blockchain', 'Cryptocurrency', 'Algorithmic Trading', 'Risk Assessment'],
      impactTags: ['fintech', 'cryptocurrency', 'algorithmic-trading', 'financial-privacy', 'risk-assessment'],
      riskFactors: ['financial-stability', 'data-security', 'regulatory-compliance'],
      threshold: 8.0, // Very high threshold due to financial system impact
    },
    techImpacts: [
      { tech: 'Algorithmic Trading', impact: 'negative', weight: 9, description: 'High market disruption risk' },
      { tech: 'Cryptocurrency', impact: 'negative', weight: 8, description: 'Financial system instability' },
      { tech: 'AI Risk Assessment', impact: 'positive', weight: 6, description: 'Can improve risk management' },
      { tech: 'Blockchain', impact: 'neutral', weight: 5, description: 'Moderate impact on processes' },
    ],
  },
  
  'technology': {
    industry: 'Technology',
    mapping: {
      sectors: ['AI', 'Machine Learning', 'Cloud Computing', 'Cybersecurity', 'Software Development'],
      impactTags: ['ai-development', 'automation', 'cybersecurity', 'software-engineering', 'tech-ethics'],
      riskFactors: ['skill-obsolescence', 'automation-displacement', 'ethical-ai-development'],
      threshold: 7.5, // High threshold for tech industry
    },
    techImpacts: [
      { tech: 'AI Development', impact: 'positive', weight: 8, description: 'Core skill for tech workers' },
      { tech: 'Automation Tools', impact: 'negative', weight: 7, description: 'May reduce manual coding needs' },
      { tech: 'Cybersecurity', impact: 'positive', weight: 9, description: 'High demand skill' },
      { tech: 'Cloud Computing', impact: 'neutral', weight: 6, description: 'Infrastructure evolution' },
    ],
  },
  
  'retail': {
    industry: 'Retail',
    mapping: {
      sectors: ['E-commerce', 'Retail AI', 'Supply Chain', 'Inventory Management', 'Customer Analytics'],
      impactTags: ['e-commerce', 'retail-automation', 'supply-chain', 'customer-analytics', 'inventory-management'],
      riskFactors: ['job-automation', 'supply-chain-disruption', 'customer-privacy'],
      threshold: 6.0, // Medium-high threshold
    },
    techImpacts: [
      { tech: 'E-commerce Platforms', impact: 'positive', weight: 7, description: 'Expands market reach' },
      { tech: 'Retail Automation', impact: 'negative', weight: 8, description: 'High job displacement risk' },
      { tech: 'Supply Chain AI', impact: 'positive', weight: 6, description: 'Improves efficiency' },
      { tech: 'Customer Analytics', impact: 'neutral', weight: 5, description: 'Moderate impact on operations' },
    ],
  },
  
  'manufacturing': {
    industry: 'Manufacturing',
    mapping: {
      sectors: ['Industrial Automation', 'IoT', 'Robotics', 'Predictive Maintenance', 'Smart Manufacturing'],
      impactTags: ['industrial-automation', 'robotics', 'iot', 'predictive-maintenance', 'smart-manufacturing'],
      riskFactors: ['job-automation', 'safety-risks', 'skill-obsolescence'],
      threshold: 8.5, // Very high threshold due to automation impact
    },
    techImpacts: [
      { tech: 'Industrial Robotics', impact: 'negative', weight: 9, description: 'Very high job displacement risk' },
      { tech: 'IoT Sensors', impact: 'positive', weight: 6, description: 'Improves monitoring and efficiency' },
      { tech: 'Predictive Maintenance', impact: 'positive', weight: 7, description: 'Reduces downtime and costs' },
      { tech: 'Smart Manufacturing', impact: 'negative', weight: 8, description: 'Significant automation impact' },
    ],
  },
  
  'transportation': {
    industry: 'Transportation',
    mapping: {
      sectors: ['Autonomous Vehicles', 'Logistics AI', 'Traffic Management', 'Electric Vehicles', 'Fleet Management'],
      impactTags: ['autonomous-vehicles', 'logistics-ai', 'traffic-management', 'electric-vehicles', 'fleet-management'],
      riskFactors: ['job-automation', 'safety-concerns', 'infrastructure-changes'],
      threshold: 8.0, // Very high threshold due to automation
    },
    techImpacts: [
      { tech: 'Autonomous Vehicles', impact: 'negative', weight: 9, description: 'Very high job displacement risk' },
      { tech: 'Logistics AI', impact: 'negative', weight: 8, description: 'High automation potential' },
      { tech: 'Electric Vehicles', impact: 'neutral', weight: 6, description: 'Moderate skill transition needed' },
      { tech: 'Traffic Management AI', impact: 'positive', weight: 7, description: 'Can improve safety and efficiency' },
    ],
  },
  
  'government': {
    industry: 'Government',
    mapping: {
      sectors: ['Digital Government', 'Public Safety AI', 'Administrative Automation', 'Data Analytics', 'Cybersecurity'],
      impactTags: ['digital-government', 'public-safety-ai', 'administrative-automation', 'government-data', 'public-privacy'],
      riskFactors: ['citizen-privacy', 'administrative-automation', 'public-trust'],
      threshold: 7.0, // High threshold due to public impact
    },
    techImpacts: [
      { tech: 'Administrative AI', impact: 'negative', weight: 7, description: 'May reduce administrative jobs' },
      { tech: 'Public Safety AI', impact: 'positive', weight: 8, description: 'Can improve public safety' },
      { tech: 'Government Analytics', impact: 'neutral', weight: 6, description: 'Policy and decision support' },
      { tech: 'Cybersecurity', impact: 'positive', weight: 9, description: 'Critical for government security' },
    ],
  },
  
  'non-profit': {
    industry: 'Non-Profit',
    mapping: {
      sectors: ['Social Impact Tech', 'Donor Analytics', 'Volunteer Management', 'Fundraising AI', 'Impact Measurement'],
      impactTags: ['social-impact-tech', 'donor-analytics', 'volunteer-management', 'fundraising-ai', 'impact-measurement'],
      riskFactors: ['mission-drift', 'donor-privacy', 'volunteer-automation'],
      threshold: 5.5, // Medium threshold
    },
    techImpacts: [
      { tech: 'Donor Analytics', impact: 'positive', weight: 7, description: 'Can improve fundraising effectiveness' },
      { tech: 'Volunteer Management', impact: 'neutral', weight: 5, description: 'Moderate impact on operations' },
      { tech: 'Impact Measurement', impact: 'positive', weight: 8, description: 'Better outcome tracking' },
      { tech: 'Fundraising AI', impact: 'neutral', weight: 6, description: 'Mixed impact on donor relationships' },
    ],
  },
  
  'freelance': {
    industry: 'Freelance',
    mapping: {
      sectors: ['Freelance Platforms', 'AI Tools', 'Remote Work', 'Project Management', 'Digital Marketing'],
      impactTags: ['freelance-platforms', 'ai-tools', 'remote-work', 'project-management', 'digital-marketing'],
      riskFactors: ['platform-dependency', 'skill-obsolescence', 'market-saturation'],
      threshold: 6.0, // Medium-high threshold
    },
    techImpacts: [
      { tech: 'AI Content Tools', impact: 'negative', weight: 7, description: 'May reduce content creation demand' },
      { tech: 'Freelance Platforms', impact: 'positive', weight: 6, description: 'Access to more opportunities' },
      { tech: 'Remote Work Tools', impact: 'positive', weight: 8, description: 'Enables more flexible work' },
      { tech: 'Project Management AI', impact: 'neutral', weight: 5, description: 'Mixed impact on project efficiency' },
    ],
  },
};

/**
 * Get industry mapping by industry key
 */
export function getIndustryMapping(industryKey: string): IndustryProfile | null {
  const normalizedKey = industryKey.toLowerCase().replace(/\s+/g, '-');
  return INDUSTRY_IMPACT_MAP[normalizedKey] || null;
}

/**
 * Calculate impact score for a story based on industry mapping
 */
export function calculateIndustryImpactScore(
  story: {
    impactTags: string[];
    sectorTag: string;
    hypeScore: number;
    ethicsScore: number;
  },
  industryKey: string
): number {
  const mapping = getIndustryMapping(industryKey);
  if (!mapping) {
    return 0; // No mapping found, no impact
  }

  let score = 0;
  let weight = 0;

  // Check sector match
  if (mapping.mapping.sectors.includes(story.sectorTag)) {
    score += 3; // High weight for sector match
    weight += 3;
  }

  // Check impact tag matches
  const matchingTags = story.impactTags.filter(tag => 
    mapping.mapping.impactTags.includes(tag)
  );
  
  if (matchingTags.length > 0) {
    score += matchingTags.length * 2; // Medium weight for each matching tag
    weight += matchingTags.length * 2;
  }

  // Factor in story scores
  const avgScore = (story.hypeScore + story.ethicsScore) / 2;
  if (weight > 0) {
    score += (avgScore / 10) * weight * 0.5; // Scale story scores
    weight += weight * 0.5;
  }

  // Return normalized score (0-10)
  return weight > 0 ? Math.min(10, (score / weight) * 10) : 0;
}

/**
 * Check if story meets recommendation threshold for industry
 */
export function meetsRecommendationThreshold(
  story: {
    impactTags: string[];
    sectorTag: string;
    hypeScore: number;
    ethicsScore: number;
  },
  industryKey: string
): boolean {
  const mapping = getIndustryMapping(industryKey);
  if (!mapping) {
    return false;
  }

  const impactScore = calculateIndustryImpactScore(story, industryKey);
  return impactScore >= mapping.mapping.threshold;
}

/**
 * Get all supported industries
 */
export function getSupportedIndustries(): string[] {
  return Object.keys(INDUSTRY_IMPACT_MAP);
}

/**
 * Get risk factors for an industry
 */
export function getIndustryRiskFactors(industryKey: string): string[] {
  const mapping = getIndustryMapping(industryKey);
  return mapping?.mapping.riskFactors || [];
}

/**
 * Get tech impacts for an industry
 */
export function getIndustryTechImpacts(industryKey: string): TechImpact[] {
  const mapping = getIndustryMapping(industryKey);
  return mapping?.techImpacts || [];
}

