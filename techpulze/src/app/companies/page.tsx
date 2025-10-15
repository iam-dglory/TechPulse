'use client'

import { useEffect, useState } from 'react'
import { Company } from '@/types/database'
import { CompanyCard } from '@/components/CompanyCard'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`/api/companies?page=${page}&limit=12`)
        if (!response.ok) {
          throw new Error('Failed to fetch companies')
        }
        const data = await response.json()
        
        if (page === 1) {
          setCompanies(data.companies || [])
        } else {
          setCompanies(prev => [...prev, ...(data.companies || [])])
        }
        
        setHasMore(data.pagination.page < data.pagination.totalPages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [page])

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  if (loading && companies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading companies...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Setup Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please check your Supabase configuration and ensure the database schema is set up correctly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Tech Companies
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Explore companies and their ethical impact scores
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/companies/search">
                <Search className="w-4 h-4 mr-2" />
                Search & Filter
              </Link>
            </Button>
            <Button asChild>
              <Link href="/companies/create">
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Link>
            </Button>
          </div>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No companies found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Companies will appear here once the database is populated.
            </p>
            <Button asChild>
              <Link href="/companies/create">
                <Plus className="w-4 h-4 mr-2" />
                Add First Company
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>

            {hasMore && (
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
  )
}
