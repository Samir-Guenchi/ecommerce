/**
 * StoreSettingsScreen — Algérie Poste E-Commerce Store Settings
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ── Icons ── */
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
const BackArrowIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19L5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ChevronRight = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ── Setting Icon Components ── */
const ThemesIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2.69L5 6.69L12 10.69L19 6.69L12 2.69Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 12L12 16L19 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 17.31L12 21.31L19 17.31" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ProductsIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6V20C3 20.53 3.21 21.04 3.59 21.41C3.96 21.79 4.47 22 5 22H19C19.53 22 20.04 21.79 20.41 21.41C20.79 21.04 21 20.53 21 20V6L18 2H6Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 6H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 10C16 11.1 15.1 12 14 12C12.9 12 12 11.1 12 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const OrdersIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 11L12 14L22 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 12V19C21 19.53 20.79 20.04 20.41 20.41C20.04 20.79 19.53 21 19 21H5C4.47 21 3.96 20.79 3.59 20.41C3.21 20.04 3 19.53 3 19V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const AnalyticsIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3V21H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 16L12 11L16 15L21 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const DomainIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M2 12H22M12 2C14.5 4.5 16 8.5 16 12C16 15.5 14.5 19.5 12 22M12 2C9.5 4.5 8 8.5 8 12C8 15.5 9.5 19.5 12 22" stroke={color} strokeWidth="2" />
  </Svg>
);
const GlobeIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M2 12H22M12 2C14.5 4.5 16 8.5 16 12C16 15.5 14.5 19.5 12 22M12 2C9.5 4.5 8 8.5 8 12C8 15.5 9.5 19.5 12 22" stroke={color} strokeWidth="2" />
  </Svg>
);

/* ── Color Map ── */
const SECTION_COLORS: Record<string, string> = {
  storefrontPreferences: '#0D2C74',
  themes: '#1E3A8A',
  products: '#D97706',
  orders: '#0D2C74',
  analytics: '#0F766E',
  domains: '#1E293B',
};

/* ── Setting Item with Animation ── */
interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accentColor: string;
  onPress?: () => void;
  COLORS: any;
  index: number;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, subtitle, accentColor, onPress, COLORS, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: 12 }}>
      <TouchableOpacity
        style={[s.settingCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[accentColor + '20', accentColor + '05']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.settingGradient}
        />
        <View style={[s.settingIconBadge, { backgroundColor: accentColor + '15' }]}>
          {icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.settingTitle, { color: COLORS.text }]}>{title}</Text>
          {subtitle && <Text style={[s.settingSubtitle, { color: COLORS.textMuted }]}>{subtitle}</Text>}
        </View>
        <View style={[s.chevronBadge, { backgroundColor: COLORS.background }]}>
          <ChevronRight color={accentColor} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ── Main Screen ── */
interface StoreSettingsScreenProps {
  navigate?: (screenId: string, params?: any) => void;
  goBack?: () => void;
  storeId?: string;
}

const StoreSettingsScreen: React.FC<StoreSettingsScreenProps> = ({ navigate, goBack, storeId }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, language, setLanguage, isRTL } = useTranslation();

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const idx = langs.indexOf(language);
    setLanguage(langs[(idx + 1) % langs.length]);
  };

  const handleNav = (screenId: string) => {
    if (navigate) {
      if (storeId && (screenId === 'domains' || screenId === 'analytics' || screenId === 'storefrontPreferences')) {
        navigate(screenId, { storeId });
      } else {
        navigate(screenId);
      }
    }
  };

  const settings = [
    { id: 'storefrontPreferences', icon: <GlobeIcon color={SECTION_COLORS.storefrontPreferences} />, title: t('storefront_preferences') || 'Storefront Preferences', subtitle: t('storefront_preferencesDesc') || 'Theme & language for customers', color: SECTION_COLORS.storefrontPreferences },
    { id: 'themes', icon: <ThemesIcon color={SECTION_COLORS.themes} />, title: t('settings_themes') || 'Themes', subtitle: t('settings_themesDesc') || 'Customize store appearance', color: SECTION_COLORS.themes },
    { id: 'products', icon: <ProductsIcon color={SECTION_COLORS.products} />, title: t('settings_products') || 'Products', subtitle: t('settings_productsDesc') || 'Manage your product catalog', color: SECTION_COLORS.products },
    { id: 'orders', icon: <OrdersIcon color={SECTION_COLORS.orders} />, title: t('settings_orders') || 'Orders', subtitle: t('settings_ordersDesc') || 'View and manage orders', color: SECTION_COLORS.orders },
    { id: 'analytics', icon: <AnalyticsIcon color={SECTION_COLORS.analytics} />, title: t('settings_analytics') || 'Analytics', subtitle: t('settings_analyticsDesc') || 'Insights and performance', color: SECTION_COLORS.analytics },
    { id: 'domains', icon: <DomainIcon color={SECTION_COLORS.domains} />, title: t('settings_domains') || 'Domains', subtitle: t('settings_domainsDesc') || 'Custom domain settings', color: SECTION_COLORS.domains },
  ];

  return (
    <View style={[s.outer, { backgroundColor: COLORS.background }]}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={[s.backBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={goBack} activeOpacity={0.7}>
            <BackArrowIcon color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: COLORS.text }]}>{t('settings_storeSettings') || 'Store Settings'}</Text>
          <View style={[s.headerControls, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity
              style={[s.controlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={cycleLanguage}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.text }}>{language.toUpperCase()}</Text>
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

        {/* Description */}
        <Text style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 20 }}>
          {t('settings_storeSettingsDesc')}
        </Text>

        {/* Settings Cards */}
        <View>
          {settings.map((item, i) => (
            <SettingItem
              key={item.id}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              accentColor={item.color}
              onPress={() => handleNav(item.id)}
              COLORS={COLORS}
              index={i}
            />
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  outer: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerControls: { flexDirection: 'row', gap: 8 },
  controlBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  settingCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  settingGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  settingIconBadge: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14, zIndex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '800', marginBottom: 3, zIndex: 1 },
  settingSubtitle: { fontSize: 12, fontWeight: '600', zIndex: 1 },
  chevronBadge: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8, zIndex: 1 },
});

export default StoreSettingsScreen;
