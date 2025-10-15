import { useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { analytics, AnalyticsEvent, AnalyticsProperties } from '../services/analytics';

export function useAnalytics() {
  const screenStartTime = useRef<number>(Date.now());

  const track = useCallback((event: AnalyticsEvent, properties?: AnalyticsProperties) => {
    analytics.track(event, properties);
  }, []);

  const trackScreenView = useCallback((screenName: string, properties?: AnalyticsProperties) => {
    analytics.trackScreenView(screenName, properties);
  }, []);

  const trackStoryViewed = useCallback((storyId: string, properties?: AnalyticsProperties) => {
    analytics.trackStoryViewed(storyId, properties);
  }, []);

  const trackStoryVoted = useCallback((storyId: string, voteValue: string, properties?: AnalyticsProperties) => {
    analytics.trackStoryVoted(storyId, voteValue, properties);
  }, []);

  const trackStorySaved = useCallback((storyId: string, saved: boolean, properties?: AnalyticsProperties) => {
    analytics.trackStorySaved(storyId, saved, properties);
  }, []);

  const trackAudioPlayed = useCallback((storyId: string, audioType: string, properties?: AnalyticsProperties) => {
    analytics.trackAudioPlayed(storyId, audioType, properties);
  }, []);

  const trackELI5Toggled = useCallback((storyId: string, mode: 'simple' | 'technical', properties?: AnalyticsProperties) => {
    analytics.trackELI5Toggled(storyId, mode, properties);
  }, []);

  const trackError = useCallback((error: Error, context?: string, properties?: AnalyticsProperties) => {
    analytics.trackError(error, context, properties);
  }, []);

  return {
    track,
    trackScreenView,
    trackStoryViewed,
    trackStoryVoted,
    trackStorySaved,
    trackAudioPlayed,
    trackELI5Toggled,
    trackError,
  };
}

export function useScreenTracking(screenName: string, properties?: AnalyticsProperties) {
  useFocusEffect(
    useCallback(() => {
      analytics.trackScreenView(screenName, properties);
    }, [screenName, properties])
  );
}

export function useStoryTracking(storyId: string) {
  const { trackStoryViewed, trackStoryVoted, trackStorySaved } = useAnalytics();

  useEffect(() => {
    trackStoryViewed(storyId);
  }, [storyId, trackStoryViewed]);

  const trackVote = useCallback((voteValue: string) => {
    trackStoryVoted(storyId, voteValue);
  }, [storyId, trackStoryVoted]);

  const trackSave = useCallback((saved: boolean) => {
    trackStorySaved(storyId, saved);
  }, [storyId, trackStorySaved]);

  return {
    trackVote,
    trackSave,
  };
}
