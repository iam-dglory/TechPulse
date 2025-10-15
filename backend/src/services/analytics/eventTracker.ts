import { AppDataSource } from '../../../ormconfig';
import { User } from '../../models/user';
import { Story } from '../../models/story';
import { Company } from '../../models/company';
import { Vote } from '../../models/vote';

export enum EventType {
  // Story Events
  STORY_CREATED = 'story_created',
  STORY_VIEWED = 'story_viewed',
  STORY_VOTED = 'story_voted',
  STORY_SHARED = 'story_shared',
  STORY_SAVED = 'story_saved',
  
  // Company Events
  COMPANY_VIEWED = 'company_viewed',
  COMPANY_CLAIMED = 'company_claimed',
  COMPANY_CLAIM_APPROVED = 'company_claim_approved',
  COMPANY_CLAIM_REJECTED = 'company_claim_rejected',
  
  // User Events
  USER_REGISTERED = 'user_registered',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  
  // Content Events
  AUDIO_PLAYED = 'audio_played',
  ELI5_TOGGLED = 'eli5_toggled',
  BRIEF_LISTENED = 'brief_listened',
  
  // System Events
  API_ERROR = 'api_error',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  MODERATION_ACTION = 'moderation_action',
}

export interface EventProperties {
  [key: string]: any;
}

export interface AnalyticsEvent {
  event: EventType;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  properties: EventProperties;
  anonymousId?: string;
  context?: {
    userAgent?: string;
    ip?: string;
    referrer?: string;
  };
}

class EventTracker {
  private isEnabled: boolean;
  private providers: AnalyticsProvider[];

  constructor() {
    this.isEnabled = process.env.ANALYTICS_ENABLED === 'true';
    this.providers = this.initializeProviders();
  }

  private initializeProviders(): AnalyticsProvider[] {
    const providers: AnalyticsProvider[] = [];

    // Console provider (always enabled in development)
    if (process.env.NODE_ENV === 'development') {
      providers.push(new ConsoleProvider());
    }

    // Sentry provider
    if (process.env.SENTRY_DSN) {
      providers.push(new SentryProvider());
    }

    // Segment provider
    if (process.env.SEGMENT_WRITE_KEY) {
      providers.push(new SegmentProvider());
    }

    // PostHog provider
    if (process.env.POSTHOG_API_KEY) {
      providers.push(new PostHogProvider());
    }

    return providers;
  }

  async track(event: AnalyticsEvent, user?: User): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    // Check user privacy settings
    if (user && !this.isAnalyticsAllowed(user)) {
      return;
    }

    // Enrich event with user data
    const enrichedEvent = this.enrichEvent(event, user);

    // Track with all providers
    const promises = this.providers.map(provider => 
      provider.track(enrichedEvent).catch(error => 
        console.error(`Analytics provider ${provider.constructor.name} failed:`, error)
      )
    );

