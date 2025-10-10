import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

import { Favorite, RootStackParamList } from '../types';
import apiService from '../services/api';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

type FavoritesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const FavoritesScreen = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFavorites = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = {
        page: pageNum,
        limit: 20,
      };

      const response = await apiService.getFavorites(params);
      
      if (refresh || pageNum === 1) {
        setFavorites(response.favorites);
        setPage(2);
      } else {
        setFavorites(prev => [...prev, ...response.favorites]);
        setPage(pageNum + 1);
      }

      setHasMore(response.pagination.hasNextPage);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  // Reload favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const handleRefresh = () => {
    loadFavorites(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadFavorites(page);
    }
  };

  const handleArticlePress = (article: Favorite) => {
    // Convert Favorite to Article for navigation
    const articleForNavigation = {
      id: article.id,
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source,
      category: article.category,
      published_at: article.published_at,
      image_url: article.image_url,
    };
    navigation.navigate('ArticleDetail', { article: articleForNavigation });
  };

  const handleFavoritePress = async (articleId: number) => {
    try {
      await apiService.toggleFavorite(articleId);
      // Remove from favorites list
      setFavorites(prev => prev.filter(fav => fav.id !== articleId));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite. Please try again.');
    }
  };

  const renderFavorite = ({ item }: { item: Favorite }) => (
    <ArticleCard
      article={item}
      onPress={handleArticlePress}
      onFavorite={handleFavoritePress}
      isFavorited={true}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>
          {favorites.length} {favorites.length === 1 ? 'article' : 'articles'} saved
        </Text>
      </View>

      {favorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          message="Start saving articles you love by tapping the heart icon on any article"
          icon="favorite-border"
        />
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
});

export default FavoritesScreen;
