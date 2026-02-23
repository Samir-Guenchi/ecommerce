import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { orderAPI, eventAPI, storeAPI } from '../services/api.service';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';

const BellIcon = ({ color }: { color: string }) => (
  <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 006 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.69 21.9 12.35 22 12 22C11.65 22 11.31 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const OrderIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 22C9.55 22 10 21.55 10 21C10 20.45 9.55 20 9 20C8.45 20 8 20.45 8 21C8 21.55 8.45 22 9 22Z" stroke={color} strokeWidth="2" />
    <Path d="M20 22C20.55 22 21 21.55 21 21C21 20.45 20.55 20 20 20C19.45 20 19 20.45 19 21C19 21.55 19.45 22 20 22Z" stroke={color} strokeWidth="2" />
    <Path d="M1 1H5L7.68 14.39C7.77 14.85 8.02 15.26 8.39 15.56C8.75 15.85 9.21 16.01 9.68 16H19.4C19.87 16.01 20.33 15.85 20.69 15.56C21.06 15.26 21.31 14.85 21.4 14.39L23 6H6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EventIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SunIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <SvgCircle cx="12" cy="12" r="5" stroke="#FDB913" strokeWidth="2" />
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB913" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const MoonIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'order' | 'event' | 'system';
  read: boolean;
};

interface NotificationsScreenProps {
  goBack?: () => void;
}

