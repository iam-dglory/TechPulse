import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { CompanyFilters } from '@/components/companies/company-filters';
import { LazyCompaniesGrid, LazyLoad } from '@/lib/lazy-components';

// Set edge runtime for better performance
export const runtime = 'edge';

// Enable ISR with 60 second revalidation
export const revalidate = 60;

// Types for search parameters
interface SearchParams {
  query?: string;
  industry?: string;
  sort?: string;
  verified?: string;
  page?: string;
  limit?: string;
}

// Fetch companies with filters
async function getCompanies(searchParams: SearchParams) {
  const supabase = createServerComponentClient({ cookies });
  
  // Parse query parameters
  const query = searchParams.query || '';
  const industry = searchParams.industry || '';
  const sort = searchParams.sort || 'trending';
  const verified = searchParams.verified === 'true';
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '12');
  const offset = (page - 1) * limit;
  
  // Build query
  let companiesQuery = supabase
    .from('companies')
    .select('id, name, slug, logo_url, industry, overall_score, verification_tier, review_count, follower_count', { count: 'exact' });
  
  // Apply filters
  if (query) {
    companiesQuery = companiesQuery.ilike('name', `%${query}%`);
  }
  
  if (industry) {
    companiesQuery = companiesQuery.eq('industry', industry);
  }
  
  if (verified) {
    companiesQuery = companiesQuery.eq('is_verified', true);
  }
  
  // Apply sorting
  switch (sort) {
    case 'score':
      companiesQuery = companiesQuery.order('overall_score', { ascending: false });
      break;
    case 'reviews':
      companiesQuery = companiesQuery.order('review_count', { ascending: false });
      break;
    case 'name':
      companiesQuery = companiesQuery.order('name', { ascending: true });
      break;
    case 'trending':
    default:
      companiesQuery = companiesQuery.order('trending_score', { ascending: false });
      break;
  }
  
  // Apply pagination
  companiesQuery = companiesQuery.range(offset, offset + limit - 1);
  
  // Execute query
  const { data: companies, count, error } = await companiesQuery;
  
  if (error) {
    console.error('Error fetching companies:', error);
    return { companies: [], count: 0 };
  }
  
  return { companies: companies || [], count: count || 0 };
}

// Get available industries for filter
async function getIndustries() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data, error } = await supabase
    .from('companies')
    .select('industry')
    .not('industry', 'is', null);
  
  if (error) {
    console.error('Error fetching industries:', error);
    return [];
  }
  
  // Extract unique industries
  const industries = [...new Set(data.map(item => item.industry))].filter(Boolean);
  return industries;
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Fetch data in parallel
  const [{ companies, count }, industries] = await Promise.all([
    getCompanies(searchParams),
    getIndustries(),
  ]);
  
  // Calculate pagination
  const currentPage = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '12');
  const totalPages = Math.ceil(count / limit);
  
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Tech Companies Directory
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Discover and evaluate tech companies based on ethics and transparency
            </p>
          </div>
          
          {/* Filters */}
          <CompanyFilters industries={industries} />
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        {/* Results count */}
        <div className="mb-6">
          <p className="text-slate-600 dark:text-slate-400">
            Showing <span className="font-medium">{companies.length}</span> of{' '}
            <span className="font-medium">{count}</span> companies
          </p>
        </div>
        
        {/* Companies Grid */}
        <LazyLoad>
          <LazyCompaniesGrid 
            companies={companies} 
            currentPage={currentPage} 
            totalPages={totalPages} 
          />
        </LazyLoad>
      </div>
    </main>
  );
}

export const metadata = {
  title: 'Tech Companies Directory | TechPulze',
  description: 'Browse and evaluate tech companies based on ethics, transparency, and community reviews.',
  openGraph: {
    title: 'Tech Companies Directory | TechPulze',
    description: 'Discover which tech companies you can trust with comprehensive ethics ratings.',
    type: 'website',
  },
};