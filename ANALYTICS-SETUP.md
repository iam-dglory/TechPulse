# TexhPulze Analytics & Event Tracking Setup

This guide explains how to set up comprehensive analytics and event tracking for TexhPulze, including privacy-preserving controls and multiple analytics providers.

## 🎯 Overview

TexhPulze includes a comprehensive analytics system that tracks:

- **Backend Events**: Story creation, voting, company claims, user actions
- **Mobile Events**: Screen views, user interactions, audio playback, navigation
- **Privacy Controls**: User opt-out, regional consent requirements, data minimization

## 🔧 Backend Analytics

### Event Tracking Service

The backend analytics system (`backend/src/services/analytics/eventTracker.ts`) provides:

#### **Event Types**

```typescript
enum EventType {
  // Story Events
  STORY_CREATED = "story_created",
  STORY_VIEWED = "story_viewed",
  STORY_VOTED = "story_voted",
  STORY_SHARED = "story_shared",
  STORY_SAVED = "story_saved",

  // Company Events
  COMPANY_VIEWED = "company_viewed",
  COMPANY_CLAIMED = "company_claimed",
  COMPANY_CLAIM_APPROVED = "company_claim_approved",

  // User Events
  USER_REGISTERED = "user_registered",
  USER_LOGIN = "user_login",
  USER_LOGOUT = "user_logout",

  // Content Events
  AUDIO_PLAYED = "audio_played",
  ELI5_TOGGLED = "eli5_toggled",
  BRIEF_LISTENED = "brief_listened",

  // System Events
  API_ERROR = "api_error",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
}
```

#### **Analytics Providers**

1. **Console Provider** (Development)

   - Logs events to console for debugging
   - Always enabled in development mode

2. **Sentry Provider** (Error Tracking)

   - Tracks errors and exceptions
   - Adds breadcrumbs for debugging
   - Requires `SENTRY_DSN` environment variable

3. **Segment Provider** (Event Analytics)

   - Tracks user behavior and events
   - Requires `SEGMENT_WRITE_KEY` environment variable

4. **PostHog Provider** (Product Analytics)
   - Advanced analytics and feature flags
   - Requires `POSTHOG_API_KEY` environment variable

### Integration Points

Analytics tracking is integrated into:

- **Story Controller**: Tracks story creation and voting
- **Company Controller**: Tracks company views and claims
- **Auth Controller**: Tracks user registration and login
- **Middleware**: Tracks API usage and errors

### Environment Variables

```env
# Analytics Configuration
ANALYTICS_ENABLED=true

# Sentry (Error Tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Segment (Event Analytics)
SEGMENT_WRITE_KEY=your-segment-write-key

# PostHog (Product Analytics)
POSTHOG_API_KEY=your-posthog-api-key
```

## 📱 Mobile Analytics

### Analytics Service

The mobile analytics system (`TexhPulzeMobile/src/services/analytics.ts`) provides:

#### **Event Types**

```typescript
enum AnalyticsEvent {
  // Screen Events
  SCREEN_VIEW = "screen_view",

  // Story Events
  STORY_VIEWED = "story_viewed",
  STORY_VOTED = "story_voted",
  STORY_SHARED = "story_shared",
  STORY_SAVED = "story_saved",

  // Company Events
  COMPANY_VIEWED = "company_viewed",
  COMPANY_CLAIMED = "company_claimed",

  // Content Events
  AUDIO_PLAYED = "audio_played",
  AUDIO_PAUSED = "audio_paused",
  ELI5_TOGGLED = "eli5_toggled",

  // Navigation Events
  TAB_CHANGED = "tab_changed",
  SEARCH_PERFORMED = "search_performed",

  // Error Events
  ERROR_OCCURRED = "error_occurred",
}
```

#### **Analytics Providers**

1. **Console Provider** (Development)

   - Logs events to console for debugging

2. **Segment Provider** (Event Analytics)

   - Cross-platform event tracking
   - User journey analysis

3. **Firebase Analytics** (Google Analytics)

   - Google Analytics integration
   - Custom event tracking

4. **Mixpanel** (Product Analytics)
   - Advanced user behavior tracking
   - Funnel analysis

### React Hooks

#### **useAnalytics Hook**

