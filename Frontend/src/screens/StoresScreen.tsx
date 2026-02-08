import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import { confirmAction } from '../components/confirmAction';
import { storeAPI, orderAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import { useTranslation } from '../i18n';
import BottomNav, { BottomTabId } from './BottomNav';

/* Icons */
const PlusIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19" stroke={COLORS.primary} strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M5 12H19" stroke={COLORS.primary} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const MapPinIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke={COLORS.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke={COLORS.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SettingsGearIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={COLORS.textSecondary} strokeWidth="1.5" />
    <Path d="M19.4 15C19.27 15.3 19.23 15.64 19.29 15.96C19.34 16.29 19.5 16.58 19.73 16.82L19.79 16.88C19.98 17.07 20.12 17.29 20.22 17.53C20.32 17.77 20.38 18.03 20.38 18.3C20.38 18.56 20.32 18.82 20.22 19.06C20.12 19.3 19.98 19.52 19.79 19.71C19.6 19.9 19.38 20.04 19.14 20.14C18.9 20.24 18.64 20.3 18.38 20.3C18.11 20.3 17.85 20.24 17.61 20.14C17.37 20.04 17.15 19.9 16.96 19.71L16.9 19.65C16.66 19.42 16.37 19.26 16.04 19.21C15.72 19.15 15.38 19.19 15.08 19.32C14.78 19.45 14.53 19.66 14.35 19.93C14.18 20.19 14.08 20.51 14.08 20.83V21C14.08 21.53 13.87 22.04 13.49 22.41C13.12 22.79 12.61 23 12.08 23C11.55 23 11.04 22.79 10.67 22.41C10.29 22.04 10.08 21.53 10.08 21V20.91C10.07 20.58 9.97 20.26 9.77 19.99C9.58 19.72 9.31 19.51 9 19.4C8.7 19.27 8.36 19.23 8.04 19.29C7.72 19.34 7.42 19.5 7.18 19.73L7.12 19.79C6.93 19.98 6.71 20.12 6.47 20.22C6.23 20.32 5.97 20.38 5.71 20.38C5.44 20.38 5.18 20.32 4.94 20.22C4.7 20.12 4.48 19.98 4.29 19.79C4.1 19.6 3.96 19.38 3.86 19.14C3.76 18.9 3.7 18.64 3.7 18.38C3.7 18.11 3.76 17.85 3.86 17.61C3.96 17.37 4.1 17.15 4.29 16.96L4.35 16.9C4.58 16.66 4.74 16.37 4.79 16.04C4.85 15.72 4.81 15.38 4.68 15.08C4.55 14.78 4.34 14.53 4.07 14.35C3.81 14.18 3.49 14.08 3.17 14.08H3C2.47 14.08 1.96 13.87 1.59 13.49C1.21 13.12 1 12.61 1 12.08C1 11.55 1.21 11.04 1.59 10.67C1.96 10.29 2.47 10.08 3 10.08H3.09C3.42 10.07 3.74 9.97 4.01 9.77C4.28 9.58 4.49 9.31 4.6 9C4.73 8.7 4.77 8.36 4.71 8.04C4.66 7.72 4.5 7.42 4.27 7.18L4.21 7.12C4.02 6.93 3.88 6.71 3.78 6.47C3.68 6.23 3.62 5.97 3.62 5.71C3.62 5.44 3.68 5.18 3.78 4.94C3.88 4.7 4.02 4.48 4.21 4.29C4.4 4.1 4.62 3.96 4.86 3.86C5.1 3.76 5.36 3.7 5.63 3.7C5.89 3.7 6.15 3.76 6.39 3.86C6.63 3.96 6.85 4.1 7.04 4.29L7.1 4.35C7.34 4.58 7.64 4.74 7.96 4.79C8.28 4.85 8.62 4.81 8.92 4.68H9C9.3 4.55 9.55 4.34 9.73 4.07C9.9 3.81 10 3.49 10 3.17V3C10 2.47 10.21 1.96 10.59 1.59C10.96 1.21 11.47 1 12 1C12.53 1 13.04 1.21 13.41 1.59C13.79 1.96 14 2.47 14 3V3.09C14 3.41 14.1 3.73 14.27 3.99C14.45 4.26 14.7 4.47 15 4.6C15.3 4.73 15.64 4.77 15.96 4.71C16.29 4.66 16.58 4.5 16.82 4.27L16.88 4.21C17.07 4.02 17.29 3.88 17.53 3.78C17.77 3.68 18.03 3.62 18.3 3.62C18.56 3.62 18.82 3.68 19.06 3.78C19.3 3.88 19.52 4.02 19.71 4.21C19.9 4.4 20.04 4.62 20.14 4.86C20.24 5.1 20.3 5.36 20.3 5.63C20.3 5.89 20.24 6.15 20.14 6.39C20.04 6.63 19.9 6.85 19.71 7.04L19.65 7.1C19.42 7.34 19.26 7.64 19.21 7.96C19.15 8.28 19.19 8.62 19.32 8.92V9C19.45 9.3 19.66 9.55 19.93 9.73C20.19 9.9 20.51 10 20.83 10H21C21.53 10 22.04 10.21 22.41 10.59C22.79 10.96 23 11.47 23 12C23 12.53 22.79 13.04 22.41 13.41C22.04 13.79 21.53 14 21 14H20.91C20.59 14 20.27 14.1 20.01 14.27C19.74 14.45 19.53 14.7 19.4 15Z" stroke={COLORS.textSecondary} strokeWidth="1.5" />
  </Svg>
);

interface Store {
  id: number;
  name: string;
  status: string;
  location: string | null;
  description?: string;
  domain?: string;
}

interface StoresScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
  goBack?: () => void;
}

const StoresScreen: React.FC<StoresScreenProps> = ({ navigate, resetTo, goBack }) => {
  const { t, isRTL } = useTranslation();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderCounts, setOrderCounts] = useState<Record<number, number>>({});
  const { message, showSuccess, showError, showInfo, clear } = useStatusMessage();

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await storeAPI.getAllStores();
      setStores(response.stores);
      const counts: Record<number, number> = {};
      for (const store of response.stores) {
        try {
          const ordersRes = await orderAPI.getAllOrders();
          counts[store.id] = (ordersRes.orders || []).filter((o: any) => o.storeId === store.id).length;
        } catch { counts[store.id] = 0; }
      }
      setOrderCounts(counts);
    } catch (error: any) {
      showError(error.message || 'Failed to load stores.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStores(); }, []);

  const handleDeleteStore = async (storeId: number, storeName: string) => {
    const confirmed = await confirmAction(t('stores_deleteTitle'), t('stores_deleteConfirm', { name: storeName }));
    if (!confirmed) return;
    try {
      await storeAPI.deleteStore(storeId);
      showSuccess(t('stores_deleteSuccess'));
      await fetchStores();
    } catch (error: any) {
      showError(error.message || t('stores_deleteFail'));
    }
  };

  const handleTabPress = (tab: BottomTabId) => {
    if (tab === 'stores') return;
    resetTo ? resetTo(tab) : navigate?.(tab);
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': case 'published': return { bg: COLORS.success + '20', color: COLORS.success };
      case 'draft': return { bg: COLORS.warning + '20', color: COLORS.warning };
      default: return { bg: COLORS.textMuted + '20', color: COLORS.textMuted };
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('stores_loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStores} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={[styles.header, isRTL && styles.rowReverse]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, isRTL && styles.textRight]}>{t('nav_stores')}</Text>
            <Text style={[styles.subtitle, isRTL && styles.textRight]}>{t('stores_subtitle')}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigate?.('addEditStore')}>
            <PlusIcon />
          </TouchableOpacity>
        </View>

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* Summary */}
        <View style={[styles.summaryRow, isRTL && styles.rowReverse]}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stores.length}</Text>
            <Text style={styles.summaryLabel}>{t('stores_total')}</Text>
          </View>
          <View style={[styles.summaryItem, styles.summaryBorder]}>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>{stores.filter(s => s.status?.toLowerCase() === 'active' || s.status?.toLowerCase() === 'published').length}</Text>
            <Text style={styles.summaryLabel}>{t('dashboard_active')}</Text>
          </View>
        </View>

        {stores.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t('stores_noStores')}</Text>
            <Text style={styles.emptySubtitle}>{t('stores_noStoresDesc')}</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => navigate?.('addEditStore')}>
              <Text style={styles.createBtnText}>{t('stores_createStore')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {stores.map((store) => {
              const ss = getStatusStyle(store.status);
              return (
                <View key={store.id} style={styles.storeCard}>
                  <View style={[styles.cardTop, isRTL && styles.rowReverse]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.storeName, isRTL && styles.textRight]}>{store.name}</Text>
                      {store.location && (
                        <View style={[styles.locationRow, isRTL && styles.rowReverse]}>
                          <MapPinIcon />
                          <Text style={styles.locationText}>{store.location}</Text>
                        </View>
                      )}
                    </View>
                    <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                      <Text style={[styles.badgeText, { color: ss.color }]}>
                        {store.status?.charAt(0).toUpperCase() + store.status?.slice(1)}
                      </Text>
                    </View>
                  </View>

                  {/* Stats row */}
                  <View style={[styles.statsRow, isRTL && styles.rowReverse]}>
                    <Text style={styles.statChip}>{t('dashboard_orders')}: {orderCounts[store.id] || 0}</Text>
                    {store.domain && <Text style={styles.domainText}>{store.domain}</Text>}
                  </View>

                  {/* Actions */}
                  <View style={[styles.cardActions, isRTL && styles.rowReverse]}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigate?.('addEditStore', { storeId: store.id.toString() })}>
                      <Text style={styles.actionBtnText}>{t('stores_modify')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigate?.('storeSettings', { storeId: store.id.toString() })}>
                      <SettingsGearIcon />
                      <Text style={styles.actionBtnText}>{t('stores_settings')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteActionBtn} onPress={() => handleDeleteStore(store.id, store.name)}>
                      <Text style={styles.deleteActionBtnText}>{t('common_delete')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      <BottomNav activeTab="stores" onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingTop: 48, paddingBottom: 110 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },
  rowReverse: { flexDirection: 'row-reverse' as any },
  textRight: { textAlign: 'right' as any },

  /* Header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  title: { fontSize: 26, fontWeight: '600', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  addBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },

  /* Summary */
  summaryRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, marginBottom: SPACING.md, overflow: 'hidden' },
  summaryItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  summaryBorder: { borderLeftWidth: 1, borderLeftColor: COLORS.borderLight },
  summaryValue: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  summaryLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },

  /* Empty */
  emptyState: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  createBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  createBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  /* Store card */
  storeCard: { backgroundColor: COLORS.surface, borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, paddingBottom: 10 },
  storeName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: COLORS.textSecondary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginLeft: 10 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  /* Stats */
  statsRow: { flexDirection: 'row', paddingHorizontal: 14, paddingBottom: 10, gap: 12 },
  statChip: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  domainText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },

  /* Actions */
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  actionBtn: { flex: 1, flexDirection: 'row', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', gap: 4, borderRightWidth: 1, borderRightColor: COLORS.borderLight },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  deleteActionBtn: { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  deleteActionBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.error },
});

export default StoresScreen;
