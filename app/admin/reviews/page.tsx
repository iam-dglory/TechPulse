'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, XCircle, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ReviewModerationPage() {
  const [reviews, setReviews] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadReviews()
  }, [filter])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin?resource=reviews&status=${filter}`)
      const data = await res.json()
      setReviews(data || [])
    } catch (error) {
      toast({ title: 'Error loading reviews', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/admin?action=approve&reviewId=${reviewId}`, { method: 'POST' })
      if (res.ok) {
        toast({ title: 'Review approved successfully' })
        loadReviews()
      }
    } catch (error) {
      toast({ title: 'Error approving review', variant: 'destructive' })
    }
  }

  const handleReject = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/admin?action=reject&reviewId=${reviewId}`, { method: 'POST' })
      if (res.ok) {
        toast({ title: 'Review rejected' })
        loadReviews()
      }
    } catch (error) {
      toast({ title: 'Error rejecting review', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Review Moderation</h1>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-12">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-600">No {filter} reviews found</p>
            </Card>
          ) : (
            reviews.map((review: any) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{review.title}</h3>
                      <Badge>{review.overall_rating}/5 ⭐</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      By {review.profiles?.username || 'Unknown'} • {review.companies?.name || 'Unknown'} • {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={
                    review.status === 'approved' ? 'default' :
                      review.status === 'pending' ? 'secondary' :
                        'destructive'
                  }>
                    {review.status}
                  </Badge>
                </div>

                <p className="text-gray-700 mb-4">{review.content}</p>

                <div className="grid grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-xs text-gray-600">Privacy</div>
                    <div className="font-bold">{review.privacy_rating}/5</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Transparency</div>
                    <div className="font-bold">{review.transparency_rating}/5</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Labor</div>
                    <div className="font-bold">{review.labor_rating}/5</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Environment</div>
                    <div className="font-bold">{review.environment_rating}/5</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Community</div>
                    <div className="font-bold">{review.community_rating}/5</div>
                  </div>
                </div>

                {review.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove(review.id)} className="flex-1">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button onClick={() => handleReject(review.id)} variant="destructive" className="flex-1">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
