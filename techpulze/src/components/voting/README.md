# Voting Components

Premium voting interface components for TechPulze, fully integrated with the scoring system.

## Components

### `VotingInterface`

Main voting component with 5-dimensional scoring sliders.

**Features:**
- ✅ 5 scoring dimensions (Ethics, Credibility, Delivery, Security, Innovation)
- ✅ Real-time score impact preview
- ✅ User weight display (1.0x - 2.0x based on reputation)
- ✅ Optional comments & evidence URLs per dimension
- ✅ Emoji feedback (😞 → 🚀)
- ✅ Authentication gate with blur overlay
- ✅ Success animation with confetti
- ✅ Dark/light theme support
- ✅ Framer Motion animations
- ✅ Toast notifications
- ✅ Optimistic UI updates

**Props:**
```typescript
interface VotingInterfaceProps {
  companyId: string
  companyName: string
  currentScores: {
    ethics: number
    credibility: number
    delivery: number
    security: number
    innovation: number
  }
  userPreviousVotes?: Record<VoteType, {
    score: number
    comment?: string
    evidence_urls?: string[]
  }>
  onVoteSubmitted?: () => void
  userId?: string
  userWeight?: number // 1.0-2.0
}
```

**Usage Example:**
```tsx
import { VotingInterface } from '@/components/voting/VotingInterface'

export default function CompanyPage({ company, user }) {
  return (
    <VotingInterface
      companyId={company.id}
      companyName={company.name}
      currentScores={{
        ethics: company.ethics_score,
        credibility: company.credibility_score,
        delivery: company.delivery_score,
        security: company.security_score,
        innovation: company.innovation_score,
      }}
      userPreviousVotes={user?.votes}
      userId={user?.id}
      userWeight={user?.vote_weight || 1.0}
      onVoteSubmitted={() => {
        // Refresh company data
        router.refresh()
      }}
    />
  )
}
```

### `VotingCard`

Compact card for company listings showing quick voting stats.

**Props:**
```typescript
interface VotingCardProps {
  companyId: string
  companyName: string
  totalVotes: number
  averageScore: number
  recentVoteCount24h?: number
  className?: string
}
```

**Usage Example:**
```tsx
import { VotingCard } from '@/components/voting/VotingCard'

<VotingCard
  companyId={company.id}
  companyName={company.name}
  totalVotes={company.total_community_votes}
  averageScore={company.overall_score}
  recentVoteCount24h={12}
/>
```

### `VotingStats`

Minimal inline stats display.

**Usage Example:**
```tsx
import { VotingStats } from '@/components/voting/VotingCard'

<VotingStats
  averageScore={company.overall_score}
  totalVotes={company.total_community_votes}
  size="md"
/>
```

## API Integration

The component automatically submits votes to your Supabase backend:

```typescript
// Upserts vote (creates or updates)
supabase.from('votes').upsert({
  user_id: userId,
  company_id: companyId,
  vote_type: 'ethics', // or credibility, delivery, security, innovation
  score: 8, // 1-10
  comment: 'Optional comment',
  evidence_urls: ['https://example.com/article']
}, {
  onConflict: 'user_id,company_id,vote_type'
})
```

**Database triggers automatically:**
1. Calculate user's vote weight
2. Recalculate company scores
3. Update company_scores table
4. Record in score_history
5. Notify followers if significant change

## Fetching User Votes

To display previous votes in the interface:

```typescript
// Fetch user's previous votes for a company
const { data: userVotes } = await supabase
  .from('votes')
  .select('vote_type, score, comment, evidence_urls')
  .eq('user_id', userId)
  .eq('company_id', companyId)

// Transform to expected format
const previousVotes = userVotes?.reduce((acc, vote) => ({
  ...acc,
  [vote.vote_type]: {
    score: vote.score,
    comment: vote.comment,
    evidence_urls: vote.evidence_urls
  }
}), {})
```

## Calculating User Weight

User vote weight is calculated based on reputation:

