'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Building2, Mail, Search, AlertCircle } from 'lucide-react'

export default function ClaimCompanyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<'search' | 'claim'>('search')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [foundCompany, setFoundCompany] = useState<any>(null)
  const [claimData, setClaimData] = useState({
    contactName: '',
    contactEmail: '',
    contactPosition: '',
    proofOfEmployment: '',
    additionalInfo: ''
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/companies?search=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.companies && data.companies.length > 0) {
        setFoundCompany(data.companies[0])
        setStep('claim')
      } else {
        toast({
          title: 'Company Not Found',
          description: 'We couldn\'t find that company. Would you like to register it instead?',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search for company',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/companies?action=claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: foundCompany.id,
          ...claimData
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      toast({
        title: 'Claim Submitted!',
        description: 'We\'ll review your claim and send a verification email within 24 hours.',
      })

      router.push('/companies')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Claim Your Company</h1>
        <p className="text-gray-600">
          Already have a profile on TexhPulze? Claim it to manage your company's information
        </p>
      </div>

      {step === 'search' ? (
        <Card className="p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <Label htmlFor="search">Search for Your Company</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Enter company name..."
                  className="pl-10"
                  required
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-4">
                Can't find your company?
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/companies/register')}
              >
                Register New Company
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-8">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">{foundCompany.name}</h3>
                <p className="text-sm text-blue-700">{foundCompany.industry}</p>
                <p className="text-sm text-blue-600 mt-1">{foundCompany.website}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => {
                setStep('search')
                setFoundCompany(null)
              }}
            >
              Search for different company
            </Button>
          </div>

          <form onSubmit={handleClaim} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Verification Information</h2>
              <p className="text-sm text-gray-600">
                We need to verify that you're authorized to manage this company profile
              </p>

              <div>
                <Label htmlFor="contactName">Your Name *</Label>
                <Input
                  id="contactName"
                  placeholder="John Doe"
                  required
                  value={claimData.contactName}
                  onChange={(e) => setClaimData({ ...claimData, contactName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Work Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="john@company.com"
                    className="pl-10"
                    required
                    value={claimData.contactEmail}
                    onChange={(e) => setClaimData({ ...claimData, contactEmail: e.target.value })}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Must match company domain: {new URL(foundCompany.website || 'https://example.com').hostname}
                </p>
              </div>

              <div>
                <Label htmlFor="contactPosition">Your Position *</Label>
                <Input
                  id="contactPosition"
                  placeholder="e.g., CEO, CTO, VP of Operations"
                  required
                  value={claimData.contactPosition}
                  onChange={(e) => setClaimData({ ...claimData, contactPosition: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="proofOfEmployment">Proof of Employment *</Label>
                <Textarea
                  id="proofOfEmployment"
                  placeholder="Provide details about your employment (LinkedIn profile, employee ID, etc.)"
                  rows={3}
                  required
                  value={claimData.proofOfEmployment}
                  onChange={(e) => setClaimData({ ...claimData, proofOfEmployment: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Any additional information to help verify your claim..."
                  rows={3}
                  value={claimData.additionalInfo}
                  onChange={(e) => setClaimData({ ...claimData, additionalInfo: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-6 border-t">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">Verification Required</h3>
                    <p className="text-sm text-yellow-800">
                      We'll verify your employment and send a confirmation email to your work address.
                      This process typically takes 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
