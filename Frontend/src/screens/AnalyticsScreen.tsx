/**
 * AnalyticsScreen — Algérie Poste E-Commerce Analytics
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { orderAPI, productAPI, storeAPI } from '../services/api.service';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { BanknoteIcon, PackageIcon, TagIcon, ChartLineIcon } from '../components/ModernIcons';

const { width: W } = Dimensions.get('window');
const CARD_R = 18;

/* ══════ ICONS ══════ */
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
const BackArrowIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19L5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const TrendUpIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 6H23V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface AnalyticsScreenProps {
  navigate?: (screenId: string) => void;
  goBack?: () => void;
  storeId?: string;
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ navigate, goBack, storeId }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, language, setLanguage, isRTL } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrder: 0,
    period: 'Last 30 days',
  });

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const idx = langs.indexOf(language);
    setLanguage(langs[(idx + 1) % langs.length]);
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        
        // Get all orders
        const ordersResponse = await orderAPI.getAllOrders();
        let orders = ordersResponse.orders;
        
        // Filter by storeId if provided
        if (storeId) {
          orders = orders.filter((order: any) => order.storeId === parseInt(storeId, 10));
        }
        
        // Get all products
        const productsResponse = await productAPI.getAllProducts();
        let products = productsResponse.products;
        
        // Filter by storeId if provided
        if (storeId) {
          products = products.filter((product: any) => product.storeId === parseInt(storeId, 10));
        }
        
        // Calculate analytics
        const totalOrders = orders.length;
        const totalProducts = products.length;
        const totalSales = orders.reduce((sum: number, order: any) => sum + (parseFloat(order.totalAmount || 0)), 0);
        const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
        
        setAnalytics({
          totalSales,
          totalOrders,
          totalProducts,
          averageOrder,
          period: t('analytics_period') || 'Last 30 days',
        });
      } catch (error: any) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [storeId]);

  const statCards = [
    { 
      label: t('analytics_totalSales') || 'Total Sales', 
      value: `${analytics.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DZD`,
      icon: (c: string) => <BanknoteIcon size={24} color={c} strokeWidth={2} />,
      color: '#0D2C74',
      gradient: ['#0D2C74', '#1E40AF'],
    },
    { 
      label: t('analytics_totalOrders') || 'Total Orders', 
      value: analytics.totalOrders.toString(),
      icon: (c: string) => <PackageIcon size={24} color={c} strokeWidth={2} />,
      color: '#1E3A8A',
      gradient: ['#1E3A8A', '#3B82F6'],
    },
    { 
      label: t('analytics_totalProducts') || 'Total Products', 
      value: analytics.totalProducts.toString(),
      icon: (c: string) => <TagIcon size={24} color={c} strokeWidth={2} />,
      color: '#D97706',
      gradient: ['#D97706', '#FDB913'],
    },
    { 
      label: t('analytics_avgOrder') || 'Average Order', 
      value: `${analytics.averageOrder.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DZD`,
      icon: (c: string) => <ChartLineIcon size={24} color={c} strokeWidth={2} />,
      color: '#0F766E',
      gradient: ['#0F766E', '#14B8A6'],
    },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textMuted, fontWeight: '600' }}>
          {t('analytics_loading') || 'Loading analytics...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity 
            style={[styles.backBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} 
            onPress={goBack} 
            activeOpacity={0.7}
          >
            <BackArrowIcon color={COLORS.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: COLORS.text }]}>{t('settings_analytics') || 'Analytics'}</Text>
            <Text style={[styles.subtitle, { color: COLORS.textMuted }]}>{analytics.period}</Text>
          </View>
          <View style={[styles.controls, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity 
              style={[styles.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} 
              onPress={cycleLanguage} 
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.text }}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} 
              onPress={toggleTheme} 
              activeOpacity={0.7}
            >
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero Card ── */}
        <View style={[styles.heroCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <LinearGradient
            colors={['#0D2C7420', '#1E40AF08']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          />
          <View style={[styles.heroIcon, { backgroundColor: '#0D2C7418' }]}>
            <TrendUpIcon color="#0D2C74" />
          </View>
          <Text style={[styles.heroTitle, { color: COLORS.text }]}>
            {t('analytics_performance') || 'Store Performance'}
          </Text>
          <Text style={[styles.heroDesc, { color: COLORS.textSecondary }]}>
            {t('analytics_performanceDesc') || 'Real-time Algérie Poste merchant insights and sales statistics'}
          </Text>
        </View>

        {/* ── Stat Cards ── */}
        <View style={{ gap: 12 }}>
          {statCards.map((stat, index) => {
            const fadeAnim = useRef(new Animated.Value(0)).current;
            const slideAnim = useRef(new Animated.Value(20)).current;

            useEffect(() => {
              Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 80, useNativeDriver: true }),
              ]).start();
            }, []);

            return (
              <Animated.View 
                key={index} 
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
              >
                <View style={[styles.statCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                  <LinearGradient
                    colors={[stat.gradient[0] + '15', stat.gradient[1] + '08']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statGradient}
                  />
                  <View style={[styles.statIconBadge, { backgroundColor: stat.color + '15' }]}>
                    {stat.icon(stat.color)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>{stat.label}</Text>
                    <Text style={[styles.statValue, { color: COLORS.text }]}>{stat.value}</Text>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* ── Info Text ── */}
        <Text style={[styles.infoText, { color: COLORS.textMuted }]}>
          {t('analytics_info') || 'Analytics data is updated in real-time. Use this information to make informed business decisions.'}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginRight: 12 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  controls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  heroCard: {
    borderRadius: CARD_R,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroIcon: { width: 64, height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12, zIndex: 1 },
  heroTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6, zIndex: 1 },
  heroDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18, zIndex: 1 },

  statCard: {
    borderRadius: CARD_R,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  statGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  statIconBadge: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14, zIndex: 1 },
  statLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4, zIndex: 1 },
  statValue: { fontSize: 22, fontWeight: '900', zIndex: 1 },

  infoText: { fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 20 },
});

export default AnalyticsScreen;
