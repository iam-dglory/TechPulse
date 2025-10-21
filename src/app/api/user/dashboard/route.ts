/**
 * User Dashboard API Endpoint
 *
 * GET /api/user/dashboard - Get aggregated user dashboard data
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  successResponse,
  errorResponseFromUnknown,
  unauthorizedResponse,
} from '@/lib/api-response';
import { requireAuth, requireProfile } from '@/lib/auth/middleware';
import {
  DatabaseError,
  fromSupabaseError,
} from '@/lib/errors';
import type { Database } from '@/types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type CompanyRow = Database['public']['Tables']['companies']['Row'];
type VoteRow = Database['public']['Tables']['votes']['Row'];
type NotificationRow = Database['public']['Tables']['notifications']['Row'];

/**
 * Company with basic info for followed companies
 */
interface FollowedCompany {
  id: string;
  name: string;
  slug: string;
  industry: string;
  logo_url: string | null;
  company_scores?: {
    overall_score: number;
    verification_tier: string;
  } | null;
}

/**
 * Vote with company information
 */
interface VoteWithCompany extends VoteRow {
  companies: Pick<CompanyRow, 'id' | 'name' | 'slug' | 'logo_url'> | null;
}

/**
 * Dashboard statistics
 */
interface DashboardStats {
  totalVotes: number;
  totalComments: number;
  followedCompaniesCount: number;
  reputationLevel: string;
}

/**
 * Complete dashboard data
 */
interface DashboardData {
  profile: ProfileRow;
  followedCompanies: FollowedCompany[];
  recentVotes: VoteWithCompany[];
  stats: DashboardStats;
  notifications: NotificationRow[];
}

/**
 * Calculate reputation level from reputation score
 */
function getReputationLevel(reputation: number): string {
  if (reputation >= 1000) return 'Expert';
  if (reputation >= 500) return 'Advanced';
  if (reputation >= 250) return 'Intermediate';
  if (reputation >= 100) return 'Contributor';
  return 'Beginner';
}

/**
 * GET /api/user/dashboard
 *
 * Fetch aggregated dashboard data for authenticated user:
 * - User profile
 * - Followed companies (limit 12) with company details
 * - Recent votes (limit 20) with company names
 * - Statistics (total votes, comments, followed companies, reputation level)
 * - Unread notifications (limit 10)
 *
 * @returns Complete dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();
    const profile = await requireProfile();

    // Fetch followed companies (limit 12) with company details
    const { data: follows, error: followsError } = await supabase
      .from('user_follows')
      .select(
        `
        company_id,
        companies (
          id,
          name,
          slug,
          industry,
          logo_url,
          company_scores (
            overall_score,
            verification_tier
          )
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12);

    if (followsError) {
      console.warn('Failed to fetch followed companies:', followsError);
    }

    // Extract and flatten company data
    const followedCompanies: FollowedCompany[] = (follows || [])
      .map((follow: any) => follow.companies)
      .filter(Boolean);

    // Fetch recent votes (limit 20) with company names
    const { data: recentVotes, error: votesError } = await supabase
      .from('votes')
      .select(
        `
        *,
        companies (
          id,
          name,
          slug,
          logo_url
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (votesError) {
      console.warn('Failed to fetch recent votes:', votesError);
    }

    // Count total votes by user
    const { count: totalVotes, error: voteCountError } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (voteCountError) {
      console.warn('Failed to count total votes:', voteCountError);
    }

    // Count votes with comments
    const { count: totalComments, error: commentCountError } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('comment', 'is', null);

    if (commentCountError) {
      console.warn('Failed to count votes with comments:', commentCountError);
    }

    // Count followed companies
    const { count: followedCompaniesCount, error: followCountError } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (followCountError) {
      console.warn('Failed to count followed companies:', followCountError);
    }

    // Fetch unread notifications (limit 10)
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (notificationsError) {
      console.warn('Failed to fetch notifications:', notificationsError);
    }

    // Build dashboard stats
    const stats: DashboardStats = {
      totalVotes: totalVotes || 0,
      totalComments: totalComments || 0,
      followedCompaniesCount: followedCompaniesCount || 0,
      reputationLevel: getReputationLevel(profile.reputation || 0),
    };

    // Build complete dashboard data
    const dashboardData: DashboardData = {
      profile,
      followedCompanies,
      recentVotes: (recentVotes as VoteWithCompany[]) || [],
      stats,
      notifications: notifications || [],
    };

    return successResponse(
      dashboardData,
      200,
      'Dashboard data retrieved successfully'
    );
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Authentication')) {
      return unauthorizedResponse('Please log in to access your dashboard');
    }

    console.error('GET /api/user/dashboard error:', error);
    return errorResponseFromUnknown(error);
  }
}
