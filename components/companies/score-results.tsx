'use client'

import { CheckCircle2, TrendingUp, Award, AlertCircle, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface DimensionScore {
  score: number
  reasoning: string
  evidence: string[]
  confidence: 'high' | 'medium' | 'low'
}

interface ScoreResultsProps {
  companyName: string
  companySlug: string
  scores: {
    overall: DimensionScore
    privacy: DimensionScore
    transparency: DimensionScore
    labor: DimensionScore
    environment: DimensionScore
    community: DimensionScore
    methodology: string
    dataQuality: {
      reviewCount: number
      dataPoints: number
      confidence: string
    }
  }
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const getColor = (score: number) => {
    if (score >= 8) return 'bg-green-500'
    if (score >= 6) return 'bg-yellow-500'
    if (score >= 4) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getTextColor = (score: number) => {
    if (score >= 8) return 'text-green-700'
    if (score >= 6) return 'text-yellow-700'
    if (score >= 4) return 'text-orange-700'
    return 'text-red-700'
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-lg font-bold ${getTextColor(score)}`}>
          {score.toFixed(1)}/10
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${getColor(score)} h-full transition-all duration-500`}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
    </div>
  )
}

function ConfidenceBadge({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  const getVariant = () => {
    if (confidence === 'high') return 'default'
    if (confidence === 'medium') return 'secondary'
    return 'outline'
  }

  const getIcon = () => {
    if (confidence === 'high') return '✓'
    if (confidence === 'medium') return '•'
    return '?'
  }

  return (
    <Badge variant={getVariant as any} className="text-xs">
      {getIcon()} {confidence} confidence
    </Badge>
  )
}

export function ScoreResults({ companyName, companySlug, scores }: ScoreResultsProps) {
  const getOverallRating = (score: number) => {
    if (score >= 8) return { label: 'Excellent', color: 'text-green-600', emoji: '🌟' }
    if (score >= 6) return { label: 'Good', color: 'text-yellow-600', emoji: '👍' }
    if (score >= 4) return { label: 'Fair', color: 'text-orange-600', emoji: '⚠️' }
    return { label: 'Poor', color: 'text-red-600', emoji: '❌' }
  }

  const rating = getOverallRating(scores.overall.score)

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-2xl font-bold text-green-900">Analysis Complete!</h3>
              <p className="text-green-700">AI ethics score for {companyName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <span>Overall Ethics Score</span>
              <ConfidenceBadge confidence={scores.overall.confidence} />
            </CardTitle>
            <span className={`text-4xl font-bold ${rating.color}`}>
              {rating.emoji} {scores.overall.score.toFixed(1)}/10
            </span>
          </div>
          <CardDescription className="text-lg">
            Rating: <span className={`font-semibold ${rating.color}`}>{rating.label}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{scores.overall.reasoning}</p>

          {scores.overall.evidence.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Key Evidence
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {scores.overall.evidence.map((evidence, idx) => (
                  <li key={idx}>• {evidence}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dimension Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown by Dimension</CardTitle>
          <CardDescription>Detailed analysis across 5 ethics dimensions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScoreBar score={scores.privacy.score} label="Privacy & Data Protection" />
          <ScoreBar score={scores.transparency.score} label="Transparency & Accountability" />
          <ScoreBar score={scores.labor.score} label="Labor Practices & Diversity" />
          <ScoreBar score={scores.environment.score} label="Environmental Impact" />
          <ScoreBar score={scores.community.score} label="Community & Social Impact" />
        </CardContent>
      </Card>

      {/* Detailed Breakdowns */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { key: 'privacy', label: 'Privacy & Data Protection', data: scores.privacy },
          { key: 'transparency', label: 'Transparency', data: scores.transparency },
          { key: 'labor', label: 'Labor Practices', data: scores.labor },
          { key: 'environment', label: 'Environmental Impact', data: scores.environment },
          { key: 'community', label: 'Community Impact', data: scores.community }
        ].map(({ key, label, data }) => (
          <Card key={key} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {label}
                </CardTitle>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600 block">
                    {data.score.toFixed(1)}
                  </span>
                  <ConfidenceBadge confidence={data.confidence} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700">{data.reasoning}</p>

              {data.evidence.length > 0 && (
                <div className="text-sm bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">Evidence:</p>
                  <ul className="text-gray-600 space-y-1">
                    {data.evidence.map((evidence, i) => (
                      <li key={i} className="text-xs">• {evidence}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Methodology & Data Quality */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-purple-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Methodology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-3">{scores.methodology}</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>AI Model:</strong> GPT-4 Turbo (OpenAI)</p>
              <p><strong>Analysis Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Temperature:</strong> 0.3 (for consistency)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Data Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Reviews Analyzed:</span>
              <span className="font-semibold">{scores.dataQuality.reviewCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Data Sources:</span>
              <span className="font-semibold">{scores.dataQuality.dataPoints}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overall Confidence:</span>
              <span className="font-semibold capitalize">{scores.dataQuality.confidence}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Scoring Criteria */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            How Each Score Is Calculated
          </CardTitle>
          <CardDescription>
            Transparent breakdown of our AI-powered scoring methodology
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">🔒 Privacy & Data Protection</h4>
              <p className="text-xs text-gray-700">
                Evaluates data collection, user consent, GDPR/CCPA compliance, security measures,
                breach history, and transparency in data usage.
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">📊 Transparency & Accountability</h4>
              <p className="text-xs text-gray-700">
                Assesses public reporting, governance structure, stakeholder communication,
                audit practices, and leadership accountability.
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">👥 Labor Practices & Diversity</h4>
              <p className="text-xs text-gray-700">
                Reviews employee treatment, work-life balance, compensation, diversity initiatives,
                inclusion programs, and harassment policies.
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-900 mb-2">🌍 Environmental Impact</h4>
              <p className="text-xs text-gray-700">
                Analyzes carbon footprint, renewable energy usage, waste management,
                sustainability initiatives, and climate commitments.
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-orange-200 md:col-span-2">
              <h4 className="font-semibold text-orange-900 mb-2">🤝 Community & Social Impact</h4>
              <p className="text-xs text-gray-700">
                Evaluates social responsibility programs, charitable giving, community engagement,
                ethical AI practices, accessibility, and digital divide initiatives.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">Scoring Scale (0-10):</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="text-center p-2 bg-red-100 rounded">
                <div className="font-bold text-red-700">0-2</div>
                <div className="text-red-600">Critical</div>
              </div>
              <div className="text-center p-2 bg-orange-100 rounded">
                <div className="font-bold text-orange-700">3-4</div>
                <div className="text-orange-600">Concerning</div>
              </div>
              <div className="text-center p-2 bg-yellow-100 rounded">
                <div className="font-bold text-yellow-700">5-6</div>
                <div className="text-yellow-600">Average</div>
              </div>
              <div className="text-center p-2 bg-green-100 rounded">
                <div className="font-bold text-green-700">7-8</div>
                <div className="text-green-600">Good</div>
              </div>
              <div className="text-center p-2 bg-emerald-100 rounded">
                <div className="font-bold text-emerald-700">9-10</div>
                <div className="text-emerald-600">Exceptional</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1" size="lg">
              <Link href={`/companies/${companySlug}`}>
                View Company Profile
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link href="/companies">
                Browse More Companies
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <p className="text-xs text-gray-600">
            <strong>Disclaimer:</strong> These scores are generated by AI based on user reviews,
            publicly available information, and industry standards. Scores should be used as a general
            guide and may not reflect the most recent developments. For critical decisions, please conduct
            your own research and due diligence. Confidence levels indicate the reliability of available data.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
