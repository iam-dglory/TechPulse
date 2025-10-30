'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ScoringProgress } from '@/components/companies/scoring-progress'
import { ScoreResults } from '@/components/companies/score-results'
import { toast } from '@/hooks/use-toast'

interface PageProps {
  params: Promise<{
    slug: string
    requestId: string
  }>
}

export default function ScoringPage({ params }: PageProps) {
  const router = useRouter()
  const [resolvedParams, setResolvedParams] = useState<{ slug: string; requestId: string } | null>(null)
  const [companyName, setCompanyName] = useState<string>('')
  const [scores, setScores] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => {
      setResolvedParams(p)
      // Fetch company name from slug
      fetch(`/api/companies?slug=${p.slug}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setCompanyName(data[0].name)
          }
        })
        .catch(err => console.error('Error fetching company:', err))
    })
  }, [params])

  const handleComplete = (completedScores: any) => {
    setScores(completedScores)

    // Redirect after showing results briefly
    setTimeout(() => {
      if (resolvedParams) {
        router.push(`/companies/${resolvedParams.slug}`)
      }
    }, 10000) // Stay on results for 10 seconds
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    toast({
      title: 'Scoring Failed',
      description: errorMessage,
      variant: 'destructive'
    })

    // Redirect back to company page after error
    setTimeout(() => {
      if (resolvedParams) {
        router.push(`/companies/${resolvedParams.slug}`)
      }
    }, 3000)
  }

  if (!resolvedParams) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-900 mb-2">Scoring Failed</h2>
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-4">Redirecting back to company page...</p>
          </div>
        ) : scores ? (
          <ScoreResults
            companyName={companyName}
            companySlug={resolvedParams.slug}
            scores={scores}
          />
        ) : (
          <ScoringProgress
            requestId={resolvedParams.requestId}
            companyName={companyName || 'Company'}
            onComplete={handleComplete}
            onError={handleError}
          />
        )}
      </div>
    </div>
  )
}
