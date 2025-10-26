'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Lazy load images for better performance
const LazyImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  return (
    <div className={`relative overflow-hidden ${className || 'h-12 w-12'}`}>
      <Image
        src={src || '/images/placeholder-logo.svg'}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        loading="lazy"
      />
    </div>
  );
};

interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  industry?: string;
  overall_score?: number;
  verification_tier?: string;
  review_count?: number;
  follower_count?: number;
}

interface CompaniesGridProps {
  companies: Company[];
  currentPage: number;
  totalPages: number;
}

export function CompaniesGrid({ companies, currentPage, totalPages }: CompaniesGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setIsLoading(true);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    
    router.push(`/companies?${params.toString()}`);
    
    // Reset loading state after navigation
    setTimeout(() => setIsLoading(false), 500);
  };

  // Animation variants for grid items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Companies Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {companies.map((company) => (
          <motion.div key={company.id} variants={item}>
            <Link href={`/companies/${company.slug}`} className="block h-full">
              <Card className="h-full hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <LazyImage 
                      src={company.logo_url || '/images/placeholder-logo.svg'} 
                      alt={company.name} 
                      className="h-12 w-12 rounded-md"
                    />
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{company.name}</h3>
                      {company.industry && (
                        <p className="text-sm text-muted-foreground">{company.industry}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">
                        {company.overall_score ? company.overall_score.toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-sm text-muted-foreground">/10</span>
                    </div>
                    {company.verification_tier && (
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        <Shield className="h-3 w-3 mr-1" />
                        {company.verification_tier.charAt(0).toUpperCase() + company.verification_tier.slice(1)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="w-full flex justify-between text-sm text-muted-foreground">
                    <span>{company.review_count || 0} reviews</span>
                    <span>{company.follower_count || 0} followers</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                disabled={isLoading}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      )}
    </div>
  );
}