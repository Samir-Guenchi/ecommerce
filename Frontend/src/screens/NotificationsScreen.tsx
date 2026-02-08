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
import Svg, { Path } from 'react-native-svg';
import { orderAPI, eventAPI, storeAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import BackHeader from '../components/BackHeader';

const BellIcon = () => (
  <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 006 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.69 21.9 12.35 22 12 22C11.65 22 11.31 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const OrderIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 22C9.55 22 10 21.55 10 21C10 20.45 9.55 20 9 20C8.45 20 8 20.45 8 21C8 21.55 8.45 22 9 22Z" stroke={COLORS.secondary} strokeWidth="2" />
    <Path d="M20 22C20.55 22 21 21.55 21 21C21 20.45 20.55 20 20 20C19.45 20 19 20.45 19 21C19 21.55 19.45 22 20 22Z" stroke={COLORS.secondary} strokeWidth="2" />
    <Path d="M1 1H5L7.68 14.39C7.77 14.85 8.02 15.26 8.39 15.56C8.75 15.85 9.21 16.01 9.68 16H19.4C19.87 16.01 20.33 15.85 20.69 15.56C21.06 15.26 21.31 14.85 21.4 14.39L23 6H6" stroke={COLORS.secondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EventIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={COLORS.warning} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'order' | 'event'>('all');

  const loadNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const items: NotificationItem[] = [];

      // Fetch recent orders as notifications
      try {
        const orderRes = await orderAPI.getAllOrders();
        const orders = (orderRes.orders || []).slice(0, 20);
        orders.forEach((o: any) => {
          const statusText = o.status === 'delivered' ? 'has been delivered' :
            o.status === 'shipped' ? 'has been shipped' :
            o.status === 'processing' ? 'is being processed' :
            o.status === 'cancelled' ? 'was cancelled' : 'was updated';
          items.push({
            id: `order-${o.id}`,
            title: `Order #${o.orderNumber}`,
            body: `Order ${statusText}. Amount: $${parseFloat(o.totalAmount || 0).toFixed(2)}`,
            time: o.orderDate || o.updatedAt || new Date().toISOString(),
            type: 'order',
            read: o.status === 'delivered',
          });
        });
      } catch (e) { /* skip */ }

      // Fetch recent events as notifications
      try {
        const storesRes = await storeAPI.getAllStores();
        if (storesRes.stores?.[0]?.id) {
          const eventRes = await eventAPI.getEventsForStore(storesRes.stores[0].id, { limit: 15 });
          (eventRes.events || []).forEach((ev: any) => {
            const typeLabel = (ev.eventType || '').replace(/_/g, ' ');
            items.push({
              id: `event-${ev.id}`,
              title: typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1),
              body: ev.eventData?.message || `${typeLabel} event recorded`,
              time: ev.createdAt || new Date().toISOString(),
              type: 'event',
              read: ev.status === 'processed',
            });
          });
        }
      } catch (e) { /* skip */ }

      // Sort by time descending
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setNotifications(items);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, []);

  const onRefresh = () => { setRefreshing(true); loadNotifications(true); };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <OrderIcon />;
      case 'event': return <EventIcon />;
      default: return <BellIcon />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'order': return COLORS.secondary + '15';
      case 'event': return COLORS.warning + '15';
      default: return COLORS.primary + '15';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
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
        <BackHeader title="Notifications" onBack={goBack} />

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{notifications.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{unreadCount}</Text>
            <Text style={styles.summaryLabel}>Unread</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>{notifications.length - unreadCount}</Text>
            <Text style={styles.summaryLabel}>Read</Text>
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
                {f === 'all' ? 'All' : f === 'order' ? 'Orders' : 'Events'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <BellIcon />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all'
                ? "You're all caught up! Notifications will appear here when something important happens."
                : `No ${filter} notifications right now.`}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },
  content: { paddingHorizontal: SPACING.md, paddingBottom: 40, paddingTop: 48 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.md },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  summaryLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500', textTransform: 'uppercase' as any },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.md },
  filterChip: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.primary },
  emptyContainer: { marginTop: 48, alignItems: 'center', justifyContent: 'center' },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
  listContainer: { gap: 10 },
  notifCard: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14 },
  notifCardUnread: { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  notifIconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  notifContent: { flex: 1 },
  notifHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1, marginRight: 8 },
  notifTime: { fontSize: 11, color: COLORS.textSecondary },
  notifBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  notifMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  typeBadgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' as any },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: 8 },
});

export default NotificationsScreen;
