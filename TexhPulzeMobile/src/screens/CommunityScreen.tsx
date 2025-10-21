import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CommunityScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Discussions</Text>
      <Text style={styles.subtitle}>Coming Soon!</Text>
      <Text style={styles.description}>
        This will be where users can discuss technology grievances and AI news.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#4ECDC4',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default CommunityScreen;
