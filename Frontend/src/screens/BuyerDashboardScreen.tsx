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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const PackageIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M16.5 9.4L7.5 4.21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const TruckIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M1 3H15V13H1V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 8H19L23 12V13H15V8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="5.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2" />
    <Circle cx="18.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2" />
  </Svg>
);

const ClockIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const StoreIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const HeartIcon = ({ color, filled }: { color: string; filled?: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill={filled ? color : "none"}>
    <Path d="M20.84 4.61C20.3292 4.09944 19.7228 3.69669 19.0554 3.42676C18.3879 3.15683 17.6725 3.01532 16.95 3.01532C16.2275 3.01532 15.5121 3.15683 14.8446 3.42676C14.1772 3.69669 13.5708 4.09944 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 3.00001 7.05 3.00001C5.59096 3.00001 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.55 7.04096 1.55 8.5C1.55 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.3506 11.8792 21.7533 11.2728 22.0232 10.6054C22.2932 9.93789 22.4347 9.22248 22.4347 8.5C22.4347 7.77752 22.2932 7.06211 22.0232 6.39464C21.7533 5.72717 21.3506 5.12075 20.84 4.61Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SparklesIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
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
  const { t, isRTL } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
        <ActivityIndicator size="large" color={COLORS.primary} />
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
            
            {/* Theme Toggle with Animation */}
            <TouchableOpacity
              style={[styles.themeToggle, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ rotate: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
                {mode === 'dark' ? (
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="5" fill="#FDB913" />
                    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB913" strokeWidth="2" strokeLinecap="round" />
                  </Svg>
                ) : (
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#3B82F6" />
                  </Svg>
                )}
              </Animated.View>
            </TouchableOpacity>
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
            /* EMPTY STATE */
            <Animated.View style={[styles.emptyState, { transform: [{ scale: scaleAnim }] }]}>
              <View style={[styles.emptyCard, { backgroundColor: COLORS.surface }]}>
                <EmptyStateIllustration COLORS={COLORS} />
                <Text style={[styles.emptyTitle, { color: COLORS.text }]}>
                  {t('buyer_emptyTitle')}
                </Text>
                <Text style={[styles.emptyMessage, { color: COLORS.textSecondary }]}>
                  {t('buyer_emptyMessage')}
                </Text>
                <TouchableOpacity
                  style={[styles.ctaButton, { backgroundColor: COLORS.primary }]}
                  onPress={() => navigate?.('stores')}
                  activeOpacity={0.8}
                >
                  <StoreIcon color="#FFFFFF" />
                  <Text style={styles.ctaButtonText}>
                    {t('buyer_browseStores')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            /* ORDERS EXIST - SHOW STATS */
            <>
              {/* Hero Stats Card - Professional Gradient */}
              <View style={styles.heroCardContainer}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.heroGradient}
                >
                  <GlassContainer style={styles.heroGlassOverlay} intensity="light">
                    <View style={styles.heroContent}>
                      <View style={[styles.heroHeader, isRTL && styles.rowReverse]}>
                        <View style={styles.heroIconBadge}>
                          <PackageIcon color="#FFFFFF" />
                        </View>
                        <Text style={styles.heroLabel}>
                          {t('buyer_yourOrders')}
                        </Text>
                      </View>
                      <Text style={styles.heroValue}>{stats.totalOrders}</Text>
                      <View style={[styles.heroMeta, isRTL && styles.rowReverse]}>
                        <View style={styles.heroMetaItem}>
                          <Text style={styles.heroMetaLabel}>{t('dashboard_active')}</Text>
                          <Text style={styles.heroMetaValue}>{stats.activeOrders || 0}</Text>
                        </View>
                        <View style={styles.heroDivider} />
                        <View style={styles.heroMetaItem}>
                          <Text style={styles.heroMetaLabel}>{t('buyer_delivered')}</Text>
                          <Text style={styles.heroMetaValue}>{stats.deliveredOrders || 0}</Text>
                        </View>
                      </View>
                    </View>
                  </GlassContainer>
                </LinearGradient>
              </View>

              {/* Order Status Cards Grid */}
              <View style={[styles.statusGrid, isRTL && styles.rowReverse]}>
                {/* Processing Card */}
                <View style={[styles.statusCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                  <View style={[styles.statusIconContainer, { backgroundColor: COLORS.info + '15' }]}>
                    <ClockIcon color={COLORS.info} />
                  </View>
                  <Text style={[styles.statusValue, { color: COLORS.text }]}>
                    {stats.processingOrders || 0}
                  </Text>
                  <Text style={[styles.statusLabel, { color: COLORS.textMuted }]}>
                    {t('buyer_processing')}
                  </Text>
                </View>

                {/* Shipped Card */}
                <View style={[styles.statusCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                  <View style={[styles.statusIconContainer, { backgroundColor: COLORS.secondary + '15' }]}>
                    <TruckIcon color={COLORS.secondary} />
                  </View>
                  <Text style={[styles.statusValue, { color: COLORS.text }]}>
                    {stats.shippedOrders || 0}
                  </Text>
                  <Text style={[styles.statusLabel, { color: COLORS.textMuted }]}>
                    {t('buyer_shipped')}
                  </Text>
                </View>
              </View>

              {/* Recent Orders Section */}
              {stats.recentOrders?.length > 0 && (
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
            </>
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

      {/* ═══ FLOATING MODERN TAB BAR ═══ */}
      <FloatingTabBar activeTab="dashboard" onTabPress={(tab) => resetTo?.(tab)} COLORS={COLORS} isRTL={isRTL} mode={mode} />
    </View>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   FLOATING TAB BAR COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const FloatingTabBar = ({ activeTab, onTabPress, COLORS, isRTL, mode }: any) => {
  const { t } = useTranslation();
  
  const tabs = [
    { id: 'dashboard', icon: 'home', label: t('nav_dashboard') },
    { id: 'stores', icon: 'store', label: t('nav_stores') },
    { id: 'orders', icon: 'package', label: t('nav_orders') },
    { id: 'userSettings', icon: 'settings', label: t('nav_settings') },
  ];

  return (
    <GlassContainer style={styles.tabBarContainer} intensity="strong">
      <View style={[styles.tabBar, { backgroundColor: 'transparent', borderColor: COLORS.border }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <Animated.View style={[
                styles.tabIconContainer,
                isActive && { backgroundColor: COLORS.primary + '15' }
              ]}>
                {tab.icon === 'home' && <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={isActive ? COLORS.primary : COLORS.textMuted} strokeWidth="2" /></Svg>}
                {tab.icon === 'store' && <StoreIcon color={isActive ? COLORS.primary : COLORS.textMuted} />}
                {tab.icon === 'package' && <PackageIcon color={isActive ? COLORS.primary : COLORS.textMuted} />}
                {tab.icon === 'settings' && <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="3" stroke={isActive ? COLORS.primary : COLORS.textMuted} strokeWidth="2" /><Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke={isActive ? COLORS.primary : COLORS.textMuted} strokeWidth="2" strokeLinecap="round" /></Svg>}
              </Animated.View>
              <Text style={[styles.tabLabel, { color: isActive ? COLORS.primary : COLORS.textMuted }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </GlassContainer>
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
   STYLES - GLASSMORPHISM & CLAYMORPHISM
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
  themeToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  /* Search Section */
  searchSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  searchBarContainer: {
    borderRadius: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
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
    borderRadius: 16,
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
    borderRadius: 24,
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
    borderRadius: 16,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    gap: 12,
    marginBottom: 24,
  },
  statusCard: {
    flex: 1,
    borderRadius: 16,
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
    width: 48,
    height: 48,
    borderRadius: 12,
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
    marginBottom: 24,
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
    width: 32,
    height: 32,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
    borderRadius: 20,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  productImage: {
    width: '100%',
    height: 140,
    borderRadius: 16,
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

  /* Quick Actions */
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
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

  /* Floating Tab Bar */
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default BuyerDashboardScreen;
