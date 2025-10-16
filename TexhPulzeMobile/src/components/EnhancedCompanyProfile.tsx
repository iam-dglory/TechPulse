import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

interface EnhancedCompanyProfileProps {
  company: Company;
  onContact?: () => void;
  onViewStories?: () => void;
  onViewProducts?: () => void;
}

export const EnhancedCompanyProfile: React.FC<EnhancedCompanyProfileProps> = ({
  company,
  onContact,
  onViewStories,
  onViewProducts
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'stories' | 'accountability'>('overview');

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10B981'; // Green
    if (score >= 6) return '#F59E0B'; // Yellow
    if (score >= 4) return '#EF4444'; // Red
    return '#DC2626'; // Dark red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  const getFundingStageColor = (stage: string) => {
    const colors = {
      'Seed': '#8B5CF6',
      'Series A': '#3B82F6',
      'Series B': '#10B981',
      'Series C': '#F59E0B',
      'Series D+': '#EF4444',
      'Public': '#6B7280',
      'IPO': '#1F2937'
    };
    return colors[stage as keyof typeof colors] || '#6B7280';
  };

  const handleWebsitePress = () => {
    if (company.website) {
      Linking.openURL(company.website);
    }
  };

  const handleEthicsStatementPress = () => {
    if (company.ethicsStatementUrl) {
      Linking.openURL(company.ethicsStatementUrl);
    }
  };

  const handlePrivacyPolicyPress = () => {
    if (company.privacyPolicyUrl) {
      Linking.openURL(company.privacyPolicyUrl);
    }
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Company Header */}
      <View style={styles.companyHeader}>
        <View style={styles.logoContainer}>
          {company.logoUrl ? (
            <Image source={{ uri: company.logoUrl }} style={styles.logo} />
          ) : (
            <View style={styles.defaultLogo}>
              <Text style={styles.defaultLogoText}>
                {company.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            {' '}{company.hqLocation}
          </Text>
          
          {company.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.verifiedText}>Verified Company</Text>
            </View>
          )}
        </View>
      </View>

      {/* Funding Stage */}
      <View style={styles.fundingContainer}>
        <View style={[styles.fundingBadge, { backgroundColor: getFundingStageColor(company.fundingStage) }]}>
          <Text style={styles.fundingText}>{company.fundingStage}</Text>
        </View>
        {company.investors.length > 0 && (
          <Text style={styles.investorsText}>
            Backed by: {company.investors.slice(0, 3).join(', ')}
            {company.investors.length > 3 && ` +${company.investors.length - 3} more`}
          </Text>
        )}
      </View>

      {/* Sector Tags */}
      <View style={styles.sectorsContainer}>
        <Text style={styles.sectionTitle}>Sectors</Text>
        <View style={styles.tagsContainer}>
          {company.sectorTags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        {company.website && (
          <TouchableOpacity style={styles.actionButton} onPress={handleWebsitePress}>
            <Ionicons name="globe-outline" size={20} color="#4ECDC4" />
            <Text style={styles.actionText}>Visit Website</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.actionButton} onPress={onContact}>
          <Ionicons name="mail-outline" size={20} color="#4ECDC4" />
          <Text style={styles.actionText}>Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Compliance Links */}
      <View style={styles.complianceContainer}>
        <Text style={styles.sectionTitle}>Transparency & Compliance</Text>
        
        {company.ethicsStatementUrl && (
          <TouchableOpacity style={styles.complianceLink} onPress={handleEthicsStatementPress}>
            <Ionicons name="document-text-outline" size={20} color="#4ECDC4" />
            <Text style={styles.complianceText}>Ethics Statement</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        
        {company.privacyPolicyUrl && (
          <TouchableOpacity style={styles.complianceLink} onPress={handlePrivacyPolicyPress}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#4ECDC4" />
            <Text style={styles.complianceText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderScoreCards = () => (
    <View style={styles.scoreCardsContainer}>
      {/* Ethics Score */}
      <View style={styles.scoreCard}>
        <LinearGradient
          colors={[getScoreColor(company.ethicsScore), `${getScoreColor(company.ethicsScore)}80`]}
          style={styles.scoreGradient}
        >
          <Text style={styles.scoreValue}>{company.ethicsScore}/10</Text>
          <Text style={styles.scoreLabel}>Ethics Score</Text>
          <Text style={styles.scoreDescription}>{getScoreLabel(company.ethicsScore)}</Text>
        </LinearGradient>
      </View>

      {/* Hype Score */}
      <View style={styles.scoreCard}>
        <LinearGradient
          colors={[getScoreColor(company.hypeScore), `${getScoreColor(company.hypeScore)}80`]}
          style={styles.scoreGradient}
        >
          <Text style={styles.scoreValue}>{company.hypeScore}/10</Text>
          <Text style={styles.scoreLabel}>Hype Score</Text>
          <Text style={styles.scoreDescription}>{getScoreLabel(company.hypeScore)}</Text>
        </LinearGradient>
      </View>

      {/* Credibility Score */}
      <View style={styles.scoreCard}>
        <LinearGradient
          colors={[getScoreColor(company.credibilityScore), `${getScoreColor(company.credibilityScore)}80`]}
          style={styles.scoreGradient}
        >
          <Text style={styles.scoreValue}>{company.credibilityScore}/10</Text>
          <Text style={styles.scoreLabel}>Credibility</Text>
          <Text style={styles.scoreDescription}>{getScoreLabel(company.credibilityScore)}</Text>
        </LinearGradient>
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'overview', label: 'Overview', icon: 'business-outline' },
        { key: 'products', label: 'Products', icon: 'cube-outline' },
        { key: 'stories', label: 'Stories', icon: 'newspaper-outline' },
        { key: 'accountability', label: 'Accountability', icon: 'shield-checkmark-outline' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Ionicons
            name={tab.icon as any}
            size={20}
            color={activeTab === tab.key ? '#4ECDC4' : '#6B7280'}
          />
          <Text style={[
            styles.tabText,
            activeTab === tab.key && styles.activeTabText
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Score Cards */}
        {renderScoreCards()}
        
        {/* Tab Bar */}
        {renderTabBar()}
        
        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        
        {activeTab === 'products' && (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Products & Services</Text>
            {company.products && company.products.length > 0 ? (
              company.products.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDescription}>{product.description}</Text>
                  <View style={styles.productTargets}>
                    {product.targetUsers.map((user, index) => (
                      <View key={index} style={styles.targetTag}>
                        <Text style={styles.targetText}>{user}</Text>
                      </View>
                    ))}
                  </View>
                  {product.demoUrl && (
                    <TouchableOpacity style={styles.demoButton}>
                      <Text style={styles.demoText}>View Demo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No products listed</Text>
            )}
          </View>
        )}
        
        {activeTab === 'stories' && (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Recent Stories</Text>
            {company.recentStories && company.recentStories.length > 0 ? (
              company.recentStories.map((story) => (
                <TouchableOpacity key={story.id} style={styles.storyCard}>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  <View style={styles.storyScores}>
                    <View style={styles.storyScore}>
                      <Text style={styles.storyScoreLabel}>Hype</Text>
                      <Text style={[styles.storyScoreValue, { color: getScoreColor(story.hypeScore) }]}>
                        {story.hypeScore}/10
                      </Text>
                    </View>
                    <View style={styles.storyScore}>
                      <Text style={styles.storyScoreLabel}>Ethics</Text>
                      <Text style={[styles.storyScoreValue, { color: getScoreColor(story.ethicsScore) }]}>
                        {story.ethicsScore}/10
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent stories</Text>
            )}
          </View>
        )}
        
        {activeTab === 'accountability' && (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Accountability Metrics</Text>
            {company.accountabilityMetrics ? (
              <View style={styles.metricsContainer}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{company.accountabilityMetrics.totalStories}</Text>
                  <Text style={styles.metricLabel}>Total Stories Tracked</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{company.accountabilityMetrics.promiseAccuracy}%</Text>
                  <Text style={styles.metricLabel}>Promise Accuracy</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{company.accountabilityMetrics.accountabilityScore}/10</Text>
                  <Text style={styles.metricLabel}>Accountability Score</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>No accountability data available</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scoreCardsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  scoreCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  scoreGradient: {
    padding: 16,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  scoreDescription: {
    fontSize: 10,
    color: '#FFFFFF',
    marginTop: 2,
    opacity: 0.8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#4ECDC4',
  },
  tabContent: {
    padding: 16,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  companyHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  logoContainer: {
    marginRight: 16,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  defaultLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultLogoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  companyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 12,
    color: '#065F46',
    marginLeft: 4,
    fontWeight: '500',
  },
  fundingContainer: {
    marginBottom: 20,
  },
  fundingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  fundingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  investorsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectorsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4ECDC4',
  },
  complianceContainer: {
    marginBottom: 20,
  },
  complianceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  complianceText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  productCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  productTargets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  targetTag: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  targetText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  demoButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  demoText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  storyCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  storyScores: {
    flexDirection: 'row',
    gap: 16,
  },
  storyScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storyScoreLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  storyScoreValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default EnhancedCompanyProfile;


