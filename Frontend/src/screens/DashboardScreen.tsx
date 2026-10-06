/**
 * DashboardScreen — Algérie Poste E-Commerce Seller & Buyer Dashboard
 */
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
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { dashboardAPI } from '../services/api.service';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Logo } from '../components/Logo';
import BottomNav, { BottomTabId } from './BottomNav';
import { API_URL } from '../config/api.config';

const { width: W } = Dimensions.get('window');
const CARD_R = 22;
const GRID_GAP = 12;

/* ══════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════ */
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
const StoreIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9L12 2L21 9V20C21 20.53 20.79 21.04 20.41 21.41C20.04 21.79 19.53 22 19 22H5C4.47 22 3.96 21.79 3.59 21.41C3.21 21.04 3 20.53 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const BoxIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 16V8C21 7.47 20.74 6.97 20.31 6.65L13.31 1.65C12.93 1.38 12.47 1.38 12.09 1.65L5.09 6.65C4.66 6.97 4.4 7.47 4.4 8V16C4.4 16.53 4.66 17.03 5.09 17.35L12.09 22.35C12.47 22.62 12.93 22.62 13.31 22.35L20.31 17.35C20.74 17.03 21 16.53 21 16Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3.27 6.96L12 12.01L20.73 6.96" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 22.08V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const CartIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6V20C3 20.53 3.21 21.04 3.59 21.41C3.96 21.79 4.47 22 5 22H19C19.53 22 20.04 21.79 20.41 21.41C20.79 21.04 21 20.53 21 20V6L18 2H6Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 6H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 10C16 11.06 15.58 12.08 14.83 12.83C14.08 13.58 13.06 14 12 14C10.94 14 9.92 13.58 9.17 12.83C8.42 12.08 8 11.06 8 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const AlertIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.65 1.56 19C1.57 19.35 1.67 19.69 1.86 19.98C2.05 20.27 2.31 20.51 2.62 20.66C2.93 20.82 3.28 20.9 3.63 20.9H20.37C20.72 20.9 21.07 20.82 21.38 20.66C21.69 20.51 21.95 20.27 22.14 19.98C22.33 19.69 22.43 19.35 22.44 19C22.45 18.65 22.36 18.3 22.18 18L13.71 3.86C13.52 3.56 13.26 3.31 12.95 3.14C12.64 2.97 12.29 2.88 11.95 2.88C11.61 2.88 11.26 2.97 10.95 3.14C10.64 3.31 10.38 3.56 10.29 3.86Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 9V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 17H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const QuickAddIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);
const QuickOrderIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 11L12 14L22 4" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 12V19C21 19.53 20.79 20.04 20.41 20.41C20.04 20.79 19.53 21 19 21H5C4.47 21 3.96 20.79 3.59 20.41C3.21 20.04 3 19.53 3 19V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const CheckCircleIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M22 11.08V12C21.99 14.52 21.14 16.96 19.59 18.94C18.03 20.92 15.87 22.27 13.44 22.78C11.01 23.29 8.49 22.93 6.29 21.78C4.1 20.62 2.37 18.73 1.42 16.42C0.47 14.1 0.34 11.51 1.06 9.1C1.78 6.69 3.3 4.63 5.37 3.25C7.44 1.87 9.93 1.25 12.41 1.49C14.89 1.73 17.18 2.82 18.93 4.56" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 4L12 14.01L9 11.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const RocketIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M4.5 16.5L2 22L7.5 19.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 2C12 2 7 4 5 11L13 19C20 17 22 12 22 12C22 12 20 5 12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="15" cy="9" r="2" stroke={color} strokeWidth="2" />
  </Svg>
);
const ShieldLockIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  const [chartWidth, setChartWidth] = useState(W - 80);
  const H = 110;
  const PAD_X = 14;
  const PAD_Y = 14;
  const plotData = (!data || data.length === 0) ? [0, 0, 0, 0, 0, 0, 0] : data;
  const pts = plotData.length;
  const maxV = Math.max(...plotData, 1);
  const minV = 0;

  const xs = plotData.map((_, i) => PAD_X + (i / Math.max(pts - 1, 1)) * (chartWidth - PAD_X * 2));
  const ys = plotData.map(v => PAD_Y + (1 - (v - minV) / (maxV - minV)) * (H - PAD_Y * 2));

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
    <View
      style={{ width: '100%', overflow: 'hidden' }}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - chartWidth) > 1) {
          setChartWidth(w);
        }
      }}
    >
      <Svg width={chartWidth} height={H}>
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
      <View style={{ width: chartWidth, height: 20, marginTop: 8, position: 'relative' }}>
        {days.map((d, i) => {
          const x = xs[i] ?? (PAD_X + (i / Math.max(days.length - 1, 1)) * (chartWidth - PAD_X * 2));
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: x - 15,
                width: 30,
                alignItems: 'center',
              }}
            >
              <Text style={[styles.chartDayLabel, { color: COLORS.textMuted }]}>{d}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

/* ══════════════════════════════════════════════════
   METRIC CARD (Bento)
══════════════════════════════════════════════════ */
const MetricCard = ({ title, value, icon, accentColor, COLORS }: any) => {
  const half = (W - 40 - GRID_GAP) / 2;
  return (
    <View style={[styles.metricCard, { width: half, backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
      <View style={styles.metricTop}>
        <View style={[styles.metricIcon, { backgroundColor: accentColor + '18' }]}>
          {icon}
        </View>
      </View>
      <AnimatedCounter value={value} style={[styles.metricValue, { color: COLORS.text }]} />
      <Text style={[styles.metricLabel, { color: COLORS.textMuted }]}>{title}</Text>
    </View>
  );
};

/* ══════════════════════════════════════════════════
   ORDER ROW (Recent Orders)
══════════════════════════════════════════════════ */
const OrderRow = ({ order, COLORS, t }: { order: any; COLORS: any; t: (k: any) => string }) => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    delivered: { bg: COLORS.success + '18', text: COLORS.success },
    shipped: { bg: '#3B82F618', text: '#3B82F6' },
    processing: { bg: COLORS.warning + '18', text: COLORS.warning },
    cancelled: { bg: COLORS.error + '18', text: COLORS.error },
  };
  const sc = statusColors[order.status?.toLowerCase()] || { bg: COLORS.border, text: COLORS.textMuted };
  return (
    <View style={[styles.orderRow, { borderBottomColor: COLORS.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.orderNum, { color: COLORS.text }]}>{order.orderNumber || `#${order.id}`}</Text>
        <Text style={[styles.orderMeta, { color: COLORS.textMuted }]}>
          {order.user?.fullName || order.user?.email || t('common_customer')} · {new Date(order.orderDate).toLocaleDateString()}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={[styles.orderAmt, { color: COLORS.primary }]}>{(+order.totalAmount || 0).toFixed(2)} DZD</Text>
        <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusPillText, { color: sc.text }]}>{order.status}</Text>
        </View>
      </View>
    </View>
  );
};

/* ══════════════════════════════════════════════════
   MAIN SCREEN
══════════════════════════════════════════════════ */
interface DashboardScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
}

