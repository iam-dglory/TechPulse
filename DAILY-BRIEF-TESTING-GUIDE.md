# Daily Brief System - End-to-End Testing Guide

This guide provides comprehensive testing instructions for the voice-first daily brief system with TTS integration, personalized content selection, and audio player controls.

## 🎯 **System Overview**

The Daily Brief system provides:

- **Personalized Audio Briefs**: AI-curated tech news in audio format
- **Flexible Durations**: 5, 10, or 15-minute briefs
- **Multiple Modes**: Personalized, Trending, or Balanced content selection
- **TTS Integration**: High-quality text-to-speech audio playback
- **Smart Controls**: Play/pause, speed control, and progress tracking
- **User Personalization**: Industry-specific story relevance

## 📋 **Prerequisites**

### Backend Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Run database migrations
npm run typeorm:migrate

# 3. Start the backend server
npm run dev:ts:watch

# 4. Seed the database (optional)
npm run seed
```

### Mobile App Setup

```bash
# 1. Install dependencies
cd TexhPulzeMobile
npm install

# 2. Install expo-speech dependency
npx expo install expo-speech

# 3. Start the mobile app
npm start
```

### TTS Setup

The system uses Expo Speech for text-to-speech functionality. No additional setup required for basic TTS.

## 🧪 **Test Scenarios**

### **Scenario 1: Generate Daily Brief (Backend)**

#### Step 1: Test Basic Brief Generation

```bash
# Generate a 10-minute balanced brief
curl -X GET "http://localhost:5000/api/briefs/daily?duration=10&mode=balanced"
```

**Expected Result:**

```json
{
  "success": true,
  "message": "Daily brief generated successfully",
  "data": {
    "briefId": "brief_1640995200000_abc123",
    "generatedAt": "2024-01-15T10:00:00.000Z",
    "duration": 10,
    "estimatedTotalTime": 600,
    "mode": "balanced",
    "stories": [
      {
        "id": "story-id-1",
        "title": "AI Revolution in Healthcare",
        "simpleSummary": "This story explains how AI is transforming healthcare...",
        "sectorTag": "Healthcare AI",
        "hypeScore": 8.5,
        "ethicsScore": 7.2,
        "publishedAt": "2024-01-15T09:00:00.000Z",
        "company": {
          "id": "company-id",
          "name": "MedTech Corp",
          "slug": "medtech-corp"
        },
        "estimatedReadTime": 45,
        "priority": "high"
      }
    ],
    "introText": "Good morning! Welcome to your 10-minute tech brief. We've curated today's most important tech developments for you. Let's dive in.",
    "outroText": "That concludes your 10-minute tech brief with 8 stories. Thank you for staying informed with TexhPulze. Have a great day!",
    "personalizedInsights": {
      "userIndustry": "Healthcare",
      "relevantStories": 5,
      "topSectors": ["Healthcare AI", "Medical Devices", "Telemedicine"],
      "riskAlerts": 2
    }
  }
}
```

#### Step 2: Test Different Durations

```bash
# 5-minute brief
curl -X GET "http://localhost:5000/api/briefs/daily?duration=5&mode=trending"

# 15-minute brief
curl -X GET "http://localhost:5000/api/briefs/daily?duration=15&mode=personalized"
```

#### Step 3: Test Personalized Brief

```bash
# Generate personalized brief for a specific user
USER_ID="user-id-from-database"

