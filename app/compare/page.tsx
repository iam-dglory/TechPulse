'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  X,
  TrendingUp,
  Search,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default function ComparePage() {
  const [selectedCompanies, setSelectedCompanies] = useState<any[]>([])
  const [allCompanies, setAllCompanies] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    if (selectedCompanies.length >= 2) {
      loadComparison()
    } else {
      setComparisonData(null)
    }
  }, [selectedCompanies])

  const loadCompanies = async () => {
    try {
      const res = await fetch('/api/companies?limit=100')
      const data = await res.json()
      setAllCompanies(data.data || [])
    } catch (error) {
      console.error('Error loading companies:', error)
    }
  }

  const loadComparison = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyIds: selectedCompanies.map(c => c.id) })
      })
      const data = await res.json()
      setComparisonData(data)
    } catch (error) {
      console.error('Error loading comparison:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCompany = (company: any) => {
    if (selectedCompanies.length < 4 && !selectedCompanies.find(c => c.id === company.id)) {
      setSelectedCompanies([...selectedCompanies, company])
    }
  }

  const removeCompany = (id: string) => {
    setSelectedCompanies(selectedCompanies.filter(c => c.id !== id))
  }

  const filteredCompanies = allCompanies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedCompanies.find(sc => sc.id === c.id)
  )

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Compare Companies</h1>
        <p className="text-gray-600">Side-by-side comparison of ethics scores and metrics</p>
      </div>

      {/* Company Selector */}
      {selectedCompanies.length < 4 && (
        <Card className="p-6 mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Select companies to compare ({selectedCompanies.length}/4)
          </h3>
          <Input
            placeholder="Search for a company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {filteredCompanies.slice(0, 10).map(company => (
              <button
                key={company.id}
                onClick={() => addCompany(company)}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Building2 className="w-8 h-8 text-gray-400" />
                <div className="flex-1">
                  <div className="font-medium">{company.name}</div>
                  <div className="text-sm text-gray-600">{company.industry?.name || company.industry || 'Technology'}</div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {company.overall_score.toFixed(1)}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Selected Companies */}
      {selectedCompanies.length > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Comparing {selectedCompanies.length} companies</h3>
            {selectedCompanies.length >= 2 && (
              <Badge variant="default">Ready to compare</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedCompanies.map(company => (
              <div
                key={company.id}
                className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg"
              >
                <span className="font-medium">{company.name}</span>
                <span className="text-sm text-gray-600">({company.overall_score.toFixed(1)})</span>
                <button
                  onClick={() => removeCompany(company.id)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Comparison Results */}
      {comparisonData && comparisonData.companies && comparisonData.companies.length >= 2 && (
        <>
          {/* Score Comparison Table */}
          <Card className="p-6 mb-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Ethics Score Comparison</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Metric</th>
                      {comparisonData.companies.map((company: any) => (
                        <th key={company.id} className="text-center py-3 px-4">
                          <Link href={`/companies/${company.slug}`} className="hover:underline">
                            <div className="font-bold">{company.name}</div>
                          </Link>
                          <div className="text-xs text-gray-600 font-normal">
                            {company.industry?.name || 'Technology'}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'overall_score', label: 'Overall Score' },
                      { key: 'privacy_score', label: 'Privacy & Data' },
                      { key: 'transparency_score', label: 'Transparency' },
                      { key: 'labor_score', label: 'Labor Practices' },
                      { key: 'environment_score', label: 'Environment' },
                      { key: 'community_score', label: 'Community' }
                    ].map(({ key, label }) => {
                      const scores = comparisonData.companies.map((c: any) => c[key] || 0)
                      const bestScore = Math.max(...scores)

                      return (
                        <tr key={key} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{label}</td>
                          {comparisonData.companies.map((company: any) => {
                            const score = company[key] || 0
                            const isBest = score === bestScore && score > 0
                            const color = score >= 8 ? 'text-green-600' : score >= 6 ? 'text-blue-600' : score >= 4 ? 'text-yellow-600' : 'text-red-600'

                            return (
                              <td key={company.id} className="text-center py-3 px-4">
                                <div className={`text-2xl font-bold ${isBest ? 'text-green-600' : color}`}>
                                  {score.toFixed(1)}
                                </div>
                                {isBest && (
                                  <Badge variant="default" className="mt-1 text-xs">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Best
                                  </Badge>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}

                    {/* Additional Metrics */}
                    <tr className="border-b bg-gray-50">
                      <td className="py-3 px-4 font-medium">Industry Rank</td>
                      {comparisonData.companies.map((company: any) => (
                        <td key={company.id} className="text-center py-3 px-4">
                          #{company.industry_rank || '—'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="py-3 px-4 font-medium">Reviews</td>
                      {comparisonData.companies.map((company: any) => (
                        <td key={company.id} className="text-center py-3 px-4">
                          {company.review_count || 0}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="py-3 px-4 font-medium">Followers</td>
                      {comparisonData.companies.map((company: any) => (
                        <td key={company.id} className="text-center py-3 px-4">
                          {company.follower_count || 0}
                        </td>
                      ))}
                    </tr>
                    {comparisonData.companies.some((c: any) => c.employee_count) && (
                      <tr className="border-b bg-gray-50">
                        <td className="py-3 px-4 font-medium">Employees</td>
                        {comparisonData.companies.map((company: any) => (
                          <td key={company.id} className="text-center py-3 px-4">
                            {company.employee_count?.toLocaleString() || '—'}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          {comparisonData.insights && comparisonData.insights.length > 0 && (
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-3">
                  {comparisonData.insights.map((insight: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {selectedCompanies.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No companies selected</h3>
          <p className="text-gray-600 mb-4">
            Search and select 2-4 companies to start comparing their ethics scores
          </p>
        </Card>
      )}

      {selectedCompanies.length === 1 && (
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Select one more company</h3>
          <p className="text-gray-600 mb-4">
            Add at least one more company to enable comparison
          </p>
        </Card>
      )}
    </div>
  )
}
