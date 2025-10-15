import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api';
import { RootStackParamList } from '../types';

interface GraveyardEntry {
  id: string;
  title: string;
  followUpSummary: string;
  actualOutcome: string;
  outcomeDate: string;
  failureType: string;
  impactAssessment?: {
    usersAffected?: number;
    financialImpact?: string;
    reputationDamage?: string;
    lessonsLearned?: string[];
  };
  originalPromises?: string;
  sources?: Array<{
    url: string;
    title: string;
    date: string;
    type: string;
  }>;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  originalClaimStory?: {
    id: string;
    title: string;
    publishedAt: string;
    hypeScore: number;
    ethicsScore: number;
  };
  company?: {
    id: string;
    name: string;
    slug: string;
  };
}

type GraveyardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Graveyard'>;

const GraveyardScreen: React.FC = () => {
  const navigation = useNavigation<GraveyardScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'outcomeDate' | 'hypeScore' | 'createdAt'>('outcomeDate');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const failureTypes = [
    { key: 'all', label: 'All Types', icon: 'list' },
    { key: 'broken-promise', label: 'Broken Promise', icon: 'close-circle' },
    { key: 'overhyped', label: 'Overhyped', icon: 'flame' },
    { key: 'failed-delivery', label: 'Failed Delivery', icon: 'alert-circle' },
    { key: 'misleading-claims', label: 'Misleading Claims', icon: 'warning' },
    { key: 'cancelled-project', label: 'Cancelled Project', icon: 'stop-circle' },
    { key: 'delayed-indefinitely', label: 'Delayed Indefinitely', icon: 'time' },
  ];

  const {
    data: graveyardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['graveyard', searchQuery, selectedFilter, sortBy, sortOrder],
    queryFn: () =>
      apiService.getGraveyardEntries({
        search: searchQuery || undefined,
        failureType: selectedFilter !== 'all' ? selectedFilter : undefined,
        sortBy,
        sortOrder,
        limit: 50,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const entries: GraveyardEntry[] = graveyardData?.data?.entries || [];

  const getFailureTypeColor = (type: string) => {
    switch (type) {
      case 'broken-promise': return '#E74C3C';
      case 'overhyped': return '#F39C12';
      case 'failed-delivery': return '#8E44AD';
      case 'misleading-claims': return '#C0392B';
      case 'cancelled-project': return '#7F8C8D';
      case 'delayed-indefinitely': return '#34495E';
      default: return '#7F8C8D';
    }
  };

  const getFailureTypeIcon = (type: string) => {
    switch (type) {
      case 'broken-promise': return 'close-circle';
      case 'overhyped': return 'flame';
      case 'failed-delivery': return 'alert-circle';
      case 'misleading-claims': return 'warning';
      case 'cancelled-project': return 'stop-circle';
      case 'delayed-indefinitely': return 'time';
      default: return 'help-circle';
    }
  };

  const handleEntryPress = (entry: GraveyardEntry) => {
    // Navigate to detailed graveyard entry view
    // For now, we'll show an alert with details
    const message = `
${entry.title}

Follow-up: ${entry.followUpSummary}

Actual Outcome: ${entry.actualOutcome}

Failure Type: ${entry.failureType.replace('-', ' ').toUpperCase()}

${entry.originalClaimStory ? `Original Story: ${entry.originalClaimStory.title}` : ''}
${entry.company ? `Company: ${entry.company.name}` : ''}
    `;
    
    // TODO: Create a detailed graveyard entry modal or screen
    alert(message);
  };

  const handleSourcePress = (url: string) => {
    Linking.openURL(url);
  };

  const handleOriginalStoryPress = (storyId: string) => {
    navigation.navigate('StoryView', { storyId });
  };

  const handleCompanyPress = (companyId: string, companySlug: string) => {
    navigation.navigate('CompanyProfile', { companyId, companySlug });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderEntry = (entry: GraveyardEntry) => (
    <TouchableOpacity
      key={entry.id}
      style={styles.entryCard}
      onPress={() => handleEntryPress(entry)}
    >
      <View style={styles.entryHeader}>
        <View style={styles.entryTitleContainer}>
          <Text style={styles.entryTitle} numberOfLines={2}>
            {entry.title}
          </Text>
          <View style={[
            styles.failureTypeBadge,
            { backgroundColor: getFailureTypeColor(entry.failureType) + '20' }
          ]}>
            <Ionicons
              name={getFailureTypeIcon(entry.failureType)}
              size={12}
              color={getFailureTypeColor(entry.failureType)}
            />
            <Text style={[
              styles.failureTypeText,
              { color: getFailureTypeColor(entry.failureType) }
            ]}>
              {entry.failureType.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.outcomeDate}>
          {formatDate(entry.outcomeDate)}
        </Text>
      </View>

      <Text style={styles.followUpSummary} numberOfLines={3}>
        {entry.followUpSummary}
      </Text>

      <Text style={styles.actualOutcome} numberOfLines={2}>
        {entry.actualOutcome}
      </Text>

      <View style={styles.entryMeta}>
        {entry.originalClaimStory && (
          <TouchableOpacity
            style={styles.metaItem}
            onPress={() => handleOriginalStoryPress(entry.originalClaimStory!.id)}
          >
            <Ionicons name="document-text" size={14} color="#4ECDC4" />
            <Text style={styles.metaText}>Original Story</Text>
          </TouchableOpacity>
        )}

        {entry.company && (
          <TouchableOpacity
            style={styles.metaItem}
            onPress={() => handleCompanyPress(entry.company!.id, entry.company!.slug)}
          >
            <Ionicons name="business" size={14} color="#4ECDC4" />
            <Text style={styles.metaText}>{entry.company.name}</Text>
          </TouchableOpacity>
        )}

        {entry.sources && entry.sources.length > 0 && (
          <TouchableOpacity
            style={styles.metaItem}
            onPress={() => entry.sources && entry.sources[0] && handleSourcePress(entry.sources[0].url)}
          >
            <Ionicons name="link" size={14} color="#4ECDC4" />
            <Text style={styles.metaText}>Sources</Text>
          </TouchableOpacity>
        )}
      </View>

      {entry.impactAssessment && (
        <View style={styles.impactContainer}>
          <Text style={styles.impactLabel}>Impact:</Text>
          {entry.impactAssessment.usersAffected && (
            <Text style={styles.impactText}>
              {entry.impactAssessment.usersAffected.toLocaleString()} users affected
            </Text>
          )}
          {entry.impactAssessment.financialImpact && (
            <Text style={styles.impactText}>
              Financial: {entry.impactAssessment.financialImpact}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tech Graveyard</Text>
        <Text style={styles.headerSubtitle}>Failed Promises & Overhyped Claims</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search failed projects..."
            placeholderTextColor="#7F8C8D"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#7F8C8D" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {failureTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.filterChip,
                selectedFilter === type.key && styles.filterChipSelected,
              ]}
              onPress={() => setSelectedFilter(type.key)}
            >
              <Ionicons
                name={type.icon as any}
                size={16}
                color={selectedFilter === type.key ? '#FFFFFF' : '#4ECDC4'}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === type.key && styles.filterChipTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.entriesList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Loading graveyard entries...</Text>
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#E74C3C" />
            <Text style={styles.errorText}>Error loading graveyard entries</Text>
            <Text style={styles.errorSubtext}>
              {error?.message || 'Something went wrong'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="skull-outline" size={64} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>No Failed Projects Found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Check back later for failed tech promises and overhyped claims'}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {entries.length} failed project{entries.length !== 1 ? 's' : ''} found
              </Text>
            </View>
            {entries.map(renderEntry)}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterContent: {
    paddingRight: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  filterChipSelected: {
    backgroundColor: '#4ECDC4',
  },
  filterChipText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
    marginLeft: 6,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  entriesList: {
    flex: 1,
    paddingHorizontal: 16,
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
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginTop: 12,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#BDC3C7',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  statsContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F8F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 24,
  },
  failureTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  failureTypeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  outcomeDate: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  followUpSummary: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
    marginBottom: 8,
  },
  actualOutcome: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  entryMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
    marginLeft: 4,
  },
  impactContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  impactLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  impactText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 2,
  },
});

export default GraveyardScreen;
