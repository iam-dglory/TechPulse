'use client'

import { motion } from 'framer-motion'
import { ThumbsUp, MessageSquare, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface VotingCardProps {
  companyId: string
  companyName: string
  totalVotes: number
  averageScore: number
  recentVoteCount24h?: number
  className?: string
}

/**
 * Compact voting card for displaying on company listings
 * Shows quick stats and CTA to full voting interface
 */
export function VotingCard({
  companyId,
  companyName,
  totalVotes,
  averageScore,
  recentVoteCount24h = 0,
  className = '',
}: VotingCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400'
    if (score >= 6) return 'text-blue-600 dark:text-blue-400'
    if (score >= 4) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 8) return 'from-green-500 to-emerald-500'
    if (score >= 6) return 'from-blue-500 to-cyan-500'
    if (score >= 4) return 'from-amber-500 to-orange-500'
    return 'from-red-500 to-rose-500'
  }

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow ${className}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
            Community Rating
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {totalVotes.toLocaleString()} votes
          </p>
        </div>

        {/* Overall Score Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${getScoreGradient(
            averageScore
          )} shadow-md`}
        >
          <span className="text-white font-bold text-lg">
            {averageScore.toFixed(1)}
          </span>
          <span className="text-white text-xs opacity-90">/10</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <ThumbsUp className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            {totalVotes} ratings
          </span>
        </div>
        {recentVoteCount24h > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            <span className="text-gray-600 dark:text-gray-400">
              +{recentVoteCount24h} today
            </span>
          </div>
        )}
      </div>

      {/* CTA */}
      <Link href={`/companies/${companyId}#vote`}>
        <motion.button
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <MessageSquare className="w-4 h-4" />
          Rate {companyName}
        </motion.button>
      </Link>
    </motion.div>
  )
}

/**
 * Minimal inline voting stats (for use in lists/tables)
 */
export function VotingStats({
  averageScore,
  totalVotes,
  size = 'sm',
}: {
  averageScore: number
  totalVotes: number
  size?: 'sm' | 'md'
}) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950'
    if (score >= 6) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
    if (score >= 4) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950'
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950'
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'

  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-semibold rounded ${sizeClasses} ${getScoreColor(
          averageScore
        )}`}
      >
        {averageScore.toFixed(1)}/10
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        ({totalVotes.toLocaleString()})
      </span>
    </div>
  )
}
