import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PriceTier {
  name: string;
  price: number;
  features: string[];
}

interface ProductFeatures {
  core: string[];
  advanced: string[];
  integrations: string[];
}

interface ProductCardProps {
  name: string;
  description: string;
  priceTiers: PriceTier[];
  features: ProductFeatures;
  targetUsers: string[];
  demoUrl?: string;
  onPress?: () => void;
  onDemoPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  description,
  priceTiers,
  features,
  targetUsers,
  demoUrl,
  onPress,
  onDemoPress,
}) => {
  const formatPrice = (price: number): string => {
    if (price === 0) return 'Free';
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}k+`;
    return `$${price}`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        {demoUrl && (
          <TouchableOpacity
            style={styles.demoButton}
            onPress={onDemoPress}
            activeOpacity={0.7}
          >
            <Ionicons name="play-circle" size={20} color="#4ECDC4" />
            <Text style={styles.demoText}>Demo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={3}>
        {description}
      </Text>

      {/* Price Tiers */}
      {priceTiers.length > 0 && (
        <View style={styles.priceSection}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.priceTiersContainer}>
              {priceTiers.map((tier, index) => (
                <View key={index} style={styles.priceTier}>
                  <Text style={styles.tierName}>{tier.name}</Text>
                  <Text style={styles.tierPrice}>
                    {formatPrice(tier.price)}
                  </Text>
                  {tier.features.length > 0 && (
                    <Text style={styles.tierFeatures}>
                      {tier.features.slice(0, 2).join(', ')}
                      {tier.features.length > 2 && '...'}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featuresContainer}>
          {features.core.slice(0, 3).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
          {features.advanced.length > 0 && (
            <View style={styles.featureItem}>
              <Ionicons name="star" size={16} color="#F39C12" />
              <Text style={styles.featureText}>
                +{features.advanced.length} advanced features
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Target Users */}
      {targetUsers.length > 0 && (
        <View style={styles.targetSection}>
          <Text style={styles.sectionTitle}>For</Text>
          <View style={styles.targetUsersContainer}>
            {targetUsers.slice(0, 3).map((user, index) => (
              <View key={index} style={styles.targetUser}>
                <Text style={styles.targetUserText}>{user}</Text>
              </View>
            ))}
            {targetUsers.length > 3 && (
              <View style={styles.targetUser}>
                <Text style={styles.targetUserText}>
                  +{targetUsers.length - 3} more
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.integrationsContainer}>
          {features.integrations.length > 0 && (
            <>
              <Ionicons name="link" size={14} color="#7F8C8D" />
              <Text style={styles.integrationsText}>
                {features.integrations.length} integrations
              </Text>
            </>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color="#BDC3C7" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    marginRight: 8,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  demoText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 16,
  },
  priceSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  priceTiersContainer: {
    flexDirection: 'row',
  },
  priceTier: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  tierName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  tierFeatures: {
    fontSize: 10,
    color: '#6C757D',
    lineHeight: 14,
  },
  featuresSection: {
    marginBottom: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 6,
    flex: 1,
    minWidth: '45%',
  },
  featureText: {
    fontSize: 12,
    color: '#495057',
    marginLeft: 6,
    flex: 1,
  },
  targetSection: {
    marginBottom: 16,
  },
  targetUsersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  targetUser: {
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  targetUserText: {
    fontSize: 11,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8F8F5',
  },
  integrationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  integrationsText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 4,
  },
});

export default ProductCard;
