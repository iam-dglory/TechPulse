import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface ImpactCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: ImpactData) => void;
  initialData?: ImpactData;
}

interface ImpactData {
  job: string;
  location: string;
  techUsed: string[];
  industry: string;
}

const { width: screenWidth } = Dimensions.get('window');

const jobCategories = [
  'Customer Service',
  'Healthcare',
  'Education',
  'Finance',
  'Technology',
  'Retail',
  'Manufacturing',
  'Transportation',
  'Government',
  'Non-Profit',
  'Freelance',
  'Other',
];

const techCategories = [
  'Social Media',
  'Email',
  'Cloud Services',
  'AI Tools',
  'Mobile Apps',
  'E-commerce',
  'Video Conferencing',
  'Project Management',
  'Data Analytics',
  'Cybersecurity',
  'IoT Devices',
  'Automation',
];

const ImpactCalculatorModal: React.FC<ImpactCalculatorModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ImpactData>(
    initialData || {
      job: '',
      location: '',
      techUsed: [],
      industry: '',
    }
  );

  const [customJob, setCustomJob] = useState('');
  const [customLocation, setCustomLocation] = useState('');

  const handleJobSelect = (job: string) => {
    setFormData(prev => ({ ...prev, job, industry: job }));
    setCustomJob('');
  };

  const handleCustomJobChange = (text: string) => {
    setCustomJob(text);
    setFormData(prev => ({ ...prev, job: text, industry: text }));
  };

  const handleLocationSelect = (location: string) => {
    setFormData(prev => ({ ...prev, location }));
    setCustomLocation('');
  };

  const handleCustomLocationChange = (text: string) => {
    setCustomLocation(text);
    setFormData(prev => ({ ...prev, location: text }));
  };

  const handleTechToggle = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techUsed: prev.techUsed.includes(tech)
        ? prev.techUsed.filter(t => t !== tech)
        : [...prev.techUsed, tech],
    }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.job) {
      Alert.alert('Required', 'Please select or enter your job category');
      return;
    }
    if (step === 2 && !formData.location) {
      Alert.alert('Required', 'Please select or enter your location');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = () => {
    if (formData.techUsed.length === 0) {
      Alert.alert('Required', 'Please select at least one technology you use');
      return;
    }

    onSave(formData);
    onClose();
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What's your job category?</Text>
      <Text style={styles.stepSubtitle}>
        This helps us personalize your tech impact recommendations
      </Text>

      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        {jobCategories.map((job) => (
          <TouchableOpacity
            key={job}
            style={[
              styles.optionButton,
              formData.job === job && styles.selectedOption,
            ]}
            onPress={() => handleJobSelect(job)}
          >
            <Text
              style={[
                styles.optionText,
                formData.job === job && styles.selectedOptionText,
              ]}
            >
              {job}
            </Text>
            {formData.job === job && (
              <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.customInputContainer}>
          <Text style={styles.customLabel}>Or enter your own:</Text>
          <TextInput
            style={styles.customInput}
            placeholder="e.g., Marketing Manager, Software Engineer"
            value={customJob}
            onChangeText={handleCustomJobChange}
            placeholderTextColor="#7F8C8D"
          />
        </View>
      </ScrollView>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Where are you located?</Text>
      <Text style={styles.stepSubtitle}>
        Location helps us understand regional tech impact patterns
      </Text>

      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.customInputContainer}>
          <Text style={styles.customLabel}>Enter your location:</Text>
          <TextInput
            style={styles.customInput}
            placeholder="e.g., San Francisco, CA or Remote"
            value={customLocation}
            onChangeText={handleCustomLocationChange}
            placeholderTextColor="#7F8C8D"
          />
        </View>

        <Text style={styles.quickOptionsLabel}>Quick options:</Text>
        {['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA'].map((location) => (
          <TouchableOpacity
            key={location}
            style={[
              styles.optionButton,
              formData.location === location && styles.selectedOption,
            ]}
            onPress={() => handleLocationSelect(location)}
          >
            <Text
              style={[
                styles.optionText,
                formData.location === location && styles.selectedOptionText,
              ]}
            >
              {location}
            </Text>
            {formData.location === location && (
              <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What technologies do you use?</Text>
      <Text style={styles.stepSubtitle}>
        Select all that apply - this helps us calculate your personal impact
      </Text>

      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.techGrid}>
          {techCategories.map((tech) => (
            <TouchableOpacity
              key={tech}
              style={[
                styles.techChip,
                formData.techUsed.includes(tech) && styles.selectedTechChip,
              ]}
              onPress={() => handleTechToggle(tech)}
            >
              <Text
                style={[
                  styles.techChipText,
                  formData.techUsed.includes(tech) && styles.selectedTechChipText,
                ]}
              >
                {tech}
              </Text>
              {formData.techUsed.includes(tech) && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.selectedTechContainer}>
          <Text style={styles.selectedTechLabel}>
            Selected: {formData.techUsed.length} technologies
          </Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#7F8C8D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Impact Calculator</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(step / 3) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>Step {step} of 3</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {renderCurrentStep()}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handlePrevious}
              >
                <Ionicons name="chevron-back" size={20} color="#4ECDC4" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                step === 3 && styles.saveButton,
              ]}
              onPress={step === 3 ? handleSave : handleNext}
            >
              <Text
                style={[
                  styles.nextButtonText,
                  step === 3 && styles.saveButtonText,
                ]}
              >
                {step === 3 ? 'Save & Continue' : 'Next'}
              </Text>
              {step < 3 && (
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
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
  },
  headerRight: {
    width: 32,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E8F8F5',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
    paddingTop: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  selectedOption: {
    backgroundColor: '#E8F8F5',
    borderColor: '#4ECDC4',
  },
  optionText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  customInputContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  customLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
    fontWeight: '500',
  },
  customInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F8F5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#2C3E50',
  },
  quickOptionsLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F8F5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  selectedTechChip: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  techChipText: {
    fontSize: 14,
    color: '#2C3E50',
    marginRight: 4,
  },
  selectedTechChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedTechContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#E8F8F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedTechLabel: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8F8F5',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#27AE60',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 4,
  },
  saveButtonText: {
    marginRight: 0,
  },
});

export default ImpactCalculatorModal;

