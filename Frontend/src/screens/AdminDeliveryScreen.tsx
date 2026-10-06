/**
 * AdminDeliveryScreen — Manage Delivery Personnel
 * 
 * Features:
 * - View all delivery personnel
 * - View pending delivery requests
 * - Accept/Decline delivery requests with reason
 * - Suspend/Activate delivery accounts with reason
 * - Delete delivery personnel with reason
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
  Alert,
  Modal,
  TextInput,
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

const TruckIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 3H15V13H1V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 8H19L23 12V13H15V8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="5.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2" />
    <Circle cx="18.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2" />
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

interface DeliveryPerson {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  accountStatus: string;
  createdAt: string;
}

interface AdminDeliveryScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  goBack?: () => void;
}

const AdminDeliveryScreen: React.FC<AdminDeliveryScreenProps> = ({ navigate, goBack }) => {
  const { mode } = useTheme();
  const { t, isRTL } = useTranslation();
  const COLORS = getColors(mode);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState<DeliveryPerson[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'accept' | 'decline' | 'suspend' | 'delete'>('accept');
  const [selectedPerson, setSelectedPerson] = useState<DeliveryPerson | null>(null);
  const [reason, setReason] = useState('');

  const fetchDeliveryPersonnel = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/admin/delivery-personnel`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDeliveryPersonnel(data.deliveryPersonnel || []);
      }
    } catch (error) {
      console.error('Failed to fetch delivery personnel:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeliveryPersonnel();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDeliveryPersonnel();
  };

  const openModal = (action: 'accept' | 'decline' | 'suspend' | 'delete', person: DeliveryPerson) => {
    setModalAction(action);
    setSelectedPerson(person);
    setReason('');
    setModalVisible(true);
  };

  const handleModalAction = async () => {
    if ((modalAction === 'decline' || modalAction === 'suspend' || modalAction === 'delete') && !reason.trim()) {
      Alert.alert(t('common_error'), t('admin_reasonRequired'));
      return;
    }

    if (!selectedPerson) return;

    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      
      if (modalAction === 'accept') {
        const response = await fetch(`${API_URL}/admin/delivery/${selectedPerson.id}/approve`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          Alert.alert(t('admin_actionSuccess'), t('admin_updateSuccess'));
          setModalVisible(false);
          fetchDeliveryPersonnel();
        } else {
          Alert.alert(t('common_error'), t('admin_actionFailed'));
        }
      } else if (modalAction === 'decline') {
        const response = await fetch(`${API_URL}/admin/delivery/${selectedPerson.id}/reject`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason }),
        });

        if (response.ok) {
          Alert.alert(t('admin_actionSuccess'), t('admin_updateSuccess'));
          setModalVisible(false);
          fetchDeliveryPersonnel();
        } else {
          Alert.alert(t('common_error'), t('admin_actionFailed'));
        }
      } else if (modalAction === 'suspend') {
        const response = await fetch(`${API_URL}/admin/delivery/${selectedPerson.id}/suspend`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason }),
        });

        if (response.ok) {
          Alert.alert(t('admin_actionSuccess'), t('admin_updateSuccess'));
          setModalVisible(false);
          fetchDeliveryPersonnel();
        } else {
          Alert.alert(t('common_error'), t('admin_actionFailed'));
        }
      } else if (modalAction === 'delete') {
        const response = await fetch(`${API_URL}/admin/delivery/${selectedPerson.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason }),
        });

        if (response.ok) {
          Alert.alert(t('admin_actionSuccess'), t('admin_updateSuccess'));
          setModalVisible(false);
          fetchDeliveryPersonnel();
        } else {
          Alert.alert(t('common_error'), t('admin_actionFailed'));
        }
      }
    } catch (error) {
      Alert.alert(t('common_error'), t('admin_actionFailed'));
    }
  };

  const handleActivate = async (person: DeliveryPerson) => {
    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/admin/activate-user/${person.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert(t('admin_actionSuccess'), t('admin_updateSuccess'));
        fetchDeliveryPersonnel();
      } else {
        Alert.alert(t('common_error'), t('admin_actionFailed'));
      }
    } catch (error) {
      Alert.alert(t('common_error'), t('admin_actionFailed'));
    }
  };

  const filteredPersonnel = deliveryPersonnel.filter(person => {
    if (filter === 'all') return true;
    return person.accountStatus === filter;
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
          <Text style={[s.headerTitle, { color: COLORS.text }]}>{t('admin_deliveryTitle')}</Text>
          <Text style={[s.headerSubtitle, { color: COLORS.textSecondary }]}>
            {t('admin_deliveryCount', { count: filteredPersonnel.length })}
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
            {t('admin_filterAll', { count: deliveryPersonnel.length })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.filterTab, filter === 'pending' && { backgroundColor: COLORS.warning + '15' }]}
          onPress={() => setFilter('pending')}
          activeOpacity={0.7}
        >
          <Text style={[s.filterTabText, { color: filter === 'pending' ? COLORS.warning : COLORS.textSecondary }]}>
            {t('admin_filterPending', { count: deliveryPersonnel.filter(p => p.accountStatus === 'pending').length })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.filterTab, filter === 'active' && { backgroundColor: '#10B981' + '15' }]}
          onPress={() => setFilter('active')}
          activeOpacity={0.7}
        >
          <Text style={[s.filterTabText, { color: filter === 'active' ? '#10B981' : COLORS.textSecondary }]}>
            {t('admin_filterActive', { count: deliveryPersonnel.filter(p => p.accountStatus === 'active').length })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.filterTab, filter === 'suspended' && { backgroundColor: COLORS.error + '15' }]}
          onPress={() => setFilter('suspended')}
          activeOpacity={0.7}
        >
          <Text style={[s.filterTabText, { color: filter === 'suspended' ? COLORS.error : COLORS.textSecondary }]}>
            {t('admin_filterSuspended', { count: deliveryPersonnel.filter(p => p.accountStatus === 'suspended').length })}
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
        {filteredPersonnel.length === 0 ? (
          <View style={s.emptyState}>
            <TruckIcon color={COLORS.textMuted} size={48} />
            <Text style={[s.emptyTitle, { color: COLORS.text }]}>{t('admin_noDeliveryFound')}</Text>
            <Text style={[s.emptyDesc, { color: COLORS.textSecondary }]}>
              {filter === 'all' ? t('admin_noDeliveryAll') : filter === 'pending' ? t('admin_noDeliveryPending') : filter === 'active' ? t('admin_noDeliveryActive') : t('admin_noDeliverySuspended')}
            </Text>
          </View>
        ) : (
          filteredPersonnel.map((person) => (
            <View key={person.id} style={[s.personCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={s.personHeader}>
                <View style={[s.personIcon, { backgroundColor: '#F59E0B' + '15' }]}>
                  <TruckIcon color="#F59E0B" size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.personName, { color: COLORS.text }]}>{person.fullName}</Text>
                  <Text style={[s.personEmail, { color: COLORS.textSecondary }]}>{person.email}</Text>
                  {person.phone && (
                    <Text style={[s.personPhone, { color: COLORS.textSecondary }]}>{person.phone}</Text>
                  )}
                </View>
                <View
                  style={[
                    s.statusBadge,
                    {
                      backgroundColor:
                        person.accountStatus === 'active'
                          ? '#10B981' + '15'
                          : person.accountStatus === 'suspended'
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
                          person.accountStatus === 'active'
                            ? '#10B981'
                            : person.accountStatus === 'suspended'
                            ? COLORS.error
                            : COLORS.warning,
                      },
                    ]}
                  >
                    {person.accountStatus === 'active' ? t('admin_statusActive') :
                     person.accountStatus === 'suspended' ? t('admin_statusSuspended') :
                     t('admin_statusPending')}
                  </Text>
                </View>
              </View>

              <View style={[s.divider, { backgroundColor: COLORS.border }]} />

              <View style={s.personDetails}>
                <View style={s.detailRow}>
                  <Text style={[s.detailLabel, { color: COLORS.textSecondary }]}>{t('admin_joined')}</Text>
                  <Text style={[s.detailValue, { color: COLORS.text }]}>
                    {new Date(person.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={s.personActions}>
                {person.accountStatus === 'pending' ? (
                  <>
                    <TouchableOpacity
                      style={[s.actionButton, { backgroundColor: '#10B981' + '15', borderColor: '#10B981' + '30' }]}
                      onPress={() => openModal('accept', person)}
                      activeOpacity={0.7}
                    >
                      <CheckIcon color="#10B981" size={16} />
                      <Text style={[s.actionButtonText, { color: '#10B981' }]}>{t('admin_accept')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.actionButton, { backgroundColor: COLORS.error + '15', borderColor: COLORS.error + '30' }]}
                      onPress={() => openModal('decline', person)}
                      activeOpacity={0.7}
                    >
                      <XIcon color={COLORS.error} size={16} />
                      <Text style={[s.actionButtonText, { color: COLORS.error }]}>{t('admin_decline')}</Text>
                    </TouchableOpacity>
                  </>
                ) : person.accountStatus === 'active' ? (
                  <>
                    <TouchableOpacity
                      style={[s.actionButton, { backgroundColor: COLORS.error + '15', borderColor: COLORS.error + '30' }]}
                      onPress={() => openModal('suspend', person)}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.actionButtonText, { color: COLORS.error }]}>{t('admin_suspendDelivery')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.actionButton, { backgroundColor: COLORS.error + '10', borderColor: COLORS.error + '20' }]}
                      onPress={() => openModal('delete', person)}
                      activeOpacity={0.7}
                    >
                      <TrashIcon color={COLORS.error} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[s.actionButton, { backgroundColor: '#10B981' + '15', borderColor: '#10B981' + '30' }]}
                      onPress={() => handleActivate(person)}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.actionButtonText, { color: '#10B981' }]}>{t('admin_activateDelivery')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.actionButton, { backgroundColor: COLORS.error + '10', borderColor: COLORS.error + '20' }]}
                      onPress={() => openModal('delete', person)}
                      activeOpacity={0.7}
                    >
                      <TrashIcon color={COLORS.error} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ─── Reason Modal ────────────────────────────── */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: COLORS.surface }]}>
            <Text style={[s.modalTitle, { color: COLORS.text }]}>
              {modalAction === 'accept' ? t('admin_approveDelivery') :
               modalAction === 'decline' ? t('admin_declineDelivery') :
               modalAction === 'suspend' ? t('admin_suspendDeliveryTitle') :
               t('admin_deleteDelivery')}
            </Text>
            <Text style={[s.modalMessage, { color: COLORS.textSecondary }]}>
              {modalAction === 'accept' ? t('admin_approveSellerMsg') :
               modalAction === 'decline' ? t('admin_provideReason') :
               modalAction === 'suspend' ? t('admin_suspendDeliveryMsg', { name: selectedPerson?.fullName || '' }) :
               t('admin_deleteStoreMsg', { name: selectedPerson?.fullName || '' })}
            </Text>
            {modalAction !== 'accept' && (
              <TextInput
                style={[s.reasonInput, { backgroundColor: COLORS.background, color: COLORS.text, borderColor: COLORS.border }]}
                placeholder={t('admin_provideReason')}
                placeholderTextColor={COLORS.textMuted}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
              />
            )}
            <View style={s.modalActions}>
              <TouchableOpacity
                style={[s.modalButton, { backgroundColor: COLORS.background }]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[s.modalButtonText, { color: COLORS.text }]}>{t('admin_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalButton, { backgroundColor: modalAction === 'accept' ? '#10B981' : COLORS.error }]}
                onPress={handleModalAction}
                activeOpacity={0.7}
              >
                <Text style={[s.modalButtonText, { color: '#FFFFFF' }]}>{t('admin_confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AdminBottomNav activeTab="delivery" onTabPress={(tab) => {
        if (tab === 'dashboard') navigate?.('adminDashboard');
        if (tab === 'stores') navigate?.('adminStores');
        if (tab === 'sellers') navigate?.('adminSellers');
        if (tab === 'products') navigate?.('adminProducts');
      }} />
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

  filterTabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  filterTabText: { fontSize: 12, fontWeight: '700' },

  personCard: { borderRadius: 18, padding: 16, borderWidth: 1, marginBottom: 12 },
  personHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  personIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  personName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  personEmail: { fontSize: 13, marginBottom: 2 },
  personPhone: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },

  divider: { height: 1, marginVertical: 12 },

  personDetails: { marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  detailLabel: { fontSize: 13, fontWeight: '600', width: 70 },
  detailValue: { fontSize: 13, flex: 1 },

  personActions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  actionButtonText: { fontSize: 14, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalMessage: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
  reasonInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 16, minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonText: { fontSize: 15, fontWeight: '700' },
});

export default AdminDeliveryScreen;
