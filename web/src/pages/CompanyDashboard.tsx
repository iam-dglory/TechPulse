import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  FileText,
  Download,
  Share2,
  Settings
} from 'lucide-react';

interface DashboardData {
  overview: {
    totalStories: number;
    avgHypeScore: number;
    avgEthicsScore: number;
    communityEngagement: number;
    sentimentTrend: string;
  };
  charts: {
    scoreTrend: Array<{
      date: string;
      hypeScore: number;
      ethicsScore: number;
    }>;
    sentimentOverTime: Array<{
      date: string;
      sentiment: number;
    }>;
    competitorComparison: Array<{
      name: string;
      activity: number;
      ethicsScore: number;
    }>;
  };
  alerts: Array<{
    type: 'warning' | 'critical' | 'info';
    message: string;
  }>;
  quickActions: Array<{
    label: string;
    action: string;
  }>;
}

const CompanyDashboard: React.FC = () => {
  const { companyId } = req.params;
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  useEffect(() => {
    fetchDashboardData();
  }, [companyId, selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/b2b/dashboard/${companyId}?period=${selectedPeriod}`);
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.dashboard);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Not Available</h1>
          <p className="text-gray-600">Unable to load company dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive analytics and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="6months">Last 6 months</option>
                <option value="1year">Last year</option>
              </select>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stories</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.overview.totalStories}</p>
              </div>
              <FileText className="w-8 h-8 text-teal-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Hype Score</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.overview.avgHypeScore.toFixed(1)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Ethics Score</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.overview.avgEthicsScore.toFixed(1)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Community Engagement</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.overview.communityEngagement}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Score Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.charts.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="hypeScore" stroke="#F59E0B" strokeWidth={2} name="Hype Score" />
                <Line type="monotone" dataKey="ethicsScore" stroke="#10B981" strokeWidth={2} name="Ethics Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment Over Time */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.charts.sentimentOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Line type="monotone" dataKey="sentiment" stroke="#4ECDC4" strokeWidth={2} name="Sentiment" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competitor Comparison & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Competitor Comparison */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitor Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.charts.competitorComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ethicsScore" fill="#10B981" name="Ethics Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h3>
            <div className="space-y-3">
              {dashboardData.alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-center">
                    {getAlertIcon(alert.type)}
                    <p className="ml-3 text-sm font-medium text-gray-900">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboardData.quickActions.map((action, index) => (
              <button
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <p className="font-medium text-gray-900">{action.label}</p>
                <p className="text-sm text-gray-600 mt-1">Click to {action.action.replace('_', ' ')}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;


