import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export enum AnalyticsEvent {
  // Screen Events
  SCREEN_VIEW = 'screen_view',
  
  // Story Events
  STORY_VIEWED = 'story_viewed',
  STORY_VOTED = 'story_voted',
  STORY_SHARED = 'story_shared',
  STORY_SAVED = 'story_saved',
  STORY_UNSAVED = 'story_unsaved',
  
  // Company Events
  COMPANY_VIEWED = 'company_viewed',
  COMPANY_CLAIMED = 'company_claimed',
  
  // Content Events
  AUDIO_PLAYED = 'audio_played',
  AUDIO_PAUSED = 'audio_paused',
  AUDIO_COMPLETED = 'audio_completed',
  ELI5_TOGGLED = 'eli5_toggled',
  BRIEF_LISTENED = 'brief_listened',
  
  // User Events
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTERED = 'user_registered',
  
  // Navigation Events
  TAB_CHANGED = 'tab_changed',
  SEARCH_PERFORMED = 'search_performed',
  
  // Error Events
  ERROR_OCCURRED = 'error_occurred',
  API_ERROR = 'api_error',
}

export interface AnalyticsProperties {
  [key: string]: any;
}

export interface AnalyticsContext {
  screen?: string;
  previousScreen?: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  isAnonymous: boolean;
}

class AnalyticsService {
  private sessionId: string;
  private isEnabled: boolean;
  private userId?: string;
  private analyticsOptOut: boolean = false;
  private currentScreen?: string;
  private screenStartTime?: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = true; // Will be controlled by user settings
    this.loadUserPreferences();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadUserPreferences(): Promise<void> {
    try {
      const preferences = await AsyncStorage.getItem('analytics_preferences');
      if (preferences) {
        const { analyticsOptOut, analyticsConsent } = JSON.parse(preferences);
        this.analyticsOptOut = analyticsOptOut || false;
        
        // Check if consent is required (EU, UK, CA)
        const region = await AsyncStorage.getItem('user_region');
        const requiresConsent = ['EU', 'UK', 'CA'].includes(region || '');
        
        if (requiresConsent && !analyticsConsent) {
          this.isEnabled = false;
        } else {
          this.isEnabled = !this.analyticsOptOut;
        }
      }
    } catch (error) {
      console.error('Failed to load analytics preferences:', error);
    }
  }

  async setUser(userId: string, preferences?: { analyticsOptOut?: boolean; analyticsConsent?: boolean; region?: string }): Promise<void> {
    this.userId = userId;
    
    if (preferences) {
      this.analyticsOptOut = preferences.analyticsOptOut || false;
      
      // Save preferences
      await AsyncStorage.setItem('analytics_preferences', JSON.stringify({
        analyticsOptOut: preferences.analyticsOptOut,
        analyticsConsent: preferences.analyticsConsent,
      }));
      
      if (preferences.region) {
        await AsyncStorage.setItem('user_region', preferences.region);
      }
      
      // Update enabled status
      const requiresConsent = ['EU', 'UK', 'CA'].includes(preferences.region || '');
      if (requiresConsent && !preferences.analyticsConsent) {
        this.isEnabled = false;
      } else {
        this.isEnabled = !this.analyticsOptOut;
      }
    }
  }

  async setAnalyticsOptOut(optOut: boolean): Promise<void> {
    this.analyticsOptOut = optOut;
    this.isEnabled = !optOut;
    
    await AsyncStorage.setItem('analytics_preferences', JSON.stringify({
      analyticsOptOut: optOut,
      analyticsConsent: true, // Assume consent if user is making explicit choice
    }));
  }

  private getContext(): AnalyticsContext {
    return {
      screen: this.currentScreen,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
      isAnonymous: !this.userId,
    };
  }

  async track(event: AnalyticsEvent, properties: AnalyticsProperties = {}): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    const context = this.getContext();
    
    // Console logging for development
    if (__DEV__) {
      console.log('📊 Analytics Event:', {
        event,
        properties,
        context,
      });
    }

