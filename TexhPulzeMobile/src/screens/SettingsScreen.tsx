import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [dataUsageOptimized, setDataUsageOptimized] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export functionality coming soon!');
  };

  return (
    <ScrollView style={styles.container}>
      {/* App Preferences */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#4ECDC4" />
          <Text style={styles.menuText}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E9ECEF', true: '#E8F8F5' }}
            thumbColor={notificationsEnabled ? '#4ECDC4' : '#BDC3C7'}
          />
        </View>

        <View style={styles.menuItem}>
          <Ionicons name="moon-outline" size={24} color="#4ECDC4" />
          <Text style={styles.menuText}>Dark Mode</Text>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: '#E9ECEF', true: '#E8F8F5' }}
            thumbColor={darkModeEnabled ? '#4ECDC4' : '#BDC3C7'}
          />
        </View>

        <View style={styles.menuItem}>
          <Ionicons name="cellular-outline" size={24} color="#4ECDC4" />
          <Text style={styles.menuText}>Data Usage Optimization</Text>
          <Switch
            value={dataUsageOptimized}
            onValueChange={setDataUsageOptimized}
            trackColor={{ false: '#E9ECEF', true: '#E8F8F5' }}
            thumbColor={dataUsageOptimized ? '#4ECDC4' : '#BDC3C7'}
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleClearCache}>
          <Ionicons name="trash-outline" size={24} color="#E74C3C" />
          <Text style={styles.menuText}>Clear Cache</Text>
          <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleExportData}>
          <Ionicons name="download-outline" size={24} color="#4ECDC4" />
          <Text style={styles.menuText}>Export Data</Text>
          <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
        </TouchableOpacity>
      </View>

      {/* Privacy & Security */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#4ECDC4" />
          <Text style={styles.menuText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="document-text-outline" size={24} color="#4ECDC4" />
          <Text style={styles.menuText}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="key-outline" size={24} color="#4ECDC4" />
          <Text style={styles.menuText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="information-circle-outline" size={24} color="#4ECDC4" />
          <Text style={styles.menuText}>App Version</Text>
          <Text style={styles.versionText}>1.0.0</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="star-outline" size={24} color="#4ECDC4" />
          <Text style={styles.menuText}>Rate App</Text>
          <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="share-outline" size={24} color="#4ECDC4" />
          <Text style={styles.menuText}>Share App</Text>
          <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#4ECDC4" />
          <Text style={styles.menuText}>Help & FAQ</Text>
          <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="mail-outline" size={24} color="#4ECDC4" />
          <Text style={styles.menuText}>Contact Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="bug-outline" size={24} color="#4ECDC4" />
          <Text style={styles.menuText}>Report Bug</Text>
          <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>TexhPulze Mobile v1.0.0</Text>
        <Text style={styles.footerSubtext}>Building the world's first courtroom for technology</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  menuText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 16,
    flex: 1,
  },
  versionText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});

export default SettingsScreen;
