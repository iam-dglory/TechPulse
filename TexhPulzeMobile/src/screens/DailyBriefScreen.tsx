import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import DailyBriefPlayer from '../components/DailyBriefPlayer';
import Toast from 'react-native-toast-message';

interface BriefStats {
  totalStories: number;
  storiesWithSummaries: number;
  coveragePercentage: number;
  averageHypeScore: number;
  availableDurations: number[];
  availableModes: string[];
}

const DailyBriefScreen: React.FC = () => {
  const { user } = useAuth();
  const [selectedDuration, setSelectedDuration] = useState<5 | 10 | 15>(10);
  const [selectedMode, setSelectedMode] = useState<'personalized' | 'trending' | 'balanced'>('balanced');
  const [showPlayer, setShowPlayer] = useState(false);

  // Fetch brief statistics
  const {
    data: statsData,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ['brief-stats'],
    queryFn: () => apiService.getBriefStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const stats: BriefStats | undefined = statsData?.data;

  const handleStartBrief = () => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Required',
        text2: 'Please log in to generate personalized briefs.',
        visibilityTime: 3000,
      });
      return;
    }
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'personalized':
        return 'Stories tailored to your industry and interests';
      case 'trending':
        return 'Most talked-about stories in tech right now';
      case 'balanced':
        return 'Mix of important and trending stories';
      default:
        return '';
    }
  };

  const getDurationDescription = (duration: number) => {
    switch (duration) {
      case 5:
        return 'Quick overview • ~3-4 stories';
      case 10:
        return 'Standard brief • ~6-8 stories';
      case 15:
        return 'Deep dive • ~10-12 stories';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Brief</Text>
        <Text style={styles.headerSubtitle}>Your personalized tech news audio brief</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <Text style={styles.sectionDescription}>
            Choose how much time you have for your daily brief
          </Text>
          <View style={styles.optionsContainer}>
            {[5, 10, 15].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.optionButton,
                  selectedDuration === duration && styles.optionButtonActive
                ]}
                onPress={() => setSelectedDuration(duration as 5 | 10 | 15)}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedDuration === duration && styles.optionButtonTextActive
                ]}>
                  {duration} min
                </Text>
                <Text style={[
                  styles.optionButtonSubtext,
                  selectedDuration === duration && styles.optionButtonSubtextActive
                ]}>
                  {getDurationDescription(duration)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mode Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brief Mode</Text>
          <Text style={styles.sectionDescription}>
            How would you like your stories curated?
          </Text>
          <View style={styles.optionsContainer}>
            {[
              { key: 'personalized', label: 'Personalized', icon: 'person' },
              { key: 'trending', label: 'Trending', icon: 'flame' },
              { key: 'balanced', label: 'Balanced', icon: 'balance' }
            ].map((mode) => (
              <TouchableOpacity
                key={mode.key}
                style={[
                  styles.optionButton,
                  styles.modeOptionButton,
                  selectedMode === mode.key && styles.optionButtonActive
                ]}
                onPress={() => setSelectedMode(mode.key as any)}
              >
                <Ionicons
                  name={mode.icon as any}
                  size={24}
                  color={selectedMode === mode.key ? '#FFFFFF' : '#4ECDC4'}
                  style={styles.modeIcon}
                />
                <View style={styles.modeContent}>
                  <Text style={[
                    styles.optionButtonText,
                    selectedMode === mode.key && styles.optionButtonTextActive
                  ]}>
                    {mode.label}
                  </Text>
                  <Text style={[
                    styles.optionButtonSubtext,
                    selectedMode === mode.key && styles.optionButtonSubtextActive
                  ]}>
                    {getModeDescription(mode.key)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* User Info */}
        {user && (
          <View style={styles.userSection}>
            <View style={styles.userInfo}>
              <Ionicons name="person-circle" size={48} color="#4ECDC4" />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.username}</Text>
                <Text style={styles.userIndustry}>
                  {user.industry || 'No industry specified'}
                </Text>
              </View>
            </View>
            <Text style={styles.userNote}>
              Your briefs will be personalized based on your profile and industry.
            </Text>
          </View>
        )}

        {/* Statistics */}
        {stats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Today's Coverage</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalStories}</Text>
                <Text style={styles.statLabel}>Total Stories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.coveragePercentage}%</Text>
                <Text style={styles.statLabel}>With Summaries</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.averageHypeScore.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Avg Hype Score</Text>
              </View>
            </View>
          </View>
        )}

        {/* Start Button */}
        <View style={styles.startSection}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartBrief}
          >
            <Ionicons name="play-circle" size={32} color="#FFFFFF" />
            <Text style={styles.startButtonText}>
              Start {selectedDuration}-Minute {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Brief
            </Text>
          </TouchableOpacity>
          <Text style={styles.startNote}>
            Your brief will include the most relevant stories with audio explanations
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="headset" size={20} color="#4ECDC4" />
              <Text style={styles.featureText}>High-quality text-to-speech audio</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="speedometer" size={20} color="#4ECDC4" />
              <Text style={styles.featureText}>Adjustable playback speed</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="person" size={20} color="#4ECDC4" />
              <Text style={styles.featureText}>Personalized content selection</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="time" size={20} color="#4ECDC4" />
              <Text style={styles.featureText}>Flexible duration options</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Player Modal */}
      <Modal
        visible={showPlayer}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleClosePlayer}
      >
        <DailyBriefPlayer
          duration={selectedDuration}
          mode={selectedMode}
          onClose={handleClosePlayer}
        />
      </Modal>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E8F8F5',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  modeOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modeIcon: {
    marginRight: 16,
  },
  modeContent: {
    flex: 1,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },
  optionButtonSubtext: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  optionButtonSubtextActive: {
    color: '#E8F8F5',
  },
  userSection: {
    backgroundColor: '#E8F8F5',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  userIndustry: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  userNote: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  startSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E8F8F5',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  startNote: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
});

export default DailyBriefScreen;
