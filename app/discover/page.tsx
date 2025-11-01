'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Heart,
  Shield,
  Users,
  Leaf,
  Building2,
  TrendingUp,
  Search,
  Filter,
  Sparkles,
  DollarSign
} from 'lucide-react'

export default function DiscoverPage() {
  const [preferences, setPreferences] = useState({
    minScore: 7.0,
    industries: [] as string[],
    priorities: {
      privacy: true,
      transparency: true,
      labor: true,
      environment: true,
      community: true
    },
    company_sizes: [] as string[],
    isInvestor: false,
    minMarketCap: 0,
    maxMarketCap: 1000000
  })

  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [industries, setIndustries] = useState<any[]>([])

  useEffect(() => {
    loadIndustries()
    loadRecommendations()
  }, [])

  const loadIndustries = async () => {
    try {
      const res = await fetch('/api/industries')
      const data = await res.json()
      setIndustries(data || [])
    } catch (error) {
      console.error('Error loading industries:', error)
    }
  }

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })
      const data = await res.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePriority = (key: keyof typeof preferences.priorities) => {
    setPreferences({
      ...preferences,
      priorities: {
        ...preferences.priorities,
        [key]: !preferences.priorities[key]
      }
    })
  }

  const toggleIndustry = (industryId: string) => {
    const industries = preferences.industries.includes(industryId)
      ? preferences.industries.filter(id => id !== industryId)
      : [...preferences.industries, industryId]
    setPreferences({ ...preferences, industries })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">
          <Sparkles className="inline w-8 h-8 mr-2 text-yellow-500" />
          Discover Ethical Companies
        </h1>
        <p className="text-gray-600">Find companies that align with your values</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Card className="p-6 h-fit lg:sticky lg:top-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Your Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-6">
            {/* Minimum Score */}
            <div>
              <Label className="mb-2 block">
                Minimum Ethics Score: <span className="font-bold text-blue-600">{preferences.minScore}/10</span>
              </Label>
              <Slider
                value={[preferences.minScore]}
                onValueChange={(value) => setPreferences({ ...preferences, minScore: value[0] })}
                min={0}
                max={10}
                step={0.5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Any</span>
                <span>Excellent Only</span>
              </div>
            </div>

            {/* Priorities */}
            <div>
              <Label className="mb-3 block font-semibold">What matters to you?</Label>
              <div className="space-y-3">
                {[
                  { key: 'privacy', label: 'Privacy & Data', icon: Shield, color: 'text-blue-600' },
                  { key: 'transparency', label: 'Transparency', icon: Building2, color: 'text-purple-600' },
                  { key: 'labor', label: 'Labor Practices', icon: Users, color: 'text-green-600' },
                  { key: 'environment', label: 'Environment', icon: Leaf, color: 'text-emerald-600' },
                  { key: 'community', label: 'Community Impact', icon: Heart, color: 'text-red-600' }
                ].map(({ key, label, icon: Icon, color }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Checkbox
                      id={key}
                      checked={preferences.priorities[key as keyof typeof preferences.priorities]}
                      onCheckedChange={() => togglePriority(key as keyof typeof preferences.priorities)}
                    />
                    <Icon className={`w-4 h-4 ${color}`} />
                    <Label htmlFor={key} className="text-sm cursor-pointer flex-1">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Industries */}
            {industries.length > 0 && (
              <div>
                <Label className="mb-3 block font-semibold">Industries (Optional)</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {industries.slice(0, 10).map((industry) => (
                    <div key={industry.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`industry-${industry.id}`}
                        checked={preferences.industries.includes(industry.id)}
                        onCheckedChange={() => toggleIndustry(industry.id)}
                      />
                      <Label htmlFor={`industry-${industry.id}`} className="text-sm cursor-pointer">
                        {industry.name} ({industry.company_count})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investor Mode */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  id="investor"
                  checked={preferences.isInvestor}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, isInvestor: !!checked })}
                />
                <DollarSign className="w-4 h-4 text-green-600" />
                <Label htmlFor="investor" className="cursor-pointer font-semibold">
                  I'm an investor
                </Label>
              </div>

              {preferences.isInvestor && (
                <div className="space-y-3 pl-6">
                  <div>
                    <Label className="text-xs mb-1 block">Min Market Cap ($M)</Label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={preferences.minMarketCap}
                      onChange={(e) => setPreferences({ ...preferences, minMarketCap: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Max Market Cap ($M)</Label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={preferences.maxMarketCap}
                      onChange={(e) => setPreferences({ ...preferences, maxMarketCap: parseInt(e.target.value) || 1000000 })}
                      placeholder="1000000"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full"
              onClick={loadRecommendations}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Search className="w-4 h-4 mr-2 animate-spin" />
                  Finding...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find Companies
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {recommendations.length} {recommendations.length === 1 ? 'Company Matches' : 'Companies Match'} Your Values
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-600">Finding companies that match your values...</p>
              </div>
            </div>
          ) : recommendations.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No matches yet</h3>
              <p className="text-gray-600 mb-4">
                Adjust your preferences and click "Find Companies" to discover ethical businesses
              </p>
            </Card>
          ) : (
            recommendations.map((company: any) => (
              <Card key={company.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {company.logo_url ? (
                        <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Building2 className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Link href={`/companies/${company.slug}`} className="hover:underline">
                        <h4 className="font-bold text-lg">{company.name}</h4>
                      </Link>
                      <p className="text-sm text-gray-600">
                        {company.industry?.name || 'Technology'}
                      </p>
                      {company.match_percentage && (
                        <Badge variant="default" className="mt-1">
                          {company.match_percentage}% Match
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {company.overall_score.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">Ethics Score</div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {[
                    { key: 'privacy', label: 'Privacy', icon: Shield },
                    { key: 'transparency', label: 'Transparency', icon: Building2 },
                    { key: 'labor', label: 'Labor', icon: Users },
                    { key: 'environment', label: 'Environment', icon: Leaf },
                    { key: 'community', label: 'Community', icon: Heart }
                  ].map(({ key, label, icon: Icon }) => {
                    const score = company[`${key}_score`] || 0
                    const isHighlighted = preferences.priorities[key as keyof typeof preferences.priorities]

                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={`flex items-center gap-1 ${isHighlighted ? 'font-semibold' : 'text-gray-600'}`}>
                            <Icon className="w-3 h-3" />
                            {label}
                          </span>
                          <span>{score.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isHighlighted ? 'bg-blue-600' : 'bg-gray-400'}`}
                            style={{ width: `${score * 10}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Additional Info */}
                <div className="flex flex-wrap gap-2">
                  {company.industry_rank && (
                    <Badge variant="secondary">
                      #{company.industry_rank} in {company.industry?.name}
                    </Badge>
                  )}
                  <Badge variant="outline">{company.review_count || 0} reviews</Badge>
                  {preferences.isInvestor && company.market_cap && (
                    <Badge variant="outline">
                      ${(company.market_cap / 1000).toFixed(1)}B market cap
                    </Badge>
                  )}
                  {company.employee_count && (
                    <Badge variant="outline">
                      {company.employee_count.toLocaleString()} employees
                    </Badge>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
