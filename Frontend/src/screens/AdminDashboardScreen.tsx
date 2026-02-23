/**
 * AdminDashboardScreen — 2026 Modern Admin Command Center
 * Redesigned to match seller/buyer dashboard UI
 * 
 * Features:
 * - Smooth bezier area charts with gradient fills
 * - Animated count-up stat counters
 * - LivePulse indicators
 * - Bento grid metric cards with trend badges
 * - Weekly growth charts (7-day trends)
 * - Quick action management cards
 * - Dark/Light theme + Multi-language support
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Logo } from '../components/Logo';
import AdminBottomNav, { AdminTabId } from './AdminBottomNav';
import { API_URL } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: W } = Dimensions.get('window');
const CARD_R = 22;
const GRID_GAP = 12;

/* ══════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════ */
const SunIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke="#FDB913" strokeWidth="2" />
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB913" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const MoonIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrendUp = ({ color }: { color: string }) => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 6H23V12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const TrendDown = ({ color }: { color: string }) => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M23 18L13.5 8.5L8.5 13.5L1 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 18H23V12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const UsersIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path d="M23 21V19C23 17.34 21.95 15.91 20.5 15.39" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16.5 3.13C17.95 3.65 19 5.08 19 6.75C19 8.42 17.95 9.85 16.5 10.37" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const StoreIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9L12 2L21 9V20C21 20.53 20.79 21.04 20.41 21.41C20.04 21.79 19.53 22 19 22H5C4.47 22 3.96 21.79 3.59 21.41C3.21 21.04 3 20.53 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const CartIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="21" r="1" fill={color} />
    <Circle cx="20" cy="21" r="1" fill={color} />
    <Path d="M1 1H5L7.68 14.39C7.77 14.83 8.02 15.22 8.38 15.49C8.74 15.76 9.19 15.9 9.64 15.88H19.4C19.85 15.9 20.3 15.76 20.66 15.49C21.02 15.22 21.27 14.83 21.36 14.39L23 6H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const TruckIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M1 3H15V13H1V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 8H19L23 12V13H15V8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="5.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2" />
    <Circle cx="18.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2" />
  </Svg>
);
const FileCheckIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6C5.47 2 4.96 2.21 4.59 2.59C4.21 2.96 4 3.47 4 4V20C4 20.53 4.21 21.04 4.59 21.41C4.96 21.79 5.47 22 6 22H18C18.53 22 19.04 21.79 19.41 21.41C19.79 21.04 20 20.53 20 20V8L14 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2V8H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 15L11 17L15 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const DollarIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 1V23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 5H9.5C8.57 5 7.68 5.37 7.02 6.02C6.37 6.68 6 7.57 6 8.5C6 9.43 6.37 10.32 7.02 10.98C7.68 11.63 8.57 12 9.5 12H14.5C15.43 12 16.32 12.37 16.98 13.02C17.63 13.68 18 14.57 18 15.5C18 16.43 17.63 17.32 16.98 17.98C16.32 18.63 15.43 19 14.5 19H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const LogoutIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 17L21 12L16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ══════════════════════════════════════════════════
   LIVE PULSE DOT
══════════════════════════════════════════════════ */
const LivePulse = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.6, duration: 700, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.2, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: 700, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#4ADE80', opacity, transform: [{ scale }], position: 'absolute' }} />
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' }} />
      </View>
      <Text style={{ fontSize: 11, fontWeight: '700', color: '#4ADE80', letterSpacing: 0.5 }}>LIVE</Text>
    </View>
  );
};

/* ══════════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════════ */
const AnimatedCounter = ({ value, prefix = '', suffix = '', style }: any) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    const n = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    anim.setValue(0);
    const id = anim.addListener(({ value: v }) => setDisplay(Math.round(v).toLocaleString()));
    Animated.timing(anim, { toValue: n, duration: 1200, useNativeDriver: false }).start();
    return () => anim.removeListener(id);
  }, [value]);
  return <Text style={style}>{prefix}{display}{suffix}</Text>;
};

