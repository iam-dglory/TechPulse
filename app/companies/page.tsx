import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { Building2 } from "lucide-react"

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; industry?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const search = params.search || ""
  const industry = params.industry || ""

  const supabase = await createClient()

  // Build query
  let query = supabase
    .from("companies")
    .select("*", { count: "exact" })
    .order("overall_score", { ascending: false })

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  if (industry) {
    query = query.eq("industry", industry)
  }

  const limit = 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.range(from, to)

  const { data: companies, error, count } = await query

  if (error) {
    console.error("Error fetching companies:", error)
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Company Directory</h1>
        <p className="text-lg text-muted-foreground">
          Browse {count || 0} technology companies rated by our community
        </p>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies?.map((company) => (
          <Link key={company.id} href={`/companies/${company.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                  <Badge variant="secondary">{company.industry || "Tech"}</Badge>
                </div>
                <CardTitle>{company.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Overall Score */}
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

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Privacy</span>
                      <span className="font-medium">{company.privacy_score.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Labor</span>
                      <span className="font-medium">{company.labor_score.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
                    <span>{company.review_count} reviews</span>
                    <span>{company.follower_count} followers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {companies?.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No companies found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/companies?page=${page - 1}${search ? `&search=${search}` : ""}${industry ? `&industry=${industry}` : ""}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Previous
              </Badge>
            </Link>
          )}
          <Badge variant="secondary">
            Page {page} of {totalPages}
          </Badge>
          {page < totalPages && (
            <Link href={`/companies?page=${page + 1}${search ? `&search=${search}` : ""}${industry ? `&industry=${industry}` : ""}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Next
              </Badge>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
