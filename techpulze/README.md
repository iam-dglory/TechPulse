# TechPulze

A Next.js 14 application for tracking tech companies and their ethical impact, built with TypeScript, Tailwind CSS, and Supabase.

## Features

- **Company Database**: Track tech companies with ethical policies and scores
- **News Updates**: Monitor industry news with ethical impact analysis
- **User Reviews**: Community-driven company reviews and ratings
- **Discussions**: Engage in conversations about tech news and companies
- **Personalized Recommendations**: AI-powered content recommendations based on user roles and interests

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Database**: PostgreSQL with Row Level Security (RLS)

## Database Schema

### Companies Table

- Company information, industry, funding stage
- Ethical policies and scores (0-10)
- Products and target users
- Verification status

### News Updates Table

- Tech news with ethical impact analysis
- Ethics and hype scores (0-10)
- Sector categorization and source tracking

### User Profiles Table

- User roles (developer, customer service, marketer, etc.)
- Interest categories for personalized content

### Reviews Table

- Company reviews with moderation system
- Rating system (1-5 stars)
- Verification and approval workflow

### Discussions Table

- Community discussions on news updates
- User engagement and comments

### User Recommendations Table

- Personalized content recommendations
- Relevance scoring and tracking

## Setup Instructions

### 1. Environment Setup

```bash
# Run the environment setup script
node scripts/setup-env.js
```

### 2. Supabase Configuration

1. Go to [Supabase](https://supabase.com) and create a new project
2. Copy your project URL and anon key from the API settings
3. Update the `.env.local` file with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and run the SQL from `supabase/schema.sql`
4. This will create all tables, indexes, and sample data

### 4. Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
techpulze/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configurations
│   │   └── supabase.ts     # Supabase client configuration
│   └── types/               # TypeScript type definitions
│       └── database.ts     # Database schema types
├── supabase/
│   └── schema.sql          # Database schema and sample data
├── scripts/
│   └── setup-env.js        # Environment setup script
└── README.md
```

## Key Features

### Ethical Scoring System

- Companies and news updates are scored on a 0-10 scale
- Factors include privacy, AI transparency, carbon footprint, and data handling
- Community-driven scoring with moderation

### Role-Based Recommendations

- Personalized content based on user roles (developer, customer service, etc.)
- Interest-based filtering (AI, EV, IoT, HealthTech)
- Relevance scoring for optimal content delivery

### Community Features

- Company reviews with verification system
- News discussion threads
- Moderation and approval workflows

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
