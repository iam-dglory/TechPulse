import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { Star, TrendingUp, Award, Building2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch user's reviews
  const { data: userReviews } = await supabase
    .from("reviews")
    .select("*, companies(name, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch followed companies
  const { data: followedCompanies } = await supabase
    .from("user_follows")
    .select("*, companies(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6)

  // Calculate user stats
  const { count: totalReviews } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: approvedReviews } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "approved")

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.username || "User"}!</h1>
        <p className="text-lg text-muted-foreground">
          Here's what's happening with your account
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.points || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Level {profile?.level || 1}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {approvedReviews || 0} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Following</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{followedCompanies?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Companies tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Impact</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userReviews?.reduce((sum, r) => sum + r.helpful_count, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Helpful votes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Reviews</h2>
            <Link href="/companies">
              <Button variant="outline" size="sm">
                Write Review
              </Button>
            </Link>
          </div>

          {userReviews && userReviews.length > 0 ? (
            <div className="space-y-4">
              {userReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        href={`/companies/${review.companies?.slug}`}
                        className="font-semibold hover:underline"
                      >
                        {review.companies?.name}
                      </Link>
                      <Badge
                        variant={
                          review.status === "approved"
                            ? "default"
                            : review.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {review.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: review.overall_rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {review.title}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(review.created_at)}</span>
                      <span>👍 {review.helpful_count} helpful</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start reviewing companies to earn points
                </p>
                <Link href="/companies">
                  <Button>Browse Companies</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Followed Companies */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Following</h2>
            <Link href="/companies">
              <Button variant="outline" size="sm">
                Discover More
              </Button>
            </Link>
          </div>

          {followedCompanies && followedCompanies.length > 0 ? (
            <div className="space-y-4">
              {followedCompanies.map((follow) => (
                <Link key={follow.id} href={`/companies/${follow.companies?.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{follow.companies?.name}</h3>
                        <Badge variant="secondary">{follow.companies?.industry}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-blue-600">
                            {follow.companies?.overall_score.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">/10</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {follow.companies?.review_count} reviews
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Not following any companies</h3>
                <p className="text-muted-foreground mb-4">
                  Follow companies to track their ethics scores
                </p>
                <Link href="/companies">
                  <Button>Explore Companies</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Level Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {profile?.points || 0} / {((profile?.level || 1) + 1) ** 2 * 50} points
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        ((profile?.points || 0) / (((profile?.level || 1) + 1) ** 2 * 50)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="text-center p-4 border rounded-lg">
                  <Award className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-sm font-medium">First Review</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {totalReviews && totalReviews > 0 ? "Unlocked" : "Locked"}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Award className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm font-medium">10 Reviews</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {totalReviews && totalReviews >= 10 ? "Unlocked" : "Locked"}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Award className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-sm font-medium">Active Follower</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {followedCompanies && followedCompanies.length >= 5 ? "Unlocked" : "Locked"}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Award className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-sm font-medium">Helpful Reviewer</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {userReviews?.some((r) => r.helpful_count >= 10) ? "Unlocked" : "Locked"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
