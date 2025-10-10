import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAuth } from '../context/AuthContext';
import { UserPreferences } from '../types';
import apiService from '../services/api';

const ProfileScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    categories: ['AI', 'Gadgets', 'Software'],
    notification_settings: { email: true, push: false },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    }
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleCategoryToggle = async (category: string) => {
    const newCategories = preferences.categories.includes(category)
      ? preferences.categories.filter(cat => cat !== category)
      : [...preferences.categories, category];

    const newPreferences = { ...preferences, categories: newCategories };
    await updatePreferences(newPreferences);
  };

  const handleNotificationToggle = async (type: 'email' | 'push') => {
    const newSettings = {
      ...preferences.notification_settings,
      [type]: !preferences.notification_settings[type],
    };
    
    const newPreferences = { ...preferences, notification_settings: newSettings };
    await updatePreferences(newPreferences);
  };

  const updatePreferences = async (newPreferences: UserPreferences) => {
    try {
      setLoading(true);
      const response = await apiService.updatePreferences(newPreferences);
      setPreferences(newPreferences);
      
      // Update user in context
      if (user) {
        updateUser({ ...user, preferences: newPreferences });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = [
    'AI',
    'Gadgets',
    'Software',
    'Programming',
    'Startups',
    'Tech News',
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderMenuItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Icon name={icon} size={24} color="#007AFF" />
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <Icon name="chevron-right" size={24} color="#ccc" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={40} color="#007AFF" />
        </View>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.memberSince}>
          Member since {user?.created_at && formatDate(user.created_at)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Categories</Text>
          <Text style={styles.subsectionDescription}>
            Choose which categories you want to see in your feed
          </Text>
          
          {availableCategories.map((category) => (
            <View key={category} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category}</Text>
              <Switch
                value={preferences.categories.includes(category)}
                onValueChange={() => handleCategoryToggle(category)}
                disabled={loading}
              />
            </View>
          ))}
        </View>

        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Notifications</Text>
          <Text style={styles.subsectionDescription}>
            Manage your notification preferences
          </Text>
          
          <View style={styles.notificationItem}>
            <View style={styles.notificationLeft}>
              <Icon name="email" size={20} color="#666" />
              <Text style={styles.notificationName}>Email Notifications</Text>
            </View>
            <Switch
              value={preferences.notification_settings.email}
              onValueChange={() => handleNotificationToggle('email')}
              disabled={loading}
            />
          </View>
          
          <View style={styles.notificationItem}>
            <View style={styles.notificationLeft}>
              <Icon name="notifications" size={20} color="#666" />
              <Text style={styles.notificationName}>Push Notifications</Text>
            </View>
            <Switch
              value={preferences.notification_settings.push}
              onValueChange={() => handleNotificationToggle('push')}
              disabled={loading}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        {renderMenuItem(
          'info',
          'About Tech News',
          'Version 1.0.0',
          () => Alert.alert('About', 'Tech News App v1.0.0\nStay updated with the latest technology news.')
        )}
        
        {renderMenuItem(
          'help',
          'Help & Support',
          'Get help and contact support'
        )}
        
        {renderMenuItem(
          'privacy-tip',
          'Privacy Policy',
          'Learn how we protect your data'
        )}
        
        {renderMenuItem(
          'logout',
          'Logout',
          'Sign out of your account',
          handleLogout,
          <Icon name="logout" size={24} color="#FF6B6B" />
        )}
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Updating preferences...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  subsection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subsectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileScreen;
