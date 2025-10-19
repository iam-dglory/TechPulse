'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  CheckCircle2,
  TrendingUp,
  Lock,
  Lightbulb,
  Info,
  Users,
  Award,
  Clock,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { colors, shadows, animations } from '@/lib/design-system'
import { GrowthBadge } from '@/components/metrics/GrowthIndicator'

export type ScoreConfidence = 'low' | 'medium' | 'high' | 'very_high'

export interface CompanyScores {
  overall: number
  ethics: number
  credibility: number
  delivery: number
  security: number
  innovation: number
  confidence: ScoreConfidence
  totalVotes: number
  expertReviewCount: number
  lastUpdated?: string
  growthRate?: number // Overall score change
}

export interface ScoreBreakdownProps {
  companyId: string
  scores: CompanyScores
  variant?: 'full' | 'compact' | 'mini'
  showVoteButton?: boolean
  onVoteClick?: () => void
  className?: string
}

interface DimensionConfig {
  key: keyof CompanyScores
  label: string
  description: string
  icon: React.ElementType
  weight: number
  color: string
  gradient: string
}

const dimensions: DimensionConfig[] = [
  {
    key: 'ethics',
    label: 'Ethics',
    description: 'Privacy, AI ethics, labor practices, environmental impact',
    icon: Shield,
    weight: 30,
    color: colors.primary[600],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    key: 'credibility',
    label: 'Credibility',
    description: 'Trust, transparency, communication, reputation',
    icon: CheckCircle2,
    weight: 25,
    color: colors.accent[600],
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    key: 'delivery',
    label: 'Delivery',
    description: 'Promise fulfillment, product delivery, roadmap adherence',
    icon: TrendingUp,
    weight: 20,
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    key: 'security',
    label: 'Security',
    description: 'Data protection, breach history, certifications',
    icon: Lock,
    weight: 15,
    color: '#ef4444',
    gradient: 'from-red-500 to-rose-500',
  },
  {
    key: 'innovation',
    label: 'Innovation',
    description: 'R&D, patents, uniqueness, market disruption',
    icon: Lightbulb,
    weight: 10,
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
  },
]

const getScoreColor = (score: number): string => {
  if (score >= 8) return 'text-green-600 dark:text-green-400'
  if (score >= 6) return 'text-blue-600 dark:text-blue-400'
  if (score >= 4) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

const getScoreGradient = (score: number): string => {
  if (score >= 8) return 'from-green-500 to-emerald-500'
  if (score >= 6) return 'from-blue-500 to-cyan-500'
  if (score >= 4) return 'from-amber-500 to-orange-500'
  return 'from-red-500 to-rose-500'
}

const getScoreLabel = (score: number): string => {
  if (score >= 8) return 'Excellent'
  if (score >= 6) return 'Good'
  if (score >= 4) return 'Average'
  return 'Poor'
}

/**
 * Circular progress ring for overall score
 */
export function ScoreRing({
  score,
  size = 200,
  strokeWidth = 20,
  animated = true,
}: {
  score: number
  size?: number
  strokeWidth?: number
  animated?: boolean
}) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = (animatedScore / 10) * circumference

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setAnimatedScore(score), 100)
      return () => clearTimeout(timer)
    } else {
      setAnimatedScore(score)
    }
  }, [score, animated])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference - progress,
          }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={score >= 8 ? '#10b981' : score >= 6 ? '#3b82f6' : score >= 4 ? '#f59e0b' : '#ef4444'} />
            <stop offset="100%" stopColor={score >= 8 ? '#14b8a6' : score >= 6 ? '#06b6d4' : score >= 4 ? '#fb923c' : '#f43f5e'} />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className={`text-5xl font-bold ${getScoreColor(score)}`}
        >
          {animatedScore.toFixed(1)}
        </motion.div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          out of 10
        </div>
        <div className={`text-xs font-semibold mt-2 ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </div>
      </div>
    </div>
  )
}

/**
 * Individual dimension score card
 */
export function DimensionCard({
  dimension,
  score,
  expanded = false,
  onExpand,
}: {
  dimension: DimensionConfig
  score: number
  expanded?: boolean
  onExpand?: () => void
}) {
  const Icon = dimension.icon
  const percentage = (score / 10) * 100

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
      whileHover={{ y: -2 }}
      onClick={onExpand}
      layout
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${dimension.gradient} flex items-center justify-center shadow-md flex-shrink-0`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {dimension.label}
              </h4>
              <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded flex-shrink-0">
                {dimension.weight}%
              </span>
            </div>
            {expanded && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs text-gray-600 dark:text-gray-400 mt-1"
              >
                {dimension.description}
              </motion.p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-bold ${getScoreColor(score)}`}>
            {score.toFixed(1)}
          </span>
          <ChevronRight
            className={`w-4 h-4 text-gray-400 transition-transform ${
              expanded ? 'rotate-90' : ''
            }`}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${dimension.gradient} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        />
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
        >
          <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1">
            <Eye className="w-3 h-3" />
            View voting details
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

/**
 * Confidence level badge
 */
export function ConfidenceBadge({
  level,
  showTooltip = true,
}: {
  level: ScoreConfidence
  showTooltip?: boolean
}) {
  const config = {
    low: {
      label: 'Low Confidence',
      color: 'text-red-700 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      description: 'Less than 15 votes',
    },
    medium: {
      label: 'Medium Confidence',
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-950',
      border: 'border-amber-200 dark:border-amber-800',
      description: '15+ votes or 1+ expert review',
    },
    high: {
      label: 'High Confidence',
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      description: '30+ votes, 2+ expert reviews',
    },
    very_high: {
      label: 'Very High Confidence',
      color: 'text-green-700 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      description: '50+ votes, 3+ expert reviews',
    },
  }

  const { label, color, bg, border, description } = config[level]

  return (
    <div className="relative group">
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${bg} ${border} ${color} text-xs font-medium`}
      >
        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
        {label}
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {description}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  )
}

