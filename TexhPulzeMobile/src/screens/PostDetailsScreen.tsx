import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import apiService from '../services/api';
import { RootStackParamList } from '../types';

type PostDetailsScreenRouteProp = RouteProp<RootStackParamList, 'PostDetails'>;
type PostDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PostDetails'>;

interface PostDetailsScreenProps {
  navigation: PostDetailsScreenNavigationProp;
}

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  type: 'grievance' | 'ai_news' | 'news';
  ai_risk_score?: number;
  votes_up: number;
  votes_down: number;
  created_at: string;
}

const PostDetailsScreen: React.FC<PostDetailsScreenProps> = ({ navigation }) => {
  const route = useRoute<PostDetailsScreenRouteProp>();
  const { id } = route.params;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voting, setVoting] = useState<{ up: boolean; down: boolean }>({ up: false, down: false });

  const fetchPost = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const postData = await apiService.getPostById(id);
      setPost(postData);
    } catch (error) {
      console.error('Error fetching post:', error);
      Alert.alert('Error', 'Failed to load post details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!post) return;

    setVoting(prev => ({ ...prev, [voteType]: true }));

    // Optimistic update
    const originalVotes = {
      votes_up: post.votes_up,
      votes_down: post.votes_down,
    };

    setPost(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        votes_up: voteType === 'up' ? prev.votes_up + 1 : prev.votes_up,
        votes_down: voteType === 'down' ? prev.votes_down + 1 : prev.votes_down,
      };
    });

    try {
      await apiService.votePost(id, voteType);
      
      Toast.show({
        type: 'success',
        text1: 'Vote Recorded',
        text2: `Your ${voteType}vote has been recorded`,
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error voting:', error);
      
      // Revert optimistic update on failure
      setPost(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          votes_up: originalVotes.votes_up,
          votes_down: originalVotes.votes_down,
        };
      });

      Toast.show({
        type: 'error',
        text1: 'Vote Failed',
        text2: 'Failed to record your vote. Please try again.',
        visibilityTime: 3000,
      });
    } finally {
      setVoting(prev => ({ ...prev, [voteType]: false }));
    }
  };

  const handleRefresh = () => {
    fetchPost(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRiskScoreColor = (score?: number) => {
    if (!score) return '#6C757D';
    if (score >= 8) return '#E74C3C'; // High risk - Red
    if (score >= 5) return '#F39C12'; // Medium risk - Orange
    return '#27AE60'; // Low risk - Green
  };

  const getRiskScoreText = (score?: number) => {
    if (!score) return 'Not assessed';
    if (score >= 8) return 'High Risk';
    if (score >= 5) return 'Medium Risk';
    return 'Low Risk';
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Loading post details...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchPost()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>
            {post.type === 'grievance' ? '🚨 Grievance' : '📰 AI News'}
          </Text>
        </View>
        <Text style={styles.timestamp}>{formatDate(post.created_at)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{post.title}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{post.category}</Text>
          </View>
          
          {post.ai_risk_score && (
            <View style={[styles.riskBadge, { backgroundColor: getRiskScoreColor(post.ai_risk_score) }]}>
              <Text style={styles.riskText}>
                AI Risk: {post.ai_risk_score}/10 ({getRiskScoreText(post.ai_risk_score)})
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.contentText}>{post.content}</Text>
      </View>

      <View style={styles.votingSection}>
        <Text style={styles.votingTitle}>Community Votes</Text>
        
        <View style={styles.votingButtons}>
          <TouchableOpacity
            style={[styles.voteButton, styles.upvoteButton]}
            onPress={() => handleVote('up')}
            disabled={voting.up}
          >
            {voting.up ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={styles.voteButtonIcon}>👍</Text>
                <Text style={styles.voteButtonText}>Upvote</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.voteCounts}>
            <Text style={styles.voteCountUp}>👍 {post.votes_up}</Text>
            <Text style={styles.voteCountDown}>👎 {post.votes_down}</Text>
          </View>

          <TouchableOpacity
            style={[styles.voteButton, styles.downvoteButton]}
            onPress={() => handleVote('down')}
            disabled={voting.down}
          >
            {voting.down ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={styles.voteButtonIcon}>👎</Text>
                <Text style={styles.voteButtonText}>Downvote</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6C757D',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  timestamp: {
    fontSize: 12,
    color: '#6C757D',
  },
  content: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    lineHeight: 32,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryBadge: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  riskText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  contentText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
  },
  votingSection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 20,
  },
  votingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  votingButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  upvoteButton: {
    backgroundColor: '#27AE60',
  },
  downvoteButton: {
    backgroundColor: '#E74C3C',
  },
  voteButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  voteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  voteCounts: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  voteCountUp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
    marginBottom: 5,
  },
  voteCountDown: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
});

export default PostDetailsScreen;