curl -X GET "http://localhost:5000/api/briefs/daily?userId=$USER_ID&duration=10&mode=personalized"
```

#### Step 4: Test Brief Statistics

```bash
curl -X GET "http://localhost:5000/api/briefs/stats"
```

**Expected Result:**

```json
{
  "success": true,
  "message": "Brief statistics retrieved successfully",
  "data": {
    "totalStories": 45,
    "storiesWithSummaries": 38,
    "coveragePercentage": 84,
    "averageHypeScore": 6.8,
    "availableDurations": [5, 10, 15],
    "availableModes": ["trending", "personalized", "balanced"]
  }
}
```

### **Scenario 2: Mobile App Daily Brief Interface**

#### Step 1: Navigate to Daily Brief

1. Open mobile app
2. Tap "Daily Brief" tab (headset icon)
3. Verify screen loads with duration and mode options

#### Step 2: Test Duration Selection

1. Tap different duration buttons (5, 10, 15 minutes)
2. Verify selection changes and descriptions update
3. Check that estimated story counts are displayed

#### Step 3: Test Mode Selection

1. Tap different mode buttons (Personalized, Trending, Balanced)
2. Verify selection changes and descriptions update
3. Check that mode-specific descriptions are shown

#### Step 4: Test User Profile Integration

1. Verify user profile is displayed if logged in
2. Check that industry information is shown
3. Verify personalized brief option is available

#### Step 5: Test Brief Generation

1. Tap "Start Brief" button
2. Verify player modal opens
3. Check that brief is generated and loaded

### **Scenario 3: Audio Player Controls**

#### Step 1: Test Basic Playback

1. Start a brief from the main screen
2. Verify player modal opens with brief details
3. Tap play button to start audio
4. Verify audio begins playing and controls update

#### Step 2: Test Play/Pause Controls

1. Tap pause button while playing
2. Verify audio pauses and button changes to play
3. Tap play button to resume
4. Verify audio resumes from where it paused

#### Step 3: Test Speed Controls

1. Tap different speed buttons (0.75x, 1x, 1.25x, 1.5x)
2. Verify speed changes and active button is highlighted
3. Check that audio speed adjusts accordingly

#### Step 4: Test Progress Tracking

1. Start playing a brief
2. Verify progress bar fills as audio plays
3. Check that elapsed time updates correctly
4. Verify total time is displayed accurately

#### Step 5: Test Skip Controls

1. Tap skip forward button
2. Verify moves to next story or segment
3. Check that progress updates accordingly
4. Verify current story title updates

#### Step 6: Test Stop Control

1. Tap stop button
2. Verify audio stops completely
3. Check that progress resets to beginning
4. Verify all controls return to initial state

### **Scenario 4: Brief Content and Structure**

#### Step 1: Test Brief Structure

1. Start a brief and let it play completely
2. Verify intro plays first
3. Check that stories play in order
4. Verify outro plays at the end
5. Confirm brief ends automatically

#### Step 2: Test Story Content

1. Verify each story includes:
   - Title announcement
   - Company name (if available)
   - Simple summary
   - Estimated read time
2. Check that content is appropriate for audio format

#### Step 3: Test Personalization

1. Create a brief in "personalized" mode
2. Verify stories are relevant to user's industry
3. Check that personalized insights are displayed
4. Verify risk alerts are highlighted if present

### **Scenario 5: Error Handling**

#### Step 1: Test Network Errors

1. Disconnect from internet
2. Try to generate a brief
3. Verify appropriate error message is shown
4. Check that retry functionality works

#### Step 2: Test Audio Errors

1. Try to play brief on device without speakers
2. Verify graceful error handling
3. Check that user is informed of audio issues

#### Step 3: Test Empty Brief

1. Create brief when no stories are available
2. Verify appropriate message is shown
3. Check that user can retry or adjust settings

## 🔧 **Advanced Testing**

### **Test Brief Generation Logic**

#### Story Selection Algorithm

```bash
# Test trending mode
curl -X GET "http://localhost:5000/api/briefs/daily?mode=trending&limit=5"

# Test personalized mode with specific user
curl -X GET "http://localhost:5000/api/briefs/daily?userId=user-id&mode=personalized&duration=10"

# Test balanced mode
curl -X GET "http://localhost:5000/api/briefs/daily?mode=balanced&duration=15"
```

#### Time Estimation Accuracy

```bash
# Generate brief and verify time estimates
curl -X GET "http://localhost:5000/api/briefs/daily?duration=10" | jq '.data.estimatedTotalTime'
```

### **Test Database Queries**

#### Verify Story Selection

```sql
-- Check stories selected for briefs
SELECT
  s.title,
  s.hype_score,
  s.ethics_score,
  s.sector_tag,
  s.simple_summary IS NOT NULL as has_summary,
  s.published_at
FROM stories s
WHERE s.published_at >= NOW() - INTERVAL '7 days'
  AND (s.simple_summary IS NOT NULL OR s.eli5_summary IS NOT NULL)
ORDER BY (s.hype_score * 0.7 + s.ethics_score * 0.3) DESC
LIMIT 10;
```

#### Check User Personalization

```sql
-- Verify user industry mapping
SELECT
  u.username,
  u.industry,
  COUNT(s.id) as relevant_stories
