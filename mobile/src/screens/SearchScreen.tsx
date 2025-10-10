import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { debounce } from 'lodash';

import { Article, RootStackParamList } from '../types';
import apiService from '../services/api';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setArticles([]);
        setHasSearched(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.searchArticles({
          q: searchQuery,
          limit: 20,
        });
        setArticles(response.articles);
        setHasSearched(true);
        
        // Add to search history
        if (searchQuery && !searchHistory.includes(searchQuery)) {
          const newHistory = [searchQuery, ...searchHistory.slice(0, 4)];
          setSearchHistory(newHistory);
        }
      } catch (error) {
        console.error('Error searching articles:', error);
        Alert.alert('Error', 'Failed to search articles. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 500),
    [searchHistory]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleArticlePress = (article: Article) => {
    navigation.navigate('ArticleDetail', { article });
  };

  const handleFavoritePress = async (articleId: number) => {
    try {
      await apiService.toggleFavorite(articleId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite. Please try again.');
    }
  };

  const handleHistoryItemPress = (historyQuery: string) => {
    setQuery(historyQuery);
  };

  const clearSearch = () => {
    setQuery('');
    setArticles([]);
    setHasSearched(false);
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <ArticleCard
      article={item}
      onPress={handleArticlePress}
      onFavorite={handleFavoritePress}
    />
  );

  const renderSearchHistory = () => {
    if (searchHistory.length === 0 || query.trim()) return null;

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Recent Searches</Text>
        {searchHistory.map((historyQuery, index) => (
          <TouchableOpacity
            key={index}
            style={styles.historyItem}
            onPress={() => handleHistoryItemPress(historyQuery)}
          >
            <Icon name="history" size={20} color="#666" />
            <Text style={styles.historyText}>{historyQuery}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (!hasSearched && !query.trim()) {
      return (
        <View style={styles.placeholderContainer}>
          <Icon name="search" size={64} color="#ccc" />
          <Text style={styles.placeholderTitle}>Search Tech News</Text>
          <Text style={styles.placeholderText}>
            Find articles about AI, gadgets, software, and more
          </Text>
          {renderSearchHistory()}
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (hasSearched && articles.length === 0) {
      return (
        <EmptyState
          title="No results found"
          message={`No articles found for "${query}". Try different keywords.`}
          icon="search-off"
        />
      );
    }

    return (
      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  historyContainer: {
    width: '100%',
    marginTop: 32,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  historyText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
});

export default SearchScreen;
