import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { dashboardAPI } from '../services/api.service';
import { getColors, SPACING, SHADOWS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Logo } from '../components/Logo';
import BottomNav, { BottomTabId } from './BottomNav';

/* Icons */
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

const TrendIcon = ({ up, color }: { up: boolean; color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    {up ? (
      <>
        <Path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M17 6H23V12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <>
        <Path d="M23 18L13.5 8.5L8.5 13.5L1 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M17 18H23V12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )}
  </Svg>
);

/* Metric Card Component */
const MetricCard = ({ title, value, change, icon, colors, COLORS }: any) => {
  const isPositive = change >= 0;
  return (
    <View style={[styles.metricCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIconContainer, { backgroundColor: colors[0] + '15' }]}>
          {icon}
        </View>
        <View style={[styles.changeBadge, { backgroundColor: isPositive ? COLORS.success + '15' : COLORS.error + '15' }]}>
          <TrendIcon up={isPositive} color={isPositive ? COLORS.success : COLORS.error} />
          <Text style={[styles.changeText, { color: isPositive ? COLORS.success : COLORS.error }]}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </Text>
        </View>
      </View>
      <Text style={[styles.metricValue, { color: COLORS.text }]}>{value}</Text>
      <Text style={[styles.metricTitle, { color: COLORS.textMuted }]}>{title}</Text>
    </View>
  );
};

/* Chart Component */
const MiniChart = ({ data, color, COLORS }: any) => {
  const maxValue = Math.max(...data, 1);
  const barWidth = 8;
  const gap = 6;
  
  return (
    <View style={styles.chartContainer}>
      {data.map((value: number, i: number) => {
        const height = (value / maxValue) * 60;
        return (
          <View key={i} style={{ alignItems: 'center', marginRight: gap }}>
            <View style={[styles.chartBar, { height: Math.max(height, 4), width: barWidth, backgroundColor: color }]} />
          </View>
        );
      })}
    </View>
  );
};

/* Order Row */
const OrderRow = ({ order, COLORS }: any) => {
  const statusColors = {
    delivered: { bg: COLORS.success + '15', text: COLORS.success },
    shipped: { bg: COLORS.secondary + '15', text: COLORS.secondary },
    processing: { bg: COLORS.info + '15', text: COLORS.info },
    cancelled: { bg: COLORS.error + '15', text: COLORS.error },
  };
  const sc = statusColors[order.status as keyof typeof statusColors] || { bg: COLORS.border, text: COLORS.textMuted };
  
  return (
    <View style={styles.orderRow}>
      <View style={[styles.orderIcon, { backgroundColor: COLORS.surfaceHighlight }]}>
        <Text style={[styles.orderIconText, { color: COLORS.primary }]}>
          {order.orderNumber?.slice(-2) || '#'}
        </Text>
      </View>
      <View style={styles.orderInfo}>
        <Text style={[styles.orderNumber, { color: COLORS.text }]}>#{order.orderNumber}</Text>
        <Text style={[styles.orderDate, { color: COLORS.textMuted }]}>
          {new Date(order.orderDate).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.orderRight}>
        <Text style={[styles.orderAmount, { color: COLORS.text }]}>
          ${parseFloat(order.totalAmount || 0).toLocaleString()}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.text }]}>{order.status}</Text>
        </View>
      </View>
    </View>
  );
};

/* Main Dashboard */
interface DashboardScreenProps {
  navigate?: (screenId: string) => void;
  resetTo?: (screenId: string) => void;
}

const DashboardScreen = ({ navigate, resetTo }: DashboardScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [stats, setStats] = useState<any>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const res = await dashboardAPI.getStats();
      setStats(res.stats);
    } catch (e) {
      console.error('Failed to load dashboard', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      if (!isRefresh) Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => { setRefreshing(true); loadData(true); };

  const handleTab = (tab: BottomTabId) => {
    if (tab === 'dashboard') return;
    resetTo ? resetTo(tab) : navigate?.(tab);
  };

  if (loading || !stats) {
    return (
      <View style={[styles.outer, styles.center, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: COLORS.textMuted }]}>{t('dashboard_loading')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.outer, { backgroundColor: COLORS.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Logo variant="icon" size={40} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.greeting, { color: COLORS.textMuted }]}>Welcome back</Text>
                <Text style={[styles.title, { color: COLORS.text }]}>Dashboard</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.themeToggle, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </TouchableOpacity>
          </View>

          {/* Revenue Hero Card */}
          <View style={[styles.heroCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroLabel}>Total Revenue</Text>
                <Text style={styles.heroValue}>${stats.totalRevenue.toLocaleString()}</Text>
                <View style={styles.heroMeta}>
                  <View style={styles.heroMetaItem}>
                    <Text style={styles.heroMetaLabel}>Orders</Text>
                    <Text style={styles.heroMetaValue}>{stats.totalOrders}</Text>
                  </View>
                  <View style={styles.heroDivider} />
                  <View style={styles.heroMetaItem}>
                    <Text style={styles.heroMetaLabel}>Stores</Text>
                    <Text style={styles.heroMetaValue}>{stats.totalStores}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Products"
              value={stats.totalProducts}
              change={stats.revenueTrend}
              colors={[COLORS.primary]}
              COLORS={COLORS}
              icon={
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="3" width="7" height="7" rx="1" stroke={COLORS.primary} strokeWidth="2" />
                  <Rect x="14" y="3" width="7" height="7" rx="1" stroke={COLORS.primary} strokeWidth="2" />
                  <Rect x="14" y="14" width="7" height="7" rx="1" stroke={COLORS.primary} strokeWidth="2" />
                  <Rect x="3" y="14" width="7" height="7" rx="1" stroke={COLORS.primary} strokeWidth="2" />
                </Svg>
              }
            />
            <MetricCard
              title="Active"
              value={stats.activeProducts}
              change={5.2}
              colors={[COLORS.success]}
              COLORS={COLORS}
              icon={
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path d="M22 11.08V12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C12.96 2 13.88 2.14 14.75 2.4" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" />
                  <Path d="M22 4L12 14.01L9 11.01" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              }
            />
            <MetricCard
              title="Low Stock"
              value={stats.lowStock || 0}
              change={-2.1}
              colors={[COLORS.warning]}
              COLORS={COLORS}
              icon={
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path d="M10.29 3.86L1.82 18C1.64 18.3 1.54 18.64 1.53 18.99C1.52 19.34 1.6 19.68 1.76 20C1.92 20.32 2.16 20.59 2.46 20.79C2.76 20.99 3.11 21.1 3.47 21.1H20.53C20.89 21.1 21.24 20.99 21.54 20.79C21.84 20.59 22.08 20.32 22.24 20C22.4 19.68 22.48 19.34 22.47 18.99C22.46 18.64 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.28 3.31 12.98 3.13C12.68 2.95 12.34 2.85 12 2.85C11.66 2.85 11.32 2.95 11.02 3.13C10.72 3.31 10.47 3.56 10.29 3.86Z" stroke={COLORS.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M12 9V13" stroke={COLORS.warning} strokeWidth="2" strokeLinecap="round" />
                  <Circle cx="12" cy="17" r="1" fill={COLORS.warning} />
                </Svg>
              }
            />
            <MetricCard
              title="Out of Stock"
              value={stats.outOfStock}
              change={-8.3}
              colors={[COLORS.error]}
              COLORS={COLORS}
              icon={
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke={COLORS.error} strokeWidth="2" />
                  <Path d="M15 9L9 15M9 9L15 15" stroke={COLORS.error} strokeWidth="2" strokeLinecap="round" />
                </Svg>
              }
            />
          </View>

          {/* Weekly Activity */}
          <View style={[styles.section, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Weekly Activity</Text>
              <Text style={[styles.sectionMeta, { color: COLORS.textMuted }]}>Last 7 days</Text>
            </View>
            <MiniChart data={stats.weeklyTrend} color={COLORS.primary} COLORS={COLORS} />
          </View>

          {/* Recent Orders */}
          {stats.recentOrders?.length > 0 && (
            <View style={[styles.section, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Recent Orders</Text>
                <TouchableOpacity onPress={() => navigate?.('orders')} activeOpacity={0.7}>
                  <Text style={[styles.viewAllLink, { color: COLORS.primary }]}>View All</Text>
                </TouchableOpacity>
              </View>
              {stats.recentOrders.slice(0, 5).map((order: any, i: number) => (
                <React.Fragment key={order.id}>
                  <OrderRow order={order} COLORS={COLORS} />
                  {i < Math.min(stats.recentOrders.length, 5) - 1 && (
                    <View style={[styles.divider, { backgroundColor: COLORS.border }]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={() => navigate?.('products')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 5V19M5 12H19" stroke={COLORS.primary} strokeWidth="2.5" strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={[styles.actionText, { color: COLORS.text }]}>Add Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={() => navigate?.('orders')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary + '15' }]}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 11L12 14L22 4" stroke={COLORS.secondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke={COLORS.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={[styles.actionText, { color: COLORS.text }]}>View Orders</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
      <BottomNav activeTab="dashboard" onTabPress={handleTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  outer: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 110 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  greeting: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  themeToggle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  
  // Hero Card
  heroCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 20, borderWidth: 1 },
  heroGradient: { padding: 24 },
  heroContent: {},
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  heroValue: { fontSize: 42, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1, marginBottom: 20 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.25)' },
  heroMetaItem: { flex: 1 },
  heroMetaLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 4 },
  heroMetaValue: { fontSize: 20, color: '#FFFFFF', fontWeight: '800' },
  heroDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 16 },
  
  // Metrics Grid
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  metricCard: { width: '48%', borderRadius: 20, padding: 18, borderWidth: 1 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  metricIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  changeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  changeText: { fontSize: 11, fontWeight: '800' },
  metricValue: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  metricTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Section
  section: { borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionMeta: { fontSize: 12, fontWeight: '600' },
  viewAllLink: { fontSize: 14, fontWeight: '800' },
  
  // Chart
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 80, paddingTop: 20 },
  chartBar: { borderRadius: 4 },
  
  // Orders
  orderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  orderIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  orderIconText: { fontSize: 13, fontWeight: '800' },
  orderInfo: { flex: 1 },
  orderNumber: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  orderDate: { fontSize: 12 },
  orderRight: { alignItems: 'flex-end' },
  orderAmount: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  divider: { height: 1, marginVertical: 4 },
  
  // Actions
  actionsGrid: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1 },
  actionIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionText: { fontSize: 14, fontWeight: '700' },
});

export default DashboardScreen;
