import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShareableScorecardProps {
  story: {
    id: string;
    title: string;
    company?: {
      name: string;
    };
    hypeScore: number;
    ethicsScore: number;
    communityVerdict: number;
    realityCheck?: string;
    publishedAt: string;
  };
  onShare?: () => void;
}

export const ShareableScorecard: React.FC<ShareableScorecardProps> = ({ story, onShare }) => {
  const getVerdictText = (score: number) => {
    if (score >= 8) return 'Highly Accurate';
    if (score >= 6) return 'Mostly Accurate';
    if (score >= 4) return 'Overhyped';
    return 'Misleading';
  };

  const getVerdictColor = (score: number) => {
    if (score >= 8) return '#10B981'; // Green
    if (score >= 6) return '#F59E0B'; // Yellow
    if (score >= 4) return '#EF4444'; // Red
    return '#DC2626'; // Dark red
  };

  const generateShareText = () => {
    const verdict = getVerdictText(story.communityVerdict);
    const companyText = story.company ? ` by ${story.company.name}` : '';
    
    return `🎯 TexhPulze Prediction Scorecard:

"${story.title}"${companyText}

📊 Community Verdict: ${story.communityVerdict}/10 (${verdict})
🚨 Hype Score: ${story.hypeScore}/10
⚖️ Ethics Score: ${story.ethicsScore}/10

Follow the reality check at texhpulze.com

#TechAccountability #TexhPulze`;
  };

  const handleShare = async () => {
    try {
      const shareText = generateShareText();
      
      const result = await Share.share({
        message: shareText,
        title: 'TexhPulze Prediction Scorecard',
      });

      if (result.action === Share.sharedAction) {
        onShare?.();
        // Track share event
        console.log('Shared TexhPulze scorecard:', story.id);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share scorecard');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎯 TexhPulze Prediction Scorecard</Text>
        <Text style={styles.timestamp}>{formatDate(story.publishedAt)}</Text>
      </View>

      {/* Original Claim */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Original Claim:</Text>
        <Text style={styles.claimText}>"{story.title}"</Text>
        {story.company && (
          <Text style={styles.companyText}>by {story.company.name}</Text>
        )}
      </View>

      {/* Scores */}
      <View style={styles.scoresContainer}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Community Verdict</Text>
          <View style={[styles.scoreBadge, { backgroundColor: getVerdictColor(story.communityVerdict) }]}>
            <Text style={styles.scoreValue}>{story.communityVerdict}/10</Text>
          </View>
          <Text style={styles.scoreText}>{getVerdictText(story.communityVerdict)}</Text>
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Hype Score</Text>
            <Text style={styles.scoreNumber}>{story.hypeScore}/10</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Ethics Score</Text>
            <Text style={styles.scoreNumber}>{story.ethicsScore}/10</Text>
          </View>
        </View>
      </View>

      {/* Reality Check Preview */}
      {story.realityCheck && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reality Check:</Text>
          <Text style={styles.realityText} numberOfLines={3}>
            {story.realityCheck}
          </Text>
        </View>
      )}

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-social" size={20} color="#FFFFFF" />
        <Text style={styles.shareButtonText}>Share on Twitter/LinkedIn</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Follow the full story at texhpulze.com</Text>
        <Text style={styles.hashtag}>#TechAccountability #TexhPulze</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  claimText: {
    fontSize: 16,
    color: '#1F2937',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  companyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  scoresContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  scoreItem: {
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  scoreText: {
    fontSize: 12,
    color: '#6B7280',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  realityText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  shareButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  hashtag: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
});

export default ShareableScorecard;
