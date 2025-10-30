# 🤖 AI Ethics Scoring Feature - Implementation Guide

## ✅ Implementation Complete!

The self-service AI ethics scoring system has been successfully implemented for TechPulze.

---

## 🎯 What Was Built

### Database Layer
- **score_requests table** - Tracks all AI scoring requests with status tracking
- **last_scored_at column** - Added to companies table for rate limiting
- **RLS Policies** - Secure access control for score requests
- **7-day rate limiting** - Prevents abuse of AI scoring API

### UI Components
1. **ScoreRequestButton** - Gradient button with modal dialog
2. **ScoringProgress** - Real-time progress indicator with 9 stages
3. **ScoreResults** - Beautiful results page with detailed breakdown

### API Endpoints
- `POST /api/ai/request-score` - Creates new scoring request
- `GET /api/ai/score-status/[requestId]` - Polls for scoring progress

### Enhanced AI Scoring
- New `calculateEthicsScoreEnhanced()` function in OpenAI library
- Returns detailed analysis with:
  - Numerical scores (0-10)
  - Summary paragraphs
  - Specific strengths
  - Specific concerns

### Pages
- `/companies/[slug]/scoring/[requestId]` - Live progress and results page

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/uypdmcgybpltogihldhu/sql/new

2. Open the migration file:
   ```
   C:\Users\GOPIKA ARAVIND\TechPulze\database-migrations\score-requests.sql
   ```

3. Copy ALL contents and paste into SQL Editor

4. Click "RUN" button

5. Verify success:
   - Should see: "Success. No rows returned"
   - Go to Table Editor → should see `score_requests` table
   - Check `companies` table → should have `last_scored_at` column

### Step 2: Add OpenAI API Key (Required for AI Scoring)

1. Get your OpenAI API key from: https://platform.openai.com/api-keys

