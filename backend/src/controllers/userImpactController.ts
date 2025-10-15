import { Request, Response } from 'express';
import { AppDataSource } from '../../ormconfig';
import { UserImpact } from '../models/userImpact';
import { User } from '../models/user';
import { getIndustryMapping, calculateIndustryImpactScore, getIndustryRiskFactors, getIndustryTechImpacts } from '../config/industryImpactMap';
import { validationResult } from 'express-validator';

export class UserImpactController {
  private userImpactRepository = AppDataSource.getRepository(UserImpact);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Get user impact profile
   */
  public async getUserImpact(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Get user impact profile
      const userImpact = await this.userImpactRepository.findOne({
        where: { userId: id },
      });

      if (!userImpact) {
        res.status(404).json({
          success: false,
          message: 'Impact profile not found. Please create one first.',
        });
        return;
      }

      // Get industry mapping for additional context
      const industryMapping = getIndustryMapping(userImpact.industry);
      const riskFactors = getIndustryRiskFactors(userImpact.industry);
      const techImpacts = getIndustryTechImpacts(userImpact.industry);

      res.json({
        success: true,
        message: 'User impact profile retrieved successfully',
        data: {
          id: userImpact.id,
          userId: userImpact.userId,
          job: userImpact.job,
          location: userImpact.location,
          techUsed: userImpact.techUsed,
          industry: userImpact.industry,
          riskMetrics: {
            automationRisk: userImpact.automationRisk,
            skillObsolescenceRisk: userImpact.skillObsolescenceRisk,
            privacyRisk: userImpact.privacyRisk,
            overallRiskScore: userImpact.overallRiskScore,
          },
          riskFactors: userImpact.riskFactors || riskFactors,
          recommendedActions: userImpact.recommendedActions || [],
          industryContext: industryMapping ? {
            industry: industryMapping.industry,
            sectors: industryMapping.mapping.sectors,
            impactTags: industryMapping.mapping.impactTags,
            threshold: industryMapping.mapping.threshold,
          } : null,
          techImpacts: techImpacts,
          lastCalculatedAt: userImpact.lastCalculatedAt,
          createdAt: userImpact.createdAt,
          updatedAt: userImpact.updatedAt,
        },
      });
    } catch (error) {
      console.error('Error getting user impact:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Create or update user impact profile
   */
  public async saveUserImpact(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { job, location, techUsed, industry } = req.body;

      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      // Check if user exists
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Get or create user impact profile
      let userImpact = await this.userImpactRepository.findOne({
        where: { userId: id },
      });

      const isUpdate = !!userImpact;

      if (!userImpact) {
        userImpact = this.userImpactRepository.create({
          userId: id,
          job,
          location,
          techUsed,
          industry,
        });
      } else {
        userImpact.job = job;
        userImpact.location = location;
        userImpact.techUsed = techUsed;
        userImpact.industry = industry;
      }

      // Calculate risk metrics
      const riskMetrics = this.calculateRiskMetrics(job, location, techUsed, industry);
      
      userImpact.automationRisk = riskMetrics.automationRisk;
      userImpact.skillObsolescenceRisk = riskMetrics.skillObsolescenceRisk;
      userImpact.privacyRisk = riskMetrics.privacyRisk;
      userImpact.overallRiskScore = riskMetrics.overallRiskScore;
      userImpact.riskFactors = riskMetrics.riskFactors;
      userImpact.recommendedActions = riskMetrics.recommendedActions;
      userImpact.lastCalculatedAt = new Date();

      // Save to database
      await this.userImpactRepository.save(userImpact);

      // Get industry mapping for response
      const industryMapping = getIndustryMapping(industry);
      const techImpacts = getIndustryTechImpacts(industry);

      res.status(isUpdate ? 200 : 201).json({
        success: true,
        message: isUpdate 
          ? 'User impact profile updated successfully' 
          : 'User impact profile created successfully',
        data: {
          id: userImpact.id,
          userId: userImpact.userId,
          job: userImpact.job,
          location: userImpact.location,
          techUsed: userImpact.techUsed,
          industry: userImpact.industry,
          riskMetrics: {
            automationRisk: userImpact.automationRisk,
            skillObsolescenceRisk: userImpact.skillObsolescenceRisk,
            privacyRisk: userImpact.privacyRisk,
            overallRiskScore: userImpact.overallRiskScore,
          },
          riskFactors: userImpact.riskFactors,
          recommendedActions: userImpact.recommendedActions,
          industryContext: industryMapping ? {
            industry: industryMapping.industry,
            sectors: industryMapping.mapping.sectors,
            impactTags: industryMapping.mapping.impactTags,
            threshold: industryMapping.mapping.threshold,
          } : null,
          techImpacts: techImpacts,
          lastCalculatedAt: userImpact.lastCalculatedAt,
          createdAt: userImpact.createdAt,
          updatedAt: userImpact.updatedAt,
        },
      });
    } catch (error) {
      console.error('Error saving user impact:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Calculate risk metrics based on user profile
   */
  private calculateRiskMetrics(
    job: string,
    location: string,
    techUsed: string[],
    industry: string
  ): {
    automationRisk: number;
    skillObsolescenceRisk: number;
    privacyRisk: number;
    overallRiskScore: number;
    riskFactors: string[];
    recommendedActions: Array<{
      action: string;
      priority: 'high' | 'medium' | 'low';
      description: string;
    }>;
  } {
    const industryMapping = getIndustryMapping(industry);
    
    let automationRisk = 0;
    let skillObsolescenceRisk = 0;
    let privacyRisk = 0;
    const riskFactors: string[] = [];
    const recommendedActions: Array<{
      action: string;
      priority: 'high' | 'medium' | 'low';
      description: string;
    }> = [];

    if (industryMapping) {
      // Calculate automation risk based on job and industry
      const techImpacts = industryMapping.techImpacts;
      
      // Check if user's tech stack includes high-risk automation tools
      const highRiskTechs = techImpacts.filter(tech => tech.impact === 'negative' && tech.weight >= 7);
      const matchingHighRiskTechs = techUsed.filter(tech => 
        highRiskTechs.some(highRisk => 
          tech.toLowerCase().includes(highRisk.tech.toLowerCase()) ||
          highRisk.tech.toLowerCase().includes(tech.toLowerCase())
        )
      );

      automationRisk = Math.min(10, matchingHighRiskTechs.length * 2.5);

      // Calculate skill obsolescence risk
      const outdatedTechs = techUsed.filter(tech => {
        const techLower = tech.toLowerCase();
        return techLower.includes('legacy') || 
               techLower.includes('old') || 
               techLower.includes('deprecated');
      });

      skillObsolescenceRisk = Math.min(10, outdatedTechs.length * 3);

      // Calculate privacy risk based on tech usage
      const privacyTechs = ['social-media', 'email', 'cloud-services', 'data-analytics'];
      const privacyTechCount = techUsed.filter(tech => 
        privacyTechs.some(privacyTech => 
          tech.toLowerCase().includes(privacyTech)
        )
      ).length;

      privacyRisk = Math.min(10, privacyTechCount * 2);

      // Add industry-specific risk factors
      riskFactors.push(...industryMapping.mapping.riskFactors);

      // Generate recommended actions based on risks
      if (automationRisk > 6) {
        recommendedActions.push({
          action: 'Learn Complementary Skills',
          priority: 'high',
          description: 'Develop skills that complement automation tools to remain valuable',
        });
      }

      if (skillObsolescenceRisk > 5) {
        recommendedActions.push({
          action: 'Update Technical Skills',
          priority: 'high',
          description: 'Learn modern technologies and frameworks to stay current',
        });
      }

      if (privacyRisk > 6) {
        recommendedActions.push({
          action: 'Review Privacy Settings',
          priority: 'medium',
          description: 'Audit and update privacy settings on all platforms you use',
        });
      }

      // Add industry-specific actions
      if (industry === 'customer-service') {
        recommendedActions.push({
          action: 'Develop Human Skills',
          priority: 'medium',
          description: 'Focus on empathy, complex problem-solving, and relationship building',
        });
      }

      if (industry === 'healthcare') {
        recommendedActions.push({
          action: 'Stay Updated on Medical AI',
          priority: 'high',
          description: 'Keep informed about AI developments in healthcare and their implications',
        });
      }
    }

    // Calculate overall risk score
    const overallRiskScore = (automationRisk + skillObsolescenceRisk + privacyRisk) / 3;

    return {
      automationRisk: Math.round(automationRisk * 10) / 10,
      skillObsolescenceRisk: Math.round(skillObsolescenceRisk * 10) / 10,
      privacyRisk: Math.round(privacyRisk * 10) / 10,
      overallRiskScore: Math.round(overallRiskScore * 10) / 10,
      riskFactors,
      recommendedActions,
    };
  }
}