```sql
-- Function: get_user_vote_weight(user_id)
-- Returns: 1.0 - 2.0

Base weight: 1.0
+0.1 if reputation >= 100
+0.3 if reputation >= 500
+0.5 if reputation >= 1000
×2.0 if is_expert = true
```

**Fetch user weight:**
```typescript
const { data } = await supabase
  .rpc('get_user_vote_weight', { p_user_id: userId })

// Or calculate client-side from user profile
const calculateWeight = (reputation: number, isExpert: boolean) => {
  if (isExpert) return 2.0
  if (reputation >= 1000) return 1.5
  if (reputation >= 500) return 1.3
  if (reputation >= 100) return 1.1
  return 1.0
}
```

## Score Impact Calculation

The component shows a preview of how the vote will affect the score. Here's the simplified client-side calculation (actual calculation happens on backend):

```typescript
const calculatePredictedScore = (
  currentScore: number,
  userVote: number,
  userWeight: number
): number => {
  // Simplified influence calculation
  const influence = userWeight * 0.05 // 5% influence per vote
  const diff = userVote - currentScore
  const change = diff * influence

  return Math.max(0, Math.min(10, currentScore + change))
}
```

**Real calculation uses:**
- Weighted average of all community votes
- Expert reviews (2x weight)
- Promise fulfillment (for delivery score)

## Styling & Theming

Components use your design system tokens:

```typescript
import { colors, shadows, animations } from '@/lib/design-system'

// Colors
colors.primary[600]    // Blue
colors.accent[600]     // Purple
colors.success[500]    // Green

// Shadows
shadows.md            // Medium shadow
shadows.xl            // Large shadow

// Animations
animations.slideUp    // Entrance animation
animations.scaleIn    // Scale animation
```

**Theme support:**
- Automatically adapts to dark/light mode via ThemeContext
- Uses Tailwind's `dark:` prefix for dark mode styles

## Accessibility

✅ **ARIA labels** on all interactive elements
✅ **Keyboard navigation** supported
✅ **Focus indicators** visible
✅ **Screen reader friendly**
✅ **Color contrast** meets WCAG AA standards

## Performance

**Optimizations:**
- Debounced slider updates
- Memoized calculations
- Lazy loading of comment sections
- Optimistic UI updates
- Single batch API call for all votes

## Error Handling

```typescript
try {
  // Submit votes
  await submitVotes()

  // Success
  toast.success('Votes recorded!')

} catch (error) {
  // Handle errors
  toast.error('Failed to submit. Please try again.')

  // Automatic retry logic can be added
}
```

## Testing

```tsx
// Test with mock data
<VotingInterface
  companyId="test-123"
  companyName="Test Company"
  currentScores={{
    ethics: 7.5,
    credibility: 6.8,
    delivery: 8.2,
    security: 7.0,
    innovation: 9.1
  }}
  userId="user-123"
  userWeight={1.5}
/>
```

## Future Enhancements

- [ ] Vote change history modal
- [ ] Compare votes with community
- [ ] Expert review submission form
- [ ] Vote analytics dashboard
- [ ] Gamification: badges for voting
- [ ] Vote reasoning templates
- [ ] Bulk vote on multiple companies
- [ ] Vote reminders for followed companies

## Related Components

- `VerificationBadge` - Display company verification tiers
- `MetricsChart` - Visualize score history
- `GrowthIndicator` - Show score trends
- `CompanyCard` - Company listing cards

## Troubleshooting

**Problem:** Votes not updating scores immediately
**Solution:** Scores recalculate via database triggers. Add a loading state or optimistic UI update.

**Problem:** User weight not displaying correctly
**Solution:** Ensure `reputation_score` and `is_expert` fields are set in `user_profiles` table.

**Problem:** Authentication gate not showing
**Solution:** Ensure `userId` prop is undefined when user is not authenticated.

**Problem:** Dark mode colors look off
**Solution:** Check ThemeProvider is wrapping your app and `suppressHydrationWarning` is set on `<html>`.
