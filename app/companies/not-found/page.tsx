"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Building2, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function CompanyNotFoundPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const searchQuery = searchParams.get("search") || ""

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: searchQuery,
    website: "",
    industry: "",
    description: "",
    requesterEmail: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/companies/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request")
      }

      setIsSuccess(true)
      toast({
        title: "Request Submitted!",
        description: "We'll notify you when the company is added and scored."
      })

      setTimeout(() => {
        router.push("/companies")
      }, 3000)
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
                <div>
                  <h2 className="text-2xl font-bold text-green-900 mb-2">Request Submitted!</h2>
                  <p className="text-green-700">
                    We'll add {formData.name} to our database and notify you when the ethics score is ready.
                  </p>
                  <p className="text-sm text-green-600 mt-4">Redirecting to companies page...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Not Found Header */}
        <Card className="border-yellow-200 bg-yellow-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h1 className="text-2xl font-bold text-yellow-900 mb-2">
                  Company Not Found
                </h1>
                <p className="text-yellow-800">
                  {searchQuery ? (
                    <>We couldn't find "<strong>{searchQuery}</strong>" in our database.</>
                  ) : (
                    <>This company is not in our database yet.</>
                  )}
                </p>
                <p className="text-yellow-700 mt-2">
                  Help us expand our coverage by requesting this company to be added!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Request Company Addition
            </CardTitle>
            <CardDescription>
              Fill in the details below and we'll add this company to our platform, calculate its ethics score, and notify you when it's ready.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Zoho Corporation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Company Website *</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="e.g., https://www.zoho.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Software, Healthcare, Finance"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Brief Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this company do? (optional)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Your Email (for notification) *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  We'll email you when the company is added and scored (usually within 24 hours)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/companies">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Box */}
        <Card className="mt-6 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>We verify the company information you provided</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>Our AI analyzes the company using public data, news, and industry reports</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>We calculate ethics scores across 5 dimensions (Privacy, Labor, Environment, etc.)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4.</span>
                <span>You receive an email notification when the company profile is live</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
