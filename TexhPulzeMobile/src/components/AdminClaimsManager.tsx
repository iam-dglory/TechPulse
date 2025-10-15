import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';
import Toast from 'react-native-toast-message';

interface Claim {
  id: string;
  companyName: string;
  officialEmail: string;
  websiteUrl: string;
  contactPerson: string;
  verificationMethod: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewNotes?: string;
  company?: {
    id: string;
    name: string;
    verified: boolean;
  };
  user: {
    id: string;
    username: string;
    email: string;
  };
}

interface AdminClaimsManagerProps {
  authToken: string;
}

const AdminClaimsManager: React.FC<AdminClaimsManagerProps> = ({ authToken }) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    try {
      // Note: In a real app, you'd use the proper API service method
      const response = await fetch('https://texhpulze.onrender.com/api/admin/claims', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setClaims(data.data.claims);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch claims',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    try {
      const response = await fetch(`https://texhpulze.onrender.com/api/admin/claims/${claimId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewNotes: reviewNotes || 'Claim approved by admin',
        }),
      });

      const data = await response.json();
      if (data.success) {
        Toast.show({
          type: 'success',
          text1: 'Claim Approved',
          text2: 'Company has been verified',
        });
        setShowModal(false);
        setReviewNotes('');
        fetchClaims(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error approving claim:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to approve claim',
      });
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    try {
      const response = await fetch(`https://texhpulze.onrender.com/api/admin/claims/${claimId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewNotes: reviewNotes || 'Claim rejected by admin',
        }),
      });

      const data = await response.json();
      if (data.success) {
        Toast.show({
          type: 'success',
          text1: 'Claim Rejected',
          text2: 'User has been notified',
        });
        setShowModal(false);
        setReviewNotes('');
        fetchClaims(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error rejecting claim:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to reject claim',
      });
    }
  };

  const openClaimModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F39C12';
      case 'approved': return '#27AE60';
      case 'rejected': return '#E74C3C';
      default: return '#7F8C8D';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time';
      case 'approved': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  React.useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Company Claims Manager</Text>
        <TouchableOpacity onPress={fetchClaims} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#4ECDC4" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Loading claims...</Text>
        </View>
      ) : (
        <ScrollView style={styles.claimsList} showsVerticalScrollIndicator={false}>
          {claims.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color="#BDC3C7" />
              <Text style={styles.emptyText}>No claims found</Text>
            </View>
          ) : (
            claims.map((claim) => (
              <TouchableOpacity
                key={claim.id}
                style={styles.claimCard}
                onPress={() => openClaimModal(claim)}
              >
                <View style={styles.claimHeader}>
                  <Text style={styles.companyName}>{claim.companyName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) + '20' }]}>
                    <Ionicons 
                      name={getStatusIcon(claim.status)} 
                      size={14} 
                      color={getStatusColor(claim.status)} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(claim.status) }]}>
                      {claim.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.claimDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="person" size={16} color="#7F8C8D" />
                    <Text style={styles.detailText}>{claim.contactPerson}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="mail" size={16} color="#7F8C8D" />
                    <Text style={styles.detailText}>{claim.officialEmail}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="globe" size={16} color="#7F8C8D" />
                    <Text style={styles.detailText}>{claim.websiteUrl}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#7F8C8D" />
                    <Text style={styles.detailText}>
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {claim.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => {
                        setSelectedClaim(claim);
                        setShowModal(true);
                      }}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => {
                        setSelectedClaim(claim);
                        setShowModal(true);
                      }}
                    >
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Review Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Review Claim: {selectedClaim?.companyName}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#7F8C8D" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.notesLabel}>Review Notes (Optional)</Text>
              <View style={styles.notesContainer}>
                <Text style={styles.notesPlaceholder}>
                  Add any notes about your decision...
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.rejectModalButton]}
                onPress={() => selectedClaim && handleRejectClaim(selectedClaim.id)}
              >
                <Text style={styles.modalButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.approveModalButton]}
                onPress={() => selectedClaim && handleApproveClaim(selectedClaim.id)}
              >
                <Text style={styles.modalButtonText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 12,
  },
  claimsList: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 12,
  },
  claimCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  claimDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#27AE60',
  },
  rejectButton: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  modalBody: {
    padding: 20,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  notesContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
  },
  notesPlaceholder: {
    fontSize: 14,
    color: '#BDC3C7',
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectModalButton: {
    backgroundColor: '#E74C3C',
  },
  approveModalButton: {
    backgroundColor: '#27AE60',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AdminClaimsManager;
