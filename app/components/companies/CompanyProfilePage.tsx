'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import CompanyProfileHeader from './CompanyProfileHeader';
import CompanyProfileTabs from './CompanyProfileTabs';
import CompletionProgress from './CompletionProgress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CompanyProfilePageProps {
  companyId: string;
  userId?: string;
}

export default function CompanyProfilePage({ companyId, userId }: CompanyProfilePageProps) {
  const [company, setCompany] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch company details
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();

        if (companyError) throw new Error('Company not found');
        
        // Check if user is the owner
        if (userId && companyData.claimed_by === userId) {
          setIsOwner(true);
        }

        // Fetch user details if logged in
        if (userId) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
          
          setCurrentUser(userData);
          setIsPremium(userData?.subscription_tier === 'premium');
        }

        // Fetch company reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        // Fetch company news
        const { data: newsData } = await supabase
          .from('news')
          .select('*')
          .eq('company_id', companyId)
          .order('published_at', { ascending: false });

        // Fetch ethics scores if available
        const { data: ethicsData } = await supabase
          .from('ethics_scores')
          .select('*')
          .eq('company_id', companyId)
          .single();

        // Track analytics event
        await fetch('/api/analytics/event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: 'company_profile_view',
            company_id: companyId,
            user_id: userId || null,
          }),
        });

        // Combine all data
        const companyWithScores = {
          ...companyData,
          ethics_scores: ethicsData?.scores || {
            privacy: 0,
            transparency: 0,
            security: 0,
            fairness: 0,
            environmental: 0
          },
          overall_score: ethicsData?.overall_score || 0
        };

        setCompany(companyWithScores);
        setReviews(reviewsData || []);
        setNews(newsData || []);
      } catch (err: any) {
        console.error('Error fetching company data:', err);
        setError(err.message || 'Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId, userId, supabase]);

  if (loading) {
    return <CompanyProfileSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}. <button onClick={() => router.push('/companies')} className="underline">Return to companies</button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CompanyProfileHeader 
        company={company} 
        isOwner={isOwner} 
        currentUser={currentUser} 
      />
      
      {isOwner && (
        <div className="mb-8">
          <CompletionProgress companyId={companyId} />
        </div>
      )}
      
      <CompanyProfileTabs 
        company={company} 
        reviews={reviews} 
        news={news} 
        isPremium={isPremium} 
      />
    </div>
  );
}

function CompanyProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="relative mb-8">
        <Skeleton className="h-48 md:h-64 w-full rounded-lg" />
        <div className="container px-4 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
            <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-lg" />
            <div className="flex-1 pt-2 md:pb-2">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg mt-6" />
      </div>
    </div>
  );
}