import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CategoryFilterProps } from '../types';

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'all': '#95A5A6',
      'AI': '#FF6B6B',
      'Gadgets': '#4ECDC4',
      'Software': '#45B7D1',
      'Tech News': '#96CEB4',
      'Programming': '#FFEAA7',
      'Startups': '#DDA0DD',
    };
    return colors[category] || '#95A5A6';
  };

  const getCategoryDisplayName = (category: string) => {
    return category === 'all' ? 'All' : category;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.category}
            style={[
              styles.chip,
              selectedCategory === category.category && styles.selectedChip,
              {
                backgroundColor: selectedCategory === category.category
                  ? getCategoryColor(category.category)
                  : '#fff',
              },
            ]}
            onPress={() => onCategorySelect(category.category)}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: selectedCategory === category.category
                    ? '#fff'
                    : getCategoryColor(category.category),
                },
              ]}
            >
              {getCategoryDisplayName(category.category)}
            </Text>
            {category.count > 0 && (
              <Text
                style={[
                  styles.countText,
                  {
                    color: selectedCategory === category.category
                      ? '#fff'
                      : '#999',
                  },
                ]}
              >
                ({category.count})
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    marginRight: 12,
  },
  selectedChip: {
    borderColor: 'transparent',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  countText: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default CategoryFilter;
