/**
 * AdminStoresScreen — Manage All Platform Stores
 * 
 * Features:
 * - View all stores from all users
 * - Suspend/Activate stores with reason
 * - Delete stores with reason
 * - View store owner information
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

const StoreIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9L12 2L21 9V20C21 20.53 20.79 21.04 20.41 21.41C20.04 21.79 19.53 22 19 22H5C4.47 22 3.96 21.79 3.59 21.41C3.21 21.04 3 20.53 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H5H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface Store {
  id: number;
  name: string;
  location: string;
  domain: string;
  status: 'active' | 'draft' | 'suspended';
  createdAt: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    accountStatus: string;
  };
}

interface AdminStoresScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  goBack?: () => void;
}

const AdminStoresScreen: React.FC<AdminStoresScreenProps> = ({ navigate, goBack }) => {
  const { mode } = useTheme();
  const { t, isRTL } = useTranslation();
  const COLORS = getColors(mode);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'suspend' | 'delete'>('suspend');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [reason, setReason] = useState('');

  const fetchStores = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/admin/stores`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores || []);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStores();
  };

  const openModal = (action: 'suspend' | 'delete', store: Store) => {
    setModalAction(action);
    setSelectedStore(store);
    setReason('');
    setModalVisible(true);
  };

  const handleModalAction = async () => {
    if (!reason.trim()) {
      Alert.alert(t('common_error'), t('admin_reasonRequired'));
      return;
    }

    if (!selectedStore) return;

    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      
      if (modalAction === 'suspend') {
        const response = await fetch(`${API_URL}/admin/stores/${selectedStore.id}/suspend`, {
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
          fetchStores();
        } else {
          Alert.alert(t('common_error'), t('admin_actionFailed'));
        }
      } else if (modalAction === 'delete') {
        const response = await fetch(`${API_URL}/admin/stores/${selectedStore.id}`, {
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
          fetchStores();
        } else {
          Alert.alert(t('common_error'), t('admin_actionFailed'));
        }
      }
    } catch (error) {
      Alert.alert(t('common_error'), t('admin_actionFailed'));
    }
  };

  const handleActivate = async (store: Store) => {
    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/admin/stores/${store.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'active' }),
      });

      if (response.ok) {
        Alert.alert(t('admin_actionSuccess'), t('admin_updateSuccess'));
        fetchStores();
      } else {
        Alert.alert(t('common_error'), t('admin_actionFailed'));
      }
    } catch (error) {
      Alert.alert(t('common_error'), t('admin_actionFailed'));
    }
  };

  const filteredStores = stores.filter(store => {
    if (filter === 'all') return true;
    return store.status === filter;
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
          <Text style={[s.headerTitle, { color: COLORS.text }]}>{t('admin_stores')}</Text>
          <Text style={[s.headerSubtitle, { color: COLORS.textSecondary }]}>
            {t('admin_storesCount', { count: filteredStores.length })}
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
            {t('admin_filterAll', { count: stores.length })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.filterTab, filter === 'active' && { backgroundColor: '#10B981' + '15' }]}
          onPress={() => setFilter('active')}
          activeOpacity={0.7}
        >
          <Text style={[s.filterTabText, { color: filter === 'active' ? '#10B981' : COLORS.textSecondary }]}>
            {t('admin_filterActive', { count: stores.filter(s => s.status === 'active').length })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.filterTab, filter === 'suspended' && { backgroundColor: COLORS.error + '15' }]}
          onPress={() => setFilter('suspended')}
          activeOpacity={0.7}
        >
          <Text style={[s.filterTabText, { color: filter === 'suspended' ? COLORS.error : COLORS.textSecondary }]}>
            {t('admin_filterSuspended', { count: stores.filter(s => s.status === 'suspended').length })}
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
        {filteredStores.length === 0 ? (
          <View style={s.emptyState}>
            <StoreIcon color={COLORS.textMuted} size={48} />
            <Text style={[s.emptyTitle, { color: COLORS.text }]}>{t('admin_noStoresFound')}</Text>
            <Text style={[s.emptyDesc, { color: COLORS.textSecondary }]}>
              {filter === 'all' ? t('admin_noStoresAll') : filter === 'active' ? t('admin_noStoresActive') : t('admin_noStoresSuspended')}
            </Text>
          </View>
        ) : (
          filteredStores.map((store) => (
            <View key={store.id} style={[s.storeCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={s.storeHeader}>
                <View style={[s.storeIcon, { backgroundColor: COLORS.primary + '15' }]}>
                  <StoreIcon color={COLORS.primary} size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.storeName, { color: COLORS.text }]}>{store.name}</Text>
                  <Text style={[s.storeLocation, { color: COLORS.textSecondary }]}>{store.location}</Text>
                </View>
                <View
                  style={[
                    s.statusBadge,
                    {
                      backgroundColor:
                        store.status === 'active'
                          ? '#10B981' + '15'
                          : store.status === 'suspended'
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
                          store.status === 'active'
                            ? '#10B981'
                            : store.status === 'suspended'
                            ? COLORS.error
                            : COLORS.warning,
                      },
                    ]}
                  >
                    {store.status === 'active' ? t('admin_statusActive') :
                     store.status === 'suspended' ? t('admin_statusSuspended') :
                     t('admin_statusDraft')}
                  </Text>
                </View>
              </View>

              <View style={[s.divider, { backgroundColor: COLORS.border }]} />

              <View style={s.storeDetails}>
                <View style={s.detailRow}>
                  <Text style={[s.detailLabel, { color: COLORS.textSecondary }]}>{t('admin_storeOwner')}</Text>
                  <Text style={[s.detailValue, { color: COLORS.text }]}>{store.user.fullName}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={[s.detailLabel, { color: COLORS.textSecondary }]}>{t('admin_storeEmail')}</Text>
                  <Text style={[s.detailValue, { color: COLORS.text }]}>{store.user.email}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={[s.detailLabel, { color: COLORS.textSecondary }]}>{t('admin_storeDomain')}</Text>
                  <Text style={[s.detailValue, { color: COLORS.primary }]}>{store.domain}</Text>
                </View>
              </View>

              <View style={s.storeActions}>
                {store.status === 'active' ? (
                  <TouchableOpacity
                    style={[s.actionButton, { backgroundColor: COLORS.error + '15', borderColor: COLORS.error + '30' }]}
                    onPress={() => openModal('suspend', store)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.actionButtonText, { color: COLORS.error }]}>{t('admin_suspendStore')}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[s.actionButton, { backgroundColor: '#10B981' + '15', borderColor: '#10B981' + '30' }]}
                    onPress={() => handleActivate(store)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.actionButtonText, { color: '#10B981' }]}>{t('admin_activateStore')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[s.actionButton, { backgroundColor: COLORS.error + '10', borderColor: COLORS.error + '20' }]}
                  onPress={() => openModal('delete', store)}
                  activeOpacity={0.7}
                >
                  <TrashIcon color={COLORS.error} />
                </TouchableOpacity>
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
              {modalAction === 'suspend' ? t('admin_suspendStoreTitle') : t('admin_deleteStoreTitle')}
            </Text>
            <Text style={[s.modalMessage, { color: COLORS.textSecondary }]}>
              {modalAction === 'suspend' 
                ? t('admin_suspendStoreMsg', { name: selectedStore?.name || '' })
                : t('admin_deleteStoreMsg', { name: selectedStore?.name || '' })
              }
            </Text>
            <TextInput
              style={[s.reasonInput, { backgroundColor: COLORS.background, color: COLORS.text, borderColor: COLORS.border }]}
              placeholder={t('admin_provideReason')}
              placeholderTextColor={COLORS.textMuted}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
            />
            <View style={s.modalActions}>
              <TouchableOpacity
                style={[s.modalButton, { backgroundColor: COLORS.background }]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[s.modalButtonText, { color: COLORS.text }]}>{t('admin_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalButton, { backgroundColor: COLORS.error }]}
                onPress={handleModalAction}
                activeOpacity={0.7}
              >
                <Text style={[s.modalButtonText, { color: '#FFFFFF' }]}>{t('admin_confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AdminBottomNav activeTab="stores" onTabPress={(tab) => {
        if (tab === 'dashboard') navigate?.('adminDashboard');
        if (tab === 'sellers') navigate?.('adminSellers');
        if (tab === 'delivery') navigate?.('adminDelivery');
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

  filterTabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  filterTabText: { fontSize: 13, fontWeight: '700' },

  storeCard: { borderRadius: 18, padding: 16, borderWidth: 1, marginBottom: 12 },
  storeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  storeIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  storeName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  storeLocation: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },

  divider: { height: 1, marginVertical: 12 },

  storeDetails: { gap: 8, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 13, fontWeight: '600', width: 90 },
  detailValue: { fontSize: 13, flex: 1 },

  storeActions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, justifyContent: 'center' },
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

export default AdminStoresScreen;
