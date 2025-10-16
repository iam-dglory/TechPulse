import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Shield, 
  TrendingUp, 
  Users, 
  FileText, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Share2,
  Download,
  Mail
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  sectorTags: string[];
  fundingStage: string;
  investors: string[];
  hqLocation: string;
  ethicsStatementUrl?: string;
  privacyPolicyUrl?: string;
  credibilityScore: number;
  ethicsScore: number;
  hypeScore: number;
  verified: boolean;
  verifiedAt?: Date;
  products?: Product[];
  recentStories?: Story[];
  accountabilityMetrics?: AccountabilityMetrics;
}

interface Product {
  id: string;
  name: string;
  description: string;
  priceTiers: any;
  features: any;
  targetUsers: string[];
  demoUrl?: string;
}

interface Story {
  id: string;
  title: string;
  publishedAt: Date;
  hypeScore: number;
  ethicsScore: number;
}

interface AccountabilityMetrics {
  totalStories: number;
  avgHypeScore: number;
  avgEthicsScore: number;
  promiseAccuracy: number;
  accountabilityScore: number;
  lastVerified: Date;
}

const CompanyProfile: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'stories' | 'accountability'>('overview');

  useEffect(() => {
    fetchCompanyProfile();
  }, [companyId]);

  const fetchCompanyProfile = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/premium`);
      const data = await response.json();
      if (data.success) {
        setCompany(data.profile.company);
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    if (score >= 4) return 'text-red-600 bg-red-50';
    return 'text-red-700 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  const getFundingStageColor = (stage: string) => {
    const colors = {
      'Seed': 'bg-purple-500',
      'Series A': 'bg-blue-500',
      'Series B': 'bg-green-500',
      'Series C': 'bg-yellow-500',
      'Series D+': 'bg-red-500',
      'Public': 'bg-gray-500',
      'IPO': 'bg-gray-800'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-500';
  };

  const handleShare = async () => {
    if (navigator.share && company) {
      try {
        await navigator.share({
          title: `${company.name} - TexhPulze Company Profile`,
          text: `Check out ${company.name}'s accountability metrics on TexhPulze`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleContact = () => {
    // This would open a contact modal or redirect to contact form
    console.log('Contact company');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Back to Home
          </button>
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
            <div className="flex items-center space-x-4">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="w-16 h-16 rounded-lg" />
              ) : (
                <div className="w-16 h-16 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {company.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {company.hqLocation}
                  </div>
                  {company.verified && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button
                onClick={handleContact}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Ethics Score */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Ethics Score</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(company.ethicsScore)}`}>
                {getScoreLabel(company.ethicsScore)}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {company.ethicsScore}/10
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${company.ethicsScore * 10}%` }}
              ></div>
            </div>
          </div>

          {/* Hype Score */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Hype Score</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(company.hypeScore)}`}>
                {getScoreLabel(company.hypeScore)}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {company.hypeScore}/10
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full" 
                style={{ width: `${company.hypeScore * 10}%` }}
              ></div>
            </div>
          </div>

          {/* Credibility Score */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Credibility</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(company.credibilityScore)}`}>
                {getScoreLabel(company.credibilityScore)}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {company.credibilityScore}/10
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${company.credibilityScore * 10}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: Building2 },
                { key: 'products', label: 'Products', icon: FileText },
                { key: 'stories', label: 'Stories', icon: TrendingUp },
                { key: 'accountability', label: 'Accountability', icon: Shield }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.key
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Funding Stage */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Funding & Investment</h3>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getFundingStageColor(company.fundingStage)}`}>
                      {company.fundingStage}
                    </span>
                    {company.investors.length > 0 && (
                      <span className="text-sm text-gray-600">
                        Backed by: {company.investors.slice(0, 3).join(', ')}
                        {company.investors.length > 3 && ` +${company.investors.length - 3} more`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sectors */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sectors</h3>
                  <div className="flex flex-wrap gap-2">
                    {company.sectorTags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="flex space-x-4">
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Website
                      </a>
                    )}
                    {company.ethicsStatementUrl && (
                      <a
                        href={company.ethicsStatementUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ethics Statement
                      </a>
                    )}
                    {company.privacyPolicyUrl && (
                      <a
                        href={company.privacyPolicyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Privacy Policy
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Products & Services</h3>
                {company.products && company.products.length > 0 ? (
                  <div className="grid gap-4">
                    {company.products.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                        <p className="text-gray-600 mb-3">{product.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {product.targetUsers.map((user, index) => (
                            <span key={index} className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-sm">
                              {user}
                            </span>
                          ))}
                        </div>
                        {product.demoUrl && (
                          <a
                            href={product.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700"
                          >
                            View Demo
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No products listed</p>
                )}
              </div>
            )}

            {activeTab === 'stories' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Stories</h3>
                {company.recentStories && company.recentStories.length > 0 ? (
                  <div className="space-y-4">
                    {company.recentStories.map((story) => (
                      <div key={story.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{story.title}</h4>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-1">Hype:</span>
                            <span className={`font-medium ${getScoreColor(story.hypeScore)}`}>
                              {story.hypeScore}/10
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-1">Ethics:</span>
                            <span className={`font-medium ${getScoreColor(story.ethicsScore)}`}>
                              {story.ethicsScore}/10
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No recent stories</p>
                )}
              </div>
            )}

            {activeTab === 'accountability' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accountability Metrics</h3>
                {company.accountabilityMetrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {company.accountabilityMetrics.totalStories}
                      </div>
                      <div className="text-sm text-gray-600">Stories Tracked</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {company.accountabilityMetrics.promiseAccuracy}%
                      </div>
                      <div className="text-sm text-gray-600">Promise Accuracy</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {company.accountabilityMetrics.accountabilityScore}/10
                      </div>
                      <div className="text-sm text-gray-600">Accountability Score</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No accountability data available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;


