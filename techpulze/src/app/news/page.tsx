'use client'

import { useEffect, useState } from 'react'
import { NewsUpdate } from '@/types/database'

interface NewsUpdateWithCompany extends NewsUpdate {
  companies?: {
    id: string
    name: string
    logo_url: string | null
  } | null
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsUpdateWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news')
        if (!response.ok) {
          throw new Error('Failed to fetch news')
        }
        const data = await response.json()
        setNews(data.news || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading news...</p>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tech News
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Latest developments in tech with ethical impact analysis
          </p>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No news found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              News updates will appear here once the database is populated.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {news.map((article) => (
              <article
                key={article.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {article.headline}
                    </h2>
                    {article.companies && (
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                          Company:
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                          {article.companies.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(article.published_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {article.summary}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                        Ethics:
                      </span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              article.ethics_score >= 7
                                ? 'bg-green-500'
                                : article.ethics_score >= 4
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${(article.ethics_score / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {article.ethics_score}/10
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                        Hype:
                      </span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              article.hype_score >= 7
                                ? 'bg-purple-500'
                                : article.hype_score >= 4
                                ? 'bg-orange-500'
                                : 'bg-gray-500'
                            }`}
                            style={{ width: `${(article.hype_score / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {article.hype_score}/10
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {article.sector}
                  </div>
                </div>

                {article.ethical_impact_tags && article.ethical_impact_tags.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                      Ethical Impact:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {article.ethical_impact_tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Read full article →
                  </a>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(article.created_at).toLocaleString()}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


















