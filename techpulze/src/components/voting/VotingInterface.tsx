'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  Shield,
  CheckCircle2,
  TrendingUp,
  Lock,
  Lightbulb,
  Info,
  ExternalLink,
  Loader2,
  LogIn,
  Sparkles,
} from 'lucide-react'
import { Vote, VoteType } from '@/types/database'
import { colors, shadows, animations } from '@/lib/design-system'
import { supabase } from '@/lib/supabase'

interface VotingInterfaceProps {
  companyId: string
  companyName: string
  currentScores: {
    ethics: number
    credibility: number
    delivery: number
    security: number
    innovation: number
  }
  userPreviousVotes?: Record<VoteType, { score: number; comment?: string; evidence_urls?: string[] }>
  onVoteSubmitted?: () => void
  userId?: string
  userWeight?: number // Reputation-based weight (1.0-2.0)
}

interface VoteDimension {
  type: VoteType
  label: string
  description: string
  icon: React.ElementType
  weight: number
  color: string
  gradient: string
}

const voteDimensions: VoteDimension[] = [
  {
    type: 'ethics',
    label: 'Ethics',
    description: 'Privacy practices, AI ethics, labor treatment, environmental impact, social responsibility',
    icon: Shield,
    weight: 30,
    color: colors.primary[600],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    type: 'credibility',
    label: 'Credibility',
    description: 'Public trust, leadership transparency, communication honesty, media relations',
    icon: CheckCircle2,
    weight: 25,
    color: colors.accent[600],
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    type: 'delivery',
    label: 'Delivery',
    description: 'Promise fulfillment, product delivery timeliness, feature completeness, roadmap adherence',
    icon: TrendingUp,
    weight: 20,
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    type: 'security',
    label: 'Security',
    description: 'Data protection, breach history, security certifications, vulnerability disclosure',
    icon: Lock,
    weight: 15,
    color: '#ef4444',
    gradient: 'from-red-500 to-rose-500',
  },
  {
    type: 'innovation',
    label: 'Innovation',
    description: 'R&D investments, patent portfolio, product uniqueness, market disruption, technology adoption',
    icon: Lightbulb,
    weight: 10,
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
  },
]

const getScoreEmoji = (score: number): string => {
  if (score <= 3) return '😞'
  if (score <= 5) return '😐'
  if (score <= 7) return '😊'
  if (score <= 9) return '🌟'
  return '🚀'
}

const getScoreLabel = (score: number): string => {
  if (score <= 3) return 'Poor'
  if (score <= 5) return 'Below Average'
  if (score <= 7) return 'Good'
  if (score <= 9) return 'Excellent'
  return 'Outstanding'
}

const getWeightLabel = (weight: number): string => {
  if (weight >= 2.0) return 'Expert'
  if (weight >= 1.5) return 'Analyst'
  if (weight >= 1.3) return 'Contributor'
  if (weight >= 1.1) return 'Regular'
  return 'New'
}

