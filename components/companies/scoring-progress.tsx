'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ScoringProgressProps {
  requestId: string
  companyName: string
  onComplete: (scores: any) => void
  onError: (error: string) => void
}

const stages = [
  { id: 1, name: 'Initializing Analysis', duration: 5 },
  { id: 2, name: 'Gathering Company Data', duration: 15 },
  { id: 3, name: 'Analyzing Reviews & Reports', duration: 30 },
  { id: 4, name: 'Calculating Privacy Score', duration: 20 },
  { id: 5, name: 'Calculating Transparency Score', duration: 20 },
  { id: 6, name: 'Calculating Labor Score', duration: 20 },
  { id: 7, name: 'Calculating Environment Score', duration: 20 },
  { id: 8, name: 'Calculating Community Score', duration: 20 },
  { id: 9, name: 'Finalizing Results', duration: 10 }
]

export function ScoringProgress({
  requestId,
  companyName,
  onComplete,
  onError
}: ScoringProgressProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed'>('processing')

  useEffect(() => {
    let intervalId: NodeJS.Timeout
    let checkStatusInterval: NodeJS.Timeout

    // Simulate progress through stages
    const totalDuration = stages.reduce((acc, stage) => acc + stage.duration, 0)
    let elapsed = 0

    intervalId = setInterval(() => {
      elapsed += 1
      const newProgress = Math.min((elapsed / totalDuration) * 100, 99)
      setProgress(newProgress)

      // Update current stage based on elapsed time
      let cumulativeDuration = 0
      for (let i = 0; i < stages.length; i++) {
        cumulativeDuration += stages[i].duration
        if (elapsed <= cumulativeDuration) {
          setCurrentStage(i)
          break
        }
      }
    }, 1000)

    // Check actual status from API every 5 seconds
    checkStatusInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/ai/score-status/${requestId}`)
        const data = await response.json()

        if (data.status === 'completed') {
          clearInterval(intervalId)
          clearInterval(checkStatusInterval)
          setStatus('completed')
          setProgress(100)
          setCurrentStage(stages.length - 1)
          onComplete(data.scores)
        } else if (data.status === 'failed') {
          clearInterval(intervalId)
          clearInterval(checkStatusInterval)
          setStatus('failed')
          onError(data.error_message || 'Scoring failed')
        }
      } catch (error: any) {
        console.error('Error checking status:', error)
      }
    }, 5000)

    return () => {
      clearInterval(intervalId)
      clearInterval(checkStatusInterval)
    }
  }, [requestId, onComplete, onError])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === 'processing' && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
          {status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
          {status === 'failed' && <XCircle className="w-5 h-5 text-red-600" />}
          Analyzing {companyName}
        </CardTitle>
        <CardDescription>
          {status === 'processing' && 'This will take 2-3 minutes. Please don\'t close this page.'}
          {status === 'completed' && 'Analysis complete! Redirecting to results...'}
          {status === 'failed' && 'Analysis failed. Please try again.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stages */}
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                index === currentStage
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : index < currentStage
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex-shrink-0">
                {index < currentStage && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
                {index === currentStage && status === 'processing' && (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                )}
                {index > currentStage && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  index === currentStage
                    ? 'text-blue-900'
                    : index < currentStage
                    ? 'text-green-900'
                    : 'text-gray-500'
                }`}
              >
                {stage.name}
              </span>
            </div>
          ))}
        </div>

        {/* Methodology Info */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-gray-900 mb-2">What's happening:</p>
            <p className="text-sm text-gray-700 mb-3">
              Our AI is analyzing publicly available information, company policies, news articles,
              and community reviews to generate comprehensive ethics scores across 5 key dimensions.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-3">How Scores Are Calculated:</p>
            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex gap-2">
                <span className="font-bold text-blue-600">1.</span>
                <div>
                  <strong>Data Collection:</strong> We gather data from user reviews, company websites,
                  public reports, news articles, and regulatory filings
                </div>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-blue-600">2.</span>
                <div>
                  <strong>AI Analysis:</strong> GPT-4 analyzes content across 5 dimensions: Privacy,
                  Transparency, Labor Practices, Environmental Impact, and Community Impact
                </div>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-blue-600">3.</span>
                <div>
                  <strong>Evidence-Based Scoring:</strong> Each score (0-10) is backed by specific
                  evidence and reasoning, with confidence levels (high/medium/low)
                </div>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-blue-600">4.</span>
                <div>
                  <strong>Weighted Average:</strong> Overall score is calculated by averaging all
                  dimensions, with adjustments based on data quality and confidence
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800">
              <strong>Scoring Scale:</strong> 9-10 = Exceptional | 7-8 = Good | 5-6 = Average |
              3-4 = Concerning | 0-2 = Critical Issues
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
