import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { LazyCompanyProfilePage, LazyLoad } from '@/lib/lazy-components';
import type { Metadata, ResolvingMetadata } from 'next';

// Set edge runtime for better performance
export const runtime = 'edge';

// Enable ISR with 60 second revalidation
export const revalidate = 60;

// Generate metadata for SEO
export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: company } = await supabase
    .from('companies')
    .select('name, description, logo_url')
    .eq('slug', params.slug)
    .single();
  
  if (!company) {
    return {
      title: 'Company Not Found',
      description: 'The requested company could not be found.'
    };
  }
  
  return {
    title: `${company.name} | TechPulze Score`,
    description: company.description?.substring(0, 160) || `View ethical technology score for ${company.name}`,
    openGraph: {
      title: `${company.name} | TechPulze Score`,
      description: company.description?.substring(0, 160) || `View ethical technology score for ${company.name}`,
      images: company.logo_url ? [{ url: company.logo_url }] : undefined,
    },
  };
}

// Fetch company data
async function getCompany(slug: string) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error || !company) {
    return null;
  }
  
  return company;
}

// Generate metadata for SEO
export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const company = await getCompany(params.slug);
  
  if (!company) {
    return {
      title: 'Company Not Found | TechPulze',
      description: 'The requested company could not be found.',
    };
  }
  
  return {
    title: `${company.name} Ethics Score & Reviews | TechPulze`,
    description: `View ${company.name}'s ethics score, transparency rating, and community reviews on TechPulze. Learn about their privacy practices and corporate responsibility.`,
    openGraph: {
      title: `${company.name} - TechPulze Ethics Score`,
      description: `${company.name} has an overall ethics score of ${company.overall_score || 'N/A'}/10. Read reviews and see detailed ratings.`,
      images: company.logo_url ? [company.logo_url] : undefined,
      type: 'website',
    },
  };
}

// Main company profile page component
export default async function CompanyProfileRoute({ params }: { params: { slug: string } }) {
  const company = await getCompany(params.slug);
  
  if (!company) {
    notFound();
  }
  
  // Get current user session
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <LazyLoad>
        <LazyCompanyProfilePage companyId={company.id} userId={userId} />
      </LazyLoad>
    </div>
  );
}