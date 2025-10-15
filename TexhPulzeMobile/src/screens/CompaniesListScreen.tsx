import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import apiService from '../services/api';
import EthicsBadge from '../components/EthicsBadge';
import { useNavigation } from '@react-navigation/native';

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
  logoUrl?: string;
}

interface FilterState {
  search: string;
  sector: string;
  ethicsScoreMin: string;
  fundingStage: string;
}

const CompaniesListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sector: '',
    ethicsScoreMin: '',
    fundingStage: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Build query parameters
  const queryParams = {
    ...(filters.search && { search: filters.search }),
    ...(filters.sector && { sector: filters.sector }),
    ...(filters.ethicsScoreMin && { ethicsScoreMin: parseInt(filters.ethicsScoreMin) }),
    ...(filters.fundingStage && { fundingStage: filters.fundingStage }),
    page: 1,
    limit: 20,
  };

  // Fetch companies using React Query
  const {
    data: companiesData,
    isLoading,
    error,
    refetch,
    isRefreshing,
  } = useQuery({
    queryKey: ['companies', queryParams],
    queryFn: () => apiService.getCompanies(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const companies: Company[] = companiesData?.data?.companies || [];

  // Sector options (you can expand this)
  const sectorOptions = [
    { label: 'All Sectors', value: '' },
    { label: 'AI', value: 'AI' },
    { label: 'Healthcare AI', value: 'Healthcare AI' },
    { label: 'Electric Vehicles', value: 'Electric Vehicles' },
    { label: 'AgTech', value: 'AgTech' },
    { label: 'Cybersecurity', value: 'Cybersecurity' },
    { label: 'EdTech', value: 'EdTech' },
    { label: 'Clean Energy', value: 'Clean Energy' },
    { label: 'Robotics', value: 'Robotics' },
  ];

  // Funding stage options
  const fundingStageOptions = [
    { label: 'All Stages', value: '' },
    { label: 'Seed', value: 'Seed' },
    { label: 'Series A', value: 'Series A' },
    { label: 'Series B', value: 'Series B' },
    { label: 'Series C+', value: 'Series C+' },
    { label: 'Public', value: 'Public' },
    { label: 'Acquired', value: 'Acquired' },
    { label: 'Bootstrapped', value: 'Bootstrapped' },
  ];

  // Ethics score options
  const ethicsScoreOptions = [
    { label: 'Any Score', value: '' },
    { label: '90+ (Excellent)', value: '90' },
    { label: '80+ (Very Good)', value: '80' },
    { label: '70+ (Good)', value: '70' },
    { label: '60+ (Fair)', value: '60' },
    { label: '50+ (Below Average)', value: '50' },
  ];

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      sector: '',
      ethicsScoreMin: '',
      fundingStage: '',
    });
  }, []);

  const handleCompanyPress = useCallback((company: Company) => {
    navigation.navigate('CompanyProfile', { companyId: company.id, companySlug: company.slug });
  }, [navigation]);

  const renderCompanyItem = ({ item: company }: { item: Company }) => (
    <TouchableOpacity
      style={styles.companyCard}
      onPress={() => handleCompanyPress(company)}
      activeOpacity={0.8}
    >
      <View style={styles.companyHeader}>
        <View style={styles.companyInfo}>
          <View style={styles.companyNameRow}>
            <Text style={styles.companyName} numberOfLines={1}>
              {company.name}
            </Text>
            {company.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              </View>
            )}
          </View>
          <Text style={styles.companyLocation} numberOfLines={1}>
            📍 {company.hqLocation}
          </Text>
          <Text style={styles.companyWebsite} numberOfLines={1}>
            🌐 {company.website}
          </Text>
        </View>
        
        <View style={styles.scoresContainer}>
          <EthicsBadge score={company.ethicsScore} type="ethics" size="small" />
          <EthicsBadge score={company.hypeScore} type="hype" size="small" />
          <EthicsBadge score={company.credibilityScore} type="credibility" size="small" />
        </View>
      </View>

      <View style={styles.companyDetails}>
        <View style={styles.sectorTags}>
          {company.sectorTags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.sectorTag}>
              <Text style={styles.sectorTagText}>{tag}</Text>
            </View>
          ))}
          {company.sectorTags.length > 3 && (
            <View style={styles.sectorTag}>
              <Text style={styles.sectorTagText}>+{company.sectorTags.length - 3}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.fundingInfo}>
          <Text style={styles.fundingStage}>{company.fundingStage}</Text>
          {company.investors.length > 0 && (
            <Text style={styles.investors} numberOfLines={1}>
              💼 {company.investors.slice(0, 2).join(', ')}
              {company.investors.length > 2 && ` +${company.investors.length - 2} more`}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search companies..."
          value={filters.search}
          onChangeText={(text) => handleFilterChange('search', text)}
          placeholderTextColor="#7F8C8D"
        />
        {filters.search.length > 0 && (
          <TouchableOpacity onPress={() => handleFilterChange('search', '')}>
            <Ionicons name="close-circle" size={20} color="#7F8C8D" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sector Filter */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Sector</Text>
        <Picker
          selectedValue={filters.sector}
          onValueChange={(value) => handleFilterChange('sector', value)}
          style={styles.picker}
        >
          {sectorOptions.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>

      {/* Ethics Score Filter */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Minimum Ethics Score</Text>
        <Picker
          selectedValue={filters.ethicsScoreMin}
          onValueChange={(value) => handleFilterChange('ethicsScoreMin', value)}
          style={styles.picker}
        >
          {ethicsScoreOptions.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>

      {/* Funding Stage Filter */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Funding Stage</Text>
        <Picker
          selectedValue={filters.fundingStage}
          onValueChange={(value) => handleFilterChange('fundingStage', value)}
          style={styles.picker}
        >
          {fundingStageOptions.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>

      {/* Clear Filters Button */}
      <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
        <Ionicons name="refresh" size={16} color="#E74C3C" />
        <Text style={styles.clearFiltersText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#E74C3C" />
        <Text style={styles.errorTitle}>Failed to Load Companies</Text>
        <Text style={styles.errorMessage}>
          {error.message || 'Something went wrong. Please try again.'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Filter Toggle */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Companies ({companiesData?.data?.pagination?.total || 0})
        </Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name={showFilters ? "filter" : "filter-outline"}
            size={24}
            color="#4ECDC4"
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && renderFilters()}

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Loading companies...</Text>
        </View>
      )}

      {/* Companies List */}
      {!isLoading && (
        <FlatList
          data={companies}
          keyExtractor={(item) => item.id}
          renderItem={renderCompanyItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refetch}
              colors={['#4ECDC4']}
              tintColor="#4ECDC4"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={64} color="#BDC3C7" />
              <Text style={styles.emptyTitle}>No Companies Found</Text>
              <Text style={styles.emptyMessage}>
                Try adjusting your search criteria or filters
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 12,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  picker: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#E74C3C',
    marginLeft: 4,
    fontWeight: '600',
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
  listContainer: {
    paddingBottom: 20,
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flex: 1,
    marginRight: 12,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  companyLocation: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  companyWebsite: {
    fontSize: 12,
    color: '#4ECDC4',
  },
  scoresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  companyDetails: {
    gap: 8,
  },
  sectorTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sectorTag: {
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectorTagText: {
    fontSize: 11,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  fundingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fundingStage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
  },
  investors: {
    fontSize: 11,
    color: '#7F8C8D',
    flex: 1,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 20,
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
});

export default CompaniesListScreen;
