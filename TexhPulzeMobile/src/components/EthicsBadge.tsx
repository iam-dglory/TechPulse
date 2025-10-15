import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EthicsBadgeProps {
  score: number;
  type: 'ethics' | 'hype' | 'credibility';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const EthicsBadge: React.FC<EthicsBadgeProps> = ({
  score,
  type,
  size = 'medium',
  showLabel = true,
}) => {
  // Ensure score is between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Get color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#27AE60'; // Green - Excellent
    if (score >= 60) return '#F39C12'; // Orange - Good
    if (score >= 40) return '#E67E22'; // Dark Orange - Fair
    if (score >= 20) return '#E74C3C'; // Red - Poor
    return '#C0392B'; // Dark Red - Very Poor
  };

  // Get background color (lighter version)
  const getBackgroundColor = (score: number): string => {
    if (score >= 80) return '#D5F4E6'; // Light Green
    if (score >= 60) return '#FEF5E7'; // Light Orange
    if (score >= 40) return '#FDF2E9'; // Light Dark Orange
    if (score >= 20) return '#FDEDEC'; // Light Red
    return '#FADBD8'; // Light Dark Red
  };

  // Get label text
  const getLabelText = (type: 'ethics' | 'hype' | 'credibility'): string => {
    switch (type) {
      case 'ethics':
        return 'Ethics';
      case 'hype':
        return 'Hype';
      case 'credibility':
        return 'Credibility';
      default:
        return 'Score';
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          scoreText: styles.smallScoreText,
          labelText: styles.smallLabelText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          scoreText: styles.largeScoreText,
          labelText: styles.largeLabelText,
        };
      default:
        return {
          container: styles.mediumContainer,
          scoreText: styles.mediumScoreText,
          labelText: styles.mediumLabelText,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const scoreColor = getScoreColor(normalizedScore);
  const backgroundColor = getBackgroundColor(normalizedScore);

  return (
    <View style={[sizeStyles.container, { backgroundColor }]}>
      <Text style={[sizeStyles.scoreText, { color: scoreColor }]}>
        {Math.round(normalizedScore)}
      </Text>
      {showLabel && (
        <Text style={[sizeStyles.labelText, { color: scoreColor }]}>
          {getLabelText(type)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Small size
  smallContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 40,
  },
  smallScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  smallLabelText: {
    fontSize: 8,
    fontWeight: '500',
    lineHeight: 10,
    marginTop: 1,
  },

  // Medium size
  mediumContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  mediumScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  mediumLabelText: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
    marginTop: 2,
  },

  // Large size
  largeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  largeScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  largeLabelText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 14,
    marginTop: 4,
  },
});

export default EthicsBadge;
