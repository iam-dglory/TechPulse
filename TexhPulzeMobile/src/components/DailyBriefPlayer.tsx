import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Speech from 'expo-speech';
import apiService from '../services/api';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

interface BriefStory {
  id: string;
  title: string;
  simpleSummary: string;
  technicalSummary?: string;
  sectorTag: string;
  hypeScore: number;
  ethicsScore: number;
  publishedAt: string;
  company?: {
    id: string;
    name: string;
    slug: string;
  };
  estimatedReadTime: number;
  priority: 'high' | 'medium' | 'low';
}

interface DailyBrief {
  briefId: string;
  generatedAt: string;
  duration: number;
  estimatedTotalTime: number;
  mode: string;
  stories: BriefStory[];
  introText: string;
  outroText: string;
  personalizedInsights?: {
    userIndustry?: string;
    relevantStories: number;
    topSectors: string[];
    riskAlerts: number;
  };
}

interface DailyBriefPlayerProps {
  duration: 5 | 10 | 15;
  mode: 'personalized' | 'trending' | 'balanced';
  onClose?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const DailyBriefPlayer: React.FC<DailyBriefPlayerProps> = ({
  duration,
  mode,
  onClose,
}) => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentSegment, setCurrentSegment] = useState<'intro' | 'story' | 'outro'>('intro');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const speechRef = useRef<Speech.SpeechUtterance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch daily brief
  const {
    data: briefData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['daily-brief', duration, mode, user?.id],
    queryFn: () => apiService.getDailyBrief({
      userId: user?.id,
      duration: duration.toString() as '5' | '10' | '15',
      mode,
    }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: !isGenerating,
  });

  const brief: DailyBrief | undefined = briefData?.data;

  // Speech configuration
  useEffect(() => {
    Speech.setDefaultRate(playbackSpeed);
  }, [playbackSpeed]);

  // Progress tracking
  useEffect(() => {
    if (isPlaying && !isPaused) {
      progressIntervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, isPaused]);

  // Speech event handlers
  useEffect(() => {
    const onSpeechStart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    const onSpeechEnd = () => {
      setIsPlaying(false);
      setIsPaused(false);
      handleNextSegment();
    };

    const onSpeechError = (error: any) => {
      console.error('Speech error:', error);
      setIsPlaying(false);
      setIsPaused(false);
      Toast.show({
        type: 'error',
        text1: 'Speech Error',
        text2: 'Failed to play audio. Please try again.',
        visibilityTime: 3000,
      });
    };

    // Note: expo-speech doesn't have event listeners like web Speech API
    // We'll handle this with manual state management
  }, []);

  const generateBrief = async () => {
    setIsGenerating(true);
    try {
      await refetch();
      Toast.show({
        type: 'success',
        text1: 'Brief Generated',
        text2: `Your ${duration}-minute ${mode} brief is ready!`,
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error generating brief:', error);
      Toast.show({
        type: 'error',
        text1: 'Generation Failed',
        text2: 'Failed to generate daily brief. Please try again.',
        visibilityTime: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = async () => {
    if (!brief) {
      Toast.show({
        type: 'error',
        text1: 'No Brief Available',
        text2: 'Please generate a brief first.',
        visibilityTime: 2000,
      });
      return;
    }

    if (isPlaying) {
      if (isPaused) {
        // Resume
        Speech.resume();
        setIsPaused(false);
      } else {
        // Pause
        Speech.pause();
        setIsPaused(true);
      }
    } else {
      // Start playing
      await startBrief();
    }
  };

  const startBrief = async () => {
    if (!brief) return;

    setCurrentStoryIndex(0);
    setCurrentSegment('intro');
    setElapsedTime(0);

    // Start with intro
    const text = brief.introText;
    await speakText(text);
  };

  const handleNextSegment = async () => {
    if (!brief) return;

    if (currentSegment === 'intro') {
      if (brief.stories.length > 0) {
        setCurrentSegment('story');
        setCurrentStoryIndex(0);
        await speakCurrentStory();
      } else {
        setCurrentSegment('outro');
        await speakText(brief.outroText);
      }
    } else if (currentSegment === 'story') {
      const nextIndex = currentStoryIndex + 1;
      if (nextIndex < brief.stories.length) {
        setCurrentStoryIndex(nextIndex);
        await speakCurrentStory();
      } else {
        setCurrentSegment('outro');
        await speakText(brief.outroText);
      }
    } else {
      // Finished
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSegment('intro');
      setCurrentStoryIndex(0);
      setElapsedTime(0);
    }
  };

  const speakCurrentStory = async () => {
    if (!brief || currentStoryIndex >= brief.stories.length) return;

    const story = brief.stories[currentStoryIndex];
    const companyText = story.company ? ` from ${story.company.name}` : '';
    const text = `${story.title}${companyText}. ${story.simpleSummary}`;

    await speakText(text);
  };

  const speakText = async (text: string) => {
    try {
      await Speech.speak(text, {
        rate: playbackSpeed,
        pitch: 1.0,
        volume: 1.0,
        language: 'en-US',
      });
    } catch (error) {
      console.error('Speech error:', error);
      Toast.show({
        type: 'error',
        text1: 'Speech Error',
        text2: 'Failed to speak text. Please try again.',
        visibilityTime: 3000,
      });
    }
  };

  const handleStop = () => {
    Speech.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegment('intro');
    setCurrentStoryIndex(0);
    setElapsedTime(0);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    Speech.setDefaultRate(speed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!brief) return 0;
    return Math.min(100, (elapsedTime / brief.estimatedTotalTime) * 100);
  };

  const getCurrentStoryTitle = () => {
    if (!brief || currentSegment !== 'story' || currentStoryIndex >= brief.stories.length) {
      return null;
    }
    return brief.stories[currentStoryIndex].title;
  };

  if (isLoading || isGenerating) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily Brief</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#7F8C8D" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>
            {isGenerating ? 'Generating your brief...' : 'Loading brief...'}
          </Text>
        </View>
      </View>
    );
  }

  if (isError || !brief) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily Brief</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#7F8C8D" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#E74C3C" />
          <Text style={styles.errorTitle}>Failed to Load Brief</Text>
          <Text style={styles.errorText}>
            {error?.message || 'Something went wrong while loading your daily brief.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={generateBrief}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Daily Brief</Text>
          <Text style={styles.headerSubtitle}>
            {duration} min • {mode} • {brief.stories.length} stories
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#7F8C8D" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {formatTime(elapsedTime)} / {formatTime(brief.estimatedTotalTime)}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(getProgressPercentage())}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
          </View>
        </View>

        {/* Current Segment */}
        <View style={styles.currentSegment}>
          <Text style={styles.currentSegmentLabel}>
            {currentSegment === 'intro' ? 'Introduction' : 
             currentSegment === 'story' ? 'Current Story' : 'Conclusion'}
          </Text>
          {currentSegment === 'story' && getCurrentStoryTitle() && (
            <Text style={styles.currentStoryTitle}>
              {getCurrentStoryTitle()}
            </Text>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controlsSection}>
          <View style={styles.mainControls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStop}
              disabled={!isPlaying && !isPaused}
            >
              <Ionicons name="stop" size={24} color="#E74C3C" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={handlePlayPause}
            >
              <Ionicons 
                name={isPlaying ? (isPaused ? 'play' : 'pause') : 'play'} 
                size={32} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.skipButton]}
              onPress={handleNextSegment}
              disabled={!isPlaying && !isPaused}
            >
              <Ionicons name="play-skip-forward" size={24} color="#4ECDC4" />
            </TouchableOpacity>
          </View>

          <View style={styles.speedControls}>
            <Text style={styles.speedLabel}>Speed:</Text>
            {[0.75, 1.0, 1.25, 1.5].map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedButton,
                  playbackSpeed === speed && styles.speedButtonActive
                ]}
                onPress={() => handleSpeedChange(speed)}
              >
                <Text style={[
                  styles.speedButtonText,
                  playbackSpeed === speed && styles.speedButtonTextActive
                ]}>
                  {speed}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Brief Info */}
        <View style={styles.briefInfo}>
          <Text style={styles.briefInfoTitle}>Brief Details</Text>
          <Text style={styles.briefInfoText}>
            Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Text>
          <Text style={styles.briefInfoText}>
            Duration: {duration} minutes
          </Text>
          <Text style={styles.briefInfoText}>
            Stories: {brief.stories.length}
          </Text>
          <Text style={styles.briefInfoText}>
            Estimated Time: {formatTime(brief.estimatedTotalTime)}
          </Text>
          
          {brief.personalizedInsights && (
            <View style={styles.insightsSection}>
              <Text style={styles.insightsTitle}>Your Insights</Text>
              <Text style={styles.insightsText}>
                {brief.personalizedInsights.relevantStories} stories relevant to your industry
              </Text>
              <Text style={styles.insightsText}>
                Top sectors: {brief.personalizedInsights.topSectors.join(', ')}
              </Text>
              {brief.personalizedInsights.riskAlerts > 0 && (
                <Text style={styles.riskAlertText}>
                  ⚠️ {brief.personalizedInsights.riskAlerts} stories with ethical concerns
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Stories List */}
        <View style={styles.storiesSection}>
          <Text style={styles.storiesTitle}>Stories in This Brief</Text>
          {brief.stories.map((story, index) => (
            <View 
              key={story.id} 
              style={[
                styles.storyItem,
                index === currentStoryIndex && currentSegment === 'story' && styles.currentStoryItem
              ]}
            >
              <View style={styles.storyHeader}>
                <Text style={styles.storyTitle}>{story.title}</Text>
                <View style={styles.storyMeta}>
                  <Text style={styles.storyTag}>{story.sectorTag}</Text>
                  <Text style={styles.storyTime}>{formatTime(story.estimatedReadTime)}</Text>
                </View>
              </View>
              {story.company && (
                <Text style={styles.storyCompany}>from {story.company.name}</Text>
              )}
            </View>
          ))}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E8F8F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  currentSegment: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  currentSegmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 4,
  },
  currentStoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  controlsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#4ECDC4',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  stopButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E74C3C',
  },
  skipButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  speedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  speedLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginRight: 8,
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  speedButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  speedButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  speedButtonTextActive: {
    color: '#FFFFFF',
  },
  briefInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  briefInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  briefInfoText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  insightsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F8F5',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  insightsText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  riskAlertText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
    marginTop: 4,
  },
  storiesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  storiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  storyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  currentStoryItem: {
    backgroundColor: '#E8F8F5',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  storyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
    marginRight: 8,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storyTag: {
    fontSize: 10,
    color: '#4ECDC4',
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  storyTime: {
    fontSize: 10,
    color: '#7F8C8D',
  },
  storyCompany: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
});

export default DailyBriefPlayer;
