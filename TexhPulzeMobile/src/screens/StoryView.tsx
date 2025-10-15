import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAnalytics, useStoryTracking } from '../hooks/useAnalytics';
import { api } from '../services/api';

interface Story {
  id: string;
  title: string;
  content: string;
  simpleSummary?: string;
  technicalSummary?: string;
  hypeScore: number;
  ethicsScore: number;
  sectorTag: string;
  companyId?: string;
  companyName?: string;
  impactTags: string[];
  realityCheck?: string;
  voteCount: number;
  helpfulVotes: number;
  harmfulVotes: number;
}

interface VoteData {
  voteValue: 'helpful' | 'harmful' | 'neutral';
  comment?: string;
  industry: string;
}

export default function StoryView() {
  const route = useRoute();
  const navigation = useNavigation();
  const { trackAudioPlayed, trackELI5Toggled, trackError } = useAnalytics();
  const { trackVote, trackSave } = useStoryTracking((route.params as any)?.storyId);
  
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [eli5Mode, setEli5Mode] = useState<'simple' | 'technical'>('simple');
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    loadStory();
  }, []);

  const loadStory = async () => {
    try {
      const storyId = (route.params as any)?.storyId;
      if (!storyId) {
        throw new Error('Story ID not provided');
      }

      const response = await api.get(`/stories/${storyId}`);
      setStory(response.data.data.story);
    } catch (error) {
      console.error('Failed to load story:', error);
      trackError(error as Error, 'loadStory');
      Alert.alert('Error', 'Failed to load story');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteValue: 'helpful' | 'harmful' | 'neutral') => {
    if (!story || voting) return;

    setVoting(true);
    try {
      const voteData: VoteData = {
        voteValue,
        industry: 'general', // This would come from user profile
        comment: '',
      };

      await api.post(`/stories/${story.id}/discussions`, voteData);
      
      // Track the vote
      trackVote(voteValue);
      
      Alert.alert('Success', 'Your vote has been recorded');
      loadStory(); // Refresh story data
    } catch (error) {
      console.error('Failed to vote:', error);
      trackError(error as Error, 'vote');
      Alert.alert('Error', 'Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  const handleSave = async () => {
    try {
      // This would be implemented with actual save/unsave API
      const newSavedState = !saved;
      setSaved(newSavedState);
      
      // Track the save action
      trackSave(newSavedState);
      
      Alert.alert(
        newSavedState ? 'Saved' : 'Removed',
        newSavedState ? 'Story saved to your collection' : 'Story removed from your collection'
      );
    } catch (error) {
      console.error('Failed to save story:', error);
      trackError(error as Error, 'save');
    }
  };

  const handleShare = async () => {
    try {
      if (!story) return;

      await Share.share({
        message: `Check out this story: ${story.title}`,
        url: `https://texhpulze.com/stories/${story.id}`,
      });

      // Track share event
      // analytics.trackStoryShared(story.id, 'native_share');
    } catch (error) {
      console.error('Failed to share:', error);
      trackError(error as Error, 'share');
    }
  };

  const handlePlayAudio = async () => {
    try {
      if (!story) return;

      // Track audio play event
      trackAudioPlayed(story.id, 'story_brief');
      
      // This would integrate with actual audio player
      Alert.alert('Audio', 'Audio playback would start here');
    } catch (error) {
      console.error('Failed to play audio:', error);
      trackError(error as Error, 'playAudio');
    }
  };

  const toggleELI5 = () => {
    const newMode = eli5Mode === 'simple' ? 'technical' : 'simple';
    setEli5Mode(newMode);
    
    // Track ELI5 toggle
    trackELI5Toggled(story?.id || '', newMode);
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return '#4CAF50'; // Green
    if (score >= 4) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading story...</Text>
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Story not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Text style={styles.actionButtonText}>
              {saved ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionButtonText}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Story Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{story.title}</Text>
        
        <View style={styles.metaInfo}>
          <Text style={styles.sectorTag}>#{story.sectorTag}</Text>
          {story.companyName && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('CompanyProfile', { companyId: story.companyId })}
            >
              <Text style={styles.companyLink}>@{story.companyName}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Scores */}
        <View style={styles.scoresContainer}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Hype Score</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(story.hypeScore) }]}>
              {story.hypeScore}/10
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Ethics Score</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(story.ethicsScore) }]}>
              {story.ethicsScore}/10
            </Text>
          </View>
        </View>

        {/* ELI5 Toggle */}
        <View style={styles.eli5Container}>
          <Text style={styles.eli5Label}>Explanation Level:</Text>
          <TouchableOpacity style={styles.eli5Toggle} onPress={toggleELI5}>
            <Text style={[
              styles.eli5Option,
              eli5Mode === 'simple' && styles.eli5OptionActive
            ]}>
              Simple
            </Text>
            <Text style={[
              styles.eli5Option,
              eli5Mode === 'technical' && styles.eli5OptionActive
            ]}>
              Technical
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.contentText}>
            {eli5Mode === 'simple' && story.simpleSummary 
              ? story.simpleSummary 
              : eli5Mode === 'technical' && story.technicalSummary
              ? story.technicalSummary
              : story.content
            }
          </Text>
        </View>

        {/* Audio Player */}
        <TouchableOpacity style={styles.audioButton} onPress={handlePlayAudio}>
          <Text style={styles.audioButtonText}>🔊 Play Audio Brief</Text>
        </TouchableOpacity>

        {/* Reality Check */}
        {story.realityCheck && (
          <View style={styles.realityCheckContainer}>
            <Text style={styles.realityCheckTitle}>Reality Check</Text>
            <Text style={styles.realityCheckText}>{story.realityCheck}</Text>
          </View>
        )}

        {/* Impact Tags */}
        <View style={styles.tagsContainer}>
          <Text style={styles.tagsLabel}>Impact Areas:</Text>
          <View style={styles.tagsList}>
            {story.impactTags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Voting */}
        <View style={styles.votingContainer}>
          <Text style={styles.votingTitle}>What's your take?</Text>
          <View style={styles.votingButtons}>
            <TouchableOpacity 
              style={[styles.voteButton, styles.helpfulButton]}
              onPress={() => handleVote('helpful')}
              disabled={voting}
            >
              <Text style={styles.voteButtonText}>👍 Helpful</Text>
              <Text style={styles.voteCount}>{story.helpfulVotes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.voteButton, styles.neutralButton]}
              onPress={() => handleVote('neutral')}
              disabled={voting}
            >
              <Text style={styles.voteButtonText}>🤷 Neutral</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.voteButton, styles.harmfulButton]}
              onPress={() => handleVote('harmful')}
              disabled={voting}
            >
              <Text style={styles.voteButtonText}>👎 Harmful</Text>
              <Text style={styles.voteCount}>{story.harmfulVotes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#F44336',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 16,
    color: '#2196F3',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
    padding: 8,
  },
  actionButtonText: {
    fontSize: 20,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    lineHeight: 32,
  },
  metaInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sectorTag: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  companyLink: {
    fontSize: 14,
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  scoresContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eli5Container: {
    marginBottom: 20,
  },
  eli5Label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  eli5Toggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 2,
  },
  eli5Option: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    fontSize: 14,
    color: '#666',
  },
  eli5OptionActive: {
    backgroundColor: '#2196F3',
    color: '#FFFFFF',
  },
  contentSection: {
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  audioButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  audioButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  realityCheckContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  realityCheckTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  realityCheckText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
  },
  votingContainer: {
    marginBottom: 20,
  },
  votingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  votingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  voteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  helpfulButton: {
    backgroundColor: '#E8F5E8',
  },
  neutralButton: {
    backgroundColor: '#F5F5F5',
  },
  harmfulButton: {
    backgroundColor: '#FFEBEE',
  },
  voteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  voteCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});