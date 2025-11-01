import Link from "next/link"
import { ArrowRight, Shield, TrendingUp, Users, Sparkles, Search as SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { BookDemoDialog } from "@/components/book-demo-dialog"
import { CompanySearch } from "@/components/company-search"

// Use Incremental Static Regeneration to reduce serverless function count
export const revalidate = 3600 // Revalidate every hour
export const dynamic = 'auto'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch statistics
  const [
    { count: companyCount },
    { count: reviewCount },
    { data: topCompanies }
  ] = await Promise.all([
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("companies").select("*").order("overall_score", { ascending: false }).limit(3)
  ])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Ethics Ratings
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            World's First Courtroom for Technology
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered ethics ratings and community reviews help you make informed decisions about companies across all industries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/companies">
              <Button size="lg" className="gap-2">
                Explore Companies
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <BookDemoDialog />
            <Link href="/signup">
              <Button size="lg" variant="outline">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Get Your Ethics Score Section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4" variant="default">
              <SearchIcon className="w-3 h-3 mr-1" />
              Get Your Ethics Score
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Discover Any Company's Ethics Rating
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Search our comprehensive database of company ethics ratings powered by AI and community reviews
            </p>
          </div>
          <CompanySearch />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y bg-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {companyCount || 0}
                </div>
                <p className="text-muted-foreground">Companies Rated</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {reviewCount || 0}
                </div>
                <p className="text-muted-foreground">Community Reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {topCompanies?.length || 0}
                </div>
                <p className="text-muted-foreground">Top Rated</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending This Week
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Top-Rated Companies</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover companies leading in transparency, ethics, and innovation across all industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {topCompanies?.map((company) => (
              <Link key={company.id} href={`/companies/${company.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{company.name}</span>
                      <Badge variant="secondary">{company.industry}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Overall Score</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {company.overall_score.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${company.overall_score * 10}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{company.review_count} reviews</span>
                        <span>{company.follower_count} followers</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/companies">
              <Button size="lg" variant="outline" className="gap-2">
                View All Companies
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why TechPulze?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The most comprehensive platform for evaluating tech company ethics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>AI-Powered Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced AI evaluates company ethics across privacy, transparency, labor practices, and more.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Community Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real reviews from employees, customers, and researchers provide authentic insights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Monitor how companies improve their ethics scores over time with historical data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Join the Movement for Ethical Tech
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Help build transparency in the tech industry by sharing your experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/companies">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                Browse Companies
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
