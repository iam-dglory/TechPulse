import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../services/api';
import Toast from 'react-native-toast-message';

interface CompanyClaimFormProps {
  companyId?: string;
  companyName?: string;
  onSuccess?: (claimData: any) => void;
  onCancel?: () => void;
}

interface ClaimData {
  companyName: string;
  officialEmail: string;
  websiteUrl: string;
  contactPerson: string;
  phoneNumber?: string;
  proofDocuments: string[];
  verificationMethod: 'website' | 'email' | 'documents';
  additionalInfo?: string;
}

const CompanyClaimForm: React.FC<CompanyClaimFormProps> = ({
  companyId,
  companyName,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ClaimData>({
    companyName: companyName || '',
    officialEmail: '',
    websiteUrl: '',
    contactPerson: '',
    phoneNumber: '',
    proofDocuments: [],
    verificationMethod: 'website',
    additionalInfo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.officialEmail.trim()) {
      newErrors.officialEmail = 'Official email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.officialEmail)) {
      newErrors.officialEmail = 'Please enter a valid email address';
    }

    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'Website URL is required';
    } else if (!isValidUrl(formData.websiteUrl)) {
      newErrors.websiteUrl = 'Please enter a valid URL';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person name is required';
    }

    if (formData.verificationMethod === 'documents' && formData.proofDocuments.length === 0) {
      newErrors.proofDocuments = 'At least one proof document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof ClaimData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const document = result.assets[0];
        setFormData(prev => ({
          ...prev,
          proofDocuments: [...prev.proofDocuments, document.uri],
        }));
        
        Toast.show({
          type: 'success',
          text1: 'Document Added',
          text2: `${document.name} has been added`,
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick document',
        visibilityTime: 2000,
      });
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      proofDocuments: prev.proofDocuments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare claim data
      const claimData = {
        companyId,
        companyName: formData.companyName,
        officialEmail: formData.officialEmail,
        websiteUrl: formData.websiteUrl,
        contactPerson: formData.contactPerson,
        phoneNumber: formData.phoneNumber || undefined,
        proofDocuments: formData.proofDocuments,
        verificationMethod: formData.verificationMethod,
        additionalInfo: formData.additionalInfo || undefined,
      };

      // Submit claim
      const response = await apiService.claimCompany(claimData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Claim Submitted',
          text2: 'Your company claim has been submitted for review',
          visibilityTime: 3000,
        });

        onSuccess?.(response.data);
      } else {
        throw new Error(response.message || 'Failed to submit claim');
      }
    } catch (error: any) {
      console.error('Error submitting claim:', error);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error.message || 'Please try again',
        visibilityTime: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openVerificationGuide = () => {
    Alert.alert(
      'Verification Methods',
      'Choose how you want to verify your company ownership:\n\n' +
      '🌐 Website: We\'ll check for company information on your website\n' +
      '📧 Email: We\'ll send a verification email to your official company email\n' +
      '📄 Documents: Upload official documents proving company ownership',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Claim Company Ownership</Text>
        <Text style={styles.subtitle}>
          Verify your ownership to manage your company profile
        </Text>
      </View>

      <View style={styles.form}>
        {/* Company Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company Name *</Text>
          <TextInput
            style={[styles.input, errors.companyName && styles.inputError]}
            value={formData.companyName}
            onChangeText={(value) => handleInputChange('companyName', value)}
            placeholder="Enter your company name"
            placeholderTextColor="#BDC3C7"
            editable={!companyName} // Disable if pre-filled
          />
          {errors.companyName && (
            <Text style={styles.errorText}>{errors.companyName}</Text>
          )}
        </View>

        {/* Official Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Official Company Email *</Text>
          <TextInput
            style={[styles.input, errors.officialEmail && styles.inputError]}
            value={formData.officialEmail}
            onChangeText={(value) => handleInputChange('officialEmail', value)}
            placeholder="contact@yourcompany.com"
            placeholderTextColor="#BDC3C7"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.officialEmail && (
            <Text style={styles.errorText}>{errors.officialEmail}</Text>
          )}
        </View>

        {/* Website URL */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company Website *</Text>
          <TextInput
            style={[styles.input, errors.websiteUrl && styles.inputError]}
            value={formData.websiteUrl}
            onChangeText={(value) => handleInputChange('websiteUrl', value)}
            placeholder="https://yourcompany.com"
            placeholderTextColor="#BDC3C7"
            keyboardType="url"
            autoCapitalize="none"
          />
          {errors.websiteUrl && (
            <Text style={styles.errorText}>{errors.websiteUrl}</Text>
          )}
        </View>

        {/* Contact Person */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Person *</Text>
          <TextInput
            style={[styles.input, errors.contactPerson && styles.inputError]}
            value={formData.contactPerson}
            onChangeText={(value) => handleInputChange('contactPerson', value)}
            placeholder="Your full name"
            placeholderTextColor="#BDC3C7"
          />
          {errors.contactPerson && (
            <Text style={styles.errorText}>{errors.contactPerson}</Text>
          )}
        </View>

        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange('phoneNumber', value)}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor="#BDC3C7"
            keyboardType="phone-pad"
          />
        </View>

        {/* Verification Method */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Verification Method *</Text>
            <TouchableOpacity onPress={openVerificationGuide}>
              <Ionicons name="information-circle" size={16} color="#4ECDC4" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.verificationOptions}>
            <TouchableOpacity
              style={[
                styles.verificationOption,
                formData.verificationMethod === 'website' && styles.verificationOptionSelected,
              ]}
              onPress={() => handleInputChange('verificationMethod', 'website')}
            >
              <Ionicons 
                name="globe" 
                size={20} 
                color={formData.verificationMethod === 'website' ? '#4ECDC4' : '#7F8C8D'} 
              />
              <Text style={[
                styles.verificationOptionText,
                formData.verificationMethod === 'website' && styles.verificationOptionTextSelected,
              ]}>
                Website Verification
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.verificationOption,
                formData.verificationMethod === 'email' && styles.verificationOptionSelected,
              ]}
              onPress={() => handleInputChange('verificationMethod', 'email')}
            >
              <Ionicons 
                name="mail" 
                size={20} 
                color={formData.verificationMethod === 'email' ? '#4ECDC4' : '#7F8C8D'} 
              />
              <Text style={[
                styles.verificationOptionText,
                formData.verificationMethod === 'email' && styles.verificationOptionTextSelected,
              ]}>
                Email Verification
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.verificationOption,
                formData.verificationMethod === 'documents' && styles.verificationOptionSelected,
              ]}
              onPress={() => handleInputChange('verificationMethod', 'documents')}
            >
              <Ionicons 
                name="document-text" 
                size={20} 
                color={formData.verificationMethod === 'documents' ? '#4ECDC4' : '#7F8C8D'} 
              />
              <Text style={[
                styles.verificationOptionText,
                formData.verificationMethod === 'documents' && styles.verificationOptionTextSelected,
              ]}>
                Document Upload
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Document Upload */}
        {formData.verificationMethod === 'documents' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Proof Documents *</Text>
            <Text style={styles.helperText}>
              Upload official documents (PDF, images) proving company ownership
            </Text>
            
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleDocumentPick}
            >
              <Ionicons name="cloud-upload" size={24} color="#4ECDC4" />
              <Text style={styles.uploadButtonText}>Upload Documents</Text>
            </TouchableOpacity>

            {formData.proofDocuments.length > 0 && (
              <View style={styles.documentsList}>
                {formData.proofDocuments.map((doc, index) => (
                  <View key={index} style={styles.documentItem}>
                    <Ionicons name="document" size={16} color="#4ECDC4" />
                    <Text style={styles.documentName} numberOfLines={1}>
                      Document {index + 1}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeDocument(index)}
                      style={styles.removeDocumentButton}
                    >
                      <Ionicons name="close" size={16} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {errors.proofDocuments && (
              <Text style={styles.errorText}>{errors.proofDocuments}</Text>
            )}
          </View>
        )}

        {/* Additional Information */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Additional Information (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.additionalInfo}
            onChangeText={(value) => handleInputChange('additionalInfo', value)}
            placeholder="Any additional information to help with verification..."
            placeholderTextColor="#BDC3C7"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By submitting this claim, you agree that you have the authority to represent this company 
            and that all information provided is accurate. False claims may result in account suspension.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {onCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Claim</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 22,
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F8F5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2C3E50',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  textArea: {
    height: 100,
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    lineHeight: 20,
  },
  verificationOptions: {
    gap: 8,
  },
  verificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F8F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  verificationOptionSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: '#E8F8F5',
  },
  verificationOptionText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginLeft: 12,
  },
  verificationOptionTextSelected: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F8F5',
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
    marginLeft: 8,
  },
  documentsList: {
    gap: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F8F5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  documentName: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
  },
  removeDocumentButton: {
    padding: 4,
  },
  termsContainer: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F8F5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default CompanyClaimForm;
