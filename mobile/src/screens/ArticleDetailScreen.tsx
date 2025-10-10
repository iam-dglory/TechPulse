import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootStackParamList, Article } from '../types';
import apiService from '../services/api';

type ArticleDetailScreenRouteProp = RouteProp<RootStackParamList, 'ArticleDetail'>;
type ArticleDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ArticleDetail'>;

interface Props {
  route: ArticleDetailScreenRouteProp;
  navigation: ArticleDetailScreenNavigationProp;
}

const ArticleDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { article } = route.params;
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [article.id]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await apiService.checkFavorite(article.id);
      setIsFavorited(response.isFavorited);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await apiService.toggleFavorite(article.id);
      setIsFavorited(response.isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInBrowser = async () => {
    try {
      const supported = await Linking.canOpenURL(article.url);
      if (supported) {
        await Linking.openURL(article.url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open article in browser');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${article.title}\n${article.url}`,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'AI': '#FF6B6B',
      'Gadgets': '#4ECDC4',
      'Software': '#45B7D1',
      'Tech News': '#96CEB4',
      'Programming': '#FFEAA7',
      'Startups': '#DDA0DD',
    };
    return colors[category] || '#95A5A6';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(article.category) },
            ]}
          >
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          
          <Text style={styles.title}>{article.title}</Text>
          
          <View style={styles.metaInfo}>
            <Text style={styles.source}>{article.source}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.date}>{formatDate(article.published_at)}</Text>
          </View>
          
          {article.description && (
            <Text style={styles.description}>{article.description}</Text>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFavoriteToggle}
            disabled={loading}
          >
            <Icon
              name={isFavorited ? 'favorite' : 'favorite-border'}
              size={24}
              color={isFavorited ? '#FF6B6B' : '#666'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share" size={24} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleOpenInBrowser}>
            <Icon name="open-in-browser" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.webViewContainer}>
        <WebView
          source={{ uri: article.url }}
          style={styles.webView}
          startInLoadingState={true}
          scalesPageToFit={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    lineHeight: 28,
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  source: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  separator: {
    fontSize: 14,
    color: '#ccc',
    marginHorizontal: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    minWidth: 48,
    alignItems: 'center',
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});

export default ArticleDetailScreen;
