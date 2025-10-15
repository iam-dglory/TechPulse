import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import apiService from '../services/api';
import EthicsBadge from '../components/EthicsBadge';
import ProductCard from '../components/ProductCard';

interface Company {
  id: string;
  name: string;
  slug: string;
  website: string;
  sectorTags: string[];
  fundingStage: string;
  investors: string[];
  hqLocation: string;
  credibilityScore: number;
  ethicsScore: number;
  hypeScore: number;
  verified: boolean;
  verifiedAt?: string;
  ethicsStatementUrl?: string;
  privacyPolicyUrl?: string;
  logoUrl?: string;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  priceTiers: Array<{
    name: string;
    price: number;
    features: string[];
  }>;
  features: {
    core: string[];
    advanced: string[];
    integrations: string[];
  };
  targetUsers: string[];
  demoUrl: string;
}

type CompanyProfileRouteParams = {
  CompanyProfile: {
    companyId?: string;
    companySlug?: string;
  };
};

const CompanyProfileScreen: React.FC = () => {
  const route = useRoute<RouteProp<CompanyProfileRouteParams, 'CompanyProfile'>>();
  const navigation = useNavigation();
  const { companyId, companySlug } = route.params;
  
  const [refreshing, setRefreshing] = useState(false);

  // Fetch company data
  const {
    data: companyData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['company', companyId, companySlug],
    queryFn: async () => {
      if (companyId) {
        return await apiService.getCompanyById(companyId);
      } else if (companySlug) {
        return await apiService.getCompanyBySlug(companySlug);
      }
      throw new Error('No company ID or slug provided');
    },
    enabled: !!(companyId || companySlug),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const company: Company = companyData?.data;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleWebsitePress = () => {
    if (company?.website) {
      Linking.openURL(company.website).catch(() => {
        Alert.alert('Error', 'Could not open website');
      });
    }
  };

  const handleEthicsStatementPress = () => {
    if (company?.ethicsStatementUrl) {
      Linking.openURL(company.ethicsStatementUrl).catch(() => {
        Alert.alert('Error', 'Could not open ethics statement');
      });
    }
  };

  const handlePrivacyPolicyPress = () => {
    if (company?.privacyPolicyUrl) {
      Linking.openURL(company.privacyPolicyUrl).catch(() => {
        Alert.alert('Error', 'Could not open privacy policy');
      });
    }
  };

  const handleContactPress = () => {
    Alert.alert(
      'Contact Company',
      'Would you like to contact this company or claim ownership?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Contact',
          onPress: () => {
            // Navigate to contact form or open email
            Alert.alert('Contact', 'Contact functionality coming soon!');
          },
        },
        {
          text: 'Claim Ownership',
          onPress: () => {
            // Navigate to claim ownership form
            Alert.alert('Claim Ownership', 'Ownership claim functionality coming soon!');
          },
        },
      ]
    );
  };

  const handleDemoPress = (demoUrl: string) => {
    Linking.openURL(demoUrl).catch(() => {
      Alert.alert('Error', 'Could not open demo');
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Loading company profile...</Text>
      </View>
    );
  }

  if (error || !company) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#E74C3C" />
        <Text style={styles.errorTitle}>Company Not Found</Text>
        <Text style={styles.errorMessage}>
          {error?.message || 'The company you are looking for could not be found.'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#4ECDC4']}
          tintColor="#4ECDC4"
        />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.companyHeader}>
          {company.logoUrl ? (
            <Image source={{ uri: company.logoUrl }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="business" size={32} color="#4ECDC4" />
            </View>
          )}
          
          <View style={styles.companyInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.companyName}>{company.name}</Text>
              {company.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.location}>📍 {company.hqLocation}</Text>
            
            <TouchableOpacity onPress={handleWebsitePress} style={styles.websiteButton}>
              <Ionicons name="globe-outline" size={16} color="#4ECDC4" />
              <Text style={styles.websiteText}>{company.website}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scores Section */}
        <View style={styles.scoresSection}>
          <Text style={styles.sectionTitle}>Scores</Text>
          <View style={styles.scoresContainer}>
            <EthicsBadge score={company.ethicsScore} type="ethics" size="large" />
            <EthicsBadge score={company.hypeScore} type="hype" size="large" />
            <EthicsBadge score={company.credibilityScore} type="credibility" size="large" />
          </View>
        </View>
      </View>

      {/* Sector Tags */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sectors</Text>
        <View style={styles.sectorTags}>
          {company.sectorTags.map((tag, index) => (
            <View key={index} style={styles.sectorTag}>
              <Text style={styles.sectorTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Funding Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Funding Information</Text>
        <View style={styles.fundingCard}>
          <View style={styles.fundingStage}>
            <Ionicons name="trending-up" size={20} color="#4ECDC4" />
            <Text style={styles.fundingStageText}>{company.fundingStage}</Text>
          </View>
          
          {company.investors.length > 0 && (
            <View style={styles.investorsSection}>
              <Text style={styles.investorsLabel}>Investors:</Text>
              {company.investors.map((investor, index) => (
                <Text key={index} style={styles.investorText}>
                  • {investor}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Products Section */}
      {company.products && company.products.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products & Services</Text>
          {company.products.map((product, index) => (
            <ProductCard
              key={product.id || index}
              name={product.name}
              description={product.description}
              priceTiers={product.priceTiers}
              features={product.features}
              targetUsers={product.targetUsers}
              demoUrl={product.demoUrl}
              onDemoPress={() => handleDemoPress(product.demoUrl)}
            />
          ))}
        </View>
      )}

      {/* Ethics & Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ethics & Privacy</Text>
        <View style={styles.ethicsSection}>
          {company.ethicsStatementUrl && (
            <TouchableOpacity
              style={styles.ethicsButton}
              onPress={handleEthicsStatementPress}
            >
              <Ionicons name="document-text" size={20} color="#4ECDC4" />
              <Text style={styles.ethicsButtonText}>Ethics Statement</Text>
              <Ionicons name="chevron-forward" size={16} color="#BDC3C7" />
            </TouchableOpacity>
          )}
          
          {company.privacyPolicyUrl && (
            <TouchableOpacity
              style={styles.ethicsButton}
              onPress={handlePrivacyPolicyPress}
            >
              <Ionicons name="shield-checkmark" size={20} color="#4ECDC4" />
              <Text style={styles.ethicsButtonText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={16} color="#BDC3C7" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Company Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Founded:</Text>
            <Text style={styles.detailValue}>
              {new Date(company.createdAt).getFullYear()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Updated:</Text>
            <Text style={styles.detailValue}>
              {new Date(company.updatedAt).toLocaleDateString()}
            </Text>
          </View>
          
          {company.verifiedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Verified:</Text>
              <Text style={styles.detailValue}>
                {new Date(company.verifiedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Contact/Claim Button */}
      <View style={styles.contactSection}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
          <Ionicons name="mail" size={20} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>Contact / Claim Ownership</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  companyHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  companyInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
    marginLeft: 4,
  },
  location: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  websiteText: {
    fontSize: 14,
    color: '#4ECDC4',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  scoresSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  sectorTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectorTag: {
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sectorTagText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  fundingCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  fundingStage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fundingStageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
  },
  investorsSection: {
    marginTop: 8,
  },
  investorsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  investorText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  ethicsSection: {
    gap: 8,
  },
  ethicsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  ethicsButtonText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
    flex: 1,
  },
  detailsCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  contactSection: {
    padding: 20,
    paddingBottom: 0,
  },
  contactButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default CompanyProfileScreen;
