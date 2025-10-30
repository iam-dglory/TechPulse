'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ScoreRequestButtonProps {
  companyId: string
  companySlug: string
  companyName: string
  lastScored?: string
  isOwner?: boolean
}

export function ScoreRequestButton({
  companyId,
  companySlug,
  companyName,
  lastScored,
  isOwner
}: ScoreRequestButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const canRequestScore = !lastScored || (
    new Date().getTime() - new Date(lastScored).getTime() > 7 * 24 * 60 * 60 * 1000 // 7 days
  )

  const handleRequestScore = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/request-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      toast({
        title: 'Score Calculation Started!',
        description: 'Your AI ethics score is being calculated. This takes 2-3 minutes.',
      })

      // Redirect to progress page
      router.push(`/companies/${companySlug}/scoring/${data.requestId}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        size="lg"
        onClick={() => setOpen(true)}
        disabled={!canRequestScore}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {lastScored ? 'Refresh Ethics Score' : 'Get Your Ethics Score'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request AI Ethics Score</DialogTitle>
            <DialogDescription>
              Our AI will analyze {companyName} across 5 dimensions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What we analyze:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>✓ Privacy & Data Protection practices</li>
                <li>✓ Transparency & Accountability measures</li>
                <li>✓ Labor Practices & Diversity initiatives</li>
                <li>✓ Environmental Impact & Sustainability</li>
                <li>✓ Community & Social Impact</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Scoring takes 2-3 minutes</h4>
              <p className="text-sm text-gray-700">
                Our AI analyzes public data, news articles, reviews, and regulatory information
                to generate an accurate ethics score.
              </p>
            </div>

            {!canRequestScore && lastScored && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700">
                  You can request a new score every 7 days. Last scored: {new Date(lastScored).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleRequestScore}
              disabled={loading || !canRequestScore}
              className="flex-1"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Starting...' : 'Start Analysis'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
