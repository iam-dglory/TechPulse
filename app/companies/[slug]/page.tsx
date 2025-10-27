import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { ExternalLink, TrendingUp, Users, Star } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function CompanyProfilePage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  // Fetch company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", params.slug)
    .single()

  if (companyError || !company) {
    notFound()
  }

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(username, avatar_url)")
    .eq("company_id", company.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(10)

  // Check if current user is following
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isFollowing = false
  if (user) {
    const { data: follow } = await supabase
      .from("user_follows")
      .select("id")
      .eq("user_id", user.id)
      .eq("company_id", company.id)
      .single()
    isFollowing = !!follow
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Company Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold">{company.name}</h1>
                <Badge variant="secondary">{company.industry || "Technology"}</Badge>
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                {company.description || "No description available"}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Website
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {company.follower_count} followers
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {company.review_count} reviews
                </span>
              </div>
            </div>

            {/* Overall Score */}
            <div className="text-center bg-muted/50 rounded-lg p-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {company.overall_score.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
              <div className="mt-4">
                <Button className="w-full" variant={isFollowing ? "outline" : "default"}>
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({company.review_count})</TabsTrigger>
          <TabsTrigger value="scores">Score Breakdown</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {company.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Industry</span>
                  <p className="font-medium">{company.industry || "Technology"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Overall Score</span>
                  <p className="font-medium">{company.overall_score.toFixed(1)}/10</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Reviews</span>
                  <p className="font-medium">{company.review_count}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Followers</span>
                  <p className="font-medium">{company.follower_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: "Privacy", score: company.privacy_score, color: "blue" },
              { label: "Transparency", score: company.transparency_score, color: "green" },
              { label: "Labor", score: company.labor_score, color: "purple" },
              { label: "Environment", score: company.environment_score, color: "emerald" },
              { label: "Community", score: company.community_score, color: "indigo" },
            ].map((dimension) => (
              <Card key={dimension.label}>
                <CardContent className="pt-6 text-center">
                  <div className={`text-3xl font-bold text-${dimension.color}-600 mb-1`}>
                    {dimension.score.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">{dimension.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {review.profiles?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold">{review.profiles?.username}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            • {formatDate(review.created_at)}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {review.reviewer_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.overall_rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2">{review.title}</h3>
                      <p className="text-muted-foreground">{review.content}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="hover:text-foreground">
                          👍 Helpful ({review.helpful_count})
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to review {company.name}
                </p>
                {user ? (
                  <Button>Write a Review</Button>
                ) : (
                  <Link href="/login">
                    <Button>Login to Review</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Scores Tab */}
        <TabsContent value="scores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ethics Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: "Privacy & Data Protection", score: company.privacy_score, color: "blue" },
                { name: "Transparency & Accountability", score: company.transparency_score, color: "green" },
                { name: "Labor Practices & Diversity", score: company.labor_score, color: "purple" },
                { name: "Environmental Impact", score: company.environment_score, color: "emerald" },
                { name: "Community & Social Impact", score: company.community_score, color: "indigo" },
              ].map((dimension) => (
                <div key={dimension.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{dimension.name}</span>
                    <span className={`font-bold text-${dimension.color}-600`}>
                      {dimension.score.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`bg-${dimension.color}-600 h-3 rounded-full transition-all`}
                      style={{ width: `${dimension.score * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