2. Add to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ```

3. Also add to Vercel environment variables if deploying

**Note:** Without OpenAI API key, the system will return default scores (5.0) with fallback messages.

### Step 3: Test Locally

```bash
cd C:\Users\GOPIKA ARAVIND\TechPulze
npm run dev
```

Visit: http://localhost:3000

---

## 🧪 Testing the Feature

### Test Scenario 1: Basic Scoring Flow

1. **Navigate to a company profile**
   - Go to http://localhost:3000/companies
   - Click on any company (e.g., OpenAI, Google)

2. **Login required**
   - If not logged in, create an account or login
   - Button only shows for authenticated users

3. **Request score**
   - Click "Get Your Ethics Score" button
   - Review the modal information
   - Click "Start Analysis"

4. **Watch progress**
   - You'll be redirected to progress page
   - Watch the 9 stages complete
   - Real-time status updates every 5 seconds
   - Takes 2-3 minutes (depends on OpenAI API response time)

5. **View results**
   - Detailed score breakdown appears
   - See overall score with rating (Excellent/Good/Fair/Poor)
   - View strengths and concerns for each dimension
   - Individual dimension cards with details

6. **Return to profile**
   - Auto-redirects after 10 seconds
   - Or click "View Company Profile" button
   - Updated scores now visible on company profile

### Test Scenario 2: Rate Limiting

1. Complete a scoring request for a company
2. Try to request another score immediately
3. Should see error: "Score can be refreshed every 7 days. X days remaining."
4. Button shows as disabled with last scored date

### Test Scenario 3: Without OpenAI Key

1. Don't add OPENAI_API_KEY to .env.local
2. Request a score
3. System returns default scores (5.0) with:
   - "Unable to calculate detailed score at this time"
   - Generic strengths and concerns
   - Request still completes successfully

### Test Scenario 4: Multiple Users

1. User A requests score for Company X
2. User B can also request score for Company Y simultaneously
3. Each request is tracked independently
4. Rate limit applies per company, not per user

---

## 📊 Feature Highlights

### User Experience
- ✅ Beautiful gradient button design
- ✅ Informative modal with clear expectations
- ✅ Real-time progress tracking
- ✅ Smooth animations and transitions
- ✅ Mobile-responsive design
- ✅ Toast notifications for feedback

### AI Analysis
- ✅ Comprehensive 5-dimension scoring
- ✅ Overall ethics score calculation
- ✅ Detailed summaries for each dimension
- ✅ Specific strengths identified
- ✅ Actionable concerns highlighted
- ✅ Industry-aware analysis

### Performance
- ✅ Async processing (doesn't block UI)
- ✅ Background job for AI scoring
- ✅ Real-time status polling
- ✅ Rate limiting to prevent abuse
- ✅ Graceful fallbacks if AI fails

### Security
- ✅ Authentication required
- ✅ RLS policies on score_requests table
- ✅ Rate limiting (7-day cooldown)
- ✅ Server-side API key storage
- ✅ Input validation

---

## 🎨 UI Components Breakdown

### ScoreRequestButton
**Location:** Company profile header, right side panel

**Features:**
- Gradient blue-to-purple design
- Sparkles icon for AI theme
- Disabled state if rate-limited
- Shows last scored date
- Modal with detailed information

**Props:**
- `companyId` - Company UUID
- `companySlug` - For navigation
- `companyName` - Display name
- `lastScored` - Timestamp for rate limiting

### ScoringProgress
**Stages:**
1. Initializing Analysis (5s)
2. Gathering Company Data (15s)
3. Analyzing Reviews & Reports (30s)
4. Calculating Privacy Score (20s)
5. Calculating Transparency Score (20s)
6. Calculating Labor Score (20s)
7. Calculating Environment Score (20s)
8. Calculating Community Score (20s)
9. Finalizing Results (10s)

**Visual Elements:**
- Progress bar (0-100%)
- Stage checklist with icons
- Loading spinners
- Color-coded stages (blue=current, green=complete, gray=pending)

### ScoreResults
**Sections:**
- Success header with checkmark
- Overall score card with emoji rating
- Strengths and concerns grid
- Score breakdown bars
- Individual dimension cards
- Action buttons
- Disclaimer

---

## 🔧 Configuration Options

### Rate Limiting
Change the cooldown period in `app/api/ai/request-score/route.ts:47`:
```typescript
if (daysSinceLastScore < 7) { // Change 7 to desired days
```

### AI Model
Change the OpenAI model in `lib/openai.ts:194`:
```typescript
model: 'gpt-4-turbo-preview', // Or gpt-4, gpt-3.5-turbo, etc.
```

### Progress Duration
Adjust stage durations in `components/companies/scoring-progress.tsx:13`:
```typescript
const stages = [
  { id: 1, name: 'Initializing Analysis', duration: 5 }, // Change duration
  // ...
]
```

### Auto-redirect Timing
Change redirect delay in `app/companies/[slug]/scoring/[requestId]/page.tsx:36`:
```typescript
setTimeout(() => {
  router.push(`/companies/${resolvedParams.slug}`)
}, 10000) // Change 10000 to desired milliseconds
```

---

## 📝 Database Schema

### score_requests Table
```sql
CREATE TABLE score_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  requested_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'processing', -- processing, completed, failed
  scores JSONB, -- Full scores object
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

### Score JSON Structure
```json
{
  "overall": {
    "score": 8.5,
    "summary": "Overall assessment...",
    "strengths": ["Strength 1", "Strength 2"],
    "concerns": ["Concern 1", "Concern 2"]
  },
  "privacy": { /* same structure */ },
  "transparency": { /* same structure */ },
  "labor": { /* same structure */ },
  "environment": { /* same structure */ },
  "community": { /* same structure */ }
}
```

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" Error
**Solution:** Make sure user is logged in. The button only appears for authenticated users.

### Issue: OpenAI API Errors
**Possible causes:**
- Invalid API key
- Insufficient OpenAI credits
- Rate limit exceeded on OpenAI
- Network issues

**Solution:** Check OpenAI dashboard and ensure account is active with credits.

### Issue: Progress Stuck
**Solution:**
- Check browser console for errors
- Verify API routes are accessible
- Check Supabase connection
- Ensure background process didn't fail

### Issue: Score Request Not Found
**Solution:**
- Verify requestId in URL is valid
- Check score_requests table in Supabase
- Ensure RLS policies allow access

### Issue: Rate Limit Not Working
**Solution:**
- Check last_scored_at column exists on companies table
- Verify migration ran successfully
- Check API logic for rate limit calculation

---

## 🚀 Deployment Notes

### Vercel Deployment
1. Add OPENAI_API_KEY to Vercel environment variables
2. Redeploy application
3. Run migration in production Supabase database
4. Test on production URL

### Production Considerations
- Consider using a job queue (Inngest, BullMQ) for better background processing
- Monitor OpenAI API costs
- Set up alerts for failed scoring requests
- Consider caching frequently scored companies
- Add admin dashboard to view all score requests

---

## 💡 Future Enhancements

### Potential Improvements:
1. **Email Notifications** - Notify user when scoring completes
2. **Scheduled Rescoring** - Auto-refresh scores every 30 days
3. **Score History** - Track score changes over time
4. **Comparative Analysis** - Compare companies side-by-side
5. **Admin Dashboard** - View and manage all score requests
6. **Batch Scoring** - Score multiple companies at once
7. **Custom Dimensions** - Allow users to request specific dimension analysis
8. **Export Reports** - Download PDF reports of scores
9. **API Webhooks** - Notify external systems when scoring completes
10. **Score Trending** - Show if scores are improving or declining

---

## 📚 Files Modified/Created

### Created Files (12):
1. `database-migrations/score-requests.sql`
2. `components/companies/score-request-button.tsx`
3. `components/companies/scoring-progress.tsx`
4. `components/companies/score-results.tsx`
5. `app/api/ai/request-score/route.ts`
6. `app/api/ai/score-status/[requestId]/route.ts`
7. `app/companies/[slug]/scoring/[requestId]/page.tsx`
8. `AI-SCORING-FEATURE.md` (this file)

### Modified Files (2):
1. `lib/openai.ts` - Added `calculateEthicsScoreEnhanced()`
2. `app/companies/[slug]/page.tsx` - Integrated ScoreRequestButton

---

## ✅ Completion Checklist

- [x] Database migration created
- [x] Score request button component
- [x] Scoring progress component
- [x] Score results component
- [x] Request score API endpoint
- [x] Score status API endpoint
- [x] Enhanced OpenAI scoring function
- [x] Scoring progress page
- [x] Integration with company profile
- [ ] **Run database migration in Supabase** ← DO THIS NOW
- [ ] **Add OpenAI API key** ← REQUIRED FOR AI SCORING
- [ ] **Test locally** ← VERIFY IT WORKS
- [ ] **Deploy to production** ← WHEN READY

---

## 🎉 Ready to Test!

Your AI ethics scoring feature is fully implemented and ready to use. Just complete the setup steps above and start scoring companies!

**Questions or issues?** Check the troubleshooting section or review the component code for details.

**Happy scoring! 🚀**
