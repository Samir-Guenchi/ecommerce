/**
 * DeliveryDashboardScreen — 2026 Innovative Dashboard for Delivery Personnel
 * 
 * Features:
 * - Document restriction banner (can't operate without approved docs)
 * - Bento-grid layout with symmetric spacing
 * - Live delivery stats with glassmorphism cards
 * - Performance ring chart
 * - Theme + Language controls
 */
import React, { useState, useEffect, useRef } from 'react';
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
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Logo } from '../components/Logo';
import BottomNav, { BottomTabId } from './BottomNav';
import { API_URL } from '../config/api.config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 14;
const CARD_RADIUS = 22;

/* ── SVG Icons ──────────────────────────────────────────────────────────── */

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

const TruckIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 3H15V13H1V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 8H19L23 12V13H15V8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="5.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2" />
    <Circle cx="18.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2" />
  </Svg>
);

const PackageIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M16.5 9.4L7.5 4.21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M21 16V8C21 6.89 20.1 6 19 6H5C3.9 6 3 6.9 3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const CheckCircleIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 11.08V12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C12.96 2 13.88 2.14 14.75 2.4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M22 4L12 14.01L9 11.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const StarIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MapPinIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.03 7.03 1 12 1C16.97 1 21 5.03 21 10Z" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const WalletIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 12V22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V6C2 4.9 2.9 4 4 4H18V8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M20 12H16C14.9 12 14 12.9 14 14C14 15.1 14.9 16 16 16H20C21.1 16 22 15.1 22 14C22 12.9 21.1 12 20 12Z" stroke={color} strokeWidth="2" />
  </Svg>
);

/* ── Progress Ring Component ─────────────────────────────────────────── */
const ProgressRing = ({ progress, size = 80, strokeWidth = 8, color, bgColor }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={bgColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
};

/* ── Main Component ──────────────────────────────────────────────────── */

interface DeliveryDashboardScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
}

