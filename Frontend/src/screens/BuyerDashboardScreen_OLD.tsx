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
  TextInput,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import { dashboardAPI } from '../services/api.service';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Logo } from '../components/Logo';
import BottomNav from './BottomNav';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 14;
const CARD_RADIUS = 22;

/* ═══════════════════════════════════════════════════════════════════════════
   GLASSMORPHISM CONTAINER - Pure React Native Implementation
   ═══════════════════════════════════════════════════════════════════════════ */

const GlassContainer = ({ children, style, intensity = 'medium' }: any) => {
  const { mode } = useTheme();
  const COLORS = getColors(mode);
  
  const intensityMap = {
    light: mode === 'dark' ? 'rgba(19, 27, 46, 0.4)' : 'rgba(255, 255, 255, 0.5)',
    medium: mode === 'dark' ? 'rgba(19, 27, 46, 0.6)' : 'rgba(255, 255, 255, 0.7)',
    strong: mode === 'dark' ? 'rgba(19, 27, 46, 0.8)' : 'rgba(255, 255, 255, 0.85)',
  };

  return (
    <View style={[
      {
        backgroundColor: intensityMap[intensity],
        borderWidth: 1,
        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
          },
          android: {
            elevation: 4,
          },
        }),
      },
      style
    ]}>
      {children}
    </View>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PROFESSIONAL ICONS - Clean, consistent Lucide-style
   ═══════════════════════════════════════════════════════════════════════════ */

const SearchIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M21 21L16.65 16.65" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const QRScanIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
    <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
    <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
    <Rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
  </Svg>
);

