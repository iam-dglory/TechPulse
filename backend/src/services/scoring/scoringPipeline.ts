import { HypeScorer, HypeScoreResult } from './hypeScorer';
import { EthicsScorer, EthicsScoreResult } from './ethicsScorer';
import { OpenAIScorer, OpenAIScoreResult } from './openAiScorer';
import queueService from '../queue/queueService';

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
  credibilityScore?: number;
  ethicsScore?: number;
}

export interface ScoringResult {
  hypeScore: number;
  ethicsScore: number;
  realityCheck?: string;
  eli5Summary?: string;
  impactTags: string[];
  confidence: number;
  processingTime: number;
  enhanced: boolean;
  breakdown: {
    local: {
      hype: HypeScoreResult;
      ethics: EthicsScoreResult;
    };
    openai?: OpenAIScoreResult;
  };
  recommendations: string[];
}

export interface ScoringJob {
  id: string;
  storyId: string;
  storyContent: StoryContent;
  companyData?: CompanyData;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: ScoringResult;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ScoringPipeline {
  private hypeScorer: HypeScorer;
  private ethicsScorer: EthicsScorer;
  private openAIScorer: OpenAIScorer;
  private scoringQueue: Map<string, ScoringJob> = new Map();
  private isProcessing = false;

  constructor() {
    this.hypeScorer = new HypeScorer();
    this.ethicsScorer = new EthicsScorer();
    this.openAIScorer = new OpenAIScorer();
  }

  /**
   * Score story content with local algorithms
   */
  async scoreStoryLocally(
    storyContent: StoryContent,
    companyData?: CompanyData
  ): Promise<ScoringResult> {
    const startTime = Date.now();

    try {
      // Calculate local scores
      const hypeResult = this.hypeScorer.calculateHypeScore(storyContent);
      const ethicsResult = this.ethicsScorer.calculateEthicsScore(storyContent, companyData);

      // Combine impact tags
      const impactTags = [
        ...ethicsResult.impactTags,
        ...this.generateAdditionalImpactTags(hypeResult, ethicsResult)
      ];

      // Calculate overall confidence
      const confidence = (hypeResult.confidence + ethicsResult.confidence) / 2;

      // Generate recommendations
      const recommendations = [
        ...ethicsResult.recommendations,
        ...this.generateHypeRecommendations(hypeResult)
      ];

      const processingTime = Date.now() - startTime;

      return {
        hypeScore: hypeResult.score,
        ethicsScore: ethicsResult.score,
        impactTags: [...new Set(impactTags)], // Remove duplicates
        confidence,
        processingTime,
        enhanced: false,
        breakdown: {
          local: {
            hype: hypeResult,
            ethics: ethicsResult
          }
        },
        recommendations
      };

    } catch (error) {
      console.error('Local scoring error:', error);
      throw new Error('Failed to calculate local scores');
    }
  }

  /**
   * Score story with OpenAI enhancement (async)
   */
  async scoreStoryWithEnhancement(
    storyContent: StoryContent,
    companyData?: CompanyData
  ): Promise<ScoringResult> {
    // First get local scores
    const localResult = await this.scoreStoryLocally(storyContent, companyData);

    // If OpenAI is not configured, return local results
    if (!this.openAIScorer.isOpenAIConfigured()) {
      return localResult;
    }

    try {
      // Enhance with OpenAI
      const openAIResult = await this.openAIScorer.enhanceScores(
        storyContent,
        {
          hypeScore: localResult.hypeScore,
          ethicsScore: localResult.ethicsScore,
          impactTags: localResult.impactTags
        }
      );

      if (!openAIResult) {
        return localResult;
      }

      // Combine local and OpenAI results
      const enhancedResult: ScoringResult = {
        hypeScore: this.combineScores(localResult.hypeScore, openAIResult.hypeScore),
        ethicsScore: this.combineScores(localResult.ethicsScore, openAIResult.ethicsScore),
        realityCheck: openAIResult.realityCheck,
        eli5Summary: openAIResult.eli5Summary,
        impactTags: localResult.impactTags,
        confidence: Math.max(localResult.confidence, openAIResult.confidence),
        processingTime: localResult.processingTime + openAIResult.processingTime,
        enhanced: true,
        breakdown: {
          local: localResult.breakdown.local,
          openai: openAIResult
        },
        recommendations: localResult.recommendations
      };

      return enhancedResult;

    } catch (error) {
      console.error('OpenAI enhancement error:', error);
      // Return local results if OpenAI fails
      return localResult;
    }
  }

  /**
   * Queue story for async scoring with OpenAI
   */
  async queueStoryForEnhancement(
    storyId: string,
    storyContent: StoryContent,
    companyData?: CompanyData
  ): Promise<string> {
    try {
      const job = await queueService.addStoryEnhancementJob({
        storyId,
        priority: 0,
        delay: 0
      });

      console.log(`📝 Story ${storyId} queued for enhancement with job ID: ${job.id}`);
      return job.id || `story-enhancement-${storyId}`;
    } catch (error) {
      console.error(`❌ Failed to queue story ${storyId} for enhancement:`, error);
      throw error;
    }
  }

  /**
   * Get scoring job status
   */
  async getScoringJobStatus(jobId: string): Promise<ScoringJob | null> {
    try {
      const job = await queueService.getJob(jobId);
      if (!job) {
        return null;
      }

      return {
        id: job.id || '',
        storyId: job.data.storyId,
        storyContent: {} as StoryContent, // Not stored in queue
        companyData: {} as CompanyData, // Not stored in queue
        status: job.finishedOn ? 'completed' : job.failedReason ? 'failed' : 'processing',
        result: job.returnvalue,
        error: job.failedReason,
        createdAt: new Date(job.timestamp),
        updatedAt: new Date(job.processedOn || job.timestamp)
      };
    } catch (error) {
      console.error('Error getting job status:', error);
      return null;
    }
  }

  /**
   * Process scoring queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    try {
      const pendingJobs = Array.from(this.scoringQueue.values())
        .filter(job => job.status === 'pending')
        .slice(0, 5); // Process up to 5 jobs at once

      if (pendingJobs.length === 0) {
        this.isProcessing = false;
        return;
      }

      // Process jobs in parallel
      await Promise.all(
        pendingJobs.map(job => this.processScoringJob(job))
      );

      // Clean up old completed jobs (older than 1 hour)
      this.cleanupOldJobs();

    } finally {
      this.isProcessing = false;
      
      // Check if there are more pending jobs
      const hasMorePending = Array.from(this.scoringQueue.values())
        .some(job => job.status === 'pending');
      
      if (hasMorePending) {
        setTimeout(() => this.processQueue(), 1000); // Process next batch in 1 second
      }
    }
  }

  /**
   * Process individual scoring job
   */
  private async processScoringJob(job: ScoringJob): Promise<void> {
    try {
      job.status = 'processing';
      job.updatedAt = new Date();

      const result = await this.scoreStoryWithEnhancement(
        job.storyContent,
        job.companyData
      );

      job.status = 'completed';
      job.result = result;
      job.updatedAt = new Date();

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.updatedAt = new Date();
    }
  }

  /**
   * Clean up old completed jobs
   */
  private cleanupOldJobs(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [jobId, job] of this.scoringQueue.entries()) {
      if (job.status === 'completed' && job.updatedAt < oneHourAgo) {
        this.scoringQueue.delete(jobId);
      }
    }
  }

