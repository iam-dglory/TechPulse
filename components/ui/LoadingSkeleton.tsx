'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
        className
      )}
    />
  );
}

interface LoadingSkeletonProps {
  variant?: 'card' | 'profile' | 'table' | 'list';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ 
  variant = 'card', 
  count = 1,
  className 
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);
  
  if (variant === 'card') {
    return (
      <div className={cn("grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3", className)}>
        {items.map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="flex justify-between pt-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (variant === 'profile') {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (variant === 'table') {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-4 border-b">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          {items.map((i) => (
            <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // List variant
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}