```typescript
const {
  track,
  trackScreenView,
  trackStoryViewed,
  trackStoryVoted,
  trackAudioPlayed,
} = useAnalytics();

// Track custom events
track(AnalyticsEvent.STORY_VIEWED, { storyId: "123" });

// Track screen views
trackScreenView("StoryView", { storyId: "123" });
```

#### **useScreenTracking Hook**

```typescript
function StoryScreen() {
  useScreenTracking("StoryView", { storyId: storyId });
  // Component automatically tracks screen views
}
```

#### **useStoryTracking Hook**

```typescript
function StoryView() {
  const { trackVote, trackSave } = useStoryTracking(storyId);

  // Automatically tracks story views
  // Provides vote and save tracking methods
}
```

## 🔒 Privacy Controls

### User Privacy Settings

Users can control their analytics preferences:

#### **Analytics Opt-Out**

```typescript
// Backend: Check user preferences
if (user.analyticsOptOut) {
  return; // Skip tracking
}

// Mobile: Set opt-out
await analytics.setAnalyticsOptOut(true);
```

#### **Regional Consent**

```typescript
// GDPR/CCPA compliance
const requiresConsent = ["EU", "UK", "CA"].includes(user.region);
if (requiresConsent && !user.analyticsConsent) {
  return; // Skip tracking
}
```

#### **Analytics Settings UI**

The `AnalyticsSettings` component provides:

- Toggle analytics on/off
- Regional consent management
- Privacy information
- Data usage transparency

### Data Minimization

- **No Personal Data**: Only behavioral and usage data
- **Anonymous IDs**: User identification only when necessary
- **Regional Compliance**: Automatic GDPR/CCPA compliance
- **Data Retention**: Configurable retention policies

## 🚀 Setup Instructions

### 1. Backend Setup

1. **Install Dependencies**:

   ```bash
   cd backend
   npm install @sentry/node @segment/analytics-node posthog-node
   ```

2. **Set Environment Variables**:

   ```env
   ANALYTICS_ENABLED=true
   SENTRY_DSN=your-sentry-dsn
   SEGMENT_WRITE_KEY=your-segment-key
   POSTHOG_API_KEY=your-posthog-key
   ```

3. **Run Migration**:
   ```bash
   npm run typeorm:migrate
   ```

### 2. Mobile Setup

1. **Install Dependencies**:

   ```bash
   cd TexhPulzeMobile
   npm install @segment/analytics-react-native @react-native-firebase/analytics react-native-mixpanel
   ```

2. **Configure Providers**:

   ```typescript
   // Update analytics.ts with your API keys
   const SEGMENT_WRITE_KEY = "your-segment-key";
   const FIREBASE_CONFIG = {
     /* your config */
   };
   const MIXPANEL_TOKEN = "your-mixpanel-token";
   ```

3. **Initialize Analytics**:

   ```typescript
   // In App.tsx
   import { analytics } from "./src/services/analytics";

   // Set user when logged in
   analytics.setUser(userId, {
     analyticsOptOut: false,
     analyticsConsent: true,
     region: "US",
   });
   ```

### 3. Analytics Providers Setup

#### **Sentry Setup**

