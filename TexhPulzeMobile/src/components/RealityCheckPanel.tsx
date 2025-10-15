import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RealityCheckPanelProps {
  realityCheck?: string;
  originalClaims?: string;
  sourceUrl?: string;
  publishedAt?: string;
  company?: {
    name: string;
    credibilityScore?: number;
  };
}

const RealityCheckPanel: React.FC<RealityCheckPanelProps> = ({
  realityCheck,
  originalClaims,
  sourceUrl,
  publishedAt,
  company,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // If no reality check is provided, show a placeholder
  if (!realityCheck) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <Ionicons name="checkmark-circle" size={20} color="#95A5A6" />
            <Text style={styles.headerTitle}>Reality Check</Text>
            <Text style={styles.headerSubtitle}>Not Available</Text>
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#7F8C8D" 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.content}>
            <View style={styles.placeholderContainer}>
              <Ionicons name="search" size={32} color="#BDC3C7" />
              <Text style={styles.placeholderTitle}>No Reality Check Available</Text>
              <Text style={styles.placeholderText}>
                Our fact-checking team hasn't reviewed this story yet. 
                This doesn't mean the claims are false, but we haven't verified them independently.
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  const extractClaimsFromContent = (content: string): string[] => {
    // Simple extraction of potential claims - in a real app, this might be more sophisticated
    const claimPatterns = [
      /(?:claims?|says?|announces?|reports?)\s+(?:that\s+)?(.+?)(?:\.|$)/gi,
      /(?:promises?|guarantees?)\s+(?:that\s+)?(.+?)(?:\.|$)/gi,
      /(?:will|can|able to)\s+(.+?)(?:\.|$)/gi,
    ];

    const claims: string[] = [];
    
    claimPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const claim = match[1]?.trim();
        if (claim && claim.length > 10 && claim.length < 200) {
          claims.push(claim);
        }
      }
    });

    // Remove duplicates and limit to 3 most relevant claims
    return [...new Set(claims)].slice(0, 3);
  };

  const claims = originalClaims ? extractClaimsFromContent(originalClaims) : [];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
          <Text style={styles.headerTitle}>Reality Check</Text>
          <Text style={styles.headerSubtitle}>Fact-Checked</Text>
        </View>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#7F8C8D" 
        />
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* What They Claim Section */}
          {claims.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="megaphone" size={16} color="#E74C3C" />
                <Text style={styles.sectionTitle}>What They Claim</Text>
              </View>
              <View style={styles.claimsContainer}>
                {claims.map((claim, index) => (
                  <View key={index} style={styles.claimItem}>
                    <View style={styles.claimBullet} />
                    <Text style={styles.claimText}>{claim}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reality Check Summary Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={16} color="#27AE60" />
              <Text style={styles.sectionTitle}>Reality Check Summary</Text>
            </View>
            <View style={styles.realityCheckContainer}>
              <Text style={styles.realityCheckText}>{realityCheck}</Text>
            </View>
          </View>

          {/* Fact-Checking Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={14} color="#7F8C8D" />
              <Text style={styles.detailLabel}>Fact-checked on: </Text>
              <Text style={styles.detailValue}>
                {publishedAt ? new Date(publishedAt).toLocaleDateString() : 'Recently'}
              </Text>
            </View>

            {company && (
              <View style={styles.detailRow}>
                <Ionicons name="business" size={14} color="#7F8C8D" />
                <Text style={styles.detailLabel}>Company: </Text>
                <Text style={styles.detailValue}>{company.name}</Text>
                {company.credibilityScore && (
                  <Text style={styles.credibilityScore}>
                    ({company.credibilityScore}/10 credibility)
                  </Text>
                )}
              </View>
            )}

            {sourceUrl && (
              <View style={styles.detailRow}>
                <Ionicons name="link" size={14} color="#7F8C8D" />
                <Text style={styles.detailLabel}>Source: </Text>
                <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
                  {sourceUrl}
                </Text>
              </View>
            )}
          </View>

          {/* Methodology Note */}
          <View style={styles.methodologyContainer}>
            <View style={styles.methodologyHeader}>
              <Ionicons name="information-circle" size={16} color="#4ECDC4" />
              <Text style={styles.methodologyTitle}>Our Fact-Checking Process</Text>
            </View>
            <Text style={styles.methodologyText}>
              We analyze claims against publicly available data, expert opinions, 
              and historical patterns. Our reality checks focus on verifiable facts 
              rather than predictions or opinions.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F8F5',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  content: {
    maxHeight: 400, // Limit height to prevent overly long content
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 24,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginTop: 12,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
  },
  claimsContainer: {
    marginTop: 8,
  },
  claimItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  claimBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E74C3C',
    marginTop: 6,
    marginRight: 10,
  },
  claimText: {
    flex: 1,
    fontSize: 13,
    color: '#7F8C8D',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  realityCheckContainer: {
    backgroundColor: '#F0F8F0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  realityCheckText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 6,
  },
  detailValue: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  credibilityScore: {
    fontSize: 11,
    color: '#4ECDC4',
    fontWeight: '600',
    marginLeft: 4,
  },
  methodologyContainer: {
    padding: 16,
    backgroundColor: '#E8F8F5',
    borderTopWidth: 1,
    borderTopColor: '#E8F8F5',
  },
  methodologyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodologyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginLeft: 6,
  },
  methodologyText: {
    fontSize: 11,
    color: '#7F8C8D',
    lineHeight: 16,
  },
});

export default RealityCheckPanel;
