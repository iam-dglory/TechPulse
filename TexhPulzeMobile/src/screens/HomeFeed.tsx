import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import EthicsBadge from '../components/EthicsBadge';
import ImpactCalculatorModal from '../components/ImpactCalculatorModal';

interface Brief {
  id: string;
  title: string;
  eli5Summary: string;
  audioUrl?: string;
  timeframe: string;
  storyId: string;
  company?: {
    name: string;
    id: string;
  };
}

interface Story {
  id: string;
  title: string;
  content: string;
  eli5Summary?: string;
  sectorTag: string;
  hypeScore: number;
  ethicsScore: number;
  impactTags: string[];
  publishedAt: string;
  company?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ImpactData {
  job: string;
  location: string;
  techUsed: string[];
  industry: string;
}

const { width: screenWidth } = Dimensions.get('window');

const HomeFeedScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [impactData, setImpactData] = useState<ImpactData | null>(null);
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch briefs (60-second summaries)
  const {
    data: briefsData,
    isLoading: briefsLoading,
    refetch: refetchBriefs,
  } = useQuery({
    queryKey: ['briefs'],
    queryFn: () => apiService.getBriefs(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch personalized stories based on impact data
  const {
    data: storiesData,
    isLoading: storiesLoading,
    refetch: refetchStories,
  } = useQuery({
    queryKey: ['stories', 'recommended', impactData?.job],
    queryFn: () => apiService.getStories({
      recommendedFor: impactData?.job?.toLowerCase().replace(/\s+/g, '-'),
      limit: 20,
      sort: 'hot',
    }),
    enabled: !!impactData?.job,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch general stories if no impact data
  const {
    data: generalStoriesData,
    isLoading: generalStoriesLoading,
    refetch: refetchGeneralStories,
  } = useQuery({
    queryKey: ['stories', 'general'],
    queryFn: () => apiService.getStories({
      limit: 20,
      sort: 'hot',
    }),
    enabled: !impactData?.job,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const briefs: Brief[] = briefsData?.data?.briefs || [];
  const stories: Story[] = impactData?.job 
    ? storiesData?.data?.stories || []
    : generalStoriesData?.data?.stories || [];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchBriefs(),
      impactData?.job ? refetchStories() : refetchGeneralStories(),
    ]);
    setRefreshing(false);
  }, [refetchBriefs, refetchStories, refetchGeneralStories, impactData?.job]);

  const handleImpactSave = useCallback((data: ImpactData) => {
    setImpactData(data);
    // Store in AsyncStorage for persistence
    // You can add AsyncStorage.setItem here if needed
  }, []);

  const handleBriefPress = useCallback((brief: Brief) => {
    navigation.navigate('StoryView', { storyId: brief.storyId });
  }, [navigation]);

  const handleStoryPress = useCallback((story: Story) => {
    navigation.navigate('StoryView', { storyId: story.id });
  }, [navigation]);

  const handleCompanyPress = useCallback((company: { id: string; slug: string }) => {
    navigation.navigate('CompanyProfile', { companyId: company.id, companySlug: company.slug });
  }, [navigation]);

  const handleAudioPlay = useCallback((brief: Brief) => {
    if (brief.audioUrl) {
      // Implement audio playback
      Alert.alert('Audio Playback', 'Audio playback functionality coming soon!');
    } else {
      Alert.alert('No Audio', 'Audio version not available for this brief');
    }
  }, []);

  const renderBriefItem = ({ item: brief }: { item: Brief }) => (
    <TouchableOpacity
      style={styles.briefCard}
      onPress={() => handleBriefPress(brief)}
      activeOpacity={0.8}
    >
      <View style={styles.briefHeader}>
        <View style={styles.briefTitleContainer}>
          <Text style={styles.briefTitle} numberOfLines={2}>
            {brief.title}
          </Text>
          <Text style={styles.briefTimeframe}>{brief.timeframe}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.audioButton}
          onPress={() => handleAudioPlay(brief)}
        >
          <Ionicons 
            name={brief.audioUrl ? "play-circle" : "play-circle-outline"} 
            size={32} 
            color="#4ECDC4" 
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.briefSummary} numberOfLines={3}>
        {brief.eli5Summary}
      </Text>

      <View style={styles.briefFooter}>
        <TouchableOpacity
          style={styles.eli5Button}
          onPress={() => handleBriefPress(brief)}
        >
          <Ionicons name="bulb" size={16} color="#F39C12" />
          <Text style={styles.eli5ButtonText}>ELI5</Text>
        </TouchableOpacity>

        {brief.company && (
          <TouchableOpacity
            style={styles.companyButton}
            onPress={() => handleCompanyPress(brief.company)}
          >
            <Text style={styles.companyButtonText}>
              {brief.company.name}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#7F8C8D" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderStoryItem = ({ item: story }: { item: Story }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => handleStoryPress(story)}
      activeOpacity={0.8}
    >
      <View style={styles.storyHeader}>
        <View style={styles.storyTitleContainer}>
          <Text style={styles.storyTitle} numberOfLines={2}>
            {story.title}
          </Text>
          <View style={styles.storyMeta}>
            <View style={styles.sectorTag}>
              <Text style={styles.sectorTagText}>{story.sectorTag}</Text>
            </View>
            <Text style={styles.publishDate}>
              {new Date(story.publishedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.scoresContainer}>
          <EthicsBadge score={story.ethicsScore} type="ethics" size="small" />
          <EthicsBadge score={story.hypeScore} type="hype" size="small" />
        </View>
      </View>

      <Text style={styles.storyContent} numberOfLines={3}>
        {story.content}
      </Text>

      <View style={styles.storyFooter}>
        {story.company && (
          <TouchableOpacity
            style={styles.companyLink}
            onPress={() => handleCompanyPress(story.company)}
          >
            <Ionicons name="business" size={16} color="#4ECDC4" />
            <Text style={styles.companyLinkText}>{story.company.name}</Text>
            <Ionicons name="chevron-forward" size={14} color="#7F8C8D" />
          </TouchableOpacity>
        )}

        <View style={styles.impactTags}>
          {story.impactTags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.impactTag}>
              <Text style={styles.impactTagText}>{tag}</Text>
            </View>
          ))}
          {story.impactTags.length > 2 && (
            <View style={styles.impactTag}>
              <Text style={styles.impactTagText}>+{story.impactTags.length - 2}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Personalized Recommendation Header */}
      {impactData?.job && (
        <View style={styles.recommendationHeader}>
          <View style={styles.recommendationContent}>
            <Ionicons name="person-circle" size={20} color="#4ECDC4" />
            <Text style={styles.recommendationText}>
              Because you are in <Text style={styles.jobHighlight}>{impactData.job}</Text>
            </Text>
          </View>
          <Text style={styles.recommendationSubtext}>
            {stories.length} personalized stories
          </Text>
        </View>
      )}

      {/* Impact Calculator Button */}
      <TouchableOpacity
        style={styles.impactCalculatorButton}
        onPress={() => setShowImpactModal(true)}
      >
        <Ionicons name="calculator" size={20} color="#4ECDC4" />
        <Text style={styles.impactCalculatorText}>
          {impactData ? 'Update Impact Profile' : 'Calculate Your Impact'}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#7F8C8D" />
      </TouchableOpacity>

      {/* Briefs Section */}
      {briefs.length > 0 && (
        <View style={styles.briefsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>60-Second Briefs</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={briefs}
            keyExtractor={(item) => item.id}
            renderItem={renderBriefItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.briefsList}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        </View>
      )}

      {/* Stories Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {impactData?.job ? 'Recommended for You' : 'Latest Stories'}
        </Text>
      </View>
    </View>
  );

  const isLoading = briefsLoading || storiesLoading || generalStoriesLoading;

  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={renderStoryItem}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4ECDC4']}
            tintColor="#4ECDC4"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={64} color="#BDC3C7" />
              <Text style={styles.emptyTitle}>No Stories Found</Text>
              <Text style={styles.emptyMessage}>
                {impactData?.job 
                  ? 'No personalized stories available. Try updating your impact profile.'
                  : 'No stories available at the moment.'
                }
              </Text>
            </View>
          ) : null
        }
      />

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Loading your personalized feed...</Text>
        </View>
      )}

      {/* Impact Calculator Modal */}
      <ImpactCalculatorModal
        visible={showImpactModal}
        onClose={() => setShowImpactModal(false)}
        onSave={handleImpactSave}
        initialData={impactData || undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContainer: {
    paddingBottom: 20,
  },
  headerContainer: {
    paddingBottom: 16,
  },
  recommendationHeader: {
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
  },
  jobHighlight: {
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  recommendationSubtext: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 28,
  },
  impactCalculatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  impactCalculatorText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  briefsSection: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  briefsList: {
    paddingHorizontal: 16,
  },
  briefCard: {
    width: screenWidth * 0.8,
    backgroundColor: '#FFFFFF',
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
  briefHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  briefTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  briefTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  briefTimeframe: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  audioButton: {
    padding: 4,
  },
  briefSummary: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 16,
  },
  briefFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eli5Button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  eli5ButtonText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
    marginLeft: 4,
  },
  companyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyButtonText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
    marginRight: 4,
  },
  storyCard: {
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
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storyTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectorTag: {
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectorTagText: {
    fontSize: 10,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  publishDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  scoresContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  storyContent: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 16,
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyLinkText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
    marginLeft: 4,
    marginRight: 4,
  },
  impactTags: {
    flexDirection: 'row',
    gap: 4,
  },
  impactTag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  impactTagText: {
    fontSize: 10,
    color: '#7F8C8D',
    fontWeight: '500',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 12,
  },
});

export default HomeFeedScreen;