    // Track with all available providers
    await Promise.allSettled([
      this.trackWithConsole(event, properties, context),
      this.trackWithSegment(event, properties, context),
      this.trackWithFirebase(event, properties, context),
      this.trackWithMixpanel(event, properties, context),
    ]);
  }

  // Screen tracking
  async trackScreenView(screenName: string, properties: AnalyticsProperties = {}): Promise<void> {
    const previousScreen = this.currentScreen;
    const screenStartTime = this.screenStartTime;
    
    // Track previous screen duration
    if (previousScreen && screenStartTime) {
      const duration = Date.now() - screenStartTime;
      await this.track(AnalyticsEvent.SCREEN_VIEW, {
        screen_name: previousScreen,
        screen_duration: duration,
        ...properties,
      });
    }
    
    this.currentScreen = screenName;
    this.screenStartTime = Date.now();
    
    await this.track(AnalyticsEvent.SCREEN_VIEW, {
      screen_name: screenName,
      previous_screen: previousScreen,
      ...properties,
    });
  }

  // Story events
  async trackStoryViewed(storyId: string, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.STORY_VIEWED, {
      story_id: storyId,
      ...properties,
    });
  }

  async trackStoryVoted(storyId: string, voteValue: string, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.STORY_VOTED, {
      story_id: storyId,
      vote_value: voteValue,
      ...properties,
    });
  }

  async trackStorySaved(storyId: string, saved: boolean, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(saved ? AnalyticsEvent.STORY_SAVED : AnalyticsEvent.STORY_UNSAVED, {
      story_id: storyId,
      ...properties,
    });
  }

  async trackStoryShared(storyId: string, shareMethod: string, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.STORY_SHARED, {
      story_id: storyId,
      share_method: shareMethod,
      ...properties,
    });
  }

  // Company events
  async trackCompanyViewed(companyId: string, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.COMPANY_VIEWED, {
      company_id: companyId,
      ...properties,
    });
  }

  async trackCompanyClaimed(companyId: string, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.COMPANY_CLAIMED, {
      company_id: companyId,
      ...properties,
    });
  }

  // Audio events
  async trackAudioPlayed(storyId: string, audioType: string, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.AUDIO_PLAYED, {
      story_id: storyId,
      audio_type: audioType,
      ...properties,
    });
  }

  async trackAudioPaused(storyId: string, duration: number, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.AUDIO_PAUSED, {
      story_id: storyId,
      audio_duration: duration,
      ...properties,
    });
  }

  async trackAudioCompleted(storyId: string, totalDuration: number, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.AUDIO_COMPLETED, {
      story_id: storyId,
      total_duration: totalDuration,
      ...properties,
    });
  }

  async trackELI5Toggled(storyId: string, mode: 'simple' | 'technical', properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.ELI5_TOGGLED, {
      story_id: storyId,
      mode: mode,
      ...properties,
    });
  }

  // User events
  async trackUserLogin(method: string, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.USER_LOGIN, {
      login_method: method,
      ...properties,
    });
  }

  async trackUserLogout(properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.USER_LOGOUT, {
      ...properties,
    });
  }

  async trackUserRegistered(method: string, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.USER_REGISTERED, {
      registration_method: method,
      ...properties,
    });
  }

  // Navigation events
  async trackTabChanged(tabName: string, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.TAB_CHANGED, {
      tab_name: tabName,
      ...properties,
    });
  }

  async trackSearchPerformed(query: string, resultsCount: number, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.SEARCH_PERFORMED, {
      search_query: query,
      results_count: resultsCount,
      ...properties,
    });
  }

  // Error events
  async trackError(error: Error, context?: string, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.ERROR_OCCURRED, {
      error_message: error.message,
      error_stack: error.stack,
      context: context,
      ...properties,
    });
  }

  async trackAPIError(endpoint: string, statusCode: number, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track(AnalyticsEvent.API_ERROR, {
      endpoint: endpoint,
      status_code: statusCode,
      ...properties,
    });
  }

  // Analytics Providers
  private async trackWithConsole(event: AnalyticsEvent, properties: AnalyticsProperties, context: AnalyticsContext): Promise<void> {
    // Already handled in track method
  }

  private async trackWithSegment(event: AnalyticsEvent, properties: AnalyticsProperties, context: AnalyticsContext): Promise<void> {
    try {
      // Segment React Native SDK would be used here
      // const { Analytics } = require('@segment/analytics-react-native');
      // Analytics.track(event, properties);
      console.log('Segment tracking:', event, properties);
    } catch (error) {
      console.warn('Segment tracking failed:', error);
    }
  }

  private async trackWithFirebase(event: AnalyticsEvent, properties: AnalyticsProperties, context: AnalyticsContext): Promise<void> {
    try {
      // Firebase Analytics would be used here
      // import analytics from '@react-native-firebase/analytics';
      // await analytics().logEvent(event, properties);
      console.log('Firebase tracking:', event, properties);
    } catch (error) {
      console.warn('Firebase tracking failed:', error);
    }
  }

  private async trackWithMixpanel(event: AnalyticsEvent, properties: AnalyticsProperties, context: AnalyticsContext): Promise<void> {
    try {
      // Mixpanel would be used here
      // import Mixpanel from 'react-native-mixpanel';
      // Mixpanel.track(event, properties);
      console.log('Mixpanel tracking:', event, properties);
    } catch (error) {
      console.warn('Mixpanel tracking failed:', error);
    }
  }
}

export const analytics = new AnalyticsService();
