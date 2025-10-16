import { Request, Response } from 'express';
import { AppDataSource } from '../../ormconfig';
import { Company } from '../models/company';
import { Story } from '../models/story';
import { eventTracker } from '../services/analytics/eventTracker';

export class PremiumCompanyController {
  /**
   * Get enhanced company profile with premium features
   */
  static async getPremiumProfile(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { includeAnalytics = false, includeCompetitors = false } = req.query;

      const company = await AppDataSource.getRepository(Company).findOne({
        where: { id: companyId },
        relations: ['products']
      });

      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Get comprehensive data
      const [
        recentStories,
        totalStories,
        competitorAnalysis,
        analyticsData,
        accountabilityMetrics
      ] = await Promise.all([
        this.getRecentStories(companyId),
        this.getTotalStories(companyId),
        includeCompetitors === 'true' ? this.getCompetitorAnalysis(company) : null,
        includeAnalytics === 'true' ? this.getAnalyticsData(companyId) : null,
        this.getAccountabilityMetrics(companyId)
      ]);

      const premiumProfile = {
        company: {
          ...company,
          isPremium: true
        },
        metrics: {
          totalStories: totalStories.length,
          recentStories: recentStories.length,
          avgHypeScore: this.calculateAverage(recentStories.map(s => s.hypeScore)),
          avgEthicsScore: this.calculateAverage(recentStories.map(s => s.ethicsScore)),
          credibilityTrend: this.calculateCredibilityTrend(totalStories),
          accountabilityScore: accountabilityMetrics.overallScore,
          promiseAccuracy: accountabilityMetrics.promiseAccuracy,
          communityTrust: accountabilityMetrics.communityTrust
        },
        insights: this.generateInsights(company, recentStories, accountabilityMetrics),
        ...(competitorAnalysis && { competitorAnalysis }),
        ...(analyticsData && { analytics: analyticsData }),
        accountabilityMetrics
      };

      await eventTracker.trackPremiumProfileViewed(company, {
        includeAnalytics: includeAnalytics === 'true',
        includeCompetitors: includeCompetitors === 'true'
      });

      res.json({
        success: true,
        profile: premiumProfile
      });
    } catch (error) {
      console.error('Get premium profile error:', error);
      res.status(500).json({ error: 'Failed to get premium profile' });
    }
  }

  /**
   * Generate company insights report
   */
  static async generateInsightsReport(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { timeframe = '6months' } = req.query;

      const company = await AppDataSource.getRepository(Company).findOne({
        where: { id: companyId }
      });

      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      const dateFilter = this.getDateFilter(timeframe as string);
      
      const stories = await AppDataSource.getRepository(Story).find({
        where: {
          companyId,
          publishedAt: dateFilter
        },
        order: { publishedAt: 'DESC' }
      });

      const insights = {
        executiveSummary: this.generateExecutiveSummary(company, stories),
        riskAssessment: this.generateRiskAssessment(company, stories),
        opportunities: this.identifyOpportunities(company, stories),
        recommendations: this.generateRecommendations(company, stories),
        marketPosition: this.analyzeMarketPosition(company, stories),
        stakeholderImpact: this.analyzeStakeholderImpact(company, stories)
      };

      await eventTracker.trackInsightsReportGenerated(company, {
        timeframe,
        storyCount: stories.length
      });

      res.json({
        success: true,
        report: {
          companyId,
          companyName: company.name,
          timeframe,
          generatedAt: new Date().toISOString(),
          insights
        }
      });
    } catch (error) {
      console.error('Generate insights report error:', error);
      res.status(500).json({ error: 'Failed to generate insights report' });
    }
  }

  /**
   * Get company dashboard data
   */
  static async getDashboardData(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const { period = '30days' } = req.query;

      const company = await AppDataSource.getRepository(Company).findOne({
        where: { id: companyId }
      });

      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      const dateFilter = this.getDateFilter(period as string);

      const [
        stories,
        voteData,
        sentimentData,
        competitorActivity
      ] = await Promise.all([
        this.getStoriesInPeriod(companyId, dateFilter),
        this.getVoteData(companyId, dateFilter),
        this.getSentimentData(companyId, dateFilter),
        this.getCompetitorActivity(company.sectorTags, dateFilter)
      ]);

      const dashboard = {
        overview: {
          totalStories: stories.length,
          avgHypeScore: this.calculateAverage(stories.map(s => s.hypeScore)),
          avgEthicsScore: this.calculateAverage(stories.map(s => s.ethicsScore)),
          communityEngagement: voteData.totalVotes,
          sentimentTrend: sentimentData.trend
        },
        charts: {
          scoreTrend: this.generateScoreTrend(stories),
          sentimentOverTime: sentimentData.overTime,
          competitorComparison: competitorActivity
        },
        alerts: this.generateAlerts(company, stories, voteData),
        quickActions: this.getQuickActions(company)
      };

      res.json({
        success: true,
        dashboard
      });
    } catch (error) {
      console.error('Get dashboard data error:', error);
      res.status(500).json({ error: 'Failed to get dashboard data' });
    }
  }

  /**
   * Update company profile (premium feature)
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const updateData = req.body;

      const company = await AppDataSource.getRepository(Company).findOne({
        where: { id: companyId }
      });

      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Update allowed fields
      const allowedFields = [
        'name', 'website', 'sectorTags', 'hqLocation',
        'ethicsStatementUrl', 'privacyPolicyUrl', 'products'
      ];

      const updateFields = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields[field] = updateData[field];
        }
      });

      Object.assign(company, updateFields);
      const updatedCompany = await AppDataSource.getRepository(Company).save(company);

      await eventTracker.trackCompanyProfileUpdated(updatedCompany, {
        updatedFields: Object.keys(updateFields)
      });

      res.json({
        success: true,
        company: updatedCompany
      });
    } catch (error) {
      console.error('Update company profile error:', error);
      res.status(500).json({ error: 'Failed to update company profile' });
    }
  }

  // Helper methods
  private static async getRecentStories(companyId: string, limit = 10) {
    return AppDataSource.getRepository(Story).find({
      where: { companyId },
      order: { publishedAt: 'DESC' },
      take: limit
    });
  }

  private static async getTotalStories(companyId: string) {
    return AppDataSource.getRepository(Story).find({
      where: { companyId },
      order: { publishedAt: 'ASC' }
    });
  }

  private static async getAccountabilityMetrics(companyId: string) {
    const stories = await this.getTotalStories(companyId);
    
    // Calculate various metrics
    const avgHypeScore = this.calculateAverage(stories.map(s => s.hypeScore));
    const avgEthicsScore = this.calculateAverage(stories.map(s => s.ethicsScore));
    
    // Get graveyard entries (failed promises)
    const graveyardEntries = await AppDataSource.query(`
      SELECT COUNT(*) as count
      FROM graveyard_entry
      WHERE company_id = $1
    `, [companyId]);

    const failedPromises = parseInt(graveyardEntries[0]?.count || '0');
    const totalPromises = stories.length;
    const promiseAccuracy = totalPromises > 0 ? ((totalPromises - failedPromises) / totalPromises) * 100 : 100;

    return {
      overallScore: (avgHypeScore + avgEthicsScore + promiseAccuracy / 10) / 3,
      promiseAccuracy,
      communityTrust: avgEthicsScore,
      failedPromises,
      totalPromises,
      lastVerified: new Date()
    };
  }

  private static async getCompetitorAnalysis(company: Company) {
    const competitors = await AppDataSource.getRepository(Company).find({
      where: { sectorTags: company.sectorTags[0] },
      order: { credibilityScore: 'DESC' },
      take: 5
    });

    return {
      competitors: competitors.filter(c => c.id !== company.id),
      marketPosition: this.calculateMarketPosition(company, competitors),
      competitiveAdvantages: this.identifyCompetitiveAdvantages(company, competitors)
    };
  }

  private static async getAnalyticsData(companyId: string) {
    // This would integrate with analytics providers
    return {
      profileViews: 1250,
      storyEngagement: 340,
      shareRate: 0.15,
      demographics: {
        topCountries: ['US', 'UK', 'DE'],
        topIndustries: ['Technology', 'Finance', 'Healthcare']
      }
    };
  }

  private static calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  private static calculateCredibilityTrend(stories: Story[]): 'improving' | 'stable' | 'declining' {
    if (stories.length < 6) return 'stable';
    
    const recent = stories.slice(-3);
    const older = stories.slice(-6, -3);
    
    const recentAvg = this.calculateAverage(recent.map(s => s.ethicsScore));
    const olderAvg = this.calculateAverage(older.map(s => s.ethicsScore));
    
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  }

  private static generateInsights(company: Company, stories: Story[], metrics: any) {
    return {
      strengths: this.identifyStrengths(company, stories),
      concerns: this.identifyConcerns(company, stories, metrics),
      opportunities: this.identifyOpportunities(company, stories),
      trends: this.identifyTrends(stories)
    };
  }

  private static generateExecutiveSummary(company: Company, stories: Story[]) {
    const avgEthics = this.calculateAverage(stories.map(s => s.ethicsScore));
    const avgHype = this.calculateAverage(stories.map(s => s.hypeScore));
    
    return `${company.name} demonstrates ${avgEthics > 7 ? 'strong' : avgEthics > 5 ? 'moderate' : 'weak'} ethics standards with a score of ${avgEthics.toFixed(1)}/10. The company's marketing approach shows ${avgHype > 7 ? 'high' : avgHype > 5 ? 'moderate' : 'low'} hype levels at ${avgHype.toFixed(1)}/10. Recent community sentiment suggests ${avgEthics > avgHype ? 'trustworthy practices' : 'potential overpromising'}.`;
  }

  private static generateRiskAssessment(company: Company, stories: Story[]) {
    const risks = [];
    
    const avgEthics = this.calculateAverage(stories.map(s => s.ethicsScore));
    const avgHype = this.calculateAverage(stories.map(s => s.hypeScore));
    
    if (avgHype > avgEthics + 2) {
      risks.push({
        level: 'HIGH',
        category: 'Overpromising',
        description: 'High marketing claims may not align with ethical practices'
      });
    }
    
    if (avgEthics < 4) {
      risks.push({
        level: 'HIGH',
        category: 'Ethics',
        description: 'Low ethics scores indicate potential compliance issues'
      });
    }
    
    if (stories.length < 5) {
      risks.push({
        level: 'MEDIUM',
        category: 'Transparency',
        description: 'Limited public information available for assessment'
      });
    }
    
    return risks;
  }

  private static identifyOpportunities(company: Company, stories: Story[]) {
    return [
      'Improve transparency by publishing detailed ethics statements',
      'Engage more actively with community feedback',
      'Provide regular updates on previous commitments',
      'Consider third-party audits for credibility verification'
    ];
  }

  private static generateRecommendations(company: Company, stories: Story[]) {
    const recommendations = [];
    
    if (!company.ethicsStatementUrl) {
      recommendations.push('Publish a comprehensive ethics statement');
    }
    
    if (!company.privacyPolicyUrl) {
      recommendations.push('Ensure privacy policy is publicly accessible');
    }
    
    const avgEthics = this.calculateAverage(stories.map(s => s.ethicsScore));
    if (avgEthics < 6) {
      recommendations.push('Address community concerns about ethical practices');
    }
    
    return recommendations;
  }

  private static analyzeMarketPosition(company: Company, stories: Story[]) {
    return {
      position: 'Emerging Leader', // This would be calculated based on competitor analysis
      marketShare: '5-10%', // Estimated
      growthPotential: 'High',
      competitiveAdvantages: ['Strong community trust', 'Transparent practices']
    };
  }

  private static analyzeStakeholderImpact(company: Company, stories: Story[]) {
    return {
      employees: 'Positive - Good workplace practices',
      customers: 'Positive - Strong privacy protection',
      investors: 'Stable - Consistent performance',
      community: 'Mixed - Some concerns about transparency'
    };
  }

  private static getDateFilter(period: string): any {
    const now = new Date();
    switch (period) {
      case '7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '6months':
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case '1year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private static async getStoriesInPeriod(companyId: string, dateFilter: any) {
    return AppDataSource.getRepository(Story).find({
      where: {
        companyId,
        publishedAt: dateFilter
      },
      order: { publishedAt: 'DESC' }
    });
  }

  private static async getVoteData(companyId: string, dateFilter: any) {
    // This would query vote data for the company's stories
    return {
      totalVotes: 150,
      positiveVotes: 120,
      negativeVotes: 20,
      neutralVotes: 10
    };
  }

  private static async getSentimentData(companyId: string, dateFilter: any) {
    // This would analyze sentiment from comments and votes
    return {
      trend: 'improving',
      overTime: [
        { date: '2024-01-01', sentiment: 0.7 },
        { date: '2024-01-15', sentiment: 0.75 },
        { date: '2024-02-01', sentiment: 0.8 }
      ]
    };
  }

  private static async getCompetitorActivity(sectorTags: string[], dateFilter: any) {
    // This would get competitor activity data
    return [
      { name: 'Competitor A', activity: 15, ethicsScore: 7.2 },
      { name: 'Competitor B', activity: 12, ethicsScore: 6.8 },
      { name: 'Competitor C', activity: 8, ethicsScore: 8.1 }
    ];
  }

  private static generateScoreTrend(stories: Story[]) {
    return stories.map(story => ({
      date: story.publishedAt,
      hypeScore: story.hypeScore,
      ethicsScore: story.ethicsScore
    }));
  }

  private static generateAlerts(company: Company, stories: Story[], voteData: any) {
    const alerts = [];
    
    if (stories.length === 0) {
      alerts.push({
        type: 'warning',
        message: 'No recent activity detected'
      });
    }
    
    const avgEthics = this.calculateAverage(stories.map(s => s.ethicsScore));
    if (avgEthics < 4) {
      alerts.push({
        type: 'critical',
        message: 'Low ethics scores require attention'
      });
    }
    
    return alerts;
  }

  private static getQuickActions(company: Company) {
    return [
      { label: 'Update Profile', action: 'update_profile' },
      { label: 'View Analytics', action: 'view_analytics' },
      { label: 'Export Report', action: 'export_report' },
      { label: 'Contact Support', action: 'contact_support' }
    ];
  }

  private static identifyStrengths(company: Company, stories: Story[]) {
    const strengths = [];
    
    if (company.verified) {
      strengths.push('Verified company status');
    }
    
    if (company.ethicsStatementUrl) {
      strengths.push('Published ethics statement');
    }
    
    const avgEthics = this.calculateAverage(stories.map(s => s.ethicsScore));
    if (avgEthics > 7) {
      strengths.push('Strong ethics scores');
    }
    
    return strengths;
  }

  private static identifyConcerns(company: Company, stories: Story[], metrics: any) {
    const concerns = [];
    
    if (metrics.promiseAccuracy < 70) {
      concerns.push('Below-average promise accuracy');
    }
    
    if (!company.privacyPolicyUrl) {
      concerns.push('No publicly accessible privacy policy');
    }
    
    return concerns;
  }

  private static identifyTrends(stories: Story[]) {
    if (stories.length < 3) return ['Insufficient data for trend analysis'];
    
    const recent = stories.slice(0, 3);
    const older = stories.slice(3, 6);
    
    const recentAvgEthics = this.calculateAverage(recent.map(s => s.ethicsScore));
    const olderAvgEthics = this.calculateAverage(older.map(s => s.ethicsScore));
    
    const trends = [];
    if (recentAvgEthics > olderAvgEthics + 0.5) {
      trends.push('Improving ethics scores');
    } else if (recentAvgEthics < olderAvgEthics - 0.5) {
      trends.push('Declining ethics scores');
    }
    
    return trends;
  }

  private static calculateMarketPosition(company: Company, competitors: Company[]) {
    const sortedCompetitors = competitors.sort((a, b) => b.credibilityScore - a.credibilityScore);
    const companyRank = sortedCompetitors.findIndex(c => c.id === company.id) + 1;
    
    if (companyRank <= 2) return 'Market Leader';
    if (companyRank <= 5) return 'Strong Competitor';
    return 'Emerging Player';
  }

  private static identifyCompetitiveAdvantages(company: Company, competitors: Company[]) {
    const advantages = [];
    
    if (company.credibilityScore > competitors[0]?.credibilityScore) {
      advantages.push('Highest credibility score in sector');
    }
    
    if (company.verified && !competitors.every(c => c.verified)) {
      advantages.push('Verified company status');
    }
    
    return advantages;
  }
}