const PackageIcon = ({ color, size = 26 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M16.5 9.4L7.5 4.21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const TruckIcon = ({ color, size = 26 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 3H15V13H1V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 8H19L23 12V13H15V8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="5.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2" />
    <Circle cx="18.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2" />
  </Svg>
);

const ClockIcon = ({ color, size = 26 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const StoreIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const HeartIcon = ({ color, filled, size = 22 }: { color: string; filled?: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"}>
    <Path d="M20.84 4.61C20.3292 4.09944 19.7228 3.69669 19.0554 3.42676C18.3879 3.15683 17.6725 3.01532 16.95 3.01532C16.2275 3.01532 15.5121 3.15683 14.8446 3.42676C14.1772 3.69669 13.5708 4.09944 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 3.00001 7.05 3.00001C5.59096 3.00001 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.55 7.04096 1.55 8.5C1.55 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.3506 11.8792 21.7533 11.2728 22.0232 10.6054C22.2932 9.93789 22.4347 9.22248 22.4347 8.5C22.4347 7.77752 22.2932 7.06211 22.0232 6.39464C21.7533 5.72717 21.3506 5.12075 20.84 4.61Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SparklesIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3L13.5 7.5L18 9L13.5 10.5L12 15L10.5 10.5L6 9L10.5 7.5L12 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M19 3L19.5 4.5L21 5L19.5 5.5L19 7L18.5 5.5L17 5L18.5 4.5L19 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY STATE ILLUSTRATION
   ═══════════════════════════════════════════════════════════════════════════ */

const EmptyStateIllustration = ({ COLORS }: { COLORS: any }) => (
  <Svg width={200} height={200} viewBox="0 0 200 200" fill="none">
    <Defs>
      <SvgGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.2" />
        <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.2" />
      </SvgGradient>
    </Defs>
    {/* Shopping bag */}
    <Path d="M60 80L60 160C60 165.523 64.4772 170 70 170L130 170C135.523 170 140 165.523 140 160L140 80" stroke={COLORS.primary} strokeWidth="4" strokeLinecap="round" />
    <Path d="M50 80L150 80L145 70L55 70L50 80Z" fill="url(#grad1)" stroke={COLORS.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* Handle */}
    <Path d="M80 80C80 65 85 50 100 50C115 50 120 65 120 80" stroke={COLORS.secondary} strokeWidth="3" strokeLinecap="round" />
    {/* Sparkles */}
    <Circle cx="40" cy="60" r="3" fill={COLORS.secondary} opacity="0.6" />
    <Circle cx="160" cy="100" r="4" fill={COLORS.primary} opacity="0.6" />
    <Circle cx="45" cy="140" r="2.5" fill={COLORS.secondary} opacity="0.6" />
    <Circle cx="155" cy="150" r="3.5" fill={COLORS.primary} opacity="0.6" />
  </Svg>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

interface BuyerDashboardScreenProps {
  navigate?: (screenId: string) => void;
  resetTo?: (screenId: string) => void;
}

const BuyerDashboardScreen = ({ navigate, resetTo }: BuyerDashboardScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Cycle through languages: en → ar → fr → en
  const cycleLanguage = () => {
    const languageOrder: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const currentIndex = languageOrder.indexOf(language);
    const nextIndex = (currentIndex + 1) % languageOrder.length;
    setLanguage(languageOrder[nextIndex]);
  };

  useEffect(() => {
    loadUserData();
    loadDashboardData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.fullName?.split(' ')[0] || 'Friend');
      }
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const res = await dashboardAPI.getStats();
      setStats(res.stats);
      
      // Animate entrance
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData(true);
  };

  const hasOrders = stats && stats.totalOrders > 0;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Logo variant="icon" size={64} />
        </Animated.View>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
        <Text style={[styles.loadingText, { color: COLORS.textMuted }]}>{t('buyer_loadingJourney')}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Simple Solid Background - No AI-looking gradient */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.background }]} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* ═══ HEADER SECTION ═══ */}
          <View style={[styles.header, isRTL && styles.rowReverse]}>
            <View style={[styles.headerLeft, isRTL && styles.rowReverse]}>
              <Logo variant="icon" size={44} />
              <View style={[styles.greetingContainer, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.greeting, { color: COLORS.textMuted }]}>
                  {t('buyer_hello')}, {userName}
                </Text>
                <Text style={[styles.title, { color: COLORS.text }]}>
                  {t('buyer_shoppingJourney')}
                </Text>
              </View>
            </View>
            
            {/* Controls: Language + Theme */}
            <View style={[styles.headerControls, isRTL && styles.rowReverse]}>
              {/* Language Switcher */}
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                onPress={cycleLanguage}
                activeOpacity={0.7}
              >
                <View style={styles.controlButtonInner}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke={COLORS.primary} strokeWidth="2" />
                    <Path d="M2 12H22M12 2C14.5 4.5 16 8.5 16 12C16 15.5 14.5 19.5 12 22M12 2C9.5 4.5 8 8.5 8 12C8 15.5 9.5 19.5 12 22" stroke={COLORS.primary} strokeWidth="2" />
                  </Svg>
                  <Text style={[styles.langLabel, { color: COLORS.text }]}>{language.toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
              
              {/* Theme Toggle */}
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                onPress={toggleTheme}
                activeOpacity={0.7}
              >
                <Animated.View style={{ transform: [{ rotate: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
                  {mode === 'dark' ? (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="12" r="5" fill="#FDB913" />
                      <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB913" strokeWidth="2" strokeLinecap="round" />
                    </Svg>
                  ) : (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#3B82F6" />
                    </Svg>
                  )}
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* ═══ SEARCH & QR SECTION ═══ */}
          <View style={[styles.searchSection, isRTL && styles.rowReverse]}>
            {/* Search Bar with Glassmorphism */}
            <GlassContainer style={[styles.searchBarContainer, { flex: 1 }]} intensity="medium">
              <View style={[styles.searchBar, { backgroundColor: 'transparent', borderColor: COLORS.border }]}>
                <SearchIcon color={COLORS.textMuted} />
                <TextInput
                  style={[styles.searchInput, { color: COLORS.text }, isRTL && { textAlign: 'right' }]}
                  placeholder={t('buyer_searchPlaceholder')}
                  placeholderTextColor={COLORS.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </GlassContainer>

            {/* QR Scan Button */}
            <TouchableOpacity
              style={[styles.qrButton, { backgroundColor: COLORS.primary }]}
              activeOpacity={0.8}
            >
              <QRScanIcon color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* ═══ MAIN CONTENT ═══ */}
          {!hasOrders ? (
            // WARM EMPTY STATE - Human-Centered Design
            <View style={styles.emptyStateContainer}>
              {/* Friendly Welcome Hero */}
              <View style={[styles.welcomeHero, { backgroundColor: COLORS.surface }]}>
                <View style={styles.welcomeContent}>
                  <Text style={[styles.welcomeEmoji, { color: COLORS.primary }]}>👋</Text>
                  <Text style={[styles.welcomeTitle, { color: COLORS.text }]}>
                    {t('buyer_hello')}, {userName}!
                  </Text>
                  <Text style={[styles.welcomeMessage, { color: COLORS.textSecondary }]}>
                    {t('buyer_emptyMessage')}
                  </Text>
                </View>
                
                {/* Primary CTA - Clear & Prominent */}
                <TouchableOpacity
                  style={[styles.primaryCTA, { backgroundColor: COLORS.primary }]}
                  onPress={() => navigate?.('stores')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.primaryCTAIcon}>🏪</Text>
                  <Text style={styles.primaryCTAText}>{t('buyer_browseStores')}</Text>
                  <Text style={styles.primaryCTAArrow}>{isRTL ? '←' : '→'}</Text>
                </TouchableOpacity>
              </View>

              {/* Trust Indicators - Build Confidence */}
              <View style={styles.trustSection}>
                <Text style={[styles.trustTitle, { color: COLORS.textMuted }]}>
                  {t('buyer_whyShopWithUs')}
                </Text>
                <View style={[styles.trustGrid, isRTL && styles.rowReverse]}>
                  <View style={[styles.trustCard, { backgroundColor: COLORS.surface }]}>
                    <View style={[styles.trustIcon, { backgroundColor: COLORS.success + '15' }]}>
                      <Text style={styles.trustEmoji}>✓</Text>
                    </View>
                    <Text style={[styles.trustLabel, { color: COLORS.text }]}>
                      {t('buyer_verifiedStores')}
                    </Text>
                    <Text style={[styles.trustDesc, { color: COLORS.textMuted }]}>
                      {stats?.totalStores || 0}+ {t('buyer_stores')}
                    </Text>
                  </View>

                  <View style={[styles.trustCard, { backgroundColor: COLORS.surface }]}>
                    <View style={[styles.trustIcon, { backgroundColor: COLORS.primary + '15' }]}>
                      <Text style={styles.trustEmoji}>🔒</Text>
                    </View>
                    <Text style={[styles.trustLabel, { color: COLORS.text }]}>
                      {t('buyer_securePayment')}
                    </Text>
                    <Text style={[styles.trustDesc, { color: COLORS.textMuted }]}>
                      100% {t('buyer_protected')}
                    </Text>
                  </View>

                  <View style={[styles.trustCard, { backgroundColor: COLORS.surface }]}>
                    <View style={[styles.trustIcon, { backgroundColor: COLORS.secondary + '15' }]}>
                      <Text style={styles.trustEmoji}>🚚</Text>
                    </View>
                    <Text style={[styles.trustLabel, { color: COLORS.text }]}>
                      {t('buyer_fastDelivery')}
                    </Text>
                    <Text style={[styles.trustDesc, { color: COLORS.textMuted }]}>
                      {t('buyer_trackRealtime')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Quick Start Guide - Help Users Get Started */}
              <View style={styles.quickStartSection}>
                <Text style={[styles.quickStartTitle, { color: COLORS.text }]}>
                  {t('buyer_quickStart')}
                </Text>
                <View style={styles.quickStartSteps}>
                  <View style={[styles.stepCard, { backgroundColor: COLORS.surface }, isRTL && styles.rowReverse]}>
                    <View style={[styles.stepNumber, { backgroundColor: COLORS.primary }]}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <Text style={[styles.stepText, { color: COLORS.text }, isRTL && { textAlign: 'right' }]}>
                      {t('buyer_step1')}
                    </Text>
                  </View>
                  <View style={[styles.stepCard, { backgroundColor: COLORS.surface }, isRTL && styles.rowReverse]}>
                    <View style={[styles.stepNumber, { backgroundColor: COLORS.primary }]}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <Text style={[styles.stepText, { color: COLORS.text }, isRTL && { textAlign: 'right' }]}>
                      {t('buyer_step2')}
                    </Text>
                  </View>
                  <View style={[styles.stepCard, { backgroundColor: COLORS.surface }, isRTL && styles.rowReverse]}>
                    <View style={[styles.stepNumber, { backgroundColor: COLORS.primary }]}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <Text style={[styles.stepText, { color: COLORS.text }, isRTL && { textAlign: 'right' }]}>
                      {t('buyer_step3')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <>
              {/* Dynamic Stats Header */}
              <View style={styles.statsHeader}>
                {/* Large Primary Stat Card */}
                <View style={[styles.primaryStatCard, { backgroundColor: COLORS.primary + '15' }]}>
                  <View style={styles.primaryStatContent}>
                    <View style={[styles.primaryIconCircle, { backgroundColor: COLORS.primary }]}>
                      <PackageIcon color="#FFFFFF" size={28} />
                    </View>
                    <View style={styles.primaryStatText}>
                      <Text style={[styles.primaryStatValue, { color: COLORS.primary }]}>
                        {stats.processingOrders || 0}
                      </Text>
                      <Text style={[styles.primaryStatLabel, { color: COLORS.primary }]}>
                        {t('buyer_processing')}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.statButton, { backgroundColor: COLORS.primary }]}
                    onPress={() => navigate?.('orders')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.statButtonText}>View All</Text>
                  </TouchableOpacity>
                </View>

                {/* Mini Stats Grid */}
                <View style={[styles.miniStatsGrid, isRTL && styles.rowReverse]}>
                  {/* Shipped Mini Card */}
                  <View style={[styles.miniStatCard, { backgroundColor: '#FEF3C7' }]}>
                    <TruckIcon color="#F59E0B" size={22} />
                    <Text style={[styles.miniStatValue, { color: '#D97706' }]}>
                      {stats.shippedOrders || 0}
                    </Text>
                    <Text style={[styles.miniStatLabel, { color: '#D97706' }]}>
                      {t('buyer_shipped')}
                    </Text>
                  </View>

                  {/* Completed Mini Card */}
                  <View style={[styles.miniStatCard, { backgroundColor: '#D1FAE5' }]}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
                      <Path d="M22 4L12 14.01l-3-3" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={[styles.miniStatValue, { color: '#059669' }]}>
                      {stats.completedOrders || 0}
                    </Text>
                    <Text style={[styles.miniStatLabel, { color: '#059669' }]}>
                      Completed
                    </Text>
                  </View>
                </View>
              </View>

              {/* Quick Actions - Circular Layout */}
              <View style={styles.quickActions}>
                <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Quick Actions</Text>
                <View style={[styles.actionButtons, isRTL && styles.rowReverse]}>
                  <TouchableOpacity
                    style={[styles.circularAction, { backgroundColor: COLORS.primary + '15' }]}
                    onPress={() => navigate?.('stores')}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.circularIconWrap, { backgroundColor: COLORS.primary }]}>
                      <StoreIcon color="#FFFFFF" size={24} />
                    </View>
                    <Text style={[styles.circularActionLabel, { color: COLORS.primary }]}>
                      Stores
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.circularAction, { backgroundColor: COLORS.success + '15' }]}
                    onPress={() => navigate?.('orders')}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.circularIconWrap, { backgroundColor: COLORS.success }]}>
                      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path d="M9 11L12 14L22 4" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                    <Text style={[styles.circularActionLabel, { color: COLORS.success }]}>
                      Track
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.circularAction, { backgroundColor: '#FEF3C7' }]}
                    onPress={() => navigate?.('favorites')}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.circularIconWrap, { backgroundColor: '#F59E0B' }]}>
                      <HeartIcon color="#FFFFFF" size={24} />
                    </View>
                    <Text style={[styles.circularActionLabel, { color: '#D97706' }]}>
                      Favorites
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* Recent Orders Section - only when has orders */}
          {hasOrders && stats?.recentOrders?.length > 0 && (
            <View style={styles.section}>
              <View style={[styles.sectionHeader, isRTL && styles.rowReverse]}>
                <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
                  {t('buyer_recentOrders')}
                </Text>
                <TouchableOpacity onPress={() => navigate?.('orders')} activeOpacity={0.7}>
                  <Text style={[styles.viewAllLink, { color: COLORS.primary }]}>
                    {t('buyer_viewAll')}
                  </Text>
                </TouchableOpacity>
              </View>

              {stats.recentOrders.slice(0, 3).map((order: any, index: number) => (
                <View key={order.id} style={[styles.orderCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                  <View style={[styles.orderHeader, isRTL && styles.rowReverse]}>
                    <View style={[styles.orderIconBadge, { backgroundColor: COLORS.primary + '10' }]}>
                      <PackageIcon color={COLORS.primary} />
                    </View>
                    <View style={[styles.orderInfo, isRTL && { alignItems: 'flex-end' }]}>
                      <Text style={[styles.orderNumber, { color: COLORS.text }]}>
                        #{order.orderNumber}
                      </Text>
                      <Text style={[styles.orderDate, { color: COLORS.textMuted }]}>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[styles.orderStatusBadge, { backgroundColor: getStatusColor(order.status, COLORS) + '15' }]}>
                      <Text style={[styles.orderStatusText, { color: getStatusColor(order.status, COLORS) }]}>
                        {order.status}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.orderFooter, isRTL && styles.rowReverse]}>
                    <Text style={[styles.orderAmount, { color: COLORS.text }]}>
                      {parseFloat(order.totalAmount || 0).toLocaleString()} DZD
                    </Text>
                    <TouchableOpacity style={[styles.trackButton, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '20' }]}>
                      <Text style={[styles.trackButtonText, { color: COLORS.primary }]}>
                        {t('buyer_track')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ═══ RECOMMENDED FOR YOU ═══ */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rowReverse]}>
              <View style={[styles.sectionTitleContainer, isRTL && styles.rowReverse]}>
                <View style={[styles.sectionIconBadge, { backgroundColor: COLORS.secondary + '15' }]}>
                  <SparklesIcon color={COLORS.secondary} />
                </View>
                <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
                  {t('buyer_recommendedForYou')}
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.recommendedScroll, isRTL && { flexDirection: 'row-reverse' }]}
            >
              {[1, 2, 3, 4].map((item) => (
                <View key={item} style={[styles.productCard, { backgroundColor: COLORS.surface }]}>
                  <View style={[styles.productImage, { backgroundColor: COLORS.surfaceHighlight }]}>
                    <PackageIcon color={COLORS.textMuted} />
                  </View>
                  <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.7}>
                    <HeartIcon color={COLORS.error} filled={false} />
                  </TouchableOpacity>
                  <Text style={[styles.productName, { color: COLORS.text }]} numberOfLines={2}>
                    {t('products_noProducts')}
                  </Text>
                  <Text style={[styles.productPrice, { color: COLORS.primary }]}>
                    2,500 DZD
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ═══ QUICK ACTIONS ═══ */}
          <View style={[styles.quickActions, isRTL && styles.rowReverse]}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: COLORS.surface }]}
              onPress={() => navigate?.('stores')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <StoreIcon color={COLORS.primary} />
              </View>
              <Text style={[styles.actionText, { color: COLORS.text }]}>
                {t('buyer_browseStores')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: COLORS.surface }]}
              onPress={() => navigate?.('orders')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary + '15' }]}>
                <PackageIcon color={COLORS.secondary} />
              </View>
              <Text style={[styles.actionText, { color: COLORS.text }]}>
                {t('buyer_myOrders')}
              </Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>

      {/* ═══ BOTTOM NAVIGATION ═══ */}
      <BottomNav activeTab="dashboard" onTabPress={(tab) => resetTo?.(tab)} />
    </View>
  );
};

