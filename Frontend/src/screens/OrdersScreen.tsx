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
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import * as API from '../services/api.service';
import { getColors, SPACING, SHADOWS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BottomNav, { BottomTabId } from './BottomNav';
import { UploadIcon } from '../components/ModernIcons';

interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  storeId: number;
  totalAmount: number;
  status: string;
  orderDate: string;
  user?: { fullName: string | null; email: string; phone: string | null };
  shippingAddress?: { addressLine1: string; addressLine2?: string | null; city: string; stateProvince?: string | null; postalCode?: string | null; country: string } | null;
}

interface OrdersScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
  goBack?: () => void;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({ navigate, resetTo, goBack }) => {
  const { mode } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { message, showSuccess, showError, showInfo, clear } = useStatusMessage();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.md, paddingTop: 48, paddingBottom: 110 },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },
    rowReverse: { flexDirection: 'row-reverse' as any },
    textRight: { textAlign: 'right' as any },

    /* Header */
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
    subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
    exportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, gap: 6, ...SHADOWS.medium },
    exportBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

    /* Summary */
    summaryRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 16, marginBottom: SPACING.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
    summaryItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
    summaryBorder: { borderLeftWidth: 1, borderLeftColor: COLORS.border },
    summaryValue: { fontSize: 22, fontWeight: '800', color: COLORS.text },
    summaryLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },

    /* Empty */
    emptyState: { padding: 40, alignItems: 'center' },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },

    /* Order card */
    orderCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    orderNumber: { fontSize: 15, fontWeight: '800', color: COLORS.text },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    badgeText: { fontSize: 11, fontWeight: '700' },
    customerName: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12, fontWeight: '600' },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderTotal: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
    orderDate: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.orderAPI.getAllOrders();
      setOrders(response.orders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      showError(error.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return { bg: COLORS.success + '20', text: COLORS.success };
      case 'shipped': return { bg: COLORS.secondary + '20', text: COLORS.secondary };
      case 'processing': return { bg: COLORS.warning + '20', text: COLORS.warning };
      case 'cancelled': return { bg: COLORS.error + '20', text: COLORS.error };
      default: return { bg: COLORS.textMuted + '20', text: COLORS.textSecondary };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return t('orders_delivered');
      case 'shipped': return t('orders_shipped');
      case 'processing': return t('orders_processing');
      case 'cancelled': return t('orders_cancelled');
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleExportOrders = async () => {
    try {
      let doc = t('orders_exportTitle') + '\n\n';
      orders.forEach((order, i) => {
        const name = order.user?.fullName || order.user?.email || t('orders_unknownCustomer');
        const phone = order.user?.phone || 'N/A';
        const loc = order.shippingAddress ? `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.country}` : 'N/A';
        const price = `$${(Number(order.totalAmount) || 0).toFixed(2)}`;
        doc += `${i + 1}. ${order.orderNumber}\n   ${name}\n   ${phone}\n   ${loc}\n   ${price}\n   ${order.status}\n   ${new Date(order.orderDate).toLocaleDateString()}\n\n`;
      });
      await Share.share({ message: doc, title: t('orders_exportTitle') });
    } catch (error: any) {
      showError(error.message || 'Failed to share.');
    }
  };

  const handleTabPress = (tab: BottomTabId) => {
    if (tab === 'orders') return;
    resetTo ? resetTo(tab) : navigate?.(tab);
  };

  /* Counts by status */
  const delivered = orders.filter(o => o.status.toLowerCase() === 'delivered').length;
  const processing = orders.filter(o => o.status.toLowerCase() === 'processing').length;
  const cancelled = orders.filter(o => o.status.toLowerCase() === 'cancelled').length;

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('orders_loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={[styles.header, isRTL && styles.rowReverse]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, isRTL && styles.textRight]}>{t('nav_orders')}</Text>
            <Text style={[styles.subtitle, isRTL && styles.textRight]}>{t('orders_subtitle')}</Text>
          </View>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExportOrders} activeOpacity={0.8}>
            <UploadIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.exportBtnText}>{t('orders_export')}</Text>
          </TouchableOpacity>
        </View>

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* Summary bar */}
        <View style={[styles.summaryRow, isRTL && styles.rowReverse]}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{orders.length}</Text>
            <Text style={styles.summaryLabel}>{t('orders_total')}</Text>
          </View>
          <View style={[styles.summaryItem, styles.summaryBorder]}>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>{delivered}</Text>
            <Text style={styles.summaryLabel}>{t('orders_delivered')}</Text>
          </View>
          <View style={[styles.summaryItem, styles.summaryBorder]}>
            <Text style={[styles.summaryValue, { color: COLORS.warning }]}>{processing}</Text>
            <Text style={styles.summaryLabel}>{t('orders_processing')}</Text>
          </View>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t('orders_noOrders')}</Text>
            <Text style={styles.emptySubtitle}>{t('orders_noOrdersDesc')}</Text>
          </View>
        ) : (
          <View>
            {orders.map((order) => {
              const sc = getStatusColor(order.status);
              const customerName = order.user?.fullName || order.user?.email || t('orders_unknownCustomer');
              const orderDate = new Date(order.orderDate).toLocaleDateString();
              return (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => navigate?.('orderTracking', {
                    orderId: order.id.toString(),
                    orderNumber: order.orderNumber,
                    customerName,
                    orderStatus: order.status,
                  })}
                  activeOpacity={0.7}
                >
                  {/* top row: order number + status */}
                  <View style={[styles.cardTop, isRTL && styles.rowReverse]}>
                    <Text style={[styles.orderNumber, isRTL && styles.textRight]}>{order.orderNumber}</Text>
                    <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.badgeText, { color: sc.text }]}>{getStatusLabel(order.status)}</Text>
                    </View>
                  </View>
                  {/* customer */}
                  <Text style={[styles.customerName, isRTL && styles.textRight]}>{customerName}</Text>
                  {/* bottom row: price + date */}
                  <View style={[styles.cardBottom, isRTL && styles.rowReverse]}>
                    <Text style={styles.orderTotal}>${(Number(order.totalAmount) || 0).toFixed(2)}</Text>
                    <Text style={styles.orderDate}>{orderDate}</Text>
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

export default OrdersScreen;