const NotificationsScreen = ({ goBack }: NotificationsScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'order' | 'event'>('all');

  const loadNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const items: NotificationItem[] = [];

      // Fetch recent orders as notifications
      // Note: The backend /api/orders endpoint returns:
      // - For SELLERS: Orders from their stores (filtered by store ownership)
      // - For BUYERS: This endpoint doesn't return buyer's orders yet
      // TODO: Backend needs a separate endpoint for buyer orders (orders where userId = current user)
      try {
        const orderRes = await orderAPI.getAllOrders();
        const orders = (orderRes.orders || []).slice(0, 20);
        
        // These are orders from the user's stores (if they're a seller)
        orders.forEach((o: any) => {
          const statusText = o.status === 'delivered' ? t('notif_hasBeenDelivered') :
            o.status === 'shipped' ? t('notif_hasBeenShipped') :
            o.status === 'processing' ? t('notif_isBeingProcessed') :
            o.status === 'cancelled' ? t('notif_wasCancelled') : t('notif_wasUpdated');
          items.push({
            id: `order-${o.id}`,
            title: `${t('nav_orders')} #${o.orderNumber}`,
            body: `${t('nav_orders')} ${statusText}. ${t('notif_amount')} ${parseFloat(o.totalAmount || 0).toFixed(2)} DZD`,
            time: o.orderDate || o.updatedAt || new Date().toISOString(),
            type: 'order',
            read: o.status === 'delivered',
          });
        });
        
        console.log(`Loaded ${orders.length} orders from backend (seller's store orders)`);
      } catch (e) { 
        console.log('Orders API failed, will use dummy data if needed');
      }

      // Fetch recent events as notifications
      // Events are store-specific, so only sellers with stores will have events
      try {
        const storesRes = await storeAPI.getAllStores();
        if (storesRes.stores?.[0]?.id) {
          const eventRes = await eventAPI.getEventsForStore(storesRes.stores[0].id, { limit: 15 });
          (eventRes.events || []).forEach((ev: any) => {
            const typeLabel = (ev.eventType || '').replace(/_/g, ' ');
            items.push({
              id: `event-${ev.id}`,
              title: typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1),
              body: ev.eventData?.message || `${typeLabel} ${t('notif_eventRecorded')}`,
              time: ev.createdAt || new Date().toISOString(),
              type: 'event',
              read: ev.status === 'processed',
            });
          });
          
          console.log(`Loaded ${eventRes.events?.length || 0} events from backend`);
        } else {
          console.log('No stores found for current user');
        }
      } catch (e) { 
        console.log('Events API failed, will use dummy data if needed');
      }

      // Add dummy data if no items from backend
      // This helps with testing and provides a better UX for new users
      if (items.length === 0) {
        console.log('📝 Adding dummy notifications for testing (user-specific simulation)');
        const now = new Date();
        
        // Dummy order notifications (simulating orders for THIS user only)
        items.push({
          id: 'dummy-order-1',
          title: `${t('nav_orders')} #ORD-2024-001`,
          body: `${t('nav_orders')} ${t('notif_hasBeenDelivered')}. ${t('notif_amount')} 4,500.00 DZD`,
          time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          type: 'order',
          read: true,
        });

        items.push({
          id: 'dummy-order-2',
          title: `${t('nav_orders')} #ORD-2024-002`,
          body: `${t('nav_orders')} ${t('notif_hasBeenShipped')}. ${t('notif_amount')} 2,350.00 DZD`,
          time: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          type: 'order',
          read: false,
        });

        items.push({
          id: 'dummy-order-3',
          title: `${t('nav_orders')} #ORD-2024-003`,
          body: `${t('nav_orders')} ${t('notif_isBeingProcessed')}. ${t('notif_amount')} 8,750.00 DZD`,
          time: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          type: 'order',
          read: false,
        });

        items.push({
          id: 'dummy-order-4',
          title: `${t('nav_orders')} #ORD-2024-004`,
          body: `${t('nav_orders')} ${t('notif_wasCancelled')}. ${t('notif_amount')} 1,200.00 DZD`,
          time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          type: 'order',
          read: true,
        });

        items.push({
          id: 'dummy-order-5',
          title: `${t('nav_orders')} #ORD-2024-005`,
          body: `${t('nav_orders')} ${t('notif_hasBeenDelivered')}. ${t('notif_amount')} 15,600.00 DZD`,
          time: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          type: 'order',
          read: true,
        });

        // Dummy event notifications (simulating events for THIS user's stores only)
        items.push({
          id: 'dummy-event-1',
          title: 'New Product Added',
          body: `Your store has a new product listed. Product name: "Premium Laptop" ${t('notif_eventRecorded')}`,
          time: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          type: 'event',
          read: false,
        });

        items.push({
          id: 'dummy-event-2',
          title: 'Store Updated',
          body: `Your store information has been updated successfully ${t('notif_eventRecorded')}`,
          time: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
          type: 'event',
          read: false,
        });

        items.push({
          id: 'dummy-event-3',
          title: 'Low Stock Alert',
          body: `Product "Wireless Mouse" is running low on stock. Only 5 units remaining ${t('notif_eventRecorded')}`,
          time: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          type: 'event',
          read: true,
        });

        items.push({
          id: 'dummy-event-4',
          title: 'Payment Received',
          body: `Payment of 4,500.00 DZD received for order #ORD-2024-001 ${t('notif_eventRecorded')}`,
          time: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          type: 'event',
          read: true,
        });

        items.push({
          id: 'dummy-event-5',
          title: 'Customer Review',
          body: `New 5-star review received on your product "Premium Laptop" ${t('notif_eventRecorded')}`,
          time: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
          type: 'event',
          read: false,
        });
      }

      // Sort by time descending
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setNotifications(items);
      
      console.log(`✅ Loaded ${items.length} notifications total (${items.filter(i => i.type === 'order').length} orders, ${items.filter(i => i.type === 'event').length} events) - USER-SPECIFIC`);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const onRefresh = () => { setRefreshing(true); loadNotifications(true); };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('notif_justNow');
    if (mins < 60) return t('notif_minutesAgo').replace('{count}', mins.toString());
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t('notif_hoursAgo').replace('{count}', hrs.toString());
    const days = Math.floor(hrs / 24);
    if (days < 7) return t('notif_daysAgo').replace('{count}', days.toString());
    return d.toLocaleDateString();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <OrderIcon color={COLORS.secondary} />;
      case 'event': return <EventIcon color={COLORS.warning} />;
      default: return <BellIcon color={COLORS.primary} />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'order': return COLORS.secondary + '15';
      case 'event': return COLORS.warning + '15';
      default: return COLORS.primary + '15';
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },
    content: { paddingHorizontal: SPACING.md, paddingBottom: 40, paddingTop: 54 },
    
    // Header
    header: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center', color: COLORS.text },
    controls: { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8 },
    iconBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, backgroundColor: COLORS.surface, borderColor: COLORS.border },
    
    summaryRow: { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10, marginBottom: SPACING.md },
    summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    summaryValue: { fontSize: 22, fontWeight: '700', color: COLORS.text },
    summaryLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500', textTransform: 'uppercase' as any },
    
    filterRow: { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8, marginBottom: SPACING.md },
    filterChip: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
    filterChipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
    filterText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
    filterTextActive: { color: COLORS.primary },
    
    emptyContainer: { marginTop: 48, alignItems: 'center', justifyContent: 'center' },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
    
    listContainer: { gap: 10 },
    notifCard: { flexDirection: isRTL ? 'row-reverse' : 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14 },
    notifCardUnread: { borderLeftWidth: isRTL ? 0 : 3, borderRightWidth: isRTL ? 3 : 0, borderLeftColor: COLORS.primary, borderRightColor: COLORS.primary },
    notifIconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 },
    notifContent: { flex: 1 },
    notifHeaderRow: { flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    notifTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1, marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 },
    notifTime: { fontSize: 11, color: COLORS.textSecondary },
    notifBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, textAlign: isRTL ? 'right' : 'left' },
    notifMeta: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginTop: 6 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    typeBadgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' as any },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('notif_loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header with back, title, and controls */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={goBack} activeOpacity={0.7}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d={isRTL ? 'M5 12H19M19 12L12 19M19 12L12 5' : 'M19 12H5M5 12L12 19M5 12L12 5'} stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{t('notif_title')}</Text>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme} activeOpacity={0.7}>
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{notifications.length}</Text>
            <Text style={styles.summaryLabel}>{t('notif_total')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{unreadCount}</Text>
            <Text style={styles.summaryLabel}>{t('notif_unread')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>{notifications.length - unreadCount}</Text>
            <Text style={styles.summaryLabel}>{t('notif_read')}</Text>
          </View>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {(['all', 'order', 'event'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? t('notif_all') : f === 'order' ? t('notif_orders') : t('notif_events')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <BellIcon color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>{t('notif_noNotifications')}</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all'
                ? t('notif_allCaughtUpDesc')
                : filter === 'order'
                ? t('notif_noOrderNotif')
                : t('notif_noEventNotif')}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filtered.map((item) => (
              <TouchableOpacity key={item.id} style={[styles.notifCard, !item.read && styles.notifCardUnread]} activeOpacity={0.7}>
                <View style={[styles.notifIconCircle, { backgroundColor: getIconBg(item.type) }]}>
                  {getIcon(item.type)}
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifHeaderRow}>
                    <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.notifTime}>{formatTime(item.time)}</Text>
                  </View>
                  <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                  <View style={styles.notifMeta}>
                    <View style={[styles.typeBadge, { backgroundColor: getIconBg(item.type) }]}>
                      <Text style={[styles.typeBadgeText, { color: item.type === 'order' ? COLORS.secondary : COLORS.warning }]}>
                        {item.type}
                      </Text>
                    </View>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;
