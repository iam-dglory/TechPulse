'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import {
  Building2,
  MessageSquare,
  Users,
  Clock,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalReviews: 0,
    totalUsers: 0,
    pendingReviews: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()

      const [
        { count: totalCompanies },
        { count: totalReviews },
        { count: totalUsers },
        { count: pendingReviews },
        { data: activity }
      ] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('reviews').select('*, profiles(username), companies(name)').order('created_at', { ascending: false }).limit(10)
      ])

      setStats({
        totalCompanies: totalCompanies || 0,
        totalReviews: totalReviews || 0,
        totalUsers: totalUsers || 0,
        pendingReviews: pendingReviews || 0
      })
      setRecentActivity(activity || [])
      setLoading(false)
    }

    loadData()
  }, [])

  const statItems = [
    { label: 'Total Companies', value: stats.totalCompanies, icon: Building2, color: 'blue' },
    { label: 'Total Reviews', value: stats.totalReviews, icon: MessageSquare, color: 'green' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'purple' },
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, color: 'orange' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of TechPulze platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statItems.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </Card>
          )
        })}
      </div>

      {/* Pending Reviews Alert */}
      {stats.pendingReviews > 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div>
                <div className="font-semibold">Pending Reviews</div>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</div>
              </div>
            </div>
            <Link href="/admin/reviews?status=pending" className="text-sm text-blue-600 hover:underline">
              Review Now →
            </Link>
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity: any) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium">{activity.profiles?.username} reviewed {activity.companies?.name}</div>
                  <div className="text-sm text-gray-600">{new Date(activity.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {activity.status}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