    await Promise.allSettled(promises);
  }

  private isAnalyticsAllowed(user: User): boolean {
    // Check if user has opted out of analytics
    if (user.analyticsOptOut) {
      return false;
    }

    // Check if user is in a region that requires consent
    const requiresConsent = ['EU', 'UK', 'CA'].includes(user.region || '');
    if (requiresConsent && !user.analyticsConsent) {
      return false;
    }

    return true;
  }

  private enrichEvent(event: AnalyticsEvent, user?: User): AnalyticsEvent {
    const enriched = { ...event };

    if (user) {
      enriched.userId = user.id;
      enriched.properties = {
        ...enriched.properties,
        userType: user.isAdmin ? 'admin' : 'user',
        userRegion: user.region,
        userCreatedAt: user.createdAt,
      };
    }

    return enriched;
  }

  // Story Events
  async trackStoryCreated(story: Story, user?: User): Promise<void> {
    await this.track({
      event: EventType.STORY_CREATED,
      timestamp: new Date(),
      properties: {
        storyId: story.id,
        companyId: story.companyId,
        sectorTag: story.sectorTag,
        impactTags: story.impactTags,
        hasCompany: !!story.companyId,
      },
    }, user);
  }

  async trackStoryVoted(story: Story, vote: Vote, user?: User): Promise<void> {
    await this.track({
      event: EventType.STORY_VOTED,
      timestamp: new Date(),
      properties: {
        storyId: story.id,
        companyId: story.companyId,
        voteValue: vote.voteValue,
        industry: vote.industry,
        hasComment: !!vote.comment,
      },
    }, user);
  }

  async trackStoryViewed(story: Story, user?: User, context?: any): Promise<void> {
    await this.track({
      event: EventType.STORY_VIEWED,
      timestamp: new Date(),
      properties: {
        storyId: story.id,
        companyId: story.companyId,
        sectorTag: story.sectorTag,
        hypeScore: story.hypeScore,
        ethicsScore: story.ethicsScore,
        viewDuration: context?.viewDuration,
        scrollDepth: context?.scrollDepth,
      },
    }, user);
  }

  // Company Events
  async trackCompanyViewed(company: Company, user?: User): Promise<void> {
    await this.track({
      event: EventType.COMPANY_VIEWED,
      timestamp: new Date(),
      properties: {
        companyId: company.id,
        companyName: company.name,
        sectorTags: company.sectorTags,
        fundingStage: company.fundingStage,
        verified: company.verified,
        ethicsScore: company.ethicsScore,
      },
    }, user);
  }

  async trackCompanyClaimed(company: Company, claimData: any, user?: User): Promise<void> {
    await this.track({
      event: EventType.COMPANY_CLAIMED,
      timestamp: new Date(),
      properties: {
        companyId: company.id,
        companyName: company.name,
        verificationMethod: claimData.verificationMethod,
        hasDocuments: !!claimData.documents,
      },
    }, user);
  }

  async trackCompanyClaimApproved(company: Company, adminUser: User): Promise<void> {
    await this.track({
      event: EventType.COMPANY_CLAIM_APPROVED,
      timestamp: new Date(),
      properties: {
        companyId: company.id,
        companyName: company.name,
        adminUserId: adminUser.id,
      },
    }, adminUser);
  }

  // User Events
  async trackUserRegistered(user: User): Promise<void> {
    await this.track({
      event: EventType.USER_REGISTERED,
      timestamp: new Date(),
      properties: {
        userType: user.isAdmin ? 'admin' : 'user',
        registrationMethod: 'email',
        region: user.region,
      },
    }, user);
  }

  async trackUserLogin(user: User, context?: any): Promise<void> {
    await this.track({
      event: EventType.USER_LOGIN,
      timestamp: new Date(),
      properties: {
        loginMethod: context?.method || 'email',
        deviceType: context?.deviceType,
        lastLoginAt: user.lastLoginAt,
      },
    }, user);
  }

  // Content Events
  async trackAudioPlayed(story: Story, duration: number, user?: User): Promise<void> {
    await this.track({
      event: EventType.AUDIO_PLAYED,
      timestamp: new Date(),
      properties: {
        storyId: story.id,
        audioDuration: duration,
        audioType: 'story_brief',
      },
    }, user);
  }

  async trackELI5Toggled(story: Story, mode: 'simple' | 'technical', user?: User): Promise<void> {
    await this.track({
      event: EventType.ELI5_TOGGLED,
      timestamp: new Date(),
      properties: {
        storyId: story.id,
        mode: mode,
        hasSimpleSummary: !!story.simpleSummary,
        hasTechnicalSummary: !!story.technicalSummary,
      },
    }, user);
  }

  // Error Events
  async trackError(error: Error, context?: any, user?: User): Promise<void> {
    await this.track({
      event: EventType.API_ERROR,
      timestamp: new Date(),
      properties: {
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.constructor.name,
        ...context,
      },
    }, user);
  }
}

// Analytics Providers
abstract class AnalyticsProvider {
  abstract track(event: AnalyticsEvent): Promise<void>;
}

class ConsoleProvider extends AnalyticsProvider {
  async track(event: AnalyticsEvent): Promise<void> {
    console.log('📊 Analytics Event:', {
      event: event.event,
      userId: event.userId,
      timestamp: event.timestamp.toISOString(),
      properties: event.properties,
    });
  }
}

class SentryProvider extends AnalyticsProvider {
  private sentry: any;

  constructor() {
    super();
    try {
      this.sentry = require('@sentry/node');
    } catch (error) {
      console.warn('Sentry not available');
    }
  }

  async track(event: AnalyticsEvent): Promise<void> {
    if (!this.sentry) return;

    // Add breadcrumb for Sentry
    this.sentry.addBreadcrumb({
      category: 'analytics',
      message: event.event,
      level: 'info',
      data: event.properties,
    });

    // Set user context
    if (event.userId) {
      this.sentry.setUser({
        id: event.userId,
      });
    }
  }
}

class SegmentProvider extends AnalyticsProvider {
  private segment: any;

  constructor() {
    super();
    try {
      const Analytics = require('@segment/analytics-node');
      this.segment = new Analytics(process.env.SEGMENT_WRITE_KEY);
    } catch (error) {
      console.warn('Segment not available');
    }
  }

  async track(event: AnalyticsEvent): Promise<void> {
    if (!this.segment) return;

    const segmentEvent = {
      event: event.event,
      userId: event.userId,
      anonymousId: event.anonymousId,
      properties: event.properties,
      context: event.context,
      timestamp: event.timestamp,
    };

    this.segment.track(segmentEvent);
  }
}

class PostHogProvider extends AnalyticsProvider {
  private posthog: any;

  constructor() {
    super();
    try {
      const { PostHog } = require('posthog-node');
      this.posthog = new PostHog(process.env.POSTHOG_API_KEY);
    } catch (error) {
      console.warn('PostHog not available');
    }
  }

  async track(event: AnalyticsEvent): Promise<void> {
    if (!this.posthog) return;

    this.posthog.capture({
      distinctId: event.userId || event.anonymousId || 'anonymous',
      event: event.event,
      properties: event.properties,
      timestamp: event.timestamp,
    });
  }
}

export const eventTracker = new EventTracker();