  /**
   * Combine local and OpenAI scores
   */
  private combineScores(localScore: number, openAIScore: number): number {
    // Weight: 70% OpenAI, 30% local (if OpenAI confidence is high)
    const openAIConfidence = 0.8; // Assume high confidence from OpenAI
    const weight = openAIConfidence;
    
    return Math.round(
      (openAIScore * weight) + (localScore * (1 - weight))
    );
  }

  /**
   * Generate additional impact tags
   */
  private generateAdditionalImpactTags(
    hypeResult: HypeScoreResult,
    ethicsResult: EthicsScoreResult
  ): string[] {
    const tags: string[] = [];

    // Hype-based tags
    if (hypeResult.score >= 8) {
      tags.push('high-hype');
    } else if (hypeResult.score <= 3) {
      tags.push('low-hype');
    }

    // Ethics-based tags
    if (ethicsResult.score >= 8) {
      tags.push('ethical');
    } else if (ethicsResult.score <= 3) {
      tags.push('unethical');
    }

    // Clickbait detection
    if (hypeResult.score >= 8 && ethicsResult.score <= 4) {
      tags.push('potential-clickbait');
    }

    return tags;
  }

  /**
   * Generate hype-specific recommendations
   */
  private generateHypeRecommendations(hypeResult: HypeScoreResult): string[] {
    const recommendations: string[] = [];

    if (hypeResult.score >= 8) {
      recommendations.push('Verify claims independently - high hype detected');
    }

    if (hypeResult.breakdown.superlatives > 7) {
      recommendations.push('Excessive superlatives - check for factual backing');
    }

    if (hypeResult.breakdown.claims > 7) {
      recommendations.push('Multiple breakthrough claims - verify independently');
    }

    return recommendations;
  }

  /**
   * Get scoring statistics
   */
  async getScoringStats(): Promise<{
    totalJobs: number;
    pendingJobs: number;
    completedJobs: number;
    failedJobs: number;
    openAIConfigured: boolean;
    queueSize: number;
  }> {
    try {
      const queueStats = await queueService.getQueueStats();
      
      return {
        totalJobs: queueStats.waiting + queueStats.active + queueStats.completed + queueStats.failed,
        pendingJobs: queueStats.waiting,
        completedJobs: queueStats.completed,
        failedJobs: queueStats.failed,
        openAIConfigured: this.openAIScorer.isOpenAIConfigured(),
        queueSize: queueStats.waiting + queueStats.active
      };
    } catch (error) {
      console.error('Error getting scoring stats:', error);
      return {
        totalJobs: 0,
        pendingJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        openAIConfigured: this.openAIScorer.isOpenAIConfigured(),
        queueSize: 0
      };
    }
  }

  /**
   * Clear all scoring jobs
   */
  clearScoringQueue(): void {
    this.scoringQueue.clear();
  }

  /**
   * Get OpenAI configuration status
   */
  getOpenAIConfigurationStatus(): any {
    return this.openAIScorer.getConfigurationStatus();
  }

  /**
   * Test OpenAI connection
   */
  async testOpenAIConnection(): Promise<boolean> {
    return await this.openAIScorer.testConnection();
  }
}
