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
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Article, RootStackParamList } from '../types';
import apiService from '../services/api';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import CategoryFilter from '../components/CategoryFilter';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadArticles = useCallback(async (pageNum: number = 1, category: string = 'all', refresh: boolean = false) => {
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
        ...(category !== 'all' && { category }),
      };

      const response = await apiService.getArticles(params);
      
      if (refresh || pageNum === 1) {
        setArticles(response.articles);
        setPage(2);
      } else {
        setArticles(prev => [...prev, ...response.articles]);
        setPage(pageNum + 1);
      }

      setHasMore(response.pagination.hasNextPage);
    } catch (error) {
      console.error('Error loading articles:', error);
      Alert.alert('Error', 'Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await apiService.getCategories();
      setCategories([
        { category: 'all', count: 0 },
        ...response.categories,
      ]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  useEffect(() => {
    loadArticles();
    loadCategories();
  }, [loadArticles, loadCategories]);

  const handleRefresh = () => {
    loadArticles(1, selectedCategory, true);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    loadArticles(1, category);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadArticles(page, selectedCategory);
    }
  };

  const handleArticlePress = (article: Article) => {
    navigation.navigate('ArticleDetail', { article });
  };

  const handleFavoritePress = async (articleId: number) => {
    try {
      await apiService.toggleFavorite(articleId);
      // You could update the local state here to reflect the favorite status
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite. Please try again.');
    }
  };

  const navigateToSearch = () => {
    navigation.navigate('Search');
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <ArticleCard
      article={item}
      onPress={handleArticlePress}
      onFavorite={handleFavoritePress}
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
        <Text style={styles.loadingText}>Loading articles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tech News</Text>
        <TouchableOpacity onPress={navigateToSearch} style={styles.searchButton}>
          <Icon name="search" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategoryChange}
      />

      {articles.length === 0 ? (
        <EmptyState
          title="No articles found"
          message="Try selecting a different category or refresh the page"
          action={{
            label: 'Refresh',
            onPress: handleRefresh,
          }}
        />
      ) : (
        <FlatList
          data={articles}
          renderItem={renderArticle}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchButton: {
    padding: 8,
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

export default HomeScreen;