const DeliveryDashboardScreen = ({ navigate, resetTo }: DeliveryDashboardScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [docStatus, setDocStatus] = useState<string>('active');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const [stats, setStats] = useState({
    todayDeliveries: 0,
    completedToday: 0,
    pendingPickups: 0,
    inTransit: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    rating: 4.8,
    completionRate: 92,
    totalDeliveries: 0,
    activeZones: 3,
  });

  const cycleLanguage = () => {
    const order: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const idx = order.indexOf(language);
    setLanguage(order[(idx + 1) % order.length]);
  };

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.fullName?.split(' ')[0] || 'Driver');
        setDocStatus(user.accountStatus || 'active');
      }
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          const res = await fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const user = await res.json();
            setUserName(user.fullName?.split(' ')[0] || 'Driver');
            // Check SellerRegistration verification status for document approval
            if (user.sellerRegistration) {
              const verStatus = user.sellerRegistration.verificationStatus;
              if (verStatus === 'approved') {
                setDocStatus('active');
              } else if (verStatus === 'rejected') {
                setDocStatus('rejected');
                setRejectionReason(user.sellerRegistration.rejectionReason || '');
              } else if (verStatus === 'pending') {
                setDocStatus('pending');
              }
            } else {
              // No registration found – documents not uploaded
              setDocStatus(user.accountStatus || 'pending');
            }
          }
        } catch (_) { }
      }
    } catch (_) { }
  };

  const loadStats = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          const res = await fetch(`${API_URL}/delivery/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setStats((prev) => ({ ...prev, ...data }));
          }
        } catch (_) { }
      }
    } catch (_) { }
    finally {
      setLoading(false);
      setRefreshing(false);
      if (!isRefresh) {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      }
    }
  };

  const onRefresh = () => { setRefreshing(true); loadStats(true); };
  const handleTab = (tab: BottomTabId) => {
    if (tab === 'dashboard') return;
    resetTo ? resetTo(tab) : navigate?.(tab);
  };

  const isRestricted = docStatus !== 'active' && docStatus !== 'verified';

  if (loading) {
    return (
      <View style={[s.loadingWrap, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[s.loadingText, { color: COLORS.textMuted }]}>{t('dashboard_loading')}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Header ───────────────────────────────────────────────── */}
          <View style={[s.header, isRTL && s.rowReverse]}>
            <View style={[s.headerLeft, isRTL && s.rowReverse]}>
              <Logo variant="icon" size={42} />
              <View style={[{ marginLeft: 12 }, isRTL && { marginLeft: 0, marginRight: 12, alignItems: 'flex-end' }]}>
                <Text style={[s.greetingSub, { color: COLORS.textMuted }]}>
                  {t('seller_welcomeBack')}, {userName}
                </Text>
                <Text style={[s.greetingTitle, { color: COLORS.text }]}>
                  Delivery Hub
                </Text>
              </View>
            </View>
            <View style={[s.headerControls, isRTL && s.rowReverse]}>
              <TouchableOpacity
                style={[s.controlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                onPress={cycleLanguage}
                activeOpacity={0.7}
              >
                <View style={s.controlBtnInner}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke={COLORS.primary} strokeWidth="2" />
                    <Path d="M2 12H22M12 2C14.5 4.5 16 8.5 16 12C16 15.5 14.5 19.5 12 22M12 2C9.5 4.5 8 8.5 8 12C8 15.5 9.5 19.5 12 22" stroke={COLORS.primary} strokeWidth="2" />
                  </Svg>
                  <Text style={[s.langText, { color: COLORS.text }]}>{language.toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.controlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                onPress={toggleTheme}
                activeOpacity={0.7}
              >
                {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Document Restriction Banner ───────────────────────── */}
          {isRestricted && (
            <View style={[s.restrictBanner, {
              backgroundColor: docStatus === 'rejected' ? COLORS.error + '12' : COLORS.warning + '12',
              borderColor: docStatus === 'rejected' ? COLORS.error + '30' : COLORS.warning + '30',
            }]}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke={docStatus === 'rejected' ? COLORS.error : COLORS.warning} strokeWidth="2" strokeLinecap="round" />
                <Path d="M12 8v4M12 16h.01"
                  stroke={docStatus === 'rejected' ? COLORS.error : COLORS.warning} strokeWidth="2" strokeLinecap="round" />
              </Svg>
              <Text style={[s.restrictTitle, { color: docStatus === 'rejected' ? COLORS.error : COLORS.warning }]}>
                {t('restrict_deliveryTitle')}
              </Text>
              <Text style={[s.restrictMsg, { color: COLORS.textSecondary }]}>
                {t('restrict_deliveryMsg')}
              </Text>
              {docStatus === 'rejected' && rejectionReason ? (
                <View style={{ backgroundColor: COLORS.error + '10', borderRadius: 12, padding: 12, marginBottom: 12, width: '100%' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.error, marginBottom: 4 }}>Rejection Reason:</Text>
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 }}>{rejectionReason}</Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={[s.restrictBtn, { backgroundColor: COLORS.primary }]}
                onPress={() => navigate?.('documentUpload', { accountType: 'delivery' })}
                activeOpacity={0.8}
              >
                <Text style={s.restrictBtnText}>
                  {docStatus === 'rejected' ? t('docState_resubmit') : t('restrict_uploadDocs')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Hero Gradient Card ───────────────────────────────── */}
          <View style={s.heroWrap}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.heroGradient}
            >
              <View style={s.heroRow}>
                <View style={{ flex: 1 }}>
                  <View style={s.heroLabelRow}>
                    <View style={s.heroIconBadge}>
                      <TruckIcon color="#FFFFFF" size={22} />
                    </View>
                    <Text style={s.heroLabel}>TODAY'S DELIVERIES</Text>
                  </View>
                  <Text style={s.heroValue}>{stats.todayDeliveries}</Text>
                  <View style={s.heroMeta}>
                    <View style={s.heroMetaItem}>
                      <Text style={s.heroMetaKey}>Completed</Text>
                      <Text style={s.heroMetaVal}>{stats.completedToday}</Text>
                    </View>
                    <View style={s.heroDivider} />
                    <View style={s.heroMetaItem}>
                      <Text style={s.heroMetaKey}>Earnings</Text>
                      <Text style={s.heroMetaVal}>{stats.todayEarnings.toLocaleString()} DZD</Text>
                    </View>
                  </View>
                </View>
                {/* Performance Ring */}
                <View style={s.heroRingWrap}>
                  <ProgressRing
                    progress={stats.completionRate}
                    size={80}
                    strokeWidth={8}
                    color="#FFFFFF"
                    bgColor="rgba(255,255,255,0.25)"
                  />
                  <Text style={s.heroRingLabel}>{stats.completionRate}%</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* ── Bento Grid — 2×2 Symmetric ──────────────────────── */}
          <View style={s.bentoGrid}>
            {/* Pending Pickups */}
            <View style={[s.bentoCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={[s.bentoIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <PackageIcon color="#F59E0B" size={22} />
              </View>
              <Text style={[s.bentoValue, { color: COLORS.text }]}>{stats.pendingPickups}</Text>
              <Text style={[s.bentoLabel, { color: COLORS.textMuted }]}>Pending</Text>
            </View>

            {/* In Transit */}
            <View style={[s.bentoCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={[s.bentoIconWrap, { backgroundColor: '#DBEAFE' }]}>
                <TruckIcon color="#3B82F6" size={22} />
              </View>
              <Text style={[s.bentoValue, { color: COLORS.text }]}>{stats.inTransit}</Text>
              <Text style={[s.bentoLabel, { color: COLORS.textMuted }]}>In Transit</Text>
            </View>

            {/* Rating */}
            <View style={[s.bentoCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={[s.bentoIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <StarIcon color="#EF4444" size={22} />
              </View>
              <Text style={[s.bentoValue, { color: COLORS.text }]}>{stats.rating}</Text>
              <Text style={[s.bentoLabel, { color: COLORS.textMuted }]}>Rating</Text>
            </View>

            {/* Active Zones */}
            <View style={[s.bentoCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={[s.bentoIconWrap, { backgroundColor: '#D1FAE5' }]}>
                <MapPinIcon color="#10B981" size={22} />
              </View>
              <Text style={[s.bentoValue, { color: COLORS.text }]}>{stats.activeZones}</Text>
              <Text style={[s.bentoLabel, { color: COLORS.textMuted }]}>Zones</Text>
            </View>
          </View>

          {/* ── Earnings Card ────────────────────────────────────── */}
          <View style={[s.earningsCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
            <View style={[s.earningsHeader, isRTL && s.rowReverse]}>
              <View style={[s.earningsIconWrap, { backgroundColor: COLORS.primary + '15' }]}>
                <WalletIcon color={COLORS.primary} size={22} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[s.earningsLabel, { color: COLORS.textMuted }]}>Total Earnings</Text>
                <Text style={[s.earningsValue, { color: COLORS.text }]}>
                  {stats.totalEarnings.toLocaleString()} DZD
                </Text>
              </View>
              <View style={[s.earningsBadge, { backgroundColor: COLORS.success + '15' }]}>
                <Text style={[s.earningsBadgeText, { color: COLORS.success }]}>
                  {stats.totalDeliveries} trips
                </Text>
              </View>
            </View>
          </View>

          {/* ── Quick Actions ────────────────────────────────────── */}
          <Text style={[s.sectionTitle, { color: COLORS.text }]}>Quick Actions</Text>
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={[s.actionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={() => navigate?.('delivery')}
              activeOpacity={0.8}
            >
              <View style={[s.actionIcon, { backgroundColor: '#D1FAE5' }]}>
                <TruckIcon color="#10B981" size={22} />
              </View>
              <Text style={[s.actionText, { color: COLORS.text }]}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.actionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={() => navigate?.('orders')}
              activeOpacity={0.8}
            >
              <View style={[s.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                <ClockIcon color="#3B82F6" size={22} />
              </View>
              <Text style={[s.actionText, { color: COLORS.text }]}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.actionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={() => navigate?.('documentUpload', { accountType: 'delivery' })}
              activeOpacity={0.8}
            >
              <View style={[s.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                <CheckCircleIcon color="#F59E0B" size={22} />
              </View>
              <Text style={[s.actionText, { color: COLORS.text }]}>Documents</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
      <BottomNav activeTab="dashboard" onTabPress={handleTab} />
    </View>
  );
};

/* ── Styles ──────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
  rowReverse: { flexDirection: 'row-reverse' },

  /* Header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  controlBtn: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  controlBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  langText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  greetingSub: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  greetingTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },

  /* Restriction Banner */
  restrictBanner: { borderRadius: CARD_RADIUS, padding: 24, marginBottom: 20, borderWidth: 1, alignItems: 'center' },
  restrictTitle: { fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 8, textAlign: 'center' },
  restrictMsg: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  restrictBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  restrictBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  /* Hero */
  heroWrap: { borderRadius: CARD_RADIUS, overflow: 'hidden', marginBottom: GRID_GAP },
  heroGradient: { padding: 24 },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  heroIconBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  heroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '800', letterSpacing: 1.2 },
  heroValue: { fontSize: 48, fontWeight: '900', color: '#FFFFFF', letterSpacing: -2, marginBottom: 18 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  heroMetaItem: { flex: 1 },
  heroMetaKey: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 4 },
  heroMetaVal: { fontSize: 18, color: '#FFFFFF', fontWeight: '800' },
  heroDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 14 },
  heroRingWrap: { alignItems: 'center', justifyContent: 'center', marginLeft: 16 },
  heroRingLabel: { position: 'absolute', fontSize: 16, fontWeight: '900', color: '#FFFFFF' },

  /* Bento Grid */
  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, marginBottom: GRID_GAP },
  bentoCard: {
    width: (SCREEN_WIDTH - 40 - GRID_GAP) / 2,
    borderRadius: CARD_RADIUS,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  bentoIconWrap: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  bentoValue: { fontSize: 30, fontWeight: '900', letterSpacing: -1, marginBottom: 4 },
  bentoLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  /* Earnings */
  earningsCard: { borderRadius: CARD_RADIUS, padding: 20, marginBottom: GRID_GAP, borderWidth: 1 },
  earningsHeader: { flexDirection: 'row', alignItems: 'center' },
  earningsIconWrap: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  earningsLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  earningsValue: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  earningsBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  earningsBadgeText: { fontSize: 13, fontWeight: '700' },

  /* Section */
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 14 },

  /* Actions */
  actionsRow: { flexDirection: 'row', gap: GRID_GAP, marginBottom: 24 },
  actionCard: { flex: 1, borderRadius: CARD_RADIUS, padding: 20, alignItems: 'center', borderWidth: 1 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionText: { fontSize: 13, fontWeight: '700' },
});

export default DeliveryDashboardScreen;
