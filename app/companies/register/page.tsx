'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Building2, Mail, Globe, MapPin, Users, Calendar } from 'lucide-react'

export default function RegisterCompanyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: '',
    description: '',
    foundedYear: '',
    employeeCount: '',
    headquarters: '',
    contactEmail: '',
    contactName: '',
    contactPosition: '',
    reason: ''
  })

  const industries = [
    'Artificial Intelligence',
    'Software',
    'Hardware',
    'Cloud Computing',
    'Cybersecurity',
    'E-commerce',
    'Social Media',
    'Fintech',
    'Biotech',
    'Healthcare',
    'Manufacturing',
    'Retail',
    'Gaming',
    'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/companies?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      toast({
        title: 'Registration Submitted!',
        description: 'We\'ll review your registration and send a verification email within 24 hours.',
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
        <h1 className="text-4xl font-bold mb-2">Register Your Company</h1>
        <p className="text-gray-600">
          Join TexhPulze to showcase your ethics commitment and build trust with your stakeholders
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Company Information</h2>

            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="companyName"
                  placeholder="e.g., OpenAI"
                  className="pl-10"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website *</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourcompany.com"
                  className="pl-10"
                  required
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData({ ...formData, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Company Description *</Label>
              <Textarea
                id="description"
                placeholder="Brief description of what your company does..."
                rows={4}
                required
                minLength={50}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1">
                Minimum 50 characters ({formData.description.length}/50)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="foundedYear">Founded Year</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="foundedYear"
                    type="number"
                    placeholder="2023"
                    className="pl-10"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.foundedYear}
                    onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="employeeCount">Employee Count</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="employeeCount"
                    type="number"
                    placeholder="50"
                    className="pl-10"
                    min="1"
                    value={formData.employeeCount}
                    onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="headquarters">Headquarters</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="headquarters"
                  placeholder="San Francisco, CA"
                  className="pl-10"
                  value={formData.headquarters}
                  onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 pt-6 border-t">
            <h2 className="text-2xl font-bold">Contact Information</h2>
            <p className="text-sm text-gray-600">
              This information will be used for verification purposes only
            </p>

            <div>
              <Label htmlFor="contactName">Your Name *</Label>
              <Input
                id="contactName"
                placeholder="John Doe"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Work Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="john@yourcompany.com"
                  className="pl-10"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Must be a company domain email (not Gmail, Yahoo, etc.)
              </p>
            </div>

            <div>
              <Label htmlFor="contactPosition">Your Position *</Label>
              <Input
                id="contactPosition"
                placeholder="e.g., CEO, CTO, VP of Operations"
                required
                value={formData.contactPosition}
                onChange={(e) => setFormData({ ...formData, contactPosition: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="reason">Why are you registering? *</Label>
              <Textarea
                id="reason"
                placeholder="Tell us why you want to join TexhPulze..."
                rows={3}
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-6 border-t">
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
                <li>We'll verify your email and company information (24-48 hours)</li>
                <li>You'll receive a verification email with next steps</li>
                <li>Once approved, you can claim your company profile</li>
                <li>Get your first AI ethics score for free</li>
              </ol>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