/**
 * Main score breakdown component
 */
export function ScoreBreakdown({
  companyId,
  scores,
  variant = 'full',
  showVoteButton = true,
  onVoteClick,
  className = '',
}: ScoreBreakdownProps) {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null)
  const [isCompactExpanded, setIsCompactExpanded] = useState(false)

  // Mini variant - just overall score badge
  if (variant === 'mini') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 ${className}`}
      >
        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getScoreGradient(scores.overall)}`} />
        <span className={`text-lg font-bold ${getScoreColor(scores.overall)}`}>
          {scores.overall.toFixed(1)}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">/10</span>
      </div>
    )
  }

  // Compact variant - single row with mini bars
  if (variant === 'compact') {
    return (
      <motion.div
        className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 ${className}`}
        layout
      >
        <div className="flex items-center gap-4">
          {/* Overall score */}
          <div className="flex items-center gap-3">
            <ScoreRing score={scores.overall} size={80} strokeWidth={8} />
          </div>

          {/* Dimension mini bars */}
          <div className="flex-1 grid grid-cols-5 gap-2">
            {dimensions.map((dim) => {
              const score = scores[dim.key] as number
              const Icon = dim.icon
              return (
                <div key={dim.key} className="group relative">
                  <div className="text-center">
                    <Icon className="w-4 h-4 mx-auto mb-1 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`w-full bg-gradient-to-b ${dim.gradient} rounded-full`}
                        initial={{ height: 0 }}
                        animate={{ height: `${(score / 10) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ transformOrigin: 'bottom' }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white mt-1">
                      {score.toFixed(1)}
                    </div>
                  </div>

                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {dim.label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Expand button */}
          <button
            onClick={() => setIsCompactExpanded(!isCompactExpanded)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isCompactExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {/* Expanded view */}
        <AnimatePresence>
          {isCompactExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dimensions.map((dim) => (
                  <DimensionCard
                    key={dim.key}
                    dimension={dim}
                    score={scores[dim.key] as number}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // Full variant - complete breakdown
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hero Section */}
      <motion.div
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Score ring */}
          <div className="flex flex-col items-center">
            <ScoreRing score={scores.overall} size={200} strokeWidth={20} />
            <div className="mt-4 flex items-center gap-2">
              <ConfidenceBadge level={scores.confidence} />
              {scores.growthRate !== undefined && (
                <GrowthBadge value={scores.growthRate} />
              )}
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Total votes */}
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {scores.totalVotes.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Community Votes
                  </div>
                </div>
              </div>

              {/* Expert reviews */}
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {scores.expertReviewCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Expert Reviews
                  </div>
                </div>
              </div>
            </div>

            {/* Last updated */}
            {scores.lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                Last updated {scores.lastUpdated}
              </div>
            )}

            {/* Vote button */}
            {showVoteButton && onVoteClick && (
              <motion.button
                onClick={onVoteClick}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Rate This Company
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Dimensional Scores */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Score Breakdown
          </h3>
          <button className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            <Info className="w-4 h-4" />
            Why these scores?
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dimensions.map((dim, index) => (
            <motion.div
              key={dim.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <DimensionCard
                dimension={dim}
                score={scores[dim.key] as number}
                expanded={expandedDimension === dim.key}
                onExpand={() =>
                  setExpandedDimension(expandedDimension === dim.key ? null : dim.key)
                }
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