/* ══════════════════════════════════════════════════
   SVG AREA CHART (Bezier)
══════════════════════════════════════════════════ */
const AreaChart = ({ data, color, COLORS }: { data: number[]; color: string; COLORS: any }) => {
  const W_CHART = W - 40;
  const H = 110;
  const PAD = 16;
  const pts = data.length;
  const maxV = Math.max(...data, 1);
  const minV = 0;

  const xs = data.map((_, i) => PAD + (i / (pts - 1)) * (W_CHART - PAD * 2));
  const ys = data.map(v => PAD + (1 - (v - minV) / (maxV - minV)) * (H - PAD * 2));

  // Cubic bezier smooth path
  let linePath = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < pts; i++) {
    const cpx1 = xs[i - 1] + (xs[i] - xs[i - 1]) / 3;
    const cpx2 = xs[i] - (xs[i] - xs[i - 1]) / 3;
    linePath += ` C ${cpx1} ${ys[i - 1]}, ${cpx2} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  const fillPath = `${linePath} L ${xs[pts - 1]} ${H} L ${xs[0]} ${H} Z`;

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View>
      <Svg width={W_CHART} height={H}>
        <Defs>
          <SvgGrad id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </SvgGrad>
        </Defs>
        {/* Fill */}
        <Path d={fillPath} fill="url(#areaGrad)" />
        {/* Line */}
        <Path d={linePath} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {xs.map((x, i) => (
          <Circle key={i} cx={x} cy={ys[i]} r={3.5} fill={color} />
        ))}
      </Svg>
      <View style={styles.chartDays}>
        {days.map((d, i) => (
          <Text key={i} style={[styles.chartDayLabel, { color: COLORS.textMuted }]}>{d}</Text>
        ))}
      </View>
    </View>
  );
};

/* ══════════════════════════════════════════════════
   METRIC CARD (Bento)
══════════════════════════════════════════════════ */
const MetricCard = ({ title, value, change, icon, accentColor, COLORS }: any) => {
  const isPos = change >= 0;
  const half = (W - 40 - GRID_GAP) / 2;
  return (
    <View style={[styles.metricCard, { width: half, backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
      <View style={styles.metricTop}>
        <View style={[styles.metricIcon, { backgroundColor: accentColor + '18' }]}>
          {icon}
        </View>
        <View style={[styles.trendBadge, { backgroundColor: isPos ? COLORS.success + '18' : COLORS.error + '18' }]}>
          {isPos ? <TrendUp color={COLORS.success} /> : <TrendDown color={COLORS.error} />}
          <Text style={[styles.trendText, { color: isPos ? COLORS.success : COLORS.error }]}>
            {isPos ? '+' : ''}{change.toFixed(1)}%
          </Text>
        </View>
      </View>
      <AnimatedCounter value={value} style={[styles.metricValue, { color: COLORS.text }]} />
      <Text style={[styles.metricLabel, { color: COLORS.textMuted }]}>{title}</Text>
    </View>
  );
};

/* ══════════════════════════════════════════════════
   INTERFACES
══════════════════════════════════════════════════ */
interface AdminDashboardScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
}

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalDelivery: number;
  pendingUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingSellerRegistrations: number;
  pendingDeliveryRegistrations: number;
  totalStores: number;
  activeStores: number;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  recentBuyers: number;
  recentSellers: number;
  recentDelivery: number;
  weeklyData?: Array<{
    date: string;
    buyers: number;
    sellers: number;
    delivery: number;
    orders: number;
  }>;
}

/* ══════════════════════════════════════════════════
   MAIN SCREEN
══════════════════════════════════════════════════ */
const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigate, resetTo }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();

  console.log('🎨 AdminDashboardScreen RENDERED');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0, totalSellers: 0, totalBuyers: 0, totalDelivery: 0,
    pendingUsers: 0, activeUsers: 0, suspendedUsers: 0,
    pendingSellerRegistrations: 0, pendingDeliveryRegistrations: 0,
    totalStores: 0, activeStores: 0,
    totalOrders: 0, completedOrders: 0, totalRevenue: 0,
    recentBuyers: 0, recentSellers: 0, recentDelivery: 0,
    weeklyData: [],
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const idx = langs.indexOf(language as 'en' | 'ar' | 'fr');
    setLanguage(langs[(idx + 1) % langs.length]);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      resetTo?.('welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      if (token) {
        const response = await fetch(`${API_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats || data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }
  }, []);

  useEffect(() => { loadData(); }, []);
  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleTab = (tab: AdminTabId) => {
    if (tab === 'dashboard') return;
    if (tab === 'stores') navigate?.('adminStores');
    if (tab === 'sellers') navigate?.('adminSellers');
    if (tab === 'delivery') navigate?.('adminDelivery');
    if (tab === 'products') navigate?.('adminProducts');
  };

  if (loading) {
    return (
      <View style={[styles.outer, { backgroundColor: COLORS.background }, styles.center]}>
        <View style={{ backgroundColor: COLORS.surface, padding: 40, borderRadius: CARD_R, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 14, color: COLORS.textMuted, fontWeight: '600' }}>Loading Admin Dashboard...</Text>
        </View>
      </View>
    );
  }

  const buyersChartData = stats.weeklyData?.map(d => d.buyers) || [0, 0, 0, 0, 0, 0, 0];
  const sellersChartData = stats.weeklyData?.map(d => d.sellers) || [0, 0, 0, 0, 0, 0, 0];
  const deliveryChartData = stats.weeklyData?.map(d => d.delivery) || [0, 0, 0, 0, 0, 0, 0];
  const ordersChartData = stats.weeklyData?.map(d => d.orders) || [0, 0, 0, 0, 0, 0, 0];

  const totalPending = stats.pendingSellerRegistrations + stats.pendingDeliveryRegistrations;

  return (
    <View style={[styles.outer, { backgroundColor: COLORS.background }]}>
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ─── Header ────────────────────────────── */}
        <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.headerLeft, isRTL && { flexDirection: 'row-reverse' }]}>
            <Logo variant="icon" size={32} />
            <View style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0, flex: 1, minWidth: 0 }}>
              <Text style={[styles.greeting, { color: COLORS.textMuted }]} numberOfLines={1}>{t('admin_dashboard')}</Text>
              <Text style={[styles.userName, { color: COLORS.text }]} numberOfLines={1} ellipsizeMode="tail">{t('admin_platformOverview')}</Text>
            </View>
          </View>
          <View style={[styles.controls, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={cycleLanguage} activeOpacity={0.7}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: COLORS.text }}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={toggleTheme} activeOpacity={0.7}>
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: COLORS.error + '15', borderColor: COLORS.error + '30' }]} onPress={handleLogout} activeOpacity={0.7}>
              <LogoutIcon color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Hero Revenue Card ────────────────────────────── */}
        <LinearGradient
          colors={mode === 'dark' ? ['#1E293B', '#0F172A'] : ['#F8FAFC', '#F1F5F9']}
          style={[styles.heroCard, { borderColor: COLORS.border }]}
        >
          <View style={styles.heroTop}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Text style={[styles.heroLabel, { color: COLORS.textMuted }]}>{t('seller_totalRevenue')}</Text>
                <LivePulse />
              </View>
              <AnimatedCounter value={stats.totalRevenue} prefix="DZD " style={[styles.heroValue, { color: COLORS.text }]} />
            </View>
            <View style={[styles.heroIconWrap, { backgroundColor: COLORS.success + '18' }]}>
              <DollarIcon color={COLORS.success} />
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatLabel, { color: COLORS.textMuted }]}>{t('seller_orders')}</Text>
              <AnimatedCounter value={stats.totalOrders} style={[styles.heroStatValue, { color: COLORS.text }]} />
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: COLORS.border }]} />
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatLabel, { color: COLORS.textMuted }]}>{t('seller_completed')}</Text>
              <AnimatedCounter value={stats.completedOrders} style={[styles.heroStatValue, { color: COLORS.text }]} />
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: COLORS.border }]} />
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatLabel, { color: COLORS.textMuted }]}>{t('admin_activeStores')}</Text>
              <AnimatedCounter value={stats.activeStores} style={[styles.heroStatValue, { color: COLORS.text }]} />
            </View>
          </View>
        </LinearGradient>

        {/* ─── Bento Grid Metrics ────────────────────────────── */}
        <View style={styles.bentoGrid}>
          <MetricCard title={t('admin_totalUsers')} value={stats.totalUsers} change={5.2} icon={<UsersIcon color={COLORS.primary} />} accentColor={COLORS.primary} COLORS={COLORS} />
          <MetricCard title={t('admin_sellers')} value={stats.totalSellers} change={3.8} icon={<StoreIcon color="#F59E0B" />} accentColor="#F59E0B" COLORS={COLORS} />
          <MetricCard title={t('admin_buyers')} value={stats.totalBuyers} change={7.1} icon={<CartIcon color="#10B981" />} accentColor="#10B981" COLORS={COLORS} />
          <MetricCard title={t('admin_delivery')} value={stats.totalDelivery} change={2.4} icon={<TruckIcon color="#8B5CF6" />} accentColor="#8B5CF6" COLORS={COLORS} />
        </View>

        {/* ─── Weekly Growth Charts ────────────────────────────── */}
        <View style={[styles.chartCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: COLORS.text }]}>{t('admin_buyers')} {t('seller_growth')}</Text>
            <Text style={[styles.chartSubtitle, { color: COLORS.textMuted }]}>{t('seller_last7Days')}</Text>
          </View>
          <View style={{ overflow: 'hidden' }}>
            <AreaChart data={buyersChartData} color="#10B981" COLORS={COLORS} />
          </View>
        </View>

        <View style={[styles.chartCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: COLORS.text }]}>{t('admin_sellers')} {t('seller_growth')}</Text>
            <Text style={[styles.chartSubtitle, { color: COLORS.textMuted }]}>{t('seller_last7Days')}</Text>
          </View>
          <View style={{ overflow: 'hidden' }}>
            <AreaChart data={sellersChartData} color="#F59E0B" COLORS={COLORS} />
          </View>
        </View>

        <View style={[styles.chartCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: COLORS.text }]}>{t('admin_delivery')}</Text>
            <Text style={[styles.chartSubtitle, { color: COLORS.textMuted }]}>{t('seller_last7Days')}</Text>
          </View>
          <View style={{ overflow: 'hidden' }}>
            <AreaChart data={deliveryChartData} color="#8B5CF6" COLORS={COLORS} />
          </View>
        </View>

        <View style={[styles.chartCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: COLORS.text }]}>{t('seller_orders')} {t('seller_activity')}</Text>
            <Text style={[styles.chartSubtitle, { color: COLORS.textMuted }]}>{t('seller_last7Days')}</Text>
          </View>
          <View style={{ overflow: 'hidden' }}>
            <AreaChart data={ordersChartData} color={COLORS.primary} COLORS={COLORS} />
          </View>
        </View>

        {/* ─── Quick Actions ────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>{t('admin_quickActions')}</Text>
        
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
          onPress={() => navigate?.('adminUsers')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '18' }]}>
            <UsersIcon color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionTitle, { color: COLORS.text }]}>{t('admin_users')}</Text>
            <Text style={[styles.actionDesc, { color: COLORS.textMuted }]}>{t('admin_allUsers')}</Text>
          </View>
          <View style={[styles.actionBadge, { backgroundColor: COLORS.primary + '18' }]}>
            <Text style={[styles.actionBadgeText, { color: COLORS.primary }]}>{stats.totalUsers}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
          onPress={() => navigate?.('adminStores')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#F59E0B18' }]}>
            <StoreIcon color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionTitle, { color: COLORS.text }]}>{t('admin_stores')}</Text>
            <Text style={[styles.actionDesc, { color: COLORS.textMuted }]}>{t('admin_allStoresDesc')}</Text>
          </View>
          <View style={[styles.actionBadge, { backgroundColor: '#F59E0B18' }]}>
            <Text style={[styles.actionBadgeText, { color: '#F59E0B' }]}>{stats.totalStores}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
          onPress={() => navigate?.('adminSellers')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#10B98118' }]}>
            <StoreIcon color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionTitle, { color: COLORS.text }]}>{t('admin_manageSellers')}</Text>
            <Text style={[styles.actionDesc, { color: COLORS.textMuted }]}>{t('admin_manageSellersDesc')}</Text>
          </View>
          <View style={[styles.actionBadge, { backgroundColor: '#10B98118' }]}>
            <Text style={[styles.actionBadgeText, { color: '#10B981' }]}>{stats.totalSellers}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
          onPress={() => navigate?.('adminDelivery')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#8B5CF618' }]}>
            <TruckIcon color="#8B5CF6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionTitle, { color: COLORS.text }]}>{t('admin_manageDelivery')}</Text>
            <Text style={[styles.actionDesc, { color: COLORS.textMuted }]}>{t('admin_manageDeliveryDesc')}</Text>
          </View>
          <View style={[styles.actionBadge, { backgroundColor: '#8B5CF618' }]}>
            <Text style={[styles.actionBadgeText, { color: '#8B5CF6' }]}>{stats.totalDelivery}</Text>
          </View>
        </TouchableOpacity>

        {totalPending > 0 && (
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: COLORS.warning + '08', borderColor: COLORS.warning + '30' }]}
            onPress={() => navigate?.('adminDocumentReview')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.warning + '18' }]}>
              <FileCheckIcon color={COLORS.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionTitle, { color: COLORS.text }]}>{t('admin_pendingVerifications')}</Text>
              <Text style={[styles.actionDesc, { color: COLORS.textMuted }]}>{t('admin_docReviewDesc')}</Text>
            </View>
            <View style={[styles.actionBadge, { backgroundColor: COLORS.warning + '18' }]}>
              <Text style={[styles.actionBadgeText, { color: COLORS.warning }]}>{totalPending}</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* ─── Bottom Navigation ────────────────────────────── */}
      <AdminBottomNav activeTab="dashboard" onTabPress={handleTab} />
    </View>
  );
};

