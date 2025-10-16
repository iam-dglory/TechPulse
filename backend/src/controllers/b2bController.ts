import { Request, Response } from 'express';
import { AppDataSource } from '../../ormconfig';
import { Company } from '../models/company';
import { Story } from '../models/story';
import { User } from '../models/user';
import { eventTracker } from '../services/analytics/eventTracker';

export class B2BController {
  /**
   * Vendor Risk Assessment API
   * Provides risk scores for procurement teams
   */
  static async getVendorRiskAssessment(req: Request, res: Response) {
    try {
      const { companyIds, includeHistorical = true } = req.body;

      if (!companyIds || !Array.isArray(companyIds)) {
        return res.status(400).json({ error: 'Company IDs array is required' });
      }

      const companies = await AppDataSource.getRepository(Company).find({
        where: companyIds.map(id => ({ id })),
        relations: ['products']
      });

      const riskAssessments = await Promise.all(
        companies.map(async (company) => {
          // Get recent stories about this company
          const recentStories = await AppDataSource.getRepository(Story).find({
            where: { companyId: company.id },
            order: { publishedAt: 'DESC' },
            take: 10
          });

          // Calculate risk metrics
          const avgEthicsScore = recentStories.length > 0 
            ? recentStories.reduce((sum, story) => sum + story.ethicsScore, 0) / recentStories.length
            : 5;

          const avgHypeScore = recentStories.length > 0
            ? recentStories.reduce((sum, story) => sum + story.hypeScore, 0) / recentStories.length
            : 5;

          const accuracyScore = this.calculateAccuracyScore(recentStories);
          const riskScore = this.calculateRiskScore(avgEthicsScore, avgHypeScore, accuracyScore);

          // Get compliance indicators
          const complianceIndicators = {
            hasPrivacyPolicy: !!company.privacyPolicyUrl,
            hasEthicsStatement: !!company.ethicsStatementUrl,
            isVerified: company.verified,
            fundingStage: company.fundingStage,
            credibilityScore: company.credibilityScore || 5
          };

          return {
            companyId: company.id,
            companyName: company.name,
            riskScore: Math.round(riskScore * 100) / 100,
            riskLevel: this.getRiskLevel(riskScore),
            metrics: {
              ethicsScore: Math.round(avgEthicsScore * 100) / 100,
              hypeScore: Math.round(avgHypeScore * 100) / 100,
              accuracyScore: Math.round(accuracyScore * 100) / 100,
              credibilityScore: company.credibilityScore || 5
            },
            complianceIndicators,
            recentActivity: {
              storyCount: recentStories.length,
              lastActivity: recentStories[0]?.publishedAt || null
            },
            recommendations: this.generateRecommendations(riskScore, complianceIndicators)
          };
        })
      );

      // Track B2B API usage
      await eventTracker.trackB2BApiUsed('vendor_risk_assessment', {
        companyCount: companyIds.length,
        includeHistorical
      });

      res.json({
        success: true,
        assessment: {
          timestamp: new Date().toISOString(),
          totalCompanies: companies.length,
          riskAssessments,
          summary: this.generateSummary(riskAssessments)
        }
      });
    } catch (error) {
      console.error('Vendor risk assessment error:', error);
      res.status(500).json({ error: 'Failed to generate vendor risk assessment' });
    }
  }

  /**
   * Competitive Intelligence API
   * Provides market insights for investors and analysts
   */
  static async getCompetitiveIntelligence(req: Request, res: Response) {
    try {
      const { sector, timeframe = '6months', includePredictions = true } = req.query;

      if (!sector) {
        return res.status(400).json({ error: 'Sector parameter is required' });
      }

      const dateFilter = this.getDateFilter(timeframe as string);

      // Get companies in sector
      const companies = await AppDataSource.getRepository(Company).find({
        where: { sectorTags: sector },
        order: { credibilityScore: 'DESC' }
      });

      // Get stories in timeframe
      const stories = await AppDataSource.getRepository(Story).find({
        where: {
          sectorTag: sector,
          publishedAt: dateFilter
        },
        relations: ['company'],
        order: { publishedAt: 'DESC' }
      });

      // Analyze market trends
      const marketAnalysis = this.analyzeMarketTrends(companies, stories);

      // Generate predictions if requested
      let predictions = null;
      if (includePredictions === 'true') {
        predictions = await this.generateMarketPredictions(sector as string, stories);
      }

      await eventTracker.trackB2BApiUsed('competitive_intelligence', {
        sector,
        timeframe,
        companyCount: companies.length,
        storyCount: stories.length
      });

      res.json({
        success: true,
        intelligence: {
          sector,
          timeframe,
          timestamp: new Date().toISOString(),
          marketAnalysis,
          predictions,
          keyInsights: this.extractKeyInsights(marketAnalysis, stories)
        }
      });
    } catch (error) {
      console.error('Competitive intelligence error:', error);
      res.status(500).json({ error: 'Failed to generate competitive intelligence' });
    }
  }

