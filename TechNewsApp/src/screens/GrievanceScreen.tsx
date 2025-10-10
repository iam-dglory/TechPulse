import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

interface GrievanceForm {
  title: string;
  description: string;
  category: string;
  is_anonymous: boolean;
  tags: string[];
}

const GrievanceScreen = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<GrievanceForm>({
    title: '',
    description: '',
    category: 'privacy_breach',
    is_anonymous: false,
    tags: [],
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'privacy_breach', label: 'Privacy Breach' },
    { value: 'data_misuse', label: 'Data Misuse' },
    { value: 'algorithm_bias', label: 'Algorithm Bias' },
    { value: 'security_vulnerability', label: 'Security Vulnerability' },
    { value: 'accessibility_issue', label: 'Accessibility Issue' },
    { value: 'environmental_impact', label: 'Environmental Impact' },
    { value: 'social_impact', label: 'Social Impact' },
    { value: 'economic_impact', label: 'Economic Impact' },
    { value: 'government_surveillance', label: 'Government Surveillance' },
    { value: 'corporate_misconduct', label: 'Corporate Misconduct' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.submitGrievance(form);
      Alert.alert(
        'Success',
        'Your grievance has been submitted successfully. Our AI system will analyze it and categorize the risk level.',
        [{ text: 'OK', onPress: () => resetForm() }]
      );
    } catch (error) {
      console.error('Error submitting grievance:', error);
      Alert.alert('Error', 'Failed to submit grievance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      category: 'privacy_breach',
      is_anonymous: false,
      tags: [],
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Icon name="report-problem" size={32} color="#FF6B6B" />
          <Text style={styles.headerTitle}>Report Technology Issue</Text>
          <Text style={styles.headerSubtitle}>
            Help us track and address technology-related problems in our community
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Issue Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Brief description of the issue"
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })}
              maxLength={255}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
                style={styles.picker}
              >
                {categories.map((category) => (
                  <Picker.Item
                    key={category.value}
                    label={category.label}
                    value={category.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Detailed Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Provide detailed information about the issue, including any relevant context, impact, and evidence..."
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setForm({ ...form, is_anonymous: !form.is_anonymous })}
            >
              <Icon
                name={form.is_anonymous ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={form.is_anonymous ? '#4ECDC4' : '#999'}
              />
              <Text style={styles.checkboxLabel}>
                Submit anonymously (your identity will be hidden)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Icon name="info" size={20} color="#4ECDC4" />
            <Text style={styles.infoText}>
              Your report will be analyzed by our AI system to assess risk level and
              categorize appropriately. High-risk issues will be automatically escalated
              to relevant authorities.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Icon name="send" size={20} color="#FFF" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Grievance'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 10,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 20,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    color: '#2C3E50',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 10,
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#E8F4FD',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default GrievanceScreen;