export function VotingInterface({
  companyId,
  companyName,
  currentScores,
  userPreviousVotes = {},
  onVoteSubmitted,
  userId,
  userWeight = 1.0,
}: VotingInterfaceProps) {
  const [votes, setVotes] = useState<Record<VoteType, number>>(() => {
    const initial: Record<VoteType, number> = {
      ethics: userPreviousVotes.ethics?.score || 5,
      credibility: userPreviousVotes.credibility?.score || 5,
      delivery: userPreviousVotes.delivery?.score || 5,
      security: userPreviousVotes.security?.score || 5,
      innovation: userPreviousVotes.innovation?.score || 5,
    }
    return initial
  })

  const [comments, setComments] = useState<Record<VoteType, string>>(() => {
    const initial: Record<VoteType, string> = {
      ethics: userPreviousVotes.ethics?.comment || '',
      credibility: userPreviousVotes.credibility?.comment || '',
      delivery: userPreviousVotes.delivery?.comment || '',
      security: userPreviousVotes.security?.comment || '',
      innovation: userPreviousVotes.innovation?.comment || '',
    }
    return initial
  })

  const [evidenceUrls, setEvidenceUrls] = useState<Record<VoteType, string>>(() => {
    const initial: Record<VoteType, string> = {
      ethics: userPreviousVotes.ethics?.evidence_urls?.[0] || '',
      credibility: userPreviousVotes.credibility?.evidence_urls?.[0] || '',
      delivery: userPreviousVotes.delivery?.evidence_urls?.[0] || '',
      security: userPreviousVotes.security?.evidence_urls?.[0] || '',
      innovation: userPreviousVotes.innovation?.evidence_urls?.[0] || '',
    }
    return initial
  })

  const [expandedComments, setExpandedComments] = useState<Record<VoteType, boolean>>({
    ethics: false,
    credibility: false,
    delivery: false,
    security: false,
    innovation: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hoveredDimension, setHoveredDimension] = useState<VoteType | null>(null)

  const isAuthenticated = !!userId

  // Calculate predicted new scores
  const calculatePredictedScore = (dimension: VoteType): number => {
    const currentScore = currentScores[dimension]
    const userVote = votes[dimension]

    // Simplified prediction (actual calculation happens on backend)
    // This is just for UI preview
    const influence = userWeight * 0.05 // Small influence per vote
    const diff = userVote - currentScore
    const change = diff * influence

    return Math.max(0, Math.min(10, currentScore + change))
  }

  const handleVoteChange = (dimension: VoteType, value: number) => {
    setVotes((prev) => ({ ...prev, [dimension]: value }))
  }

  const toggleCommentSection = (dimension: VoteType) => {
    setExpandedComments((prev) => ({ ...prev, [dimension]: !prev[dimension] }))
  }

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to vote')
      return
    }

    setIsSubmitting(true)

    try {
      // Submit all votes
      const votePromises = voteDimensions.map(async (dimension) => {
        const evidenceArray = evidenceUrls[dimension.type]
          ? [evidenceUrls[dimension.type]]
          : []

        return supabase.from('votes').upsert({
          user_id: userId,
          company_id: companyId,
          vote_type: dimension.type,
          score: votes[dimension.type],
          comment: comments[dimension.type] || null,
          evidence_urls: evidenceArray,
        }, {
          onConflict: 'user_id,company_id,vote_type'
        })
      })

      const results = await Promise.all(votePromises)

      // Check for errors
      const errors = results.filter((r) => r.error)
      if (errors.length > 0) {
        throw new Error(errors[0].error!.message)
      }

      // Success!
      setShowSuccess(true)

      toast.success(
        `Your votes have been recorded! Scores will update in moments.`,
        {
          duration: 4000,
          icon: '🎉',
        }
      )

      // Call parent callback
      if (onVoteSubmitted) {
        setTimeout(onVoteSubmitted, 1500)
      }

      // Hide success animation after 3s
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error submitting votes:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit votes. Please try again.',
        { duration: 5000 }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        className="relative rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Blurred background preview */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 z-10" />

        {/* Sign in overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <motion.div
            className="text-center max-w-md mx-auto px-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Sign In to Vote
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Help the community by sharing your assessment of {companyName}
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              Sign In Now
            </button>
          </motion.div>
        </div>

        {/* Placeholder content (blurred) */}
        <div className="space-y-6 blur-sm">
          {voteDimensions.map((dim) => (
            <div key={dim.type} className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="relative rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Rate {companyName}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your assessment helps the community make informed decisions
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Your Vote Weight
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {userWeight.toFixed(1)}x
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                {getWeightLabel(userWeight)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Sliders */}
      <div className="p-6 space-y-6">
        {voteDimensions.map((dimension, index) => {
          const Icon = dimension.icon
          const currentScore = currentScores[dimension.type]
          const userVote = votes[dimension.type]
          const predictedScore = calculatePredictedScore(dimension.type)
          const hasChanged = Math.abs(predictedScore - currentScore) >= 0.05

          return (
            <motion.div
              key={dimension.type}
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`p-6 rounded-xl border-2 transition-all ${
                  hoveredDimension === dimension.type
                    ? 'border-blue-300 dark:border-blue-600 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 shadow-sm'
                }`}
                onMouseEnter={() => setHoveredDimension(dimension.type)}
                onMouseLeave={() => setHoveredDimension(null)}
              >
                {/* Dimension Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${dimension.gradient} flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {dimension.label}
                        </h3>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded">
                          {dimension.weight}% weight
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {dimension.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score Display */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Community: <span className="font-semibold">{currentScore.toFixed(1)}</span>
                      </span>
                      <span className="text-4xl">{getScoreEmoji(userVote)}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Your Vote: <span className="font-semibold text-blue-600 dark:text-blue-400">{userVote}/10</span>
                      </span>
                    </div>

                    {/* Slider */}
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={userVote}
                        onChange={(e) => handleVoteChange(dimension.type, parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, ${dimension.color} 0%, ${dimension.color} ${
                            (userVote - 1) * 11.11
                          }%, rgb(229 231 235) ${(userVote - 1) * 11.11}%, rgb(229 231 235) 100%)`,
                        }}
                      />

                      {/* Community score marker */}
                      <div
                        className="absolute top-0 w-0.5 h-3 bg-gray-400 dark:bg-gray-500"
                        style={{ left: `${((currentScore - 1) / 9) * 100}%` }}
                      />
                    </div>

                    {/* Score labels */}
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>1</span>
                      <span className="font-medium">{getScoreLabel(userVote)}</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>

                {/* Impact Preview */}
                {hasChanged && (
                  <motion.div
                    className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-900 dark:text-blue-100">
                        Your vote will move {dimension.label} from{' '}
                        <span className="font-semibold">{currentScore.toFixed(1)}</span> to{' '}
                        <span className="font-semibold">{predictedScore.toFixed(1)}</span>
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Comment & Evidence Section */}
                <button
                  onClick={() => toggleCommentSection(dimension.type)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  <Info className="w-4 h-4" />
                  {expandedComments[dimension.type] ? 'Hide' : 'Add'} comment & evidence
                </button>

                <AnimatePresence>
                  {expandedComments[dimension.type] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Comment (optional)
                        </label>
                        <textarea
                          value={comments[dimension.type]}
                          onChange={(e) =>
                            setComments((prev) => ({
                              ...prev,
                              [dimension.type]: e.target.value.slice(0, 500),
                            }))
                          }
                          placeholder="Explain your reasoning..."
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                          maxLength={500}
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                          {comments[dimension.type].length}/500
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Evidence URL (optional)
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            value={evidenceUrls[dimension.type]}
                            onChange={(e) =>
                              setEvidenceUrls((prev) => ({
                                ...prev,
                                [dimension.type]: e.target.value,
                              }))
                            }
                            placeholder="https://example.com/article"
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Submit Button */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <motion.button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-2xl hover:scale-[1.02]'
          }`}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              Submitting Your Votes...
            </span>
          ) : (
            'Submit All Votes'
          )}
        </motion.button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
          Your votes are public and will contribute to {companyName}'s overall score
        </p>
      </div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <CheckCircle2 className="w-16 h-16 text-white" />
                </motion.div>
              </div>
              <motion.h3
                className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Votes Submitted! 🎉
              </motion.h3>
              <motion.p
                className="text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Thank you for contributing to the community
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: 3px solid currentColor;
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: 3px solid currentColor;
        }
      `}</style>
    </motion.div>
  )
}
