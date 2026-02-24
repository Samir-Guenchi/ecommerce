/**
 * AdminSellersScreen — Manage All Sellers
 * 
 * Features:
 * - View all sellers and their stores
 * - View seller registration status
 * - Review pending seller documents
 * - Accept/Decline seller registrations with reason
 * - Suspend/Activate seller accounts
 * - Delete sellers with reason
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import AdminBottomNav, { AdminTabId } from './AdminBottomNav';
import { API_URL } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BackArrowIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19L5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const StoreIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9L12 2L21 9V20C21 20.53 20.79 21.04 20.41 21.41C20.04 21.79 19.53 22 19 22H5C4.47 22 3.96 21.79 3.59 21.41C3.21 21.04 3 20.53 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FileTextIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const XIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H5H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface Seller {
  id: number;
  email: string;
  fullName: string;
  accountStatus: string;
  createdAt: string;
  sellerRegistration?: {
    id: number;
    verificationStatus: string;
    rejectionReason?: string;
    businessName?: string;
    businessAddress?: string;
    taxId?: string;
    document1Path?: string;
    document2Path?: string;
    document3Path?: string;
  };
  stores: Array<{
    id: number;
    name: string;
    status: string;
  }>;
}

interface AdminSellersScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  goBack?: () => void;
}

const AdminSellersScreen: React.FC<AdminSellersScreenProps> = ({ navigate, goBack }) => {
  const { mode } = useTheme();
  const { t, isRTL } = useTranslation();
  const COLORS = getColors(mode);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'active' | 'suspended'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'suspend' | 'delete'>('approve');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [reason, setReason] = useState('');
  const [expandedSeller, setExpandedSeller] = useState<number | null>(null);

  // Safe document opening with validation
  const openDocument = (url: string | null | undefined, docName: string) => {
    // Comprehensive URL validation
    if (!url || 
        url === 'null' || 
        url === 'undefined' || 
        url === '' || 
        typeof url !== 'string' ||
        url.trim().length === 0) {
      Alert.alert(
        t('admin_error') || 'Error', 
        t('admin_docNotAvailable') || `${docName} path not available. This registration may have been created before the file upload system was configured. Please ask the user to resubmit their documents.`
      );
      return;
    }

    const fullUrl = url.startsWith('http') ? url : `${API_URL.replace('/api', '')}/${url}`;
    
    // Check if it's an image
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
    
    if (isImage) {
      // For images, open in new tab (could be enhanced with modal viewer)
      if (typeof window !== 'undefined') {
        window.open(fullUrl, '_blank');
      }
    } else {
      // Open PDF or other documents
      Linking.openURL(fullUrl).catch((err) => {
        console.error('Failed to open document:', err);
        Alert.alert(
          t('admin_error') || 'Error', 
          t('admin_docOpenFailed') || 'Unable to open document. Please check if the file exists on the server.'
        );
      });
    }
  };

  const fetchSellers = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/admin/sellers`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSellers(data.sellers || []);
      }
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSellers();
  };

  const handleTab = (tab: AdminTabId) => {
    if (tab === 'sellers') return;
    if (tab === 'dashboard') navigate?.('adminDashboard');
    if (tab === 'stores') navigate?.('adminStores');
    if (tab === 'delivery') navigate?.('adminDelivery');
    if (tab === 'products') navigate?.('adminProducts');
  };

  const handleApproveReject = async () => {
    if (!selectedSeller?.sellerRegistration) return;
    
    if (modalAction === 'reject' && !reason.trim()) {
      Alert.alert('Error', t('admin_reasonRequired'));
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      const endpoint = modalAction === 'approve' ? 'approve' : 'reject';
      const response = await fetch(`${API_URL}/admin/registrations/${selectedSeller.sellerRegistration.id}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: modalAction === 'reject' ? JSON.stringify({ reason }) : undefined,
      });

      if (response.ok) {
        Alert.alert('Success', `Seller ${modalAction}d successfully`);
        setModalVisible(false);
        setReason('');
        setSelectedSeller(null);
        fetchSellers();
      } else {
        Alert.alert('Error', `Failed to ${modalAction} seller`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${modalAction} seller`);
    }
  };

  const handleSuspendDelete = async () => {
    if (!selectedSeller || !reason.trim()) {
      Alert.alert('Error', t('admin_reasonRequired'));
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      const endpoint = modalAction === 'suspend' ? `sellers/${selectedSeller.id}/suspend` : `sellers/${selectedSeller.id}`;
      const method = modalAction === 'suspend' ? 'PATCH' : 'DELETE';
      
      const response = await fetch(`${API_URL}/admin/${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        Alert.alert('Success', `Seller ${modalAction}d successfully`);
        setModalVisible(false);
        setReason('');
        setSelectedSeller(null);
        fetchSellers();
      } else {
        Alert.alert('Error', `Failed to ${modalAction} seller`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${modalAction} seller`);
    }
  };

  const handleToggleStatus = async (seller: Seller) => {
    const newStatus = seller.accountStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'Suspend' : 'Activate';

    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      const endpoint = newStatus === 'suspended' ? 'suspend-user' : 'activate-user';
      const url = `${API_URL}/admin/${endpoint}/${seller.id}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        fetchSellers();
      } else {
        const errorMsg = responseData.error || 'Failed to update seller status';
        if (Platform.OS === 'web') {
          alert(`Error: ${errorMsg}`);
        } else {
          Alert.alert('Error', errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = `Failed to update seller status: ${error.message}`;
      if (Platform.OS === 'web') {
        alert(errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const filteredSellers = sellers.filter(seller => {
    if (filter === 'all') return true;
    if (filter === 'pending') return seller.sellerRegistration?.verificationStatus === 'pending';
    if (filter === 'approved') return seller.sellerRegistration?.verificationStatus === 'approved';
    if (filter === 'active') return seller.accountStatus === 'active';
    if (filter === 'suspended') return seller.accountStatus === 'suspended';
    return true;
  });

  if (loading) {
    return (
      <View style={[s.outer, { backgroundColor: COLORS.background }, s.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[s.outer, { backgroundColor: COLORS.background }]}>
      {/* ─── Header ────────────────────────────── */}
      <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
          onPress={goBack}
          activeOpacity={0.7}
        >
          <BackArrowIcon color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, { color: COLORS.text }]}>{t('admin_sellersTitle')}</Text>
          <Text style={[s.headerSubtitle, { color: COLORS.textSecondary }]}>
            {t('admin_sellersCount', { count: filteredSellers.length })}
          </Text>
        </View>
      </View>

      {/* ─── Filter Tabs ────────────────────────────── */}
      <View style={[s.filterTabs, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity
          style={[s.filterTab, filter === 'all' && { backgroundColor: COLORS.primary + '15' }]}
          onPress={() => setFilter('all')}
          activeOpacity={0.7}
        >
          <Text style={[s.filterTabText, { color: filter === 'all' ? COLORS.primary : COLORS.textSecondary }]}>
            {t('admin_filterAll', { count: sellers.length })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.filterTab, filter === 'pending' && { backgroundColor: COLORS.warning + '15' }]}
          onPress={() => setFilter('pending')}
          activeOpacity={0.7}
        >
          <Text style={[s.filterTabText, { color: filter === 'pending' ? COLORS.warning : COLORS.textSecondary }]}>
            {t('admin_filterPending', { count: sellers.filter(s => s.sellerRegistration?.verificationStatus === 'pending').length })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.filterTab, filter === 'active' && { backgroundColor: '#10B981' + '15' }]}
          onPress={() => setFilter('active')}
          activeOpacity={0.7}
        >
          <Text style={[s.filterTabText, { color: filter === 'active' ? '#10B981' : COLORS.textSecondary }]}>
            {t('admin_filterActive', { count: sellers.filter(s => s.accountStatus === 'active').length })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.filterTab, filter === 'suspended' && { backgroundColor: COLORS.error + '15' }]}
          onPress={() => setFilter('suspended')}
          activeOpacity={0.7}
        >
          <Text style={[s.filterTabText, { color: filter === 'suspended' ? COLORS.error : COLORS.textSecondary }]}>
            {t('admin_filterSuspended', { count: sellers.filter(s => s.accountStatus === 'suspended').length })}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        {filteredSellers.length === 0 ? (
          <View style={s.emptyState}>
            <StoreIcon color={COLORS.textMuted} size={48} />
            <Text style={[s.emptyTitle, { color: COLORS.text }]}>{t('admin_noSellersFound')}</Text>
            <Text style={[s.emptyDesc, { color: COLORS.textSecondary }]}>
              {filter === 'all' ? t('admin_noSellersAll') : `No ${filter} sellers found`}
            </Text>
          </View>
        ) : (
          filteredSellers.map((seller) => (
            <View key={seller.id} style={[s.sellerCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={s.sellerHeader}>
                <View style={[s.sellerIcon, { backgroundColor: '#10B981' + '15' }]}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#10B981' }}>
                    {seller.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.sellerName, { color: COLORS.text }]}>{seller.fullName}</Text>
                  <Text style={[s.sellerEmail, { color: COLORS.textSecondary }]}>{seller.email}</Text>
                </View>
                <View
                  style={[
                    s.statusBadge,
                    {
                      backgroundColor:
                        seller.accountStatus === 'active'
                          ? '#10B981' + '15'
                          : seller.accountStatus === 'suspended'
                          ? COLORS.error + '15'
                          : COLORS.warning + '15',
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.statusText,
                      {
                        color:
                          seller.accountStatus === 'active'
                            ? '#10B981'
                            : seller.accountStatus === 'suspended'
                            ? COLORS.error
                            : COLORS.warning,
                      },
                    ]}
                  >
                    {seller.accountStatus.charAt(0).toUpperCase() + seller.accountStatus.slice(1)}
                  </Text>
                </View>
              </View>

              {seller.sellerRegistration && (
                <View style={[s.verificationBadge, { backgroundColor: COLORS.background }]}>
                  <Text style={[s.verificationLabel, { color: COLORS.textSecondary }]}>{t('admin_verification')}</Text>
                  <Text
                    style={[
                      s.verificationStatus,
                      {
                        color:
                          seller.sellerRegistration.verificationStatus === 'approved'
                            ? '#10B981'
                            : seller.sellerRegistration.verificationStatus === 'rejected'
                            ? COLORS.error
                            : COLORS.warning,
                      },
                    ]}
                  >
                    {seller.sellerRegistration.verificationStatus.charAt(0).toUpperCase() +
                      seller.sellerRegistration.verificationStatus.slice(1)}
                  </Text>
                </View>
              )}

              {/* Documents Section for Pending Sellers */}
              {seller.sellerRegistration?.verificationStatus === 'pending' && (
                <View style={[s.documentsSection, { backgroundColor: COLORS.background }]}>
                  <TouchableOpacity
                    style={s.documentsHeader}
                    onPress={() => setExpandedSeller(expandedSeller === seller.id ? null : seller.id)}
                  >
                    <FileTextIcon color={COLORS.primary} />
                    <Text style={[s.documentsTitle, { color: COLORS.text }]}>{t('admin_documents')}</Text>
                    <Text style={[s.expandText, { color: COLORS.primary }]}>
                      {expandedSeller === seller.id ? t('admin_hideDocuments') : t('admin_viewDocuments')}
                    </Text>
                  </TouchableOpacity>
                  
                  {expandedSeller === seller.id && (
                    <View style={s.documentsList}>
                      {seller.sellerRegistration.document1Path && (
                        <TouchableOpacity
                          style={[s.documentItem, { backgroundColor: COLORS.surface }]}
                          onPress={() => openDocument(seller.sellerRegistration!.document1Path, 'Business License')}
                        >
                          <FileTextIcon color={COLORS.textMuted} size={16} />
                          <Text style={[s.documentName, { color: COLORS.text }]}>{t('admin_businessLicense')}</Text>
                        </TouchableOpacity>
                      )}
                      {seller.sellerRegistration.document2Path && (
                        <TouchableOpacity
                          style={[s.documentItem, { backgroundColor: COLORS.surface }]}
                          onPress={() => openDocument(seller.sellerRegistration!.document2Path, 'Tax ID')}
                        >
                          <FileTextIcon color={COLORS.textMuted} size={16} />
                          <Text style={[s.documentName, { color: COLORS.text }]}>{t('admin_taxId')}</Text>
                        </TouchableOpacity>
                      )}
                      {seller.sellerRegistration.document3Path && (
                        <TouchableOpacity
                          style={[s.documentItem, { backgroundColor: COLORS.surface }]}
                          onPress={() => openDocument(seller.sellerRegistration!.document3Path, 'Additional Document')}
                        >
                          <FileTextIcon color={COLORS.textMuted} size={16} />
                          <Text style={[s.documentName, { color: COLORS.text }]}>{t('admin_additionalDoc')}</Text>
                        </TouchableOpacity>
                      )}
                      {!seller.sellerRegistration.document1Path && !seller.sellerRegistration.document2Path && !seller.sellerRegistration.document3Path && (
                        <Text style={[s.noDocuments, { color: COLORS.textMuted }]}>{t('admin_noDocuments')}</Text>
                      )}
                    </View>
                  )}
                </View>
              )}

              <View style={[s.divider, { backgroundColor: COLORS.border }]} />

              <View style={s.storesSection}>
                <Text style={[s.storesTitle, { color: COLORS.text }]}>
                  {t('admin_storesOwned', { count: seller.stores.length })}
                </Text>
                {seller.stores.length === 0 ? (
                  <Text style={[s.noStores, { color: COLORS.textSecondary }]}>{t('admin_noStoresCreated')}</Text>
                ) : (
                  seller.stores.map((store) => (
                    <View key={store.id} style={[s.storeItem, { backgroundColor: COLORS.background }]}>
                      <StoreIcon color={COLORS.primary} size={16} />
                      <Text style={[s.storeName, { color: COLORS.text }]}>{store.name}</Text>
                      <View
                        style={[
                          s.storeStatusDot,
                          { backgroundColor: store.status === 'active' ? '#10B981' : COLORS.warning },
                        ]}
                      />
                    </View>
                  ))
                )}
              </View>

              <View style={s.sellerActions}>
                {seller.sellerRegistration?.verificationStatus === 'pending' ? (
                  <>
                    <TouchableOpacity
                      style={[s.actionButton, { backgroundColor: '#10B981' + '15', borderColor: '#10B981' + '30', flex: 1 }]}
                      onPress={() => {
                        setSelectedSeller(seller);
                        setModalAction('approve');
                        setModalVisible(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <CheckIcon color="#10B981" />
                      <Text style={[s.actionButtonText, { color: '#10B981' }]}>{t('admin_accept')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.actionButton, { backgroundColor: COLORS.error + '15', borderColor: COLORS.error + '30', flex: 1 }]}
                      onPress={() => {
                        setSelectedSeller(seller);
                        setModalAction('reject');
                        setModalVisible(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <XIcon color={COLORS.error} />
                      <Text style={[s.actionButtonText, { color: COLORS.error }]}>{t('admin_decline')}</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {seller.accountStatus === 'suspended' ? (
                      <TouchableOpacity
                        style={[s.actionButton, { backgroundColor: '#10B981' + '15', borderColor: '#10B981' + '30', flex: 1 }]}
                        onPress={() => handleToggleStatus(seller)}
                        activeOpacity={0.7}
                      >
                        <CheckIcon color="#10B981" />
                        <Text style={[s.actionButtonText, { color: '#10B981' }]}>{t('admin_activateSeller')}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[s.actionButton, { backgroundColor: COLORS.warning + '15', borderColor: COLORS.warning + '30', flex: 1 }]}
                        onPress={() => {
                          setSelectedSeller(seller);
                          setModalAction('suspend');
                          setModalVisible(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.actionButtonText, { color: COLORS.warning }]}>{t('admin_suspendSeller')}</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[s.actionButton, { backgroundColor: COLORS.error + '15', borderColor: COLORS.error + '30', flex: 1 }]}
                      onPress={() => {
                        setSelectedSeller(seller);
                        setModalAction('delete');
                        setModalVisible(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <TrashIcon color={COLORS.error} />
                      <Text style={[s.actionButtonText, { color: COLORS.error }]}>{t('admin_deleteSeller')}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: COLORS.surface }]}>
            <Text style={[s.modalTitle, { color: COLORS.text }]}>
              {modalAction === 'approve' ? t('admin_approveSeller') :
               modalAction === 'reject' ? t('admin_declineSeller') :
               modalAction === 'suspend' ? t('admin_suspendSeller') : t('admin_deleteSeller')}
            </Text>
            <Text style={[s.modalDesc, { color: COLORS.textMuted }]}>
              {modalAction === 'approve' 
                ? t('admin_approveSellerMsg', { name: selectedSeller?.fullName || '' })
                : `Please provide a reason to ${modalAction} ${selectedSeller?.fullName || ''}`}
            </Text>
            
            {modalAction !== 'approve' && (
              <TextInput
                style={[s.reasonInput, { backgroundColor: COLORS.background, color: COLORS.text, borderColor: COLORS.border }]}
                placeholder={t('admin_enterReason')}
                placeholderTextColor={COLORS.textMuted}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
              />
            )}

            <View style={s.modalActions}>
              <TouchableOpacity
                style={[s.modalBtn, { backgroundColor: COLORS.background }]}
                onPress={() => {
                  setModalVisible(false);
                  setReason('');
                  setSelectedSeller(null);
                }}
              >
                <Text style={[s.modalBtnText, { color: COLORS.text }]}>{t('admin_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, { 
                  backgroundColor: modalAction === 'approve' ? '#10B981' : 
                                   modalAction === 'reject' ? COLORS.error :
                                   modalAction === 'suspend' ? COLORS.warning : COLORS.error
                }]}
                onPress={modalAction === 'approve' || modalAction === 'reject' ? handleApproveReject : handleSuspendDelete}
              >
                <Text style={[s.modalBtnText, { color: '#FFF' }]}>
                  {modalAction === 'approve' ? t('admin_approve') :
                   modalAction === 'reject' ? t('admin_decline') :
                   modalAction === 'suspend' ? t('admin_suspend') : t('admin_deleteSeller')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AdminBottomNav activeTab="sellers" onTabPress={handleTab} />
    </View>
  );
};

const s = StyleSheet.create({
  outer: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, marginTop: 2 },

  filterTabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  filterTabText: { fontSize: 13, fontWeight: '700' },

  sellerCard: { borderRadius: 18, padding: 16, borderWidth: 1, marginBottom: 12 },
  sellerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  sellerIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sellerName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  sellerEmail: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },

  verificationBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 12 },
  verificationLabel: { fontSize: 13, fontWeight: '600' },
  verificationStatus: { fontSize: 13, fontWeight: '700' },

  divider: { height: 1, marginVertical: 12 },

  storesSection: { marginBottom: 12 },
  storesTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  noStores: { fontSize: 13, fontStyle: 'italic' },
  storeItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 6 },
  storeName: { flex: 1, fontSize: 13, fontWeight: '600' },
  storeStatusDot: { width: 8, height: 8, borderRadius: 4 },

  sellerActions: { flexDirection: 'row', gap: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  actionButtonText: { fontSize: 14, fontWeight: '700' },

  documentsSection: { padding: 12, borderRadius: 12, marginBottom: 12 },
  documentsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  documentsTitle: { flex: 1, fontSize: 14, fontWeight: '700' },
  expandText: { fontSize: 13, fontWeight: '600' },
  documentsList: { marginTop: 12, gap: 8 },
  documentItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10 },
  documentName: { fontSize: 13, fontWeight: '600' },
  noDocuments: { fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalDesc: { fontSize: 14, fontWeight: '600', marginBottom: 16, lineHeight: 20 },
  reasonInput: { borderRadius: 12, padding: 12, fontSize: 14, borderWidth: 1, marginBottom: 20, minHeight: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center' },
});

export default AdminSellersScreen;
