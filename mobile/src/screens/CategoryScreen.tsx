import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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

type CategoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const CategoryScreen = () => {
  const navigation = useNavigation<CategoryScreenNavigationProp>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('AI');
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);

  const categoriesList = [
    { category: 'AI', count: 0 },
    { category: 'Gadgets', count: 0 },
    { category: 'Software', count: 0 },
    { category: 'Tech News', count: 0 },
    { category: 'Programming', count: 0 },
    { category: 'Startups', count: 0 },
  ];

  useEffect(() => {
    loadCategories();
    loadArticles(selectedCategory);
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      const categoryMap = new Map(response.categories.map(cat => [cat.category, cat.count]));
      
      const updatedCategories = categoriesList.map(cat => ({
        ...cat,
        count: categoryMap.get(cat.category) || 0,
      }));
      
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadArticles = async (category: string) => {
    try {
      setLoading(true);
      const response = await apiService.getArticles({
        category,
        limit: 20,
      });
      setArticles(response.articles);
    } catch (error) {
      console.error('Error loading articles:', error);
      Alert.alert('Error', 'Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    loadArticles(category);
  };

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

  const renderCategoryItem = ({ item }: { item: { category: string; count: number } }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.category && {
          backgroundColor: getCategoryColor(item.category),
        },
      ]}
      onPress={() => handleCategorySelect(item.category)}
    >
      <Icon
        name={getCategoryIcon(item.category)}
        size={32}
        color={selectedCategory === item.category ? '#fff' : getCategoryColor(item.category)}
      />
      <Text
        style={[
          styles.categoryName,
          selectedCategory === item.category && styles.selectedCategoryName,
        ]}
      >
        {item.category}
      </Text>
      <Text
        style={[
          styles.categoryCount,
          selectedCategory === item.category && styles.selectedCategoryCount,
        ]}
      >
        {item.count} articles
      </Text>
    </TouchableOpacity>
  );

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'AI': 'psychology',
      'Gadgets': 'devices',
      'Software': 'code',
      'Tech News': 'article',
      'Programming': 'computer',
      'Startups': 'trending-up',
    };
    return icons[category] || 'category';
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <ArticleCard
      article={item}
      onPress={handleArticlePress}
      onFavorite={handleFavoritePress}
    />
  );

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
      <Text style={styles.title}>Categories</Text>
      
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.category}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesList}
      />

      <View style={styles.articlesContainer}>
        <Text style={styles.sectionTitle}>{selectedCategory} Articles</Text>
        
        {articles.length === 0 ? (
          <EmptyState
            title="No articles found"
            message={`No ${selectedCategory.toLowerCase()} articles available at the moment`}
            icon="inbox"
          />
        ) : (
          <FlatList
            data={articles}
            renderItem={renderArticle}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.articlesList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoriesList: {
    maxHeight: 140,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: '#fff',
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  selectedCategoryCount: {
    color: '#fff',
  },
  articlesContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  articlesList: {
    paddingBottom: 16,
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
});

export default CategoryScreen;
