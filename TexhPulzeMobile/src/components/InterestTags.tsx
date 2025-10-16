import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface InterestTagsProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const AVAILABLE_TAGS = [
  { id: 'ai', label: 'AI & Machine Learning', icon: '🤖' },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: '🔒' },
  { id: 'climate-tech', label: 'Climate Tech', icon: '🌱' },
  { id: 'fintech', label: 'Fintech', icon: '💳' },
  { id: 'healthtech', label: 'Health Tech', icon: '🏥' },
  { id: 'edtech', label: 'Ed Tech', icon: '📚' },
  { id: 'blockchain', label: 'Blockchain', icon: '⛓️' },
  { id: 'robotics', label: 'Robotics', icon: '🤖' },
  { id: 'biotech', label: 'Biotech', icon: '🧬' },
  { id: 'space-tech', label: 'Space Tech', icon: '🚀' },
  { id: 'privacy', label: 'Privacy', icon: '🕵️' },
  { id: 'sustainability', label: 'Sustainability', icon: '♻️' },
];

export const InterestTags: React.FC<InterestTagsProps> = ({ selectedTags, onTagsChange }) => {
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(tag => tag !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What interests you?</Text>
      <Text style={styles.subtitle}>
        Choose topics to personalize your feed
      </Text>
      
      <ScrollView style={styles.tagsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.tagsGrid}>
          {AVAILABLE_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tag,
                  isSelected && styles.selectedTag
                ]}
                onPress={() => toggleTag(tag.id)}
              >
                <Text style={styles.tagIcon}>{tag.icon}</Text>
                <Text style={[
                  styles.tagText,
                  isSelected && styles.selectedTagText
                ]}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {selectedTags.length} topic{selectedTags.length !== 1 ? 's' : ''} selected
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  tagsContainer: {
    flex: 1,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    minWidth: '45%',
  },
  selectedTag: {
    backgroundColor: '#ECFDF5',
    borderColor: '#4ECDC4',
  },
  tagIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  selectedTagText: {
    color: '#065F46',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default InterestTags;
