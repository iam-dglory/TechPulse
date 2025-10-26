'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Bookmark, BookmarkCheck, Building } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ClaimCompanyButton from './ClaimCompanyButton';

interface CompanyProfileHeaderProps {
  company: any;
  isOwner: boolean;
  currentUser: any;
}

export default function CompanyProfileHeader({ company, isOwner, currentUser }: CompanyProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(company.is_followed || false);
  const [isBookmarked, setIsBookmarked] = useState(company.is_bookmarked || false);
  const [followCount, setFollowCount] = useState(company.follow_count || 0);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const handleFollow = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to follow companies',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Optimistic UI update
      setIsFollowing(!isFollowing);
      setFollowCount(isFollowing ? followCount - 1 : followCount + 1);

      const response = await fetch(`/api/companies/${company.id}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isFollowing ? 'unfollow' : 'follow',
        }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setIsFollowing(isFollowing);
        setFollowCount(followCount);
        throw new Error('Failed to update follow status');
      }

      toast({
        title: isFollowing ? 'Company unfollowed' : 'Company followed',
        description: isFollowing 
          ? `You will no longer receive updates from ${company.name}` 
          : `You will now receive updates from ${company.name}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to bookmark companies',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Optimistic UI update
      setIsBookmarked(!isBookmarked);

      const response = await fetch(`/api/companies/${company.id}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isBookmarked ? 'remove' : 'add',
        }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setIsBookmarked(isBookmarked);
        throw new Error('Failed to update bookmark status');
      }

      toast({
        title: isBookmarked ? 'Bookmark removed' : 'Company bookmarked',
        description: isBookmarked 
          ? `${company.name} has been removed from your bookmarks` 
          : `${company.name} has been added to your bookmarks`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Company profile link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link to clipboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative mb-8">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden rounded-lg bg-muted">
        {company.cover_url ? (
          <Image
            src={company.cover_url}
            alt={`${company.name} cover`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}
      </div>

      {/* Company Logo and Info */}
      <div className="container px-4 relative">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
          {/* Logo */}
          <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-lg overflow-hidden border-4 border-background bg-background shadow-md">
            {company.logo_url ? (
              <Image
                src={company.logo_url}
                alt={`${company.name} logo`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <Building className="h-12 w-12 text-primary/40" />
              </div>
            )}
          </div>

          {/* Company Info */}
          <div className="flex-1 pt-2 md:pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold">{company.name}</h1>
              {company.is_verified && (
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {company.verification_tier === 'gold' ? 'Gold Verified' : 
                   company.verification_tier === 'silver' ? 'Silver Verified' : 'Verified'}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {company.industry && <span>{company.industry}</span>}
              {company.hq_location && <span>{company.hq_location}</span>}
              {company.founded_year && <span>Founded {company.founded_year}</span>}
              <span>{followCount} followers</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            {!company.claimed_by && !isOwner && currentUser && (
              <ClaimCompanyButton companyId={company.id} companyName={company.name} />
            )}
            
            <Button
              variant={isFollowing ? "default" : "outline"}
              size="sm"
              onClick={handleFollow}
              className="flex items-center gap-1"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleBookmark}
              className="flex items-center gap-1"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}