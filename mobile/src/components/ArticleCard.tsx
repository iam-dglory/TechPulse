import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Article } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface ArticleCardProps {
  article: Article;
  onPress: (article: Article) => void;
  onFavorite: (articleId: number) => void;
  isFavorited?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onPress,
  onFavorite,
  isFavorited = false,
}) => {
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const scale = useSharedValue(1);
  const favoriteScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const favoriteAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: favoriteScale.value }],
    };
  });

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    onPress(article);
  };

  const handleFavoritePress = async () => {
    if (favoriteLoading) return;

    favoriteScale.value = withSpring(0.8, {}, () => {
      favoriteScale.value = withSpring(1);
    });

    setFavoriteLoading(true);
    try {
      await onFavorite(article.id);
    } catch (error) {
      console.error('Error handling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
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

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <View style={styles.card}>
          {article.image_url && (
            <Image source={{ uri: article.image_url }} style={styles.image} />
          )}
          
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.categoryContainer}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryColor(article.category) },
                  ]}
                >
                  <Text style={styles.categoryText}>{article.category}</Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={handleFavoritePress}
                disabled={favoriteLoading}
                style={styles.favoriteButton}
              >
                <Animated.View style={favoriteAnimatedStyle}>
                  <Icon
                    name={isFavorited ? 'favorite' : 'favorite-border'}
                    size={24}
                    color={isFavorited ? '#FF6B6B' : '#ccc'}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>

            <Text style={styles.title} numberOfLines={2}>
              {article.title}
            </Text>

            {article.description && (
              <Text style={styles.description} numberOfLines={3}>
                {article.description}
              </Text>
            )}

            <View style={styles.footer}>
              <View style={styles.sourceContainer}>
                <Text style={styles.source}>{article.source}</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.date}>{formatDate(article.published_at)}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryContainer: {
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  source: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  separator: {
    fontSize: 12,
    color: '#ccc',
    marginHorizontal: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});

export default ArticleCard;
