'use client'

import { Company } from '@/types/database'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Building2, TrendingUp, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface CompanyCardProps {
  company: Company
}

export function CompanyCard({ company }: CompanyCardProps) {
  const getEthicsScoreColor = (score: number) => {
    if (score >= 7) return 'bg-green-500'
    if (score >= 5) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getEthicsScoreTextColor = (score: number) => {
    if (score >= 7) return 'text-green-700'
    if (score >= 5) return 'text-yellow-700'
    return 'text-red-700'
  }

  const getIndustryColor = (industry: string) => {
    const colors: Record<string, string> = {
      'AI': 'bg-purple-100 text-purple-800',
      'EV': 'bg-green-100 text-green-800',
      'IoT': 'bg-blue-100 text-blue-800',
      'HealthTech': 'bg-pink-100 text-pink-800',
      'FinTech': 'bg-yellow-100 text-yellow-800',
      'EdTech': 'bg-indigo-100 text-indigo-800',
      'Cybersecurity': 'bg-red-100 text-red-800',
    }
    return colors[industry] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {company.logo_url ? (
                <Image
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
              {company.verified && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {company.name}
              </h3>
              <Badge className={`${getIndustryColor(company.industry)} text-xs`}>
                {company.industry}
              </Badge>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEthicsScoreColor(company.ethics_score)} text-white`}>
              {company.ethics_score}/10
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span className="font-medium">Funding:</span>
            <span className="ml-1">{company.funding_stage}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Package className="w-4 h-4 mr-2" />
            <span className="font-medium">Products:</span>
            <span className="ml-1">{company.products?.length || 0}</span>
          </div>

          {company.investors && company.investors.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {company.investors.slice(0, 3).map((investor, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {investor}
                </Badge>
              ))}
              {company.investors.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{company.investors.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-6 px-6">
        <Button asChild className="w-full group-hover:bg-blue-600 transition-colors">
          <Link href={`/companies/${company.id}`}>
            View Profile
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}








