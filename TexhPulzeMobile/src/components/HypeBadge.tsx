import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HypeBadgeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const HypeBadge: React.FC<HypeBadgeProps> = ({ 
  score, 
  size = 'medium', 
  showTooltip = true 
}) => {
  const [showTooltipModal, setShowTooltipModal] = useState(false);

  const getScoreColor = (s: number) => {
    if (s >= 8) return '#E74C3C'; // Red - Very High Hype
    if (s >= 6) return '#F39C12'; // Orange - High Hype
    if (s >= 4) return '#F1C40F'; // Yellow - Medium Hype
    if (s >= 2) return '#2ECC71'; // Green - Low Hype
    return '#95A5A6'; // Gray - Very Low Hype
  };

  const getScoreLabel = (s: number) => {
    if (s >= 8) return 'Very High Hype';
    if (s >= 6) return 'High Hype';
    if (s >= 4) return 'Medium Hype';
    if (s >= 2) return 'Low Hype';
    return 'Very Low Hype';
  };

  const getScoreDescription = (s: number) => {
    if (s >= 8) return 'Extreme marketing language, many superlatives, claims of "revolutionary" or "unprecedented" changes';
    if (s >= 6) return 'High marketing language, multiple superlatives, strong claims about impact or innovation';
    if (s >= 4) return 'Moderate marketing language, some superlatives, balanced claims about benefits';
    if (s >= 2) return 'Low marketing language, few superlatives, modest claims about improvements';
    return 'Minimal marketing language, factual presentation, realistic claims';
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return {
          container: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
          scoreText: { fontSize: 12 },
          labelText: { fontSize: 8 },
          iconSize: 12,
        };
      case 'large':
        return {
          container: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
          scoreText: { fontSize: 20 },
          labelText: { fontSize: 12 },
          iconSize: 16,
        };
      default: // medium
        return {
          container: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
          scoreText: { fontSize: 16 },
          labelText: { fontSize: 10 },
          iconSize: 14,
        };
    }
  };

  const badgeSize = getBadgeSize();
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const scoreDescription = getScoreDescription(score);

  const renderTooltipModal = () => (
    <Modal
      visible={showTooltipModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowTooltipModal(false)}
    >
      <TouchableOpacity
        style={styles.tooltipOverlay}
        activeOpacity={1}
        onPress={() => setShowTooltipModal(false)}
      >
        <View style={styles.tooltipContainer}>
          <View style={styles.tooltipHeader}>
            <Ionicons name="flame" size={24} color={scoreColor} />
            <Text style={styles.tooltipTitle}>Hype Score: {score}/10</Text>
            <TouchableOpacity
              onPress={() => setShowTooltipModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color="#7F8C8D" />
            </TouchableOpacity>
          </View>

          <View style={styles.tooltipContent}>
            <View style={styles.scoreIndicator}>
              <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
              <View style={styles.scoreBar}>
                <View 
                  style={[
                    styles.scoreFill, 
                    { 
                      width: `${(score / 10) * 100}%`, 
                      backgroundColor: scoreColor 
                    }
                  ]} 
                />
              </View>
            </View>

            <Text style={styles.description}>{scoreDescription}</Text>

            <View style={styles.factorsContainer}>
              <Text style={styles.factorsTitle}>How we calculate hype:</Text>
              <View style={styles.factorItem}>
                <Ionicons name="megaphone" size={16} color="#F39C12" />
                <Text style={styles.factorText}>Marketing language density</Text>
              </View>
              <View style={styles.factorItem}>
                <Ionicons name="star" size={16} color="#F39C12" />
                <Text style={styles.factorText}>Number of superlatives</Text>
              </View>
              <View style={styles.factorItem}>
                <Ionicons name="flash" size={16} color="#F39C12" />
                <Text style={styles.factorText}>Claims like "revolutionary" or "unprecedented"</Text>
              </View>
              <View style={styles.factorItem}>
                <Ionicons name="pulse" size={16} color="#F39C12" />
                <Text style={styles.factorText}>Exclamation marks and excitement indicators</Text>
              </View>
              <View style={styles.factorItem}>
                <Ionicons name="analytics" size={16} color="#F39C12" />
                <Text style={styles.factorText}>Ratio of marketing words to technical details</Text>
              </View>
            </View>

            <View style={styles.interpretationContainer}>
              <Text style={styles.interpretationTitle}>What this means:</Text>
              {score >= 7 ? (
                <Text style={styles.interpretationText}>
                  ⚠️ High hype scores suggest the story may contain exaggerated claims. 
                  Look for the Reality Check section for a more balanced perspective.
                </Text>
              ) : score >= 4 ? (
                <Text style={styles.interpretationText}>
                  ⚖️ Moderate hype suggests a mix of marketing language and factual content. 
                  The Reality Check can help separate claims from facts.
                </Text>
              ) : (
                <Text style={styles.interpretationText}>
                  ✅ Low hype suggests more factual, measured reporting with 
                  realistic claims about the technology or company.
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <>
      <TouchableOpacity
        style={[
          styles.badgeContainer,
          badgeSize.container,
          { backgroundColor: scoreColor + '20', borderColor: scoreColor }
        ]}
        onPress={() => showTooltip && setShowTooltipModal(true)}
        activeOpacity={showTooltip ? 0.7 : 1}
      >
        <View style={styles.badgeContent}>
          <Ionicons 
            name="flame" 
            size={badgeSize.iconSize} 
            color={scoreColor} 
            style={styles.badgeIcon}
          />
          <Text style={[styles.scoreText, badgeSize.scoreText, { color: scoreColor }]}>
            {score}
          </Text>
        </View>
        <Text style={[styles.labelText, badgeSize.labelText, { color: scoreColor }]}>
          Hype
        </Text>
        {showTooltip && (
          <Ionicons 
            name="information-circle" 
            size={badgeSize.iconSize} 
            color={scoreColor} 
            style={styles.infoIcon}
          />
        )}
      </TouchableOpacity>

      {renderTooltipModal()}
    </>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    marginRight: 4,
  },
  scoreText: {
    fontWeight: 'bold',
  },
  labelText: {
    fontWeight: '600',
    marginTop: 2,
  },
  infoIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tooltipContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxWidth: screenWidth * 0.9,
    maxHeight: screenWidth * 1.2,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
    paddingBottom: 12,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 12,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  tooltipContent: {
    flex: 1,
  },
  scoreIndicator: {
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#E8F8F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreFill: {
    height: 8,
    borderRadius: 4,
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  factorsContainer: {
    marginBottom: 16,
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  factorText: {
    fontSize: 13,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  interpretationContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  interpretationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  interpretationText: {
    fontSize: 13,
    color: '#7F8C8D',
    lineHeight: 18,
  },
});

export default HypeBadge;