const DashboardScreen = ({ navigate, resetTo }: DashboardScreenProps) => {
  console.log('🏪 SELLER DashboardScreen RENDERED');
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();

  /* State */
  const [userType, setUserType] = useState<'buyer' | 'seller' | 'both'>('buyer');
  const [userName, setUserName] = useState('');
  const [docStatus, setDocStatus] = useState<'approved' | 'pending' | 'rejected' | 'not_submitted'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* Seller stats */
  const [revenue, setRevenue] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [storesCount, setStoresCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState([10, 25, 18, 45, 32, 58, 41]);

  /* Buyer stats */
  const [buyerOrders, setBuyerOrders] = useState({ total: 0, processing: 0, shipped: 0, delivered: 0 });

  /* Animations */
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const idx = langs.indexOf(language as 'en' | 'ar' | 'fr');
    setLanguage(langs[(idx + 1) % langs.length]);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      /* Get user from AsyncStorage first */
      const raw = await AsyncStorage.getItem('userData');
      if (raw) {
        const u = JSON.parse(raw);
        setUserType(u.accountType || 'buyer');
        setUserName(u.fullName || u.email?.split('@')[0] || 'User');
      }

      /* Get auth token */
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          const res = await fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const u = await res.json();
            
            // Check if user is admin and redirect to admin dashboard
            if (u.isAdmin === true || u.accountType === 'admin') {
              console.log('✅ Admin user detected in DashboardScreen, redirecting to admin dashboard');
              if (resetTo) {
                resetTo('adminDashboard');
              }
              return;
            }
            
            setUserType(u.accountType || 'buyer');
            setUserName(u.fullName || u.email?.split('@')[0] || 'User');
            if (u.sellerRegistration?.verificationStatus) {
              const vs = u.sellerRegistration.verificationStatus;
              setDocStatus(vs === 'approved' ? 'approved' : vs === 'rejected' ? 'rejected' : vs === 'pending' ? 'pending' : 'not_submitted');
              setRejectionReason(u.sellerRegistration.rejectionReason || '');
            } else {
              setDocStatus(u.accountStatus === 'active' ? 'approved' : 'pending');
            }
          }
        } catch (_) { }

        /* Load seller dashboard data */
        try {
          const data = await dashboardAPI.getStats();
          const stats = data.stats;
          setRevenue(stats.totalRevenue || 0);
          setOrdersCount(stats.totalOrders || 0);
          setStoresCount(stats.totalStores || 0);
          setProductsCount(stats.totalProducts || 0);
          setRecentOrders((stats.recentOrders || []).slice(0, 5));
          if (stats.weeklyTrend?.length >= 7) setChartData(stats.weeklyTrend.map((v: any) => Number(v) || 0));
        } catch (_) { }


        /* Load buyer order stats */
        try {
          const oRes = await fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } });
          if (oRes.ok) {
            const oData = await oRes.json();
            const orders = oData.orders || [];
            setBuyerOrders({
              total: orders.length,
              processing: orders.filter((o: any) => o.status?.toLowerCase() === 'processing').length,
              shipped: orders.filter((o: any) => o.status?.toLowerCase() === 'shipped').length,
              delivered: orders.filter((o: any) => o.status?.toLowerCase() === 'delivered').length,
            });
          } else if (oRes.status === 403) {
            // User doesn't have permission (likely needs document approval or is a buyer)
            console.log('⚠️ Orders API returned 403 - User may need document approval or is a buyer');
            setBuyerOrders({ total: 0, processing: 0, shipped: 0, delivered: 0 });
          }
        } catch (err) {
          console.log('⚠️ Failed to load buyer orders:', err);
          setBuyerOrders({ total: 0, processing: 0, shipped: 0, delivered: 0 });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }
  }, []);

  useEffect(() => { loadData(); }, []);
  const onRefresh = () => { setRefreshing(true); loadData(); };
  const handleTab = (tab: BottomTabId) => {
    if (tab === 'dashboard') return;
    resetTo ? resetTo(tab) : navigate?.(tab);
  };

  /* ──────────────── LOADING ──────────────── */
  if (loading) {
    return (
      <View style={[styles.outer, { backgroundColor: COLORS.background }, styles.center]}>
        <View style={{ backgroundColor: COLORS.surface, padding: 40, borderRadius: CARD_R, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 14, color: COLORS.textMuted, fontWeight: '600' }}>{t('dashboard_loading')}</Text>
        </View>
      </View>
    );
  }

  const isSeller = userType === 'seller' || userType === 'both';
  const isDocRestricted = isSeller && docStatus !== 'approved';
  const greeting = `${t('seller_welcomeBack')}, ${userName}`;

  /* ──────────────── SHARED HEADER ──────────────── */
  const Header = () => (
    <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
      <View style={[styles.headerLeft, isRTL && { flexDirection: 'row-reverse' }]}>
        <Logo variant="icon" size={38} />
        <View style={{ marginLeft: 10 }}>
          <Text style={[styles.greeting, { color: COLORS.textMuted }]}>{isSeller ? t('seller_welcomeBack') : t('buyer_hello')}</Text>
          <Text style={[styles.userName, { color: COLORS.text }]} numberOfLines={1}>{userName}</Text>
        </View>
      </View>
      <View style={[styles.controls, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={cycleLanguage} activeOpacity={0.7}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.text }}>{language.toUpperCase()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={toggleTheme} activeOpacity={0.7}>
          {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ──────────────── RESTRICTION BANNER ──────────────── */
  const DocRestrictionBanner = () => {
    if (!isDocRestricted) return null;
    const isPending = docStatus === 'pending';
    const isRejected = docStatus === 'rejected';
    const bannerColor = isRejected ? COLORS.error : COLORS.warning;

    return (
      <View style={[styles.restrictBanner, { backgroundColor: bannerColor + '12', borderColor: bannerColor + '35' }]}>
        <View style={[styles.restrictIcon, { backgroundColor: bannerColor + '18' }]}>
          <AlertIcon color={bannerColor} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.restrictTitle, { color: bannerColor }]}>
            {isPending ? t('docState_inReview') : isRejected ? t('docState_rejected') : t('docState_incomplete')}
          </Text>
          <Text style={[styles.restrictDesc, { color: COLORS.textSecondary }]}>
            {isPending ? t('docState_inReviewMsg') : isRejected ? t('docState_rejectedMsg') : t('docState_incompleteMsg')}
          </Text>
          {isRejected && rejectionReason ? (
            <Text style={[styles.restrictReason, { color: COLORS.error }]}>
              ↳ {rejectionReason}
            </Text>
          ) : null}
          <TouchableOpacity
            style={[styles.restrictBtn, { backgroundColor: bannerColor }]}
            onPress={() => navigate?.('documentUpload')}
            activeOpacity={0.8}
          >
            <Text style={styles.restrictBtnText}>
              {isRejected ? t('docState_resubmit') : isPending ? t('docState_viewStatus') : t('docState_uploadNow')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ══════════════════════════════════════════════════
     SELLER DASHBOARD
  ══════════════════════════════════════════════════ */
  const SellerDashboard = () => (
    <>
      <DocRestrictionBanner />

      {/* ── Hero Revenue Card ── */}
      <View style={[styles.heroCard, { borderColor: COLORS.border }]}>
        <LinearGradient colors={['#0D2C74', '#1E40AF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGradient}>
          {/* Top row */}
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>{t('seller_totalRevenue')}</Text>
              <AnimatedCounter value={revenue} suffix=" DZD" style={styles.heroAmount} />
            </View>
          </View>

          {/* Metrics strip */}
          <View style={styles.heroStrip}>
            <View style={styles.heroStat}>
              <AnimatedCounter value={ordersCount} style={styles.heroStatVal} />
              <Text style={styles.heroStatLabel}>{t('seller_orders')}</Text>
            </View>
            <View style={styles.heroStripDivider} />
            <View style={styles.heroStat}>
              <AnimatedCounter value={storesCount} style={styles.heroStatVal} />
              <Text style={styles.heroStatLabel}>{t('seller_stores')}</Text>
            </View>
            <View style={styles.heroStripDivider} />
            <View style={styles.heroStat}>
              <AnimatedCounter value={productsCount} style={styles.heroStatVal} />
              <Text style={styles.heroStatLabel}>{t('seller_products')}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* ── Metric Cards ── */}
      <View style={styles.metricGrid}>
        <MetricCard title={t('seller_orders')} value={ordersCount} icon={<CartIcon color={COLORS.primary} />} accentColor={COLORS.primary} COLORS={COLORS} />
        <MetricCard title={t('seller_stores')} value={storesCount} icon={<StoreIcon color="#0D2C74" />} accentColor="#0D2C74" COLORS={COLORS} />
        <MetricCard title={t('seller_products')} value={productsCount} icon={<BoxIcon color="#D97706" />} accentColor="#D97706" COLORS={COLORS} />
        <MetricCard title={t('seller_active')} value={Math.max(storesCount - 1, 0)} icon={<QuickOrderIcon color={COLORS.primaryLight} />} accentColor={COLORS.primaryLight} COLORS={COLORS} />
      </View>

      {/* ── Weekly Activity Chart ── */}
      <View style={[styles.chartCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: COLORS.text }]}>{t('seller_weeklyActivity')}</Text>
            <Text style={[styles.sectionSub, { color: COLORS.textMuted }]}>{t('seller_last7Days')}</Text>
          </View>
        </View>
        <AreaChart data={chartData} color={COLORS.primaryLight || '#2563EB'} COLORS={COLORS} />
      </View>

      {/* ── Recent Orders ── */}
      <View style={[styles.sectionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
        <View style={styles.sectionCardHeader}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>{t('seller_recentOrders')}</Text>
          <TouchableOpacity onPress={() => navigate?.('orders')} activeOpacity={0.7}>
            <Text style={[styles.seeAll, { color: COLORS.primary }]}>{t('buyer_viewAll')}</Text>
          </TouchableOpacity>
        </View>
        {recentOrders.length === 0 ? (
          <Text style={[styles.emptyText, { color: COLORS.textMuted }]}>{t('orders_noOrders')}</Text>
        ) : recentOrders.map((o, i) => (
          <OrderRow key={o.id || i} order={o} COLORS={COLORS} t={t} />
        ))}
      </View>

      {/* ── Quick Actions ── */}
      <View style={[styles.sectionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>{t('seller_quickActions')}</Text>
        <View style={[styles.quickRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={[styles.quickBtn, { backgroundColor: COLORS.primary + '12' }]} onPress={() => navigate?.('addEditProduct')} activeOpacity={0.7}>
            <View style={[styles.quickBtnIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <QuickAddIcon color={COLORS.primary} />
            </View>
            <Text style={[styles.quickBtnText, { color: COLORS.primary }]}>{t('seller_addProduct')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#FDB91318' }]} onPress={() => navigate?.('orders')} activeOpacity={0.7}>
            <View style={[styles.quickBtnIcon, { backgroundColor: '#FDB91330' }]}>
              <QuickOrderIcon color="#B45309" />
            </View>
            <Text style={[styles.quickBtnText, { color: '#B45309' }]}>{t('seller_viewOrders')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  /* ══════════════════════════════════════════════════
     BUYER DASHBOARD
  ══════════════════════════════════════════════════ */
  const BuyerDashboard = () => (
    <>
      {/* Welcome hero */}
      <LinearGradient colors={['#0984E3', '#6C5CE7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buyerHero}>
        <Text style={styles.buyerHeroTitle}>{t('buyer_shoppingJourney')}</Text>
        <Text style={styles.buyerHeroSub}>{t('buyer_emptyMessage')}</Text>
        <View style={styles.buyerHeroStats}>
          <View style={styles.buyerHeroStat}>
            <AnimatedCounter value={buyerOrders.total} style={styles.buyerHeroStatVal} />
            <Text style={styles.buyerHeroStatLabel}>{t('orders_total')}</Text>
          </View>
          <View style={styles.buyerHeroDiv} />
          <View style={styles.buyerHeroStat}>
            <AnimatedCounter value={buyerOrders.processing} style={styles.buyerHeroStatVal} />
            <Text style={styles.buyerHeroStatLabel}>{t('buyer_processing')}</Text>
          </View>
          <View style={styles.buyerHeroDiv} />
          <View style={styles.buyerHeroStat}>
            <AnimatedCounter value={buyerOrders.delivered} style={styles.buyerHeroStatVal} />
            <Text style={styles.buyerHeroStatLabel}>{t('buyer_delivered')}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Status cards */}
      <View style={styles.metricGrid}>
        {[
          { label: t('buyer_processing'), val: buyerOrders.processing, color: '#E17055' },
          { label: t('buyer_shipped'), val: buyerOrders.shipped, color: '#0984E3' },
          { label: t('buyer_delivered'), val: buyerOrders.delivered, color: '#00B894' },
          { label: t('orders_total'), val: buyerOrders.total, color: '#6C5CE7' },
        ].map((item) => {
          const half = (W - 40 - GRID_GAP) / 2;
          return (
            <View key={item.label} style={[styles.metricCard, { width: half, backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={[styles.metricIcon, { backgroundColor: item.color + '18' }]}>
                <CartIcon color={item.color} />
              </View>
              <AnimatedCounter value={item.val} style={[styles.metricValue, { color: item.color }]} />
              <Text style={[styles.metricLabel, { color: COLORS.textMuted }]}>{item.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Quick Actions */}
      <View style={[styles.sectionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>{t('buyer_quickStart')}</Text>
        <View style={[styles.quickRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={[styles.quickBtn, { backgroundColor: COLORS.primary + '12' }]} onPress={() => navigate?.('stores')} activeOpacity={0.7}>
            <View style={[styles.quickBtnIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <StoreIcon color={COLORS.primary} />
            </View>
            <Text style={[styles.quickBtnText, { color: COLORS.primary }]}>{t('buyer_browseStores')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#00B89412' }]} onPress={() => navigate?.('orders')} activeOpacity={0.7}>
            <View style={[styles.quickBtnIcon, { backgroundColor: '#00B89420' }]}>
              <QuickOrderIcon color="#00B894" />
            </View>
            <Text style={[styles.quickBtnText, { color: '#00B894' }]}>{t('buyer_trackOrders')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Why shop with us */}
      <View style={[styles.sectionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>{t('buyer_whyShopWithUs')}</Text>
        {[
          { icon: <CheckCircleIcon color="#10B981" />, bg: '#10B98118', title: t('buyer_verifiedStores'), sub: t('buyer_securePayment') },
          { icon: <RocketIcon color="#6C5CE7" />, bg: '#6C5CE718', title: t('buyer_fastDelivery'), sub: t('buyer_trackRealtime') },
          { icon: <ShieldLockIcon color="#0984E3" />, bg: '#0984E318', title: t('buyer_securePayment'), sub: t('buyer_protected') },
        ].map((item) => (
          <View key={item.title} style={[styles.featureRow, { borderBottomColor: COLORS.border }]}>
            <View style={[styles.featureIconBadge, { backgroundColor: item.bg }]}>{item.icon}</View>
            <View style={{ marginLeft: 14 }}>
              <Text style={[styles.featureTitle, { color: COLORS.text }]}>{item.title}</Text>
              <Text style={[styles.featureSub, { color: COLORS.textMuted }]}>{item.sub}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );

  /* ──────────────── RENDER ──────────────── */
  return (
    <View style={[styles.outer, { backgroundColor: COLORS.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Header />
          {isSeller ? <SellerDashboard /> : <BuyerDashboard />}
        </Animated.View>
      </ScrollView>
      <BottomNav activeTab="dashboard" onTabPress={handleTab} />
    </View>
  );
};

/* ══════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  outer: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingTop: 54, paddingBottom: 155 },

  /* Header */
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  greeting: { fontSize: 12, fontWeight: '600' },
  userName: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  controls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: { width: 42, height: 42, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  /* Doc restriction */
  restrictBanner: { borderRadius: CARD_R, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  restrictIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  restrictTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  restrictDesc: { fontSize: 12, lineHeight: 18 },
  restrictReason: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  restrictBtn: { alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  restrictBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  /* Hero */
  heroCard: { borderRadius: CARD_R, overflow: 'hidden', marginBottom: 16, borderWidth: 1 },
  heroGradient: { padding: 22 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  brandPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(253, 185, 19, 0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(253, 185, 19, 0.4)' },
  brandPillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FDB913' },
  brandPillText: { fontSize: 10, fontWeight: '800', color: '#FDB913', letterSpacing: 0.5 },
  heroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroAmount: { fontSize: 38, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1.5, marginTop: 4 },
  heroStrip: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  heroStripDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },

  /* Metric grid */
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, marginBottom: 16 },
  metricCard: { borderRadius: CARD_R, padding: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  trendText: { fontSize: 11, fontWeight: '700' },
  metricValue: { fontSize: 28, fontWeight: '900', letterSpacing: -1, marginBottom: 4 },
  metricLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  /* Chart */
  chartCard: { borderRadius: CARD_R, padding: 20, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  chartBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  chartBadgeText: { fontSize: 12, fontWeight: '700' },
  chartDays: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 6 },
  chartDayLabel: { fontSize: 11, fontWeight: '700' },

  /* Section cards */
  sectionCard: { borderRadius: CARD_R, padding: 20, borderWidth: 1, marginBottom: 16 },
  sectionCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  sectionSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  seeAll: { fontSize: 13, fontWeight: '700' },
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: 20 },

  /* Order row */
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  orderNum: { fontSize: 14, fontWeight: '800' },
  orderMeta: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  orderAmt: { fontSize: 15, fontWeight: '900' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusPillText: { fontSize: 10, fontWeight: '700' },

  /* Quick actions */
  quickRow: { flexDirection: 'row', gap: GRID_GAP },
  quickBtn: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  quickBtnIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  quickBtnText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  /* Buyer */
  buyerHero: { borderRadius: CARD_R, padding: 24, marginBottom: 16 },
  buyerHeroTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginBottom: 6 },
  buyerHeroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 18, marginBottom: 20 },
  buyerHeroStats: { flexDirection: 'row', alignItems: 'center' },
  buyerHeroStat: { flex: 1, alignItems: 'center' },
  buyerHeroStatVal: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },
  buyerHeroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  buyerHeroDiv: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.25)' },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  featureIconBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  featureTitle: { fontSize: 14, fontWeight: '700' },
  featureSub: { fontSize: 12, marginTop: 2 },
});

export default DashboardScreen;