// Helper function
const getStatusColor = (status: string, COLORS: any) => {
  const statusMap: any = {
    delivered: COLORS.success,
    shipped: COLORS.secondary,
    processing: COLORS.info,
    cancelled: COLORS.error,
  };
  return statusMap[status?.toLowerCase()] || COLORS.textMuted;
};

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES - PROFESSIONAL & CLEAN
   ═══════════════════════════════════════════════════════════════════════════ */

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  /* Consistent grid dimensions */
  GRID_GAP: { gap: GRID_GAP },
  rowReverse: {
    flexDirection: 'row-reverse',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greetingContainer: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  controlButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  langLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* Search Section */
  searchSection: {
    flexDirection: 'row',
    gap: GRID_GAP,
    marginBottom: 24,
  },
  searchBarContainer: {
    borderRadius: CARD_RADIUS,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  qrButton: {
    width: 56,
    height: 56,
    borderRadius: CARD_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  /* Empty State */
  emptyState: {
    marginTop: 40,
  },
  emptyCard: {
    borderRadius: CARD_RADIUS,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: CARD_RADIUS,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  /* Hero Card */
  heroCardContainer: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  heroGradient: {
    borderRadius: 20,
  },
  heroGlassOverlay: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroContent: {
    padding: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  heroIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    marginBottom: 20,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  heroMetaItem: {
    flex: 1,
  },
  heroMetaLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginBottom: 6,
  },
  heroMetaValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  heroDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 16,
  },

  /* Status Grid */
  statusGrid: {
    flexDirection: 'row',
    gap: GRID_GAP,
    marginBottom: 24,
  },
  statusCard: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusValue: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 6,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Section */
  section: {
    marginBottom: GRID_GAP * 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '700',
  },

  /* Order Card */
  orderCard: {
    borderRadius: CARD_RADIUS,
    padding: 16,
    marginBottom: GRID_GAP,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
  },
  orderStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  trackButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },

  /* Recommended Products */
  recommendedScroll: {
    paddingRight: 20,
  },
  productCard: {
    width: 160,
    borderRadius: CARD_RADIUS,
    padding: 12,
    marginRight: GRID_GAP,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  productImage: {
    width: '100%',
    height: 140,
    borderRadius: CARD_RADIUS - 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
  },

  /* Quick Actions - reinvented */
  quickActions: {
    marginBottom: GRID_GAP * 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: GRID_GAP,
    marginTop: 16,
  },
  circularAction: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
  },
  circularIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  circularActionLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  /* Innovative Empty State */
  waveHero: {
    borderRadius: CARD_RADIUS + 6,
    overflow: 'hidden',
    marginBottom: 24,
    paddingTop: 40,
  },
  waveContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  waveSvg: {
    marginTop: 16,
  },

  /* NEW: Warm Empty State */
  emptyStateContainer: {
    gap: 24,
  },
  welcomeHero: {
    borderRadius: CARD_RADIUS,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  welcomeContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  primaryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: CARD_RADIUS,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryCTAIcon: {
    fontSize: 24,
  },
  primaryCTAText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  primaryCTAArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  /* Trust Section */
  trustSection: {
    gap: 16,
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  trustGrid: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  trustCard: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  trustIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustEmoji: {
    fontSize: 28,
  },
  trustLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  trustDesc: {
    fontSize: 12,
    textAlign: 'center',
  },

  /* Quick Start Guide */
  quickStartSection: {
    gap: 16,
  },
  quickStartTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  quickStartSteps: {
    gap: GRID_GAP,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: CARD_RADIUS,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },

  floatingCards: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP * 2,
  },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: CARD_RADIUS,
    padding: 20,
    gap: GRID_GAP,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  cardIconLarge: {
    width: 60,
    height: 60,
    borderRadius: CARD_RADIUS - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardArrow: {
    opacity: 0.6,
  },

  statsRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  compactCard: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  compactIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  compactValue: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -2,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: CARD_RADIUS,
    padding: 20,
    gap: GRID_GAP,
  },
  cardIconSmall: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryCardText: {
    fontSize: 16,
    fontWeight: '800',
  },

  /* Has-Orders Innovative Stats */
  statsHeader: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP * 2,
  },
  primaryStatCard: {
    borderRadius: CARD_RADIUS + 4,
    padding: 24,
    overflow: 'hidden',
  },
  primaryStatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  primaryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryStatText: {
    flex: 1,
  },
  primaryStatValue: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -2,
  },
  primaryStatLabel: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.8,
  },
  statButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  statButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  miniStatsGrid: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  miniStatCard: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  miniStatValue: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  miniStatLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  actionCard: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default BuyerDashboardScreen;
