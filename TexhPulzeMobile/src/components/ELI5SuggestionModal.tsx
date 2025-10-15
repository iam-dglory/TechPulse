import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import Toast from 'react-native-toast-message';

interface ELI5SuggestionModalProps {
  isVisible: boolean;
  onClose: () => void;
  storyId: string;
  mode: 'simple' | 'technical';
  currentText?: string;
}

const ELI5SuggestionModal: React.FC<ELI5SuggestionModalProps> = ({
  isVisible,
  onClose,
  storyId,
  mode,
  currentText = '',
}) => {
  const queryClient = useQueryClient();
  const [suggestedText, setSuggestedText] = useState(currentText);
  const [explanation, setExplanation] = useState('');

  const createSuggestionMutation = useMutation({
    mutationFn: (data: {
      storyId: string;
      mode: 'simple' | 'technical';
      suggestedText: string;
      explanation?: string;
    }) => apiService.createELI5Suggestion(data),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Suggestion Submitted',
        text2: 'Your ELI5 suggestion has been submitted for review',
        visibilityTime: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['eli5-suggestions'] });
      onClose();
      setSuggestedText('');
      setExplanation('');
    },
    onError: (error: any) => {
      console.error('Error creating ELI5 suggestion:', error);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error.response?.data?.message || 'Please try again',
        visibilityTime: 3000,
      });
    },
  });

  const handleSubmit = () => {
    if (!suggestedText.trim()) {
      Alert.alert('Error', 'Please enter your suggested explanation');
      return;
    }

    if (suggestedText.trim().length < 50) {
      Alert.alert('Error', 'Your suggestion should be at least 50 characters long');
      return;
    }

    createSuggestionMutation.mutate({
      storyId,
      mode,
      suggestedText: suggestedText.trim(),
      explanation: explanation.trim() || undefined,
    });
  };

  const getModeDescription = () => {
    if (mode === 'simple') {
      return {
        title: 'Simple Explanation',
        description: 'Explain this story in simple, everyday language that anyone can understand. Avoid technical jargon and use analogies when helpful.',
        placeholder: 'Explain this story in simple terms...',
        tips: [
          'Use everyday language and analogies',
          'Avoid technical jargon',
          'Focus on what this means for regular people',
          'Keep it under 150 words',
          'Make it engaging and relatable'
        ]
      };
    } else {
      return {
        title: 'Technical Explanation',
        description: 'Provide a detailed technical explanation with precise language and relevant technical details.',
        placeholder: 'Provide a technical explanation...',
        tips: [
          'Use precise technical language',
          'Include relevant technical details',
          'Explain underlying mechanisms',
          'Keep it under 200 words',
          'Maintain accuracy and depth'
        ]
      };
    }
  };

  const modeInfo = getModeDescription();

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#7F8C8D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Suggest Better {modeInfo.title}</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{modeInfo.title}</Text>
            <Text style={styles.sectionDescription}>{modeInfo.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Your Suggested Explanation *</Text>
            <TextInput
              style={styles.textInput}
              value={suggestedText}
              onChangeText={setSuggestedText}
              placeholder={modeInfo.placeholder}
              placeholderTextColor="#BDC3C7"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={mode === 'simple' ? 800 : 1000}
            />
            <Text style={styles.characterCount}>
              {suggestedText.length} / {mode === 'simple' ? 800 : 1000} characters
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Explanation (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={explanation}
              onChangeText={setExplanation}
              placeholder="Why is your explanation better? What makes it clearer or more accurate?"
              placeholderTextColor="#BDC3C7"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />
            <Text style={styles.characterCount}>
              {explanation.length} / 300 characters
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips for Great {modeInfo.title}</Text>
            {modeInfo.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4ECDC4" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#4ECDC4" />
              <Text style={styles.infoText}>
                Your suggestion will be reviewed by our editorial team. If approved, 
                it may replace the current explanation for this story.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={createSuggestionMutation.isPending}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!suggestedText.trim() || createSuggestionMutation.isPending) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!suggestedText.trim() || createSuggestionMutation.isPending}
          >
            {createSuggestionMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={16} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Suggestion</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    textAlign: 'center',
    marginRight: 32, // Balance the close button
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F8F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
    marginTop: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F8F5',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  infoText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8F8F5',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ELI5SuggestionModal;

