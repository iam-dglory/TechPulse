import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import apiService from '../services/api';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Posts'>;

interface Post {
  id: number;
  title: string;
  content: string;
  type: 'grievance' | 'ai_news' | 'news';
  category: string;
  votes?: number;
  votes_up?: number;
  votes_down?: number;
  created_at: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  const loadPosts = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const postsData = await apiService.getPosts();
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkServerHealth = async () => {
    try {
      setServerStatus('checking');
      await apiService.checkHealth();
      setServerStatus('connected');
    } catch (error) {
      setServerStatus('error');
    }
  };

  useEffect(() => {
    checkServerHealth();
    loadPosts();
  }, []);

  // Refresh posts when screen comes into focus (e.g., returning from CreatePost)
  useFocusEffect(
    React.useCallback(() => {
      loadPosts();
    }, [])
  );

  const handleRefresh = () => {
    loadPosts(true);
  };

  const renderPost = (post: Post) => (
    <TouchableOpacity 
      key={post.id} 
      style={styles.postCard}
      onPress={() => navigation.navigate('PostDetails', { id: post.id })}
    >
      <View style={styles.postHeader}>
        <View style={[
          styles.typeBadge,
          post.type === 'grievance' ? styles.grievanceBadge : styles.newsBadge
        ]}>
          <Text style={styles.typeText}>
            {post.type === 'grievance' ? '🚨 Grievance' : '📰 AI News'}
          </Text>
        </View>
        <Text style={styles.postTime}>
          {new Date(post.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {post.content}
      </Text>
      
      <View style={styles.postFooter}>
        <Text style={styles.postCategory}>{post.category}</Text>
        <View style={styles.voteContainer}>
          <Text style={styles.voteCount}>👍 {post.votes || post.votes_up || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getServerStatusIcon = () => {
    switch (serverStatus) {
      case 'connected': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getServerStatusText = () => {
    switch (serverStatus) {
      case 'connected': return 'Server Connected';
      case 'error': return 'Server Offline';
      default: return 'Checking Server...';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TexhPulze</Text>
        <Text style={styles.headerSubtitle}>Technology Grievance Platform</Text>
        
        <TouchableOpacity style={styles.serverStatus} onPress={checkServerHealth}>
          <Text style={styles.serverStatusIcon}>{getServerStatusIcon()}</Text>
          <Text style={styles.serverStatusText}>{getServerStatusText()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Grievance')}
        >
          <Text style={styles.actionButtonText}>🚨 Report Grievance</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Community')}
        >
          <Text style={styles.actionButtonText}>💬 Community</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.createPostContainer}>
        <TouchableOpacity 
          style={styles.createPostButton}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.createPostButtonText}>✍️ Create New Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>Latest Posts</Text>
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <Text>Loading posts...</Text>
          </View>
        ) : posts.length > 0 ? (
          posts.map(renderPost)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭 No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share a grievance or AI news!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 15,
  },
  serverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  serverStatusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  serverStatusText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createPostContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  createPostButton: {
    backgroundColor: '#27AE60',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  createPostButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  postsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  grievanceBadge: {
    backgroundColor: '#FDEAEA',
  },
  newsBadge: {
    backgroundColor: '#E8F4FD',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
    color: '#6C757D',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postCategory: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteCount: {
    fontSize: 12,
    color: '#6C757D',
  },
});

export default HomeScreen;
