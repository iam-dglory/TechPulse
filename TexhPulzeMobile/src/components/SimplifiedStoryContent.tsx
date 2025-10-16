import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SimplifiedStoryContentProps {
  story: {
    id: string;
    title: string;
    content: string;
    simpleSummary?: string;
    technicalSummary?: string;
    realityCheck?: string;
  };
}

export const SimplifiedStoryContent: React.FC<SimplifiedStoryContentProps> = ({ story }) => {
  const [showTechnical, setShowTechnical] = useState(false);

  // Use AI-generated simple summary if available, otherwise use original content
  const displayContent = story.simpleSummary || story.content;

  return (
    <View style={styles.container}>
      {/* Story Title */}
      <Text style={styles.title}>{story.title}</Text>

      {/* Content Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !showTechnical && styles.activeToggle]}
          onPress={() => setShowTechnical(false)}
        >
          <Text style={[styles.toggleText, !showTechnical && styles.activeToggleText]}>
            Simple
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, showTechnical && styles.activeToggle]}
          onPress={() => setShowTechnical(true)}
        >
          <Text style={[styles.toggleText, showTechnical && styles.activeToggleText]}>
            Technical
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.content}>
          {showTechnical ? (story.technicalSummary || story.content) : displayContent}
        </Text>
      </View>

      {/* Reality Check */}
      {story.realityCheck && (
        <View style={styles.realityCheckContainer}>
          <View style={styles.realityCheckHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.realityCheckTitle}>Reality Check</Text>
          </View>
          <Text style={styles.realityCheckText}>{story.realityCheck}</Text>
        </View>
      )}

      {/* AI Attribution */}
      {(story.simpleSummary || story.technicalSummary) && (
        <View style={styles.attributionContainer}>
          <Ionicons name="sparkles" size={16} color="#6B7280" />
          <Text style={styles.attributionText}>
            AI-enhanced for clarity
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 28,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeToggleText: {
    color: '#1F2937',
  },
  contentContainer: {
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  realityCheckContainer: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  realityCheckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  realityCheckTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 8,
  },
  realityCheckText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  attributionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  attributionText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontStyle: 'italic',
  },
});

export default SimplifiedStoryContent;
