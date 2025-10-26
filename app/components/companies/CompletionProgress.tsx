'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CompletionProgressProps {
  companyId: string;
  isOwner: boolean;
}

export default function CompletionProgress({ companyId, isOwner }: CompletionProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCompletionStatus = async () => {
      if (!isOwner) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/companies/${companyId}/onboarding`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setProgress(data.data.onboarding.completion_percentage);
          setCurrentStep(data.data.onboarding.current_step);
        }
      } catch (error) {
        console.error('Error fetching completion status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletionStatus();
  }, [companyId, isOwner]);

  const handleContinueOnboarding = () => {
    router.push(`/companies/${companyId}/onboarding`);
  };

  if (!isOwner || isLoading) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {progress < 100 ? (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          Profile Completion
        </CardTitle>
        <CardDescription>
          {progress < 100 
            ? `Your company profile is ${progress}% complete. Complete all required fields to get verified.` 
            : 'Your company profile is complete and ready for verification.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">
              {progress < 100 
                ? `${progress}% - ${getRemainingFieldsText(progress)}` 
                : '100% - All required fields completed'}
            </div>
            
            <Button 
              onClick={handleContinueOnboarding}
              size="sm"
              className="flex items-center gap-1"
            >
              {progress < 100 ? 'Continue Setup' : 'View Profile'} 
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getRemainingFieldsText(progress: number): string {
  if (progress < 20) return 'Basic information needed';
  if (progress < 40) return 'Add company details';
  if (progress < 60) return 'Team & metrics needed';
  if (progress < 80) return 'Add policies & links';
  if (progress < 100) return 'Upload verification documents';
  return 'All required fields completed';
}