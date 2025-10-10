import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import apiService from '../services/api';
import { RootStackParamList } from '../types';

type CommunityScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

interface Discussion {
  id: number;
  title: string;
  content: string;
  category: string;
  discussion_type: string;
  upvotes: number;
  downvotes: number;
  views: number;
  comment_count: number;
  is_pinned: boolean;
  is_featured: boolean;
  username: string;
  role: string;
  created_at: string;
  tags: string[];
}

const CommunityScreen = () => {
  const navigation = useNavigation<CommunityScreenNavigationProp>();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'ai_ethics', label: 'AI Ethics' },
    { value: 'privacy_rights', label: 'Privacy Rights' },
    { value: 'digital_rights', label: 'Digital Rights' },
    { value: 'tech_policy', label: 'Tech Policy' },
    { value: 'government_tech', label: 'Government Tech' },
    { value: 'corporate_responsibility', label: 'Corporate Responsibility' },
    { value: 'research_discussion', label: 'Research Discussion' },
    { value: 'policy_analysis', label: 'Policy Analysis' },
    { value: 'community_news', label: 'Community News' },
    { value: 'general_tech', label: 'General Tech' },
  ];

  const loadDiscussions = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {
        page: 1,
        limit: 20,
        sort: sortBy,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await apiService.getDiscussions(params);
      setDiscussions(response.discussions);
    } catch (error) {
      console.error('Error loading discussions:', error);
      Alert.alert('Error', 'Failed to load discussions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, sortBy, searchQuery]);

  useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions]);

  const handleRefresh = () => {
    loadDiscussions(true);
  };

  const renderDiscussion = ({ item }: { item: Discussion }) => (
    <TouchableOpacity
      style={[styles.discussionCard, item.is_pinned && styles.pinnedCard]}
      onPress={() => navigation.navigate('DiscussionDetail', { discussion: item })}
    >
      {item.is_pinned && (
        <View style={styles.pinnedBadge}>
          <Icon name="push-pin" size={16} color="#FFF" />
          <Text style={styles.pinnedText}>PINNED</Text>
        </View>
      )}
      
      <View style={styles.discussionHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: getRoleColor(item.role) }]}>
            <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.role}>{getRoleLabel(item.role)}</Text>
          </View>
        </View>
        <Text style={styles.timeAgo}>{formatTimeAgo(item.created_at)}</Text>
      </View>

      <Text style={styles.discussionTitle}>{item.title}</Text>
      <Text style={styles.discussionContent} numberOfLines={3}>
        {item.content}
      </Text>

      <View style={styles.discussionMeta}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{getCategoryLabel(item.category)}</Text>
        </View>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Icon name="thumb-up" size={16} color="#4ECDC4" />
            <Text style={styles.statText}>{item.upvotes}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="comment" size={16} color="#4ECDC4" />
            <Text style={styles.statText}>{item.comment_count}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="visibility" size={16} color="#4ECDC4" />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
        </View>
      </View>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#E74C3C';
      case 'moderator': return '#F39C12';
      case 'government': return '#3498DB';
      case 'researcher': return '#9B59B6';
      case 'policymaker': return '#27AE60';
      default: return '#95A5A6';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'moderator': return 'Moderator';
      case 'government': return 'Government';
      case 'researcher': return 'Researcher';
      case 'policymaker': return 'Policymaker';
      default: return 'Citizen';
    }
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading discussions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Discussions</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateDiscussion')}
        >
          <Icon name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#6C757D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search discussions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.categoryFilter}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === item.value && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(item.value)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === item.value && styles.categoryChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          {['newest', 'popular', 'trending'].map((sort) => (
            <TouchableOpacity
              key={sort}
              style={[
                styles.sortButton,
                sortBy === sort && styles.sortButtonActive,
              ]}
              onPress={() => setSortBy(sort as any)}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === sort && styles.sortButtonTextActive,
                ]}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={discussions}
        renderItem={renderDiscussion}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.discussionsList}
      />
    </View>
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
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  createButton: {
    backgroundColor: '#4ECDC4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  filterContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  categoryFilter: {
    marginBottom: 15,
  },
  categoryChip: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  categoryChipActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    color: '#6C757D',
    marginRight: 10,
    fontWeight: '500',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#F8F9FA',
  },
  sortButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#FFF',
  },
  discussionsList: {
    padding: 15,
  },
  discussionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  pinnedCard: {
    borderColor: '#4ECDC4',
    borderWidth: 2,
  },
  pinnedBadge: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  pinnedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  role: {
    fontSize: 12,
    color: '#6C757D',
  },
  timeAgo: {
    fontSize: 12,
    color: '#6C757D',
  },
  discussionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 24,
  },
  discussionContent: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
    marginBottom: 15,
  },
  discussionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  statText: {
    fontSize: 12,
    color: '#6C757D',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6C757D',
  },
});

export default CommunityScreen;