1. Create account at [sentry.io](https://sentry.io)
2. Create new project
3. Copy DSN to environment variables
4. Events automatically tracked

#### **Segment Setup**

1. Create account at [segment.com](https://segment.com)
2. Create new source
3. Copy write key to environment variables
4. Configure destinations (Google Analytics, Mixpanel, etc.)

#### **PostHog Setup**

1. Create account at [posthog.com](https://posthog.com)
2. Get API key from project settings
3. Add to environment variables
4. Access dashboard for insights

#### **Firebase Analytics Setup**

1. Create Firebase project
2. Add Android/iOS apps
3. Download configuration files
4. Enable Analytics in Firebase console

#### **Mixpanel Setup**

1. Create account at [mixpanel.com](https://mixpanel.com)
2. Create new project
3. Get project token
4. Configure in mobile app

## 📊 Usage Examples

### Backend Event Tracking

```typescript
import { eventTracker } from "../services/analytics/eventTracker";

// Track story creation
await eventTracker.trackStoryCreated(story, user);

// Track user login
await eventTracker.trackUserLogin(user, {
  method: "email",
  deviceType: "mobile",
});

// Track custom events
await eventTracker.track(
  {
    event: EventType.API_ERROR,
    userId: user?.id,
    properties: {
      endpoint: "/api/stories",
      error: "Database connection failed",
    },
  },
  user
);
```

### Mobile Event Tracking

```typescript
import { analytics } from "../services/analytics";
import { useAnalytics } from "../hooks/useAnalytics";

// Direct tracking
await analytics.trackStoryViewed("story-123", {
  source: "feed",
  position: 5,
});

// Using hooks
function StoryScreen() {
  const { trackScreenView, trackAudioPlayed } = useAnalytics();

  useEffect(() => {
    trackScreenView("StoryScreen");
  }, []);

  const handlePlayAudio = () => {
    trackAudioPlayed(storyId, "story_brief");
  };
}
```

### Privacy-Compliant Tracking

```typescript
// Check privacy settings before tracking
if (await analytics.isTrackingAllowed()) {
  await analytics.trackStoryViewed(storyId);
}

// Respect user preferences
const userPreferences = await analytics.getUserPreferences();
if (userPreferences.analyticsEnabled) {
  // Track events
}
```

## 🔍 Monitoring & Debugging

### Development Mode

In development, all events are logged to console:

```
📊 Analytics Event: {
  event: 'story_viewed',
  properties: { storyId: '123' },
  userId: 'user-456'
}
```

### Production Monitoring

1. **Sentry Dashboard**: Error tracking and performance
2. **Segment Dashboard**: Event flow and user journeys
3. **PostHog Dashboard**: Product analytics and feature flags
4. **Firebase Console**: Google Analytics and custom events
5. **Mixpanel Dashboard**: Advanced user behavior analysis

### Debug Commands

```bash
# Backend: Test analytics
npm run test:analytics

# Mobile: Debug analytics
npm run debug:analytics

# Check analytics status
curl http://localhost:5000/api/health/analytics
```

## 📈 Analytics Dashboard

### Key Metrics to Track

1. **User Engagement**:

   - Daily/Monthly Active Users
   - Session duration
   - Screen views per session

2. **Content Performance**:

   - Most viewed stories
   - Voting patterns
   - Audio completion rates

3. **Feature Usage**:

   - ELI5 toggle usage
   - Search queries
   - Company claim submissions

4. **User Journey**:
   - Registration to first story view
   - Voting funnel
   - Audio engagement

### Custom Dashboards

Create dashboards in your analytics provider to track:

- User retention curves
- Feature adoption rates
- Error rates and performance
- A/B test results

## 🔧 Troubleshooting

### Common Issues

1. **Events Not Tracking**:

   - Check `ANALYTICS_ENABLED=true`
   - Verify API keys are correct
   - Check user privacy settings

2. **Privacy Compliance Errors**:

   - Ensure regional consent is handled
   - Check GDPR/CCPA compliance
   - Verify opt-out functionality

3. **Performance Issues**:
   - Analytics should be asynchronous
   - Use batch processing for high volume
   - Implement rate limiting

### Debug Steps

1. **Check Console Logs**:

   ```bash
   # Backend
   tail -f logs/analytics.log

   # Mobile
   npx react-native log-android
   ```

2. **Verify Provider Status**:

   ```bash
   curl -H "Authorization: Bearer $SENTRY_TOKEN" \
        https://sentry.io/api/0/projects/
   ```

3. **Test Event Flow**:

   ```bash
   # Test backend analytics
   npm run test:analytics:integration

   # Test mobile analytics
   npm run test:analytics:mobile
   ```

## 📚 Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Segment Documentation](https://segment.com/docs/)
- [PostHog Documentation](https://posthog.com/docs)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [Mixpanel Documentation](https://developer.mixpanel.com/docs)

## 🤝 Contributing

When adding new analytics events:

1. **Define Event Type**: Add to appropriate enum
2. **Update Tracking**: Integrate into controllers/hooks
3. **Add Privacy Checks**: Respect user preferences
4. **Test Coverage**: Add tests for new events
5. **Documentation**: Update this guide

For questions or issues, refer to the troubleshooting section or create an issue in the repository.
