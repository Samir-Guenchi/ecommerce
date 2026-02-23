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
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { dashboardAPI } from '../services/api.service';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Logo } from '../components/Logo';
import BottomNav from './BottomNav';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'stores' | 'userSettings'>('dashboard');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const cycleLanguage = () => {
    const languageOrder: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const currentIndex = languageOrder.indexOf(language);
    const nextIndex = (currentIndex + 1) % languageOrder.length;
    setLanguage(languageOrder[nextIndex]);
  };

  const handleTabPress = (tabId: 'dashboard' | 'products' | 'orders' | 'stores' | 'userSettings') => {
    setActiveTab(tabId);
    if (navigate) {
      navigate(tabId);
    }
  };

  useEffect(() => {
    console.log('🎨 NEW MODERN BUYER DASHBOARD LOADED');
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
      
      try {
        const res = await dashboardAPI.getStats();
        setStats(res.stats);
      } catch (error: any) {
        console.log('⚠️ Dashboard API failed (expected for buyers), using dummy data:', error.message);
        // Use dummy data for buyers
        setStats({
          totalOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          completedOrders: 0,
          recentOrders: [],
        });
      }

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 7, useNativeDriver: true }),
      ]).start();
    } catch (error) {
      console.error('Failed to load dashboard', error);
      // Set empty stats on error
      setStats({
        totalOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        completedOrders: 0,
        recentOrders: [],
      });
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
          <Logo variant="icon" size={72} />
        </Animated.View>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* CURVED HEADER */}
          <View style={styles.headerWrapper}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary + 'E6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.curvedHeader}
            >
              <View style={[styles.headerContent, isRTL && styles.rowReverse]}>
                <View style={[styles.headerLeft, isRTL && styles.rowReverse]}>
                  <Logo variant="icon" size={48} />
                  <View style={[styles.greetingBox, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={styles.greetingText}>
                      {t('buyer_hello')}, {userName}! 👋
                    </Text>
                    <Text style={styles.subtitleText}>
                      {t('buyer_shoppingJourney')}
                    </Text>
                  </View>
                </View>

                <View style={[styles.headerControls, isRTL && styles.rowReverse]}>
                  <TouchableOpacity style={styles.controlBtn} onPress={cycleLanguage} activeOpacity={0.8}>
                    <Text style={styles.controlText}>{language.toUpperCase()}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.controlBtn} onPress={toggleTheme} activeOpacity={0.8}>
                    <Text style={styles.controlIcon}>{mode === 'dark' ? '☀️' : '🌙'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
            <View style={[styles.curveBottom, { backgroundColor: COLORS.primary }]} />
          </View>

          {/* HERO WELCOME CARD */}
          <Animated.View style={[styles.heroCard, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={[COLORS.primary + '15', COLORS.primary + '08']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.heroGradient, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
            >
              <Text style={[styles.heroTitle, { color: COLORS.text }]}>
                {hasOrders ? t('buyer_yourOrders') : t('buyer_emptyTitle')}
              </Text>
              <Text style={[styles.heroSubtitle, { color: COLORS.textMuted }]}>
                {hasOrders
                  ? `${stats.totalOrders} orders`
                  : t('buyer_emptyMessage')
                }
              </Text>

              <TouchableOpacity
                style={[styles.heroCTA, { backgroundColor: COLORS.primary }]}
                onPress={() => navigate?.(hasOrders ? 'orders' : 'stores')}
                activeOpacity={0.9}
              >
                <Text style={styles.heroCTAText}>
                  {hasOrders ? t('buyer_viewAll') : t('buyer_browseStores')}
                </Text>
                <Text style={styles.heroCTAIcon}>{isRTL ? '←' : '→'}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* BENTO GRID STATS */}
          {hasOrders && (
            <View style={styles.bentoGrid}>
              <View style={[styles.bentoLarge, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                <View style={[styles.bentoIcon, { backgroundColor: COLORS.primary + '15' }]}>
                  <Text style={styles.bentoEmoji}>📦</Text>
                </View>
                <Text style={[styles.bentoValue, { color: COLORS.text }]}>
                  {stats.processingOrders || 0}
                </Text>
                <Text style={[styles.bentoLabel, { color: COLORS.textMuted }]}>
                  {t('buyer_processing')}
                </Text>
              </View>

              <View style={styles.bentoColumn}>
                <View style={[styles.bentoSmall, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                  <Text style={styles.bentoEmoji}>🚚</Text>
                  <Text style={[styles.bentoValue, { color: COLORS.text }]}>
                    {stats.shippedOrders || 0}
                  </Text>
                  <Text style={[styles.bentoLabel, { color: COLORS.textMuted }]}>
                    {t('buyer_shipped')}
                  </Text>
                </View>

                <View style={[styles.bentoSmall, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                  <Text style={styles.bentoEmoji}>✓</Text>
                  <Text style={[styles.bentoValue, { color: COLORS.text }]}>
                    {stats.completedOrders || 0}
                  </Text>
                  <Text style={[styles.bentoLabel, { color: COLORS.textMuted }]}>
                    {t('buyer_delivered')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* FLOATING ACTION CARDS */}
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={() => navigate?.('stores')}
              activeOpacity={0.85}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: COLORS.primary + '15' }]}>
                <Text style={styles.actionEmoji}>🏪</Text>
              </View>
              <Text style={[styles.actionLabel, { color: COLORS.text }]}>
                {t('buyer_browseStores')}
              </Text>
              <Text style={[styles.actionCount, { color: COLORS.textMuted }]}>
                {stats?.totalStores || 0}+ stores
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={() => navigate?.('orders')}
              activeOpacity={0.85}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: COLORS.success + '15' }]}>
                <Text style={styles.actionEmoji}>📋</Text>
              </View>
              <Text style={[styles.actionLabel, { color: COLORS.text }]}>
                {t('buyer_trackOrders')}
              </Text>
              <Text style={[styles.actionCount, { color: COLORS.textMuted }]}>
                Track live
              </Text>
            </TouchableOpacity>
          </View>

          {/* RECENT ORDERS TIMELINE */}
          {hasOrders && stats?.recentOrders?.length > 0 && (
            <View style={styles.timelineSection}>
              <View style={[styles.sectionHeader, isRTL && styles.rowReverse]}>
                <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
                  {t('buyer_recentOrders')}
                </Text>
                <TouchableOpacity onPress={() => navigate?.('orders')}>
                  <Text style={[styles.viewAllLink, { color: COLORS.primary }]}>
                    {t('buyer_viewAll')}
                  </Text>
                </TouchableOpacity>
              </View>

              {stats.recentOrders.slice(0, 3).map((order: any, index: number) => (
                <View key={order.id} style={[styles.timelineItem, isRTL && styles.rowReverse]}>
                  <View style={styles.timelineDot}>
                    <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
                    {index < stats.recentOrders.slice(0, 3).length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: COLORS.border }]} />
                    )}
                  </View>

                  <View style={[styles.orderCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                    <View style={[styles.orderHeader, isRTL && styles.rowReverse]}>
                      <Text style={[styles.orderNumber, { color: COLORS.text }]}>
                        #{order.orderNumber}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                          {order.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.orderDate, { color: COLORS.textMuted }]}>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.orderAmount, { color: COLORS.text }]}>
                      {parseFloat(order.totalAmount || 0).toLocaleString()} DZD
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} userRole="buyer" />
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return '#10B981';
    case 'shipped': return '#F59E0B';
    case 'processing': return '#3B82F6';
    case 'cancelled': return '#EF4444';
    default: return '#6B7280';
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },

  // CURVED HEADER
  headerWrapper: {
    marginBottom: 80,
  },
  curvedHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  curveBottom: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    transform: [{ scaleY: 0.5 }],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  greetingBox: {
    flex: 1,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.85,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  controlIcon: {
    fontSize: 18,
  },

  // HERO CARD
  heroCard: {
    marginHorizontal: 20,
    marginTop: -60,
    marginBottom: 24,
  },
  heroGradient: {
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 22,
  },
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  heroCTAText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroCTAIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },

  // BENTO GRID
  bentoGrid: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  bentoLarge: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bentoColumn: {
    flex: 1,
    gap: 16,
  },
  bentoSmall: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bentoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  bentoEmoji: {
    fontSize: 28,
  },
  bentoValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  bentoLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  // ACTION GRID
  actionGrid: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 32,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionCount: {
    fontSize: 12,
  },

  // TIMELINE SECTION
  timelineSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  timelineDot: {
    alignItems: 'center',
    paddingTop: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  orderCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 13,
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default BuyerDashboardScreen;
