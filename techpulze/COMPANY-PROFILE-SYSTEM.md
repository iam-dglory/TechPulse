# TechPulze Company Profile System

## 🎯 Overview

A comprehensive company profile system built for TechPulze with advanced features for displaying, creating, and searching company information with ethical impact analysis.

## ✨ Features Implemented

### 1. Company Profile Page (`/companies/[id]`)

- **Company Header**: Logo, name, verified badge (gold checkmark)
- **Industry Tags**: Colored badges for different industries
- **Funding Information**: Stage with investor chips
- **Products Section**: Grid of product cards with name, description, URL
- **Target Users**: Clear description of target audience
- **Ethical Policy Accordion**: 4 expandable sections:
  - 🔒 Privacy Policy (rich text)
  - 🤖 AI Transparency (rich text)
  - 🌱 Carbon Footprint (rich text)
  - 📊 Data Handling (rich text)
- **Ethics Score Visualization**:
  - Large circular progress ring (200px diameter)
  - Color-coded: red <5, yellow 5-7, green >7
  - Center shows score with /10
- **Reviews Section**: Star rating summary with individual reviews
- **Compare Feature**: Modal for comparing with similar companies

### 2. Company Creation Form (`/companies/create`)

- **Tabbed Interface**: 5 sections for organized data entry
- **Basic Info**: Name, logo upload (drag-drop), industry selection
- **Funding**: Stage dropdown, investor tags (add/remove chips)
- **Products**: Dynamic form with + button to add products
- **Target Users**: Multi-select with common options + custom input
- **Ethical Policies**: 4 rich text editors using Tiptap
- **Actions**: Save as draft and Submit for verification
- **Validation**: Form validation and error handling

### 3. Company Search & Filter (`/companies/search`)

- **Search Bar**: Instant search with debounced input
- **Advanced Filters**:
  - Industry checkboxes (AI, EV, IoT, HealthTech, etc.)
  - Ethics score range slider (0-10)
  - Funding stage checkboxes
  - Verified only toggle
- **Results Grid**: Responsive layout (1/2/3 columns)
- **Sorting Options**: Ethics Score, Newest, Most Reviews, A-Z
- **Pagination**: Load more button with infinite scroll capability
- **Results Counter**: Shows "X results found"

### 4. Company Card Component

- **Hover Effects**: Lift animation and shadow transitions
- **Logo Display**: 60px logo with fallback icon
- **Company Info**: Name, verified badge, industry tag
- **Ethics Score Badge**: Color-coded score in top right
- **Quick Stats**: Funding stage, product count
- **Investor Chips**: Clickable investor badges
- **View Profile Button**: Links to detailed company page

### 5. API Routes

- **`/api/companies`**:
  - GET: List with pagination
  - POST: Create new company
- **`/api/companies/[id]`**:
  - GET: Single company details
  - PATCH: Update company
  - DELETE: Remove company
- **`/api/companies/[id]/reviews`**:
  - GET: Company reviews
  - POST: Add new review
- **`/api/companies/search`**:
  - POST: Advanced search with filters

## 🛠️ Technical Implementation

### Dependencies Added

```json
{
  "react-dropzone": "^14.2.3",
  "@tiptap/react": "^2.1.13",
  "@tiptap/starter-kit": "^2.1.13",
  "@tiptap/extension-placeholder": "^2.1.13",
  "lucide-react": "^0.263.1"
}
```

### shadcn/ui Components Used

- Card, CardContent, CardHeader, CardTitle
- Badge, Button, Input, Select
- Slider, Tabs, Accordion, Dialog
- DropdownMenu, Checkbox

### Key Features

- **TypeScript**: Full type safety with database schema types
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Rich Text Editing**: Tiptap integration for ethical policy content
- **File Upload**: Drag-and-drop logo upload with react-dropzone
- **Search & Filter**: Advanced filtering with debounced search
- **Pagination**: Efficient data loading with load more functionality
- **Error Handling**: Comprehensive error states and loading indicators

## 📁 File Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── CompanyCard.tsx        # Reusable company card
├── app/
│   ├── companies/
│   │   ├── page.tsx          # Companies listing
│   │   ├── create/
│   │   │   └── page.tsx      # Company creation form
│   │   ├── search/
│   │   │   └── page.tsx      # Search & filter page
│   │   └── [id]/
│   │       └── page.tsx      # Company profile page
│   └── api/
│       └── companies/
│           ├── route.ts      # List & create companies
│           ├── [id]/
│           │   ├── route.ts  # Single company CRUD
│           │   └── reviews/
│           │       └── route.ts # Company reviews
│           └── search/
│               └── route.ts  # Search endpoint
├── hooks/
│   └── useDebounce.ts        # Search debouncing
└── types/
    └── database.ts           # Database schema types
```

## 🎨 UI/UX Features

### Visual Design

- **Color-coded Ethics Scores**: Red (<5), Yellow (5-7), Green (>7)
- **Industry Badges**: Unique colors for each industry
- **Verified Badges**: Gold checkmark for verified companies
- **Hover Effects**: Smooth transitions and animations
- **Responsive Grid**: Adapts to screen size (1/2/3 columns)

### User Experience

- **Progressive Disclosure**: Accordion for ethical policies
- **Instant Search**: Debounced search with real-time results
- **Smart Filters**: Multiple filter combinations
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Clear error messages and fallbacks

## 🔧 Setup Instructions

1. **Install Dependencies**: All required packages are already installed
2. **Database Setup**: Ensure Supabase schema is set up with sample data
3. **Environment Variables**: Configure Supabase credentials
4. **Start Development**: Run `npm run dev`

## 🚀 Usage Examples

### Viewing Companies

- Browse all companies at `/companies`
- Search and filter at `/companies/search`
- View detailed profiles at `/companies/[id]`

### Adding Companies

- Create new company at `/companies/create`
- Fill out all required information
- Submit for verification or save as draft

### API Usage

```javascript
// Search companies
const response = await fetch("/api/companies/search", {
  method: "POST",
  body: JSON.stringify({
    query: "AI",
    filters: {
      industry: ["AI", "HealthTech"],
      ethicsScoreMin: 7,
      verified: true,
    },
  }),
});
```

## 🎯 Future Enhancements

- **Authentication**: User login and company ownership
- **Review System**: Full review submission and moderation
- **Comparison Tool**: Side-by-side company comparison
- **Analytics**: Company performance metrics
- **Export Features**: PDF reports and data export
- **Social Features**: Company following and notifications

The Company Profile system is now fully functional and ready for use! 🌟