/* ══════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  outer: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: SPACING.lg, paddingBottom: 30 },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, maxWidth: '55%', minWidth: 0 },
  greeting: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  userName: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
  controls: { flexDirection: 'row', gap: 6, flexShrink: 0 },
  ctrlBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  heroCard: { borderRadius: CARD_R, padding: 20, marginBottom: 20, borderWidth: 1 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  heroLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  heroValue: { fontSize: 42, fontWeight: '900', letterSpacing: -2 },
  heroIconWrap: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  heroStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  heroStatItem: { alignItems: 'center' },
  heroStatLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  heroStatValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  heroStatDivider: { width: 1, height: 32 },

  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, marginBottom: 20 },
  metricCard: { borderRadius: CARD_R, padding: 16, borderWidth: 1 },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  trendText: { fontSize: 11, fontWeight: '700' },
  metricValue: { fontSize: 28, fontWeight: '900', letterSpacing: -1, marginBottom: 4 },
  metricLabel: { fontSize: 12, fontWeight: '600' },

  chartCard: { borderRadius: CARD_R, padding: 18, marginBottom: 16, borderWidth: 1 },
  chartHeader: { marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  chartSubtitle: { fontSize: 12, fontWeight: '600' },
  chartDays: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 16 },
  chartDayLabel: { fontSize: 11, fontWeight: '600', width: 20, textAlign: 'center' },

  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 14, letterSpacing: -0.5 },
  
  actionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: CARD_R, marginBottom: 12, borderWidth: 1 },
  actionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  actionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  actionDesc: { fontSize: 12, fontWeight: '600' },
  actionBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  actionBadgeText: { fontSize: 14, fontWeight: '800' },
});

export default AdminDashboardScreen;