FROM users u
LEFT JOIN stories s ON s.impact_tags && ARRAY['automation', 'ai-tools']
WHERE u.industry = 'Customer Service'
GROUP BY u.id, u.username, u.industry;
```

### **Test Mobile App Edge Cases**

#### Different Screen Sizes

1. Test on various device sizes
2. Verify player controls are accessible
3. Check that text is readable on small screens

#### Background Playback

1. Start playing a brief
2. Minimize the app
3. Verify audio continues playing
4. Check that controls work from notification

#### Device Rotation

1. Start playing a brief
2. Rotate device
3. Verify player maintains state
4. Check that controls remain functional

## 📊 **Expected Database State**

### Stories with Summaries

```sql
SELECT
  COUNT(*) as total_stories,
  COUNT(CASE WHEN simple_summary IS NOT NULL THEN 1 END) as with_simple,
  COUNT(CASE WHEN technical_summary IS NOT NULL THEN 1 END) as with_technical,
  COUNT(CASE WHEN eli5_summary IS NOT NULL THEN 1 END) as with_eli5
FROM stories
WHERE published_at >= NOW() - INTERVAL '7 days';
```

### User Personalization Data

```sql
SELECT
  u.industry,
  COUNT(*) as user_count,
  AVG(s.hype_score) as avg_hype_score,
  AVG(s.ethics_score) as avg_ethics_score
FROM users u
LEFT JOIN stories s ON s.published_at >= NOW() - INTERVAL '7 days'
GROUP BY u.industry
ORDER BY user_count DESC;
```

## ✅ **Success Criteria**

### Backend API:

- [ ] Brief generation works for all durations (5, 10, 15 minutes)
- [ ] All modes (trending, personalized, balanced) work correctly
- [ ] Personalization based on user industry works
- [ ] Time estimation is accurate
- [ ] Story selection algorithm works properly
- [ ] Statistics endpoint returns correct data

### Mobile App:

- [ ] Daily Brief screen loads and displays options
- [ ] Duration and mode selection works
- [ ] Brief generation triggers player modal
- [ ] Audio player controls work correctly
- [ ] Progress tracking is accurate
- [ ] Speed controls function properly
- [ ] Error handling works for network issues

### Audio Player:

- [ ] TTS audio plays correctly
- [ ] Play/pause controls work
- [ ] Speed adjustment works
- [ ] Progress bar updates accurately
- [ ] Skip controls advance through content
- [ ] Stop control resets playback
- [ ] Brief structure (intro, stories, outro) is maintained

### Personalization:

- [ ] Industry-specific story selection works
- [ ] Personalized insights are displayed
- [ ] Risk alerts are highlighted
- [ ] User profile integration works
- [ ] Relevant story counts are accurate

## 🐛 **Common Issues & Troubleshooting**

### Issue: "No stories available for brief"

**Solution:** Ensure stories have simple summaries and are published within last 7 days

### Issue: Audio not playing

**Solution:** Check device audio settings and expo-speech permissions

### Issue: Brief generation fails

**Solution:** Verify database has stories with summaries and check API connectivity

### Issue: Personalization not working

**Solution:** Ensure user has industry set in profile and stories have relevant impact tags

### Issue: Time estimates inaccurate

**Solution:** Check story content length and adjust calculation algorithm

### Issue: Player controls not responsive

**Solution:** Verify TTS state management and event handling

## 🚀 **Production Deployment Notes**

### Audio Quality:

- Consider using cloud TTS services for better quality
- Implement audio caching for frequently accessed briefs
- Set up audio compression for faster loading

### Performance:

- Cache brief generation results
- Implement background brief generation
- Optimize database queries for story selection

### User Experience:

- Add brief scheduling (morning/evening briefs)
- Implement brief history and favorites
- Add offline brief download capability

### Analytics:

- Track brief completion rates
- Monitor audio playback metrics
- Analyze user engagement with different modes

## 📝 **Test Results Template**

```
Test Date: ___________
Tester: ___________

Backend API:
- [ ] Brief generation (5/10/15 min)
- [ ] Mode selection (trending/personalized/balanced)
- [ ] Personalization logic
- [ ] Time estimation
- [ ] Statistics endpoint

Mobile App:
- [ ] Daily Brief screen
- [ ] Duration selection
- [ ] Mode selection
- [ ] User profile integration
- [ ] Brief generation

Audio Player:
- [ ] Play/pause controls
- [ ] Speed controls
- [ ] Progress tracking
- [ ] Skip controls
- [ ] Stop control
- [ ] TTS audio quality

Personalization:
- [ ] Industry-specific stories
- [ ] Personalized insights
- [ ] Risk alerts
- [ ] User profile display

Error Handling:
- [ ] Network errors
- [ ] Audio errors
- [ ] Empty briefs
- [ ] Device compatibility

Notes:
_________________________________
_________________________________
```

This testing guide ensures the complete daily brief system works end-to-end from content curation through audio playback to user personalization! 🎉🎧✨
