'use client'

import { useState, useEffect, useCallback } from 'react'
import { Company } from '@/types/database'
import { CompanyCard } from '@/components/CompanyCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

const industries = [
  'AI', 'EV', 'IoT', 'HealthTech', 'FinTech', 'EdTech', 'Cybersecurity', 'Blockchain', 'AR/VR', 'Robotics'
]

const fundingStages = [
  'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Public', 'Acquired'
]

const sortOptions = [
  { value: 'ethics_score', label: 'Ethics Score (High to Low)' },
  { value: 'created_at', label: 'Newest First' },
  { value: 'name', label: 'A to Z' },
  { value: 'reviews_count', label: 'Most Reviews' }
]

interface SearchFilters {
  industry: string[]
  ethicsScoreMin: number
  ethicsScoreMax: number
  fundingStage: string[]
  verified: boolean | undefined
  sortBy: string
  sortOrder: string
}

export default function CompanySearchPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    industry: [],
    ethicsScoreMin: 0,
    ethicsScoreMax: 10,
    fundingStage: [],
    verified: undefined,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0
  })
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const searchCompanies = useCallback(async (page = 1, resetResults = false) => {
    setLoading(true)
    try {
      const response = await fetch('/api/companies/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: debouncedSearchQuery,
          filters,
          page,
          limit: 12
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (resetResults) {
          setCompanies(data.companies)
        } else {
          setCompanies(prev => [...prev, ...data.companies])
        }
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error searching companies:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchQuery, filters])

  useEffect(() => {
    searchCompanies(1, true)
  }, [searchCompanies])

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleIndustry = (industry: string) => {
    setFilters(prev => ({
      ...prev,
      industry: prev.industry.includes(industry)
        ? prev.industry.filter(i => i !== industry)
        : [...prev.industry, industry]
    }))
  }

  const toggleFundingStage = (stage: string) => {
    setFilters(prev => ({
      ...prev,
      fundingStage: prev.fundingStage.includes(stage)
        ? prev.fundingStage.filter(s => s !== stage)
        : [...prev.fundingStage, stage]
    }))
  }

  const clearFilters = () => {
    setFilters({
      industry: [],
      ethicsScoreMin: 0,
      ethicsScoreMax: 10,
      fundingStage: [],
      verified: undefined,
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
    setSearchQuery('')
  }

  const loadMore = () => {
    if (pagination.page < pagination.totalPages) {
      searchCompanies(pagination.page + 1, false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Search Companies
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Find companies by name, industry, or ethical impact
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Search and Filters */}
          <div className="lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Search & Filters</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search companies..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {industries.map((industry) => (
                      <div key={industry} className="flex items-center space-x-2">
                        <Checkbox
                          id={industry}
                          checked={filters.industry.includes(industry)}
                          onCheckedChange={() => toggleIndustry(industry)}
                        />
                        <label htmlFor={industry} className="text-sm">
                          {industry}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ethics Score Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ethics Score: {filters.ethicsScoreMin} - {filters.ethicsScoreMax}
                  </label>
                  <Slider
                    value={[filters.ethicsScoreMin, filters.ethicsScoreMax]}
                    onValueChange={([min, max]) => {
                      handleFilterChange('ethicsScoreMin', min)
                      handleFilterChange('ethicsScoreMax', max)
                    }}
                    max={10}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Funding Stage Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Funding Stage</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {fundingStages.map((stage) => (
                      <div key={stage} className="flex items-center space-x-2">
                        <Checkbox
                          id={stage}
                          checked={filters.fundingStage.includes(stage)}
                          onCheckedChange={() => toggleFundingStage(stage)}
                        />
                        <label htmlFor={stage} className="text-sm">
                          {stage}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verified Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Verification</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={filters.verified === true}
                        onCheckedChange={(checked) => 
                          handleFilterChange('verified', checked ? true : undefined)
                        }
                      />
                      <label htmlFor="verified" className="text-sm">
                        Verified Only
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => {
                      const [sortBy, sortOrder] = value.split('-')
                      handleFilterChange('sortBy', sortBy)
                      handleFilterChange('sortOrder', sortOrder)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {pagination.total} companies found
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {debouncedSearchQuery && `Search results for "${debouncedSearchQuery}"`}
                </p>
              </div>
            </div>

            {loading && companies.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Searching companies...</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No companies found
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {companies.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>

                {pagination.page < pagination.totalPages && (
                  <div className="text-center">
                    <Button
                      onClick={loadMore}
                      disabled={loading}
                      variant="outline"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}





