'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface RequiredFieldsValidatorProps {
  company: any;
}

interface FieldDefinition {
  key: string;
  label: string;
  description: string;
  example: string;
  required: boolean;
}

export default function RequiredFieldsValidator({ company }: RequiredFieldsValidatorProps) {
  const [completedFields, setCompletedFields] = useState<string[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const requiredFields: FieldDefinition[] = [
    {
      key: 'name',
      label: 'Company Name',
      description: 'Official name of your company',
      example: 'Acme Corporation',
      required: true
    },
    {
      key: 'logo_url',
      label: 'Company Logo',
      description: 'Square logo image (min 200x200px)',
      example: 'Upload a clear, recognizable logo',
      required: true
    },
    {
      key: 'website',
      label: 'Website',
      description: 'Official company website URL',
      example: 'https://example.com',
      required: true
    },
    {
      key: 'industry',
      label: 'Industry',
      description: 'Primary industry sector',
      example: 'Technology, Healthcare, Finance',
      required: true
    },
    {
      key: 'hq_location',
      label: 'Headquarters',
      description: 'Main office location',
      example: 'San Francisco, CA',
      required: true
    },
    {
      key: 'employee_count',
      label: 'Employee Count',
      description: 'Approximate number of employees',
      example: '50, 100, 1000+',
      required: true
    },
    {
      key: 'founded_year',
      label: 'Founded Year',
      description: 'Year the company was established',
      example: '2010',
      required: true
    },
    {
      key: 'funding_stage',
      label: 'Funding Stage',
      description: 'Current funding status',
      example: 'Bootstrapped, Series A, Public',
      required: true
    },
    {
      key: 'privacy_policy_url',
      label: 'Privacy Policy',
      description: 'Link to privacy policy document',
      example: 'https://example.com/privacy',
      required: true
    },
    {
      key: 'terms_url',
      label: 'Terms of Service',
      description: 'Link to terms of service',
      example: 'https://example.com/terms',
      required: false
    },
    {
      key: 'transparency_report_url',
      label: 'Transparency Report',
      description: 'Link to transparency documentation',
      example: 'https://example.com/transparency',
      required: false
    },
    {
      key: 'verification_documents',
      label: 'Verification Documents',
      description: 'Proof of company ownership/registration',
      example: 'Business registration certificate',
      required: true
    }
  ];

  useEffect(() => {
    // Determine which fields are completed
    const completed = requiredFields
      .filter(field => {
        if (field.key === 'verification_documents') {
          return company.verification_documents && company.verification_documents.length > 0;
        }
        return company[field.key] && company[field.key] !== '';
      })
      .map(field => field.key);
    
    setCompletedFields(completed);
    
    // Calculate completion percentage based on required fields only
    const requiredFieldsCount = requiredFields.filter(field => field.required).length;
    const completedRequiredFields = completed.filter(key => 
      requiredFields.find(field => field.key === key && field.required)
    ).length;
    
    setCompletionPercentage(Math.round((completedRequiredFields / requiredFieldsCount) * 100));
  }, [company]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Required Fields</span>
          <Badge variant={completionPercentage === 100 ? "success" : "outline"}>
            {completionPercentage}% Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {requiredFields.map((field) => (
            <div key={field.key} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                {completedFields.includes(field.key) ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : field.required ? (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                )}
                <span className="font-medium">{field.label}</span>
                {field.required && <Badge variant="outline" className="ml-2">Required</Badge>}
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                      <p>{field.description}</p>
                      <p className="text-xs text-muted-foreground">Example: {field.example}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}