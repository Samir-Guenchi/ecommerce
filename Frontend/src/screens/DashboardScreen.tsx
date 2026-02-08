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
import Svg, { Path, Circle } from 'react-native-svg';
import { dashboardAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import { useTranslation } from '../i18n';
import BottomNav, { BottomTabId } from './BottomNav';

/*  Icons  */
const BellIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 006 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={COLORS.textSecondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.69 21.9 12.35 22 12 22C11.65 22 11.31 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21" stroke={COLORS.textSecondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrendIcon = ({ up, color }: { up: boolean; color: string }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
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

const ArrowRightIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/*  Bar Chart  */
const BarChart = ({ data, dayLabels, trendPct }: { data: number[]; dayLabels: string[]; trendPct: number }) => {
  const maxValue = Math.max(...data, 1);
  const maxBarHeight = 100;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: maxBarHeight + 28, marginTop: 12 }}>
        {data.map((value, i) => {
          const h = (value / maxValue) * maxBarHeight;
          const best = value === Math.max(...data) && value > 0;
          return (
            <View key={i} style={{ alignItems: 'center', flex: 1, marginHorizontal: 3 }}>
              {value > 0 && (
                <Text style={{ fontSize: 9, color: best ? COLORS.primary : COLORS.textMuted, fontWeight: '600', marginBottom: 4 }}>
                  {value}
                </Text>
              )}
              <LinearGradient
                colors={best ? [COLORS.primary, COLORS.primary + '40'] : [COLORS.borderLight, COLORS.border]}
                style={{ width: 10, height: Math.max(h, 4), borderRadius: 5 }}
              />
              <Text style={{ marginTop: 6, fontSize: 9, color: best ? COLORS.text : COLORS.textMuted, fontWeight: best ? '600' : '400' }}>
                {dayLabels[i] || ''}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

/*  Donut Legend  */
const DonutStat = ({ label, count, color }: { label: string; count: number; color: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginRight: 8 }} />
    <Text style={{ fontSize: 13, color: COLORS.textSecondary, flex: 1 }}>{label}</Text>
    <Text style={{ fontSize: 13, color: COLORS.text, fontWeight: '600' }}>{count}</Text>
  </View>
);

/*  Recent Order Row  */
const OrderRow = ({ order, isRTL }: { order: any; isRTL: boolean }) => {
  const sc = (s: string) => {
    switch (s) {
      case 'delivered': return { bg: COLORS.success + '15', text: COLORS.success };
      case 'shipped': return { bg: COLORS.secondary + '15', text: COLORS.secondary };
      case 'processing': return { bg: COLORS.warning + '15', text: COLORS.warning };
      case 'cancelled': return { bg: COLORS.error + '15', text: COLORS.error };
      default: return { bg: COLORS.border, text: COLORS.textSecondary };
    }
  };
  const c = sc(order.status);
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }, isRTL && { flexDirection: 'row-reverse' }]}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.surfaceHighlight, justifyContent: 'center', alignItems: 'center', marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>
          {order.orderNumber?.slice(-2) || '#'}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[{ fontSize: 13, fontWeight: '600', color: COLORS.text }, isRTL && { textAlign: 'right' }]}>#{order.orderNumber}</Text>
        <Text style={[{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }, isRTL && { textAlign: 'right' }]}>{new Date(order.orderDate).toLocaleDateString()}</Text>
      </View>
      <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.text }}>${parseFloat(order.totalAmount || 0).toLocaleString()}</Text>
        <View style={{ backgroundColor: c.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 }}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: c.text, textTransform: 'capitalize' }}>{order.status}</Text>
        </View>
      </View>
    </View>
  );
};

/*  Main  */
interface DashboardScreenProps {
  navigate?: (screenId: string) => void;
  resetTo?: (screenId: string) => void;
}

const DashboardScreen = ({ navigate, resetTo }: DashboardScreenProps) => {
  const { t, isRTL } = useTranslation();
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
      <View style={[styles.outer, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('dashboard_loading')}</Text>
      </View>
    );
  }

  const trendUp = stats.revenueTrend >= 0;
  const trendColor = trendUp ? COLORS.success : COLORS.error;

  // Hero revenue card with professional gradient
  const heroCardWrapper: ViewStyle = { 
    marginBottom: SPACING.md, 
    borderRadius: 20, 
    overflow: 'hidden', 
    ...SHADOWS.large,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  };
  
  return (
    <View style={styles.outer}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={[styles.header, isRTL && styles.rowReverse]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, isRTL && styles.textRight]}>{t('dashboard_welcome')}</Text>
              <Text style={[styles.title, isRTL && styles.textRight]}>{t('dashboard_overview')}</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn} onPress={() => navigate?.('notifications')} activeOpacity={0.6}>
              <LinearGradient
                colors={[COLORS.glass, COLORS.surfaceHighlight]}
                style={styles.bellBtnGradient}
              >
                <BellIcon />
                <View style={styles.bellDot} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Revenue hero card with professional gradient */}
          <View style={heroCardWrapper}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, isRTL && styles.rowReverse]}>
                <View>
                  <Text style={[styles.heroLabel, isRTL && styles.textRight]}>{t('dashboard_revenue')}</Text>
                  <Text style={[styles.heroValue, isRTL && styles.textRight]}>${stats.totalRevenue.toLocaleString()}</Text>
                </View>
                <View style={[styles.trendBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <TrendIcon up={trendUp} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginLeft: 4 }}>
                    {trendUp ? '+' : ''}{stats.revenueTrend.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <View style={[styles.heroMeta, isRTL && styles.rowReverse]}>
                <Text style={styles.heroMetaText}>{stats.totalOrders} {t('dashboard_orders').toLowerCase()}</Text>
                <View style={styles.heroDivider} />
                <Text style={styles.heroMetaText}>{stats.totalStores} {t('nav_stores').toLowerCase()}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Quick metrics with professional cards */}
          <View style={[styles.metricsRow, isRTL && styles.rowReverse]}>
            {[
              { value: stats.totalProducts, label: t('nav_products'), color: COLORS.primary },
              { value: stats.activeProducts, label: t('dashboard_active'), color: COLORS.success },
              { value: stats.lowStock || 0, label: t('dashboard_lowStock'), color: COLORS.warning },
              { value: stats.outOfStock, label: t('dashboard_outOfStock'), color: COLORS.error },
            ].map((m, i) => (
              <View key={i} style={styles.metricChipWrapper}>
                <LinearGradient
                  colors={[COLORS.glass, COLORS.surfaceHighlight]}
                  style={styles.metricChip}
                >
                  <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Order Activity Chart */}
          <LinearGradient
            colors={[COLORS.glass, COLORS.surfaceHighlight]}
            style={styles.section}
          >
            <View style={[styles.sectionHead, isRTL && styles.rowReverse]}>
              <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t('dashboard_orderActivity')}</Text>
              <Text style={styles.sectionMeta}>{t('dashboard_weeklyTrend')}</Text>
            </View>
            <BarChart
              data={stats.weeklyTrend}
              dayLabels={stats.dayLabels.map((d: string, i: number) => {
                const dayKeys = ['dashboard_mon','dashboard_tue','dashboard_wed','dashboard_thu','dashboard_fri','dashboard_sat','dashboard_sun'];
                return t(dayKeys[i] as any) || d;
              })}
              trendPct={stats.revenueTrend}
            />
          </LinearGradient>

          {/* Inventory Status */}
          <LinearGradient
            colors={[COLORS.glass, COLORS.surfaceHighlight]}
            style={styles.section}
          >
            <View style={[styles.sectionHead, isRTL && styles.rowReverse]}>
              <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t('dashboard_inventoryStatus')}</Text>
            </View>
            <View style={{ marginTop: 8 }}>
              <DonutStat label={t('dashboard_active')} count={stats.activeProducts} color={COLORS.success} />
              <DonutStat label={t('dashboard_lowStock')} count={stats.lowStock || 0} color={COLORS.warning} />
              <DonutStat label={t('dashboard_outOfStock')} count={stats.outOfStock} color={COLORS.error} />
            </View>
            {/* Progress bar */}
            <View style={styles.progressBar}>
              {stats.totalProducts > 0 && (
                <>
                  <View style={[styles.progressSegment, { flex: stats.activeProducts, backgroundColor: COLORS.success, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
                  <View style={[styles.progressSegment, { flex: Math.max(stats.lowStock || 0, 0.1), backgroundColor: COLORS.warning }]} />
                  <View style={[styles.progressSegment, { flex: Math.max(stats.outOfStock, 0.1), backgroundColor: COLORS.error, borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
                </>
              )}
            </View>
            <TouchableOpacity style={styles.linkBtn} onPress={() => navigate?.('products')} activeOpacity={0.6}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.linkBtnGradient}
              >
                <Text style={styles.linkBtnText}>{t('dashboard_manageInventory')}</Text>
                <ArrowRightIcon />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>

          {/* Recent Orders */}
          {stats.recentOrders?.length > 0 && (
            <LinearGradient
              colors={[COLORS.glass, COLORS.surfaceHighlight]}
              style={styles.section}
            >
              <View style={[styles.sectionHead, isRTL && styles.rowReverse]}>
                <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t('dashboard_orders')}</Text>
                <TouchableOpacity onPress={() => navigate?.('orders')} activeOpacity={0.6}>
                  <Text style={styles.viewAllLink}>{t('common_viewAll') || 'View All'}</Text>
                </TouchableOpacity>
              </View>
              {stats.recentOrders.map((order: any, i: number) => (
                <React.Fragment key={order.id}>
                  <OrderRow order={order} isRTL={isRTL} />
                  {i < stats.recentOrders.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </LinearGradient>
          )}

          {/* Live Activity */}
          <LinearGradient
            colors={[COLORS.glass, COLORS.surfaceHighlight]}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t('dashboard_liveActivity')}</Text>
            <View style={{ marginTop: 12 }}>
              <View style={[styles.actRow, isRTL && styles.rowReverse]}>
                <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
                <Text style={[styles.actText, isRTL && styles.textRight]}>{t('dashboard_usersActive', { count: stats.totalStores })}</Text>
              </View>
              <View style={[styles.actRow, isRTL && styles.rowReverse]}>
                <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
                <Text style={[styles.actText, isRTL && styles.textRight]}>{t('dashboard_eventsLogged', { count: stats.eventsCount })}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
      <BottomNav activeTab="dashboard" onTabPress={handleTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.textMuted, fontSize: 13 },
  content: { padding: SPACING.md, paddingTop: 52, paddingBottom: 110 },
  rowReverse: { flexDirection: 'row-reverse' as any },
  textRight: { textAlign: 'right' as any },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greeting: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600', marginBottom: 4, letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  bellBtn: { width: 48, height: 48, borderRadius: 14, overflow: 'hidden', ...SHADOWS.small },
  bellBtnGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.glassBorder },
  bellDot: { position: 'absolute', top: 12, right: 13, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error },

  // Hero revenue card
  heroCard: { borderRadius: 20, padding: 24 },
  heroLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '700', textTransform: 'uppercase' as any, letterSpacing: 1.5, marginBottom: 8 },
  heroValue: { fontSize: 38, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingTop: 18, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.25)' },
  heroMetaText: { fontSize: 14, color: 'rgba(255,255,255,0.95)', fontWeight: '700' },
  heroDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.6)', marginHorizontal: 12 },

  // Metrics
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.md },
  metricChipWrapper: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  metricChip: { paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: COLORS.glassBorder, borderRadius: 16 },
  metricValue: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  metricLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase' as any, letterSpacing: 0.5 },

  // Sections
  section: { borderRadius: 20, padding: SPACING.md + 2, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.glassBorder },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  sectionMeta: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },

  // Progress bar
  progressBar: { flexDirection: 'row', height: 8, borderRadius: 4, backgroundColor: COLORS.border, marginTop: 16, overflow: 'hidden' },
  progressSegment: { height: 8 },

  // Link button
  linkBtn: { marginTop: 16, borderRadius: 12, overflow: 'hidden' },
  linkBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  linkBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14, marginRight: 6 },
  viewAllLink: { fontSize: 13, color: COLORS.primary, fontWeight: '800' },

  // Divider
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 0 },

  // Activity
  actRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  actText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
});

export default DashboardScreen;
