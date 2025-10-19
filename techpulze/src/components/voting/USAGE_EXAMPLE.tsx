/**
 * USAGE EXAMPLE: VotingInterface Component
 *
 * This file demonstrates how to integrate the VotingInterface component
 * into a company profile page with full authentication and data fetching.
 */

import { VotingInterface } from '@/components/voting/VotingInterface'
import { supabase } from '@/lib/supabase'

/**
 * Example 1: Basic Integration in Company Page
 */
export async function CompanyProfilePage({ params }: { params: { id: string } }) {
  // Fetch company data
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .single()

  // Fetch current user (server-side)
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  // Fetch user's previous votes if authenticated
  let userVotes = null
  if (userId) {
    const { data: votes } = await supabase
      .from('votes')
      .select('vote_type, score, comment, evidence_urls')
      .eq('user_id', userId)
      .eq('company_id', params.id)

    // Transform to expected format
    userVotes = votes?.reduce((acc, vote) => ({
      ...acc,
      [vote.vote_type]: {
        score: vote.score,
        comment: vote.comment,
        evidence_urls: vote.evidence_urls,
      },
    }), {})
  }

  // Fetch user profile for vote weight
  let userWeight = 1.0
  if (userId) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('reputation_score, is_expert')
      .eq('id', userId)
      .single()

    if (profile) {
      const reputation = profile.reputation_score || 0
      if (profile.is_expert) {
        userWeight = 2.0
      } else if (reputation >= 1000) {
        userWeight = 1.5
      } else if (reputation >= 500) {
        userWeight = 1.3
      } else if (reputation >= 100) {
        userWeight = 1.1
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1>{company.name}</h1>

      {/* Voting Interface */}
      <div className="mt-12">
        <VotingInterface
          companyId={company.id}
          companyName={company.name}
          currentScores={{
            ethics: company.ethics_score,
            credibility: company.credibility_score,
            delivery: company.delivery_score,
            security: company.security_score,
            innovation: company.innovation_score,
          }}
          userPreviousVotes={userVotes || undefined}
          userId={userId}
          userWeight={userWeight}
          onVoteSubmitted={async () => {
            // Refresh page data after vote submission
            'use server'
            // In Next.js App Router, trigger revalidation
            // revalidatePath(`/companies/${params.id}`)
          }}
        />
      </div>
    </div>
  )
}

/**
 * Example 2: Client-Side Integration with State Management
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ClientSideVotingExample({ companyId, companyName }: { companyId: string, companyName: string }) {
  const router = useRouter()
  const [currentScores, setCurrentScores] = useState({
    ethics: 0,
    credibility: 0,
    delivery: 0,
    security: 0,
    innovation: 0,
  })
  const [userVotes, setUserVotes] = useState(null)
  const [userId, setUserId] = useState<string | undefined>()
  const [userWeight, setUserWeight] = useState(1.0)

  useEffect(() => {
    async function fetchData() {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user?.id
      setUserId(uid)

      // Fetch company scores
      const { data: company } = await supabase
        .from('companies')
        .select('ethics_score, credibility_score, delivery_score, security_score, innovation_score')
        .eq('id', companyId)
        .single()

      if (company) {
        setCurrentScores({
          ethics: company.ethics_score,
          credibility: company.credibility_score,
          delivery: company.delivery_score,
          security: company.security_score,
          innovation: company.innovation_score,
        })
      }

      // Fetch user votes if authenticated
      if (uid) {
        const { data: votes } = await supabase
          .from('votes')
          .select('vote_type, score, comment, evidence_urls')
          .eq('user_id', uid)
          .eq('company_id', companyId)

        if (votes) {
          const votesMap = votes.reduce((acc, vote) => ({
            ...acc,
            [vote.vote_type]: {
              score: vote.score,
              comment: vote.comment,
              evidence_urls: vote.evidence_urls,
            },
          }), {})
          setUserVotes(votesMap as any)
        }

        // Fetch user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('reputation_score, is_expert')
          .eq('id', uid)
          .single()

        if (profile) {
          const reputation = profile.reputation_score || 0
          let weight = 1.0
          if (profile.is_expert) weight = 2.0
          else if (reputation >= 1000) weight = 1.5
          else if (reputation >= 500) weight = 1.3
          else if (reputation >= 100) weight = 1.1
          setUserWeight(weight)
        }
      }
    }

    fetchData()
  }, [companyId])

  const handleVoteSubmitted = () => {
    // Refresh the router to get updated data
    router.refresh()

    // Or refetch data manually
    // fetchData()
  }

  return (
    <VotingInterface
      companyId={companyId}
      companyName={companyName}
      currentScores={currentScores}
      userPreviousVotes={userVotes || undefined}
      userId={userId}
      userWeight={userWeight}
      onVoteSubmitted={handleVoteSubmitted}
    />
  )
}

/**
 * Example 3: Standalone Voting Modal
 */
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function VotingModal({
  companyId,
  companyName,
  currentScores,
  isOpen,
  onClose,
}: {
  companyId: string
  companyName: string
  currentScores: any
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Voting Interface */}
              <VotingInterface
                companyId={companyId}
                companyName={companyName}
                currentScores={currentScores}
                onVoteSubmitted={() => {
                  onClose()
                  // Optional: trigger parent refresh
                }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Example 4: Fetch Helper Functions
 */

// Helper to fetch user's previous votes
export async function fetchUserVotes(userId: string, companyId: string) {
  const { data: votes } = await supabase
    .from('votes')
    .select('vote_type, score, comment, evidence_urls')
    .eq('user_id', userId)
    .eq('company_id', companyId)

  if (!votes) return null

  return votes.reduce((acc, vote) => ({
    ...acc,
    [vote.vote_type]: {
      score: vote.score,
      comment: vote.comment,
      evidence_urls: vote.evidence_urls,
    },
  }), {})
}

// Helper to calculate user vote weight
export function calculateUserVoteWeight(reputation: number, isExpert: boolean): number {
  if (isExpert) return 2.0
  if (reputation >= 1000) return 1.5
  if (reputation >= 500) return 1.3
  if (reputation >= 100) return 1.1
  return 1.0
}

// Helper to fetch company scores
export async function fetchCompanyScores(companyId: string) {
  const { data: company } = await supabase
    .from('companies')
    .select('ethics_score, credibility_score, delivery_score, security_score, innovation_score')
    .eq('id', companyId)
    .single()

  if (!company) return null

  return {
    ethics: company.ethics_score,
    credibility: company.credibility_score,
    delivery: company.delivery_score,
    security: company.security_score,
    innovation: company.innovation_score,
  }
}

/**
 * Example 5: Real-time Score Updates with Subscriptions
 */
'use client'

import { useEffect } from 'react'

export function VotingWithRealtimeUpdates({ companyId, companyName }: { companyId: string, companyName: string }) {
  const [currentScores, setCurrentScores] = useState({
    ethics: 0,
    credibility: 0,
    delivery: 0,
    security: 0,
    innovation: 0,
  })

  useEffect(() => {
    // Initial fetch
    fetchCompanyScores(companyId).then((scores) => {
      if (scores) setCurrentScores(scores)
    })

    // Subscribe to score changes
    const channel = supabase
      .channel(`company-scores-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'companies',
          filter: `id=eq.${companyId}`,
        },
        (payload) => {
          const updated = payload.new
          setCurrentScores({
            ethics: updated.ethics_score,
            credibility: updated.credibility_score,
            delivery: updated.delivery_score,
            security: updated.security_score,
            innovation: updated.innovation_score,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [companyId])

  return (
    <VotingInterface
      companyId={companyId}
      companyName={companyName}
      currentScores={currentScores}
    />
  )
}
