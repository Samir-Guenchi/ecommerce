/**
 * OrdersScreen — Algérie Poste E-Commerce Order Management
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
  Share,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import * as API from '../services/api.service';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BottomNav, { BottomTabId } from './BottomNav';
import { PackageIcon, TruckIcon, UserIcon, CheckCircleIcon } from '../components/ModernIcons';

const { width: W } = Dimensions.get('window');
const CARD_R = 18;

/* ══════ ICONS ══════ */
const SunIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke="#FDB913" strokeWidth="2" />
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB913" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const MoonIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const UploadIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15V19C21 19.53 20.79 20.04 20.41 20.41C20.04 20.79 19.53 21 19 21H5C4.47 21 3.96 20.79 3.59 20.41C3.21 20.04 3 19.53 3 19V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 8L12 3L7 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 3V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ChevronRight = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  storeId: number;
  totalAmount: number;
  status: string;
  orderDate: string;
  user?: { fullName: string | null; email: string; phone: string | null };
  shippingAddress?: { addressLine1: string; city: string; country: string } | null;
}

interface OrdersScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
  goBack?: () => void;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({ navigate, resetTo, goBack }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { message, showSuccess, showError, showInfo, clear } = useStatusMessage();

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language as any) + 1) % langs.length]);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.orderAPI.getAllOrders();
      setOrders(response.orders || []);
    } catch (error: any) {
      showError(error.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return {
          bg: COLORS.success + '15',
          text: COLORS.success,
          color: COLORS.success,
          label: t('orders_delivered') || 'Livrée',
          icon: <CheckCircleIcon size={12} color={COLORS.success} strokeWidth={2.5} />
        };
      case 'shipped':
        return {
          bg: '#2563EB15',
          text: '#2563EB',
          color: '#2563EB',
          label: t('orders_shipped') || 'Expédiée',
          icon: <TruckIcon size={12} color="#2563EB" strokeWidth={2.5} />
        };
      case 'processing':
        return {
          bg: '#D9770615',
          text: '#D97706',
          color: '#D97706',
          label: t('orders_processing') || 'En cours',
          icon: <PackageIcon size={12} color="#D97706" strokeWidth={2.5} />
        };
      case 'cancelled':
        return {
          bg: COLORS.error + '15',
          text: COLORS.error,
          color: COLORS.error,
          label: t('orders_cancelled') || 'Annulée',
          icon: <PackageIcon size={12} color={COLORS.error} strokeWidth={2.5} />
        };
      default:
        return {
          bg: COLORS.border,
          text: COLORS.textMuted,
          color: COLORS.textMuted,
          label: status,
          icon: <PackageIcon size={12} color={COLORS.textMuted} strokeWidth={2.5} />
        };
    }
  };

  const handleExport = async () => {
    try {
      let doc = `${t('orders_exportTitle')}\n${'─'.repeat(40)}\n\n`;
      orders.forEach((o, i) => {
        const name = o.user?.fullName || o.user?.email || t('orders_unknownCustomer');
        const price = `${(Number(o.totalAmount) || 0).toFixed(2)} DZD`;
        doc += `${i + 1}. ${o.orderNumber}\n   ${name}\n   ${price}  |  ${o.status}\n   ${new Date(o.orderDate).toLocaleDateString()}\n\n`;
      });
      await Share.share({ message: doc, title: t('orders_exportTitle') });
    } catch (e: any) { showError(e.message || 'Failed to share.'); }
  };

  const handleTabPress = (tab: BottomTabId) => {
    if (tab === 'orders') return;
    resetTo ? resetTo(tab) : navigate?.(tab);
  };

  const delivered = orders.filter(o => o.status?.toLowerCase() === 'delivered').length;
  const processing = orders.filter(o => o.status?.toLowerCase() === 'processing').length;
  const shipped = orders.filter(o => o.status?.toLowerCase() === 'shipped').length;

  if (loading) {
    return (
      <View style={[{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textMuted, fontWeight: '600' }}>{t('orders_loading')}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={COLORS.primary} />}
      >
        {/* ── Header ── */}
        <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: COLORS.text }]}>{t('nav_orders')}</Text>
            <Text style={[styles.subtitle, { color: COLORS.textMuted }]}>{t('orders_subtitle')}</Text>
          </View>
          <View style={[styles.controls, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={cycleLanguage} activeOpacity={0.7}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.text }}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={toggleTheme} activeOpacity={0.7}>
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.exportBtn, { backgroundColor: COLORS.primary }]}
              onPress={handleExport}
              activeOpacity={0.8}
            >
              <UploadIcon color="#FFFFFF" />
              <Text style={styles.exportBtnText}>{t('orders_export')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* ── Gradient Summary Strip ── */}
        <LinearGradient colors={['#0D2C74', '#1E40AF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.summaryGrad}>
          {[
            { val: orders.length, label: t('orders_total') },
            { val: delivered, label: t('orders_delivered') },
            { val: processing, label: t('orders_processing') },
            { val: shipped, label: t('orders_shipped') },
          ].map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.sumDiv} />}
              <View style={styles.sumItem}>
                <Text style={styles.sumVal}>{item.val}</Text>
                <Text style={styles.sumLabel}>{item.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </LinearGradient>

        {/* ── Orders list ── */}
        {orders.length === 0 ? (
          <View style={{ padding: 48, alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <PackageIcon size={34} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 8 }}>{t('orders_noOrders')}</Text>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }}>{t('orders_noOrdersDesc')}</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {orders.map((order) => {
              const sc = getStatusConfig(order.status);
              const customerName = order.user?.fullName || order.user?.email || t('orders_unknownCustomer');
              const orderDate = new Date(order.orderDate).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
              const city = order.shippingAddress?.city || 'Algérie';

              return (
                <TouchableOpacity
                  key={order.id}
                  style={[styles.orderCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                  onPress={() => navigate?.('orderTracking', {
                    orderId: order.id.toString(),
                    orderNumber: order.orderNumber,
                    customerName,
                    orderStatus: order.status,
                  })}
                  activeOpacity={0.75}
                >
                  {/* Top Bar: Order Reference & Status Badge */}
                  <View style={[styles.cardHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={styles.headerLeft}>
                      <View style={[styles.orderNumBadge, { backgroundColor: '#0D2C7410' }]}>
                        <Text style={[styles.orderNum, { color: '#0D2C74' }]}>#{order.orderNumber}</Text>
                      </View>
                      <Text style={[styles.orderDate, { color: COLORS.textMuted }]}>{orderDate}</Text>
                    </View>
                    <View style={[styles.statusTag, { backgroundColor: sc.bg, borderColor: sc.color + '40' }]}>
                      {sc.icon}
                      <Text style={[styles.statusTagText, { color: sc.color }]}>{sc.label}</Text>
                    </View>
                  </View>

                  {/* Client & Shipping info */}
                  <View style={[styles.clientInfoBox, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
                    <View style={styles.clientRow}>
                      <UserIcon size={14} color={COLORS.textSecondary} />
                      <Text style={[styles.customerName, { color: COLORS.text }]} numberOfLines={1}>
                        {customerName}
                      </Text>
                      <Text style={{ fontSize: 12, color: COLORS.textMuted }}>• {city}</Text>
                    </View>
                    <View style={styles.deliveryBadge}>
                      <TruckIcon size={13} color="#0D2C74" />
                      <Text style={styles.deliveryBadgeText}>Colis Express Algérie Poste</Text>
                    </View>
                  </View>

                  {/* Financials & Tracking trigger */}
                  <View style={[styles.cardFooter, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View>
                      <Text style={[styles.amountLabel, { color: COLORS.textMuted }]}>Montant total</Text>
                      <Text style={[styles.orderAmt, { color: COLORS.text }]}>
                        {(Number(order.totalAmount) || 0).toLocaleString()} DZD
                      </Text>
                    </View>
                    <View style={[styles.trackBtn, { backgroundColor: '#0D2C74' }]}>
                      <Text style={styles.trackBtnText}>{t('tracking_title') || 'Suivre'}</Text>
                      <ChevronRight color="#FFFFFF" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
      <BottomNav activeTab="orders" onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 54, paddingBottom: 155 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  controls: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  ctrlBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, gap: 6 },
  exportBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },

  summaryGrad: { borderRadius: CARD_R, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sumItem: { flex: 1, alignItems: 'center' },
  sumVal: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  sumLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  sumDiv: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },

  orderCard: { borderRadius: CARD_R, borderWidth: 1, padding: 16, gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderNumBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  orderNum: { fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },
  orderDate: { fontSize: 12, fontWeight: '500' },
  statusTag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusTagText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  clientInfoBox: { borderRadius: 12, borderWidth: 1, padding: 10, gap: 6 },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  customerName: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
  deliveryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deliveryBadgeText: { fontSize: 11, fontWeight: '600', color: '#0D2C74' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 4 },
  amountLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  orderAmt: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5, marginTop: 2 },
  trackBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  trackBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});

export default OrdersScreen;
