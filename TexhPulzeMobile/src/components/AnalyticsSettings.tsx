import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analytics } from '../services/analytics';

interface AnalyticsSettingsProps {
  userId?: string;
  region?: string;
  onSettingsChange?: (settings: AnalyticsSettingsData) => void;
}

interface AnalyticsSettingsData {
  analyticsOptOut: boolean;
  analyticsConsent: boolean;
  region: string;
}

export default function AnalyticsSettings({ 
  userId, 
  region, 
  onSettingsChange 
}: AnalyticsSettingsProps) {
  const [analyticsOptOut, setAnalyticsOptOut] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRegion, setUserRegion] = useState(region || 'US');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const preferences = await AsyncStorage.getItem('analytics_preferences');
      const storedRegion = await AsyncStorage.getItem('user_region');
      
      if (preferences) {
        const { analyticsOptOut, analyticsConsent } = JSON.parse(preferences);
        setAnalyticsOptOut(analyticsOptOut || false);
        setAnalyticsConsent(analyticsConsent || false);
      }
      
      if (storedRegion) {
        setUserRegion(storedRegion);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load analytics settings:', error);
      setIsLoading(false);
    }
  };

  const handleAnalyticsToggle = async (value: boolean) => {
    setAnalyticsOptOut(!value);
    
    try {
      await analytics.setAnalyticsOptOut(!value);
      
      const settings: AnalyticsSettingsData = {
        analyticsOptOut: !value,
        analyticsConsent: analyticsConsent,
        region: userRegion,
      };
      
      onSettingsChange?.(settings);
      
      // Track the setting change (only if analytics is enabled)
      if (value) {
        analytics.track('analytics_enabled', { source: 'settings' });
      }
    } catch (error) {
      console.error('Failed to update analytics settings:', error);
      Alert.alert('Error', 'Failed to update analytics settings');
    }
  };

  const handleConsentToggle = async (value: boolean) => {
    setAnalyticsConsent(value);
    
    try {
      const settings: AnalyticsSettingsData = {
        analyticsOptOut: analyticsOptOut,
        analyticsConsent: value,
        region: userRegion,
      };
      
      await AsyncStorage.setItem('analytics_preferences', JSON.stringify({
        analyticsOptOut: analyticsOptOut,
        analyticsConsent: value,
      }));
      
      // Update analytics service
      if (userId) {
        await analytics.setUser(userId, settings);
      }
      
      onSettingsChange?.(settings);
      
      // Track consent change
      analytics.track('analytics_consent_changed', { 
        consented: value,
        region: userRegion,
      });
    } catch (error) {
      console.error('Failed to update consent settings:', error);
      Alert.alert('Error', 'Failed to update consent settings');
    }
  };

  const showPrivacyInfo = () => {
    Alert.alert(
      'Privacy & Analytics',
      'TexhPulze uses analytics to improve your experience and understand how our app is used. We collect:\n\n' +
      '• App usage and performance data\n' +
      '• Feature interactions and preferences\n' +
      '• Error reports to fix issues\n' +
      '• Anonymous usage statistics\n\n' +
      'Your personal data is never shared with third parties without your explicit consent. You can opt out at any time.',
      [{ text: 'OK' }]
    );
  };

  const requiresConsent = ['EU', 'UK', 'CA'].includes(userRegion);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics & Privacy</Text>
        <Text style={styles.subtitle}>
          Control how your data is used to improve TexhPulze
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Analytics</Text>
            <Text style={styles.settingDescription}>
              Help improve TexhPulze by sharing anonymous usage data
            </Text>
          </View>
          <Switch
            value={!analyticsOptOut}
            onValueChange={handleAnalyticsToggle}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={!analyticsOptOut ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        {requiresConsent && (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Data Processing Consent</Text>
              <Text style={styles.settingDescription}>
                Required for users in {userRegion} to process analytics data
              </Text>
            </View>
            <Switch
              value={analyticsConsent}
              onValueChange={handleConsentToggle}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={analyticsConsent ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        )}

        <TouchableOpacity style={styles.infoButton} onPress={showPrivacyInfo}>
          <Text style={styles.infoButtonText}>Learn More About Privacy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What We Track</Text>
        <View style={styles.trackingList}>
          <Text style={styles.trackingItem}>• Screen views and navigation</Text>
          <Text style={styles.trackingItem}>• Feature usage and interactions</Text>
          <Text style={styles.trackingItem}>• Story views, votes, and saves</Text>
          <Text style={styles.trackingItem}>• Audio playback and completion</Text>
          <Text style={styles.trackingItem}>• Error reports and app performance</Text>
          <Text style={styles.trackingItem}>• Search queries and results</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Rights</Text>
        <View style={styles.rightsList}>
          <Text style={styles.rightsItem}>• Opt out of analytics at any time</Text>
          <Text style={styles.rightsItem}>• Request data deletion</Text>
          <Text style={styles.rightsItem}>• Access your data</Text>
          <Text style={styles.rightsItem}>• Data portability</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Analytics help us improve TexhPulze for everyone. Your privacy is important to us.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  infoButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  trackingList: {
    marginTop: 10,
  },
  trackingItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  rightsList: {
    marginTop: 10,
  },
  rightsItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