  /**
   * Historical Accuracy API
   * Provides accuracy scores for companies over time
   */
  static async getHistoricalAccuracy(req: Request, res: Response) {
    try {
      const { companyId, timeframe = '1year' } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
      }

      const dateFilter = this.getDateFilter(timeframe as string);

      const stories = await AppDataSource.getRepository(Story).find({
        where: {
          companyId: companyId as string,
          publishedAt: dateFilter
        },
        order: { publishedAt: 'ASC' }
      });

      // Calculate accuracy trends
      const accuracyTrends = this.calculateAccuracyTrends(stories);
      
      // Get accountability records (graveyard entries)
      const graveyardEntries = await AppDataSource.query(`
        SELECT ge.*, s.title as original_title
        FROM graveyard_entry ge
        LEFT JOIN story s ON ge.original_claim_story_id = s.id
        WHERE ge.company_id = $1 AND ge.created_at >= $2
        ORDER BY ge.created_at DESC
      `, [companyId, dateFilter]);

      const company = await AppDataSource.getRepository(Company).findOne({
        where: { id: companyId as string }
      });

      await eventTracker.trackB2BApiUsed('historical_accuracy', {
        companyId,
        timeframe,
        storyCount: stories.length
      });

      res.json({
        success: true,
        accuracy: {
          companyId,
          companyName: company?.name,
          timeframe,
          timestamp: new Date().toISOString(),
          trends: accuracyTrends,
          accountabilityRecords: graveyardEntries,
          overallAccuracyScore: this.calculateOverallAccuracy(stories),
          recommendations: this.generateAccuracyRecommendations(accuracyTrends, graveyardEntries)
        }
      });
    } catch (error) {
      console.error('Historical accuracy error:', error);
      res.status(500).json({ error: 'Failed to get historical accuracy data' });
    }
  }

  // Helper methods
  private static calculateAccuracyScore(stories: Story[]): number {
    if (stories.length === 0) return 5;
    
    // Simple accuracy calculation based on community verdict
    // In real implementation, this would be more sophisticated
    const totalScore = stories.reduce((sum, story) => {
      // Convert community verdict to accuracy score
      return sum + (story.hypeScore > 7 ? 3 : story.hypeScore < 4 ? 8 : 5);
    }, 0);
    
    return totalScore / stories.length;
  }

  private static calculateRiskScore(ethicsScore: number, hypeScore: number, accuracyScore: number): number {
    // Higher risk = lower ethics, higher hype, lower accuracy
    const ethicsRisk = (10 - ethicsScore) * 0.4;
    const hypeRisk = hypeScore * 0.3;
    const accuracyRisk = (10 - accuracyScore) * 0.3;
    
    return Math.min(10, ethicsRisk + hypeRisk + accuracyRisk);
  }

  private static getRiskLevel(riskScore: number): string {
    if (riskScore >= 8) return 'HIGH';
    if (riskScore >= 6) return 'MEDIUM';
    if (riskScore >= 4) return 'LOW';
    return 'MINIMAL';
  }

  private static generateRecommendations(riskScore: number, compliance: any): string[] {
    const recommendations = [];
    
    if (riskScore > 7) {
      recommendations.push('Consider alternative vendors with better ethics scores');
      recommendations.push('Request detailed compliance documentation');
    }
    
    if (!compliance.hasPrivacyPolicy) {
      recommendations.push('Verify privacy policy before engagement');
    }
    
    if (!compliance.isVerified) {
      recommendations.push('Company verification status unclear - proceed with caution');
    }
    
    if (compliance.fundingStage === 'Seed' || compliance.fundingStage === 'Series A') {
      recommendations.push('Early-stage company - monitor financial stability');
    }
    
    return recommendations;
  }

  private static generateSummary(assessments: any[]): any {
    const avgRiskScore = assessments.reduce((sum, a) => sum + a.riskScore, 0) / assessments.length;
    const highRiskCount = assessments.filter(a => a.riskScore > 7).length;
    const verifiedCount = assessments.filter(a => a.complianceIndicators.isVerified).length;
    
    return {
      averageRiskScore: Math.round(avgRiskScore * 100) / 100,
      highRiskVendors: highRiskCount,
      verifiedVendors: verifiedCount,
      overallRecommendation: avgRiskScore > 7 ? 'HIGH_RISK' : avgRiskScore > 5 ? 'MEDIUM_RISK' : 'LOW_RISK'
    };
  }

  private static getDateFilter(timeframe: string): any {
    const now = new Date();
    switch (timeframe) {
      case '1month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '3months':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '6months':
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case '1year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    }
  }

  private static analyzeMarketTrends(companies: Company[], stories: Story[]): any {
    const avgEthicsScore = stories.reduce((sum, s) => sum + s.ethicsScore, 0) / stories.length || 5;
    const avgHypeScore = stories.reduce((sum, s) => sum + s.hypeScore, 0) / stories.length || 5;
    const totalFunding = companies.reduce((sum, c) => sum + (c.fundingStage === 'Series C' ? 3 : c.fundingStage === 'Series B' ? 2 : 1), 0);
    
    return {
      averageEthicsScore: Math.round(avgEthicsScore * 100) / 100,
      averageHypeScore: Math.round(avgHypeScore * 100) / 100,
      marketMaturity: totalFunding / companies.length,
      activeCompanies: companies.length,
      storyVolume: stories.length,
      trendDirection: avgEthicsScore > 6 ? 'IMPROVING' : 'DECLINING'
    };
  }

  private static async generateMarketPredictions(sector: string, stories: Story[]): Promise<any> {
    // Simple prediction logic - in real implementation, use ML models
    const recentStories = stories.slice(0, 10);
    const avgHype = recentStories.reduce((sum, s) => sum + s.hypeScore, 0) / recentStories.length;
    
    return {
      predictionHorizon: '3months',
      predictedTrend: avgHype > 7 ? 'INCREASING_HYPE' : avgHype < 4 ? 'DECLINING_HYPE' : 'STABLE',
      confidence: 0.75,
      keyFactors: ['Community sentiment', 'Historical accuracy', 'Market conditions']
    };
  }

  private static extractKeyInsights(analysis: any, stories: Story[]): string[] {
    const insights = [];
    
    if (analysis.trendDirection === 'IMPROVING') {
      insights.push('Sector showing improving ethics standards');
    } else {
      insights.push('Sector ethics standards declining - monitor closely');
    }
    
    if (analysis.storyVolume > 20) {
      insights.push('High activity sector with significant community interest');
    }
    
    if (analysis.averageHypeScore > 7) {
      insights.push('High marketing activity - verify claims independently');
    }
    
    return insights;
  }

  private static calculateAccuracyTrends(stories: Story[]): any[] {
    // Group stories by month and calculate accuracy
    const monthlyData = stories.reduce((acc, story) => {
      const month = story.publishedAt.toISOString().substring(0, 7);
      if (!acc[month]) acc[month] = [];
      acc[month].push(story);
      return acc;
    }, {} as Record<string, Story[]>);

    return Object.entries(monthlyData).map(([month, monthStories]) => ({
      month,
      accuracyScore: this.calculateAccuracyScore(monthStories),
      storyCount: monthStories.length
    }));
  }

  private static calculateOverallAccuracy(stories: Story[]): number {
    return this.calculateAccuracyScore(stories);
  }

  private static generateAccuracyRecommendations(trends: any[], graveyardEntries: any[]): string[] {
    const recommendations = [];
    
    if (trends.length > 0) {
      const recentAccuracy = trends[trends.length - 1].accuracyScore;
      if (recentAccuracy < 4) {
        recommendations.push('Recent accuracy declining - verify all claims independently');
      }
    }
    
    if (graveyardEntries.length > 0) {
      recommendations.push(`${graveyardEntries.length} accountability issues identified`);
    }
    
    return recommendations;
  }
}
