import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import Toast from 'react-native-toast-message';

interface ELI5Suggestion {
  id: string;
  storyId: string;
  mode: 'simple' | 'technical';
  suggestedText: string;
  explanation?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  upvotes: number;
  downvotes: number;
  netVotes: number;
  createdAt: string;
  reviewedAt?: string;
  story: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    username: string;
  };
  reviewer?: {
    id: string;
    username: string;
  };
}

const ELI5ReviewScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const {
    data: suggestionsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['eli5-suggestions', selectedFilter],
    queryFn: () => apiService.getELI5Suggestions({
      status: selectedFilter !== 'all' ? selectedFilter : undefined,
      limit: 50,
    }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: ({ id, status, reviewNotes }: { id: string; status: 'approved' | 'rejected'; reviewNotes?: string }) =>
      apiService.updateELI5Suggestion(id, { status, reviewNotes }),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Suggestion Updated',
        text2: 'The suggestion status has been updated',
        visibilityTime: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ['eli5-suggestions'] });
    },
    onError: (error: any) => {
      console.error('Error updating suggestion:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.response?.data?.message || 'Please try again',
        visibilityTime: 3000,
      });
    },
  });

  const suggestions: ELI5Suggestion[] = suggestionsData?.data?.suggestions || [];

  const handleApprove = (suggestion: ELI5Suggestion) => {
    Alert.alert(
      'Approve Suggestion',
      'Are you sure you want to approve this ELI5 suggestion? It will replace the current explanation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: () => updateSuggestionMutation.mutate({
            id: suggestion.id,
            status: 'approved',
            reviewNotes: 'Approved by reviewer'
          })
        }
      ]
    );
  };

  const handleReject = (suggestion: ELI5Suggestion) => {
    Alert.alert(
      'Reject Suggestion',
      'Are you sure you want to reject this ELI5 suggestion?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => updateSuggestionMutation.mutate({
            id: suggestion.id,
            status: 'rejected',
            reviewNotes: 'Rejected by reviewer'
          })
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F39C12';
      case 'approved': return '#27AE60';
      case 'rejected': return '#E74C3C';
      default: return '#7F8C8D';
    }
  };

  const renderSuggestion = (suggestion: ELI5Suggestion) => (
    <View key={suggestion.id} style={styles.suggestionCard}>
      <View style={styles.suggestionHeader}>
        <View style={styles.suggestionMeta}>
          <Text style={styles.suggestionTitle}>{suggestion.story.title}</Text>
          <View style={styles.suggestionDetails}>
            <Text style={styles.modeBadge}>
              {suggestion.mode.toUpperCase()}
            </Text>
            <Text style={styles.userText}>by {suggestion.user.username}</Text>
            <Text style={styles.dateText}>{formatDate(suggestion.createdAt)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(suggestion.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(suggestion.status) }]}>
            {suggestion.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.suggestionContent}>
        <Text style={styles.suggestedTextLabel}>Suggested Text:</Text>
        <Text style={styles.suggestedText}>{suggestion.suggestedText}</Text>
        
        {suggestion.explanation && (
          <>
            <Text style={styles.explanationLabel}>Explanation:</Text>
            <Text style={styles.explanationText}>{suggestion.explanation}</Text>
          </>
        )}

        <View style={styles.votesContainer}>
          <View style={styles.voteItem}>
            <Ionicons name="thumbs-up" size={16} color="#27AE60" />
            <Text style={styles.voteText}>{suggestion.upvotes}</Text>
          </View>
          <View style={styles.voteItem}>
            <Ionicons name="thumbs-down" size={16} color="#E74C3C" />
            <Text style={styles.voteText}>{suggestion.downvotes}</Text>
          </View>
          <Text style={styles.netVotesText}>
            Net: {suggestion.netVotes}
          </Text>
        </View>
      </View>

      {suggestion.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApprove(suggestion)}
            disabled={updateSuggestionMutation.isPending}
          >
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleReject(suggestion)}
            disabled={updateSuggestionMutation.isPending}
          >
            <Ionicons name="close" size={16} color="#FFFFFF" />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {suggestion.reviewNotes && (
        <View style={styles.reviewNotes}>
          <Text style={styles.reviewNotesLabel}>Review Notes:</Text>
          <Text style={styles.reviewNotesText}>{suggestion.reviewNotes}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ELI5 Review Panel</Text>
        <Text style={styles.headerSubtitle}>Review community ELI5 suggestions</Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {[
            { key: 'pending', label: 'Pending', icon: 'time' },
            { key: 'approved', label: 'Approved', icon: 'checkmark-circle' },
            { key: 'rejected', label: 'Rejected', icon: 'close-circle' },
            { key: 'all', label: 'All', icon: 'list' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.filterChipSelected,
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={selectedFilter === filter.key ? '#FFFFFF' : '#4ECDC4'}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.key && styles.filterChipTextSelected,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.suggestionsList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Loading suggestions...</Text>
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#E74C3C" />
            <Text style={styles.errorText}>Error loading suggestions</Text>
            <Text style={styles.errorSubtext}>
              {error?.message || 'Something went wrong'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : suggestions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bulb-outline" size={64} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>No Suggestions Found</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'pending' 
                ? 'No pending ELI5 suggestions to review'
                : `No ${selectedFilter} suggestions found`}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} found
              </Text>
            </View>
            {suggestions.map(renderSuggestion)}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
  },
  filterContent: {
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  filterChipSelected: {
    backgroundColor: '#4ECDC4',
  },
  filterChipText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
    marginLeft: 6,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  suggestionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginTop: 12,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#BDC3C7',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  statsContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F8F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  suggestionMeta: {
    flex: 1,
    marginRight: 12,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  suggestionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  modeBadge: {
    backgroundColor: '#4ECDC4',
    color: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 8,
  },
  userText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  suggestionContent: {
    marginBottom: 12,
  },
  suggestedTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  suggestedText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
    marginBottom: 12,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 13,
    color: '#7F8C8D',
    lineHeight: 18,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  votesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  voteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  netVotesText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewNotes: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  reviewNotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 4,
  },
  reviewNotesText: {
    fontSize: 12,
    color: '#2C3E50',
    lineHeight: 16,
  },
});

export default ELI5ReviewScreen;

