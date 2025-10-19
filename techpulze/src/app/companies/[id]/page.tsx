'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Company, VoteType } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  CheckCircle,
  Building2,
  TrendingUp,
  Package,
  Users,
  Star,
  Shield,
  Bot,
  Leaf,
  Database,
  ExternalLink,
  BarChart3
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { VotingInterface } from '@/components/voting/VotingInterface'
import { supabase } from '@/lib/supabase'

interface CompanyProfileProps {
  params: { id: string }
}

export default function CompanyProfilePage({ params }: CompanyProfileProps) {
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [userId, setUserId] = useState<string | undefined>()
  const [userVotes, setUserVotes] = useState<any>(null)
  const [userWeight, setUserWeight] = useState(1.0)

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`/api/companies/${params.id}`)
        if (!response.ok) {
          throw new Error('Company not found')
        }
        const data = await response.json()
        setCompany(data.company)

        // Fetch reviews
        const reviewsResponse = await fetch(`/api/companies/${params.id}/reviews`)
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json()
          setReviews(reviewsData.reviews || [])

          // Calculate average rating
          if (reviewsData.reviews && reviewsData.reviews.length > 0) {
            const total = reviewsData.reviews.reduce((sum: number, review: any) => sum + review.rating, 0)
            setAverageRating(total / reviewsData.reviews.length)
          }
        }

        // Get user session
        const { data: { session } } = await supabase.auth.getSession()
        const uid = session?.user?.id
        setUserId(uid)

        // Fetch user votes if authenticated
        if (uid) {
          const { data: votes } = await supabase
            .from('votes')
            .select('vote_type, score, comment, evidence_urls')
            .eq('user_id', uid)
            .eq('company_id', params.id)

          if (votes && votes.length > 0) {
            const votesMap = votes.reduce((acc, vote) => ({
              ...acc,
              [vote.vote_type]: {
                score: vote.score,
                comment: vote.comment,
                evidence_urls: vote.evidence_urls,
              },
            }), {})
            setUserVotes(votesMap)
          }

          // Fetch user profile for vote weight
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading company profile...</p>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Company Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error || 'The company you are looking for does not exist.'}
          </p>
          <Button asChild>
            <Link href="/companies">Back to Companies</Link>
          </Button>
        </div>
      </div>
    )
  }

  const getEthicsScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-500'
    if (score >= 5) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getEthicsScoreBgColor = (score: number) => {
    if (score >= 7) return 'bg-green-500'
    if (score >= 5) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getIndustryColor = (industry: string) => {
    const colors: Record<string, string> = {
      'AI': 'bg-purple-100 text-purple-800',
      'EV': 'bg-green-100 text-green-800',
      'IoT': 'bg-blue-100 text-blue-800',
      'HealthTech': 'bg-pink-100 text-pink-800',
      'FinTech': 'bg-yellow-100 text-yellow-800',
      'EdTech': 'bg-indigo-100 text-indigo-800',
      'Cybersecurity': 'bg-red-100 text-red-800',
    }
    return colors[industry] || 'bg-gray-100 text-gray-800'
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {company.logo_url ? (
                    <Image
                      src={company.logo_url}
                      alt={`${company.name} logo`}
                      width={120}
                      height={120}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-30 h-30 bg-gray-200 rounded-xl flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {company.verified && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-2">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {company.name}
                  </h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge className={`${getIndustryColor(company.industry)} text-sm px-3 py-1`}>
                      {company.industry}
                    </Badge>
                    {company.verified && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Verified Company
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    <span className="font-medium">Funding Stage:</span>
                    <span className="ml-2">{company.funding_stage}</span>
                  </div>
                </div>
              </div>
              
              {/* Ethics Score Circle */}
              <div className="text-center">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(company.ethics_score / 10) * 251.2} 251.2`}
                      className={getEthicsScoreColor(company.ethics_score)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getEthicsScoreColor(company.ethics_score)}`}>
                        {company.ethics_score}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">/ 10</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Ethics Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Products Section */}
            {company.products && company.products.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {company.products.map((product, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">{product.description}</p>
                        <Button asChild variant="outline" size="sm">
                          <a href={product.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit Product
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Target Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Target Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{company.target_users}</p>
              </CardContent>
            </Card>

            {/* Ethical Policy Accordion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Ethical Policies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="privacy">
                    <AccordionTrigger className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Privacy Policy
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose dark:prose-invert max-w-none">
                        {company.ethical_policy?.privacy || 'No privacy policy information available.'}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="ai-transparency">
                    <AccordionTrigger className="flex items-center">
                      <Bot className="w-4 h-4 mr-2" />
                      AI Transparency
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose dark:prose-invert max-w-none">
                        {company.ethical_policy?.ai_transparency || 'No AI transparency information available.'}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="carbon-footprint">
                    <AccordionTrigger className="flex items-center">
                      <Leaf className="w-4 h-4 mr-2" />
                      Carbon Footprint
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose dark:prose-invert max-w-none">
                        {company.ethical_policy?.carbon_footprint || 'No carbon footprint information available.'}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="data-handling">
                    <AccordionTrigger className="flex items-center">
                      <Database className="w-4 h-4 mr-2" />
                      Data Handling
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose dark:prose-invert max-w-none">
                        {company.ethical_policy?.data_handling || 'No data handling information available.'}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Reviews
                  </div>
                  <div className="flex items-center">
                    {renderStars(averageRating)}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      ({reviews.length} reviews)
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center mb-2">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                      </div>
                    ))}
                    {reviews.length > 3 && (
                      <Button variant="outline" className="w-full">
                        View All Reviews ({reviews.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">No reviews yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Voting Interface */}
            <div className="mt-8">
              <VotingInterface
                companyId={params.id}
                companyName={company.name}
                currentScores={{
                  ethics: company.ethics_score || 5,
                  credibility: company.credibility_score || 5,
                  delivery: company.delivery_score || 5,
                  security: company.security_score || 5,
                  innovation: company.innovation_score || 5,
                }}
                userPreviousVotes={userVotes || undefined}
                userId={userId}
                userWeight={userWeight}
                onVoteSubmitted={() => {
                  // Refresh company data after vote submission
                  router.refresh()
                  // Optionally refetch company data
                  window.location.reload()
                }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Products</span>
                  <span className="font-semibold">{company.products?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Investors</span>
                  <span className="font-semibold">{company.investors?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Reviews</span>
                  <span className="font-semibold">{reviews.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Verified</span>
                  <span className="font-semibold">{company.verified ? 'Yes' : 'No'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Investors */}
            {company.investors && company.investors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Investors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {company.investors.map((investor, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {investor}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compare Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  Compare with Similar Companies
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Compare Companies</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    This feature will allow you to compare {company.name} with similar companies in the {company.industry} industry.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Coming soon!
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}


















