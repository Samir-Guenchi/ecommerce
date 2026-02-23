/**
 * StorefrontPreferencesScreen — 2026 Premium Redesign
 *
 * ✦ Control theme and language for customer-facing storefront
 * ✦ Bento-style cards with gradient accents
 * ✦ Real-time preview
 * ✦ Full i18n support
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { storeAPI } from '../services/api.service';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

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
const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const GlobeIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M2 12H22M12 2C14.5 4.5 16 8.5 16 12C16 15.5 14.5 19.5 12 22M12 2C9.5 4.5 8 8.5 8 12C8 15.5 9.5 19.5 12 22" stroke={color} strokeWidth="2" />
  </Svg>
);

interface StorefrontPreferencesScreenProps {
  navigate?: (screenId: string) => void;
  goBack?: () => void;
  storeId?: string;
}

const StorefrontPreferencesScreen: React.FC<StorefrontPreferencesScreenProps> = ({ navigate, goBack, storeId }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, language, setLanguage, isRTL } = useTranslation();
  const { message, showSuccess, showError, clear } = useStatusMessage();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('auto');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');
  const [currentStoreId, setCurrentStoreId] = useState<string | undefined>(storeId);

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const idx = langs.indexOf(language);
    setLanguage(langs[(idx + 1) % langs.length]);
  };

  useEffect(() => {
    if (storeId) {
      setCurrentStoreId(storeId);
    }
    loadPreferences();
  }, [storeId]);

  const loadPreferences = async () => {
    if (!currentStoreId) {
      // Try to get first store
      try {
        const response = await storeAPI.getAllStores();
        if (response.stores.length > 0) {
          const store = response.stores[0];
          setCurrentStoreId(store.id.toString());
          setSelectedTheme(store.storefrontTheme || 'auto');
          setSelectedLanguage(store.storefrontLanguage || 'auto');
        }
      } catch (error: any) {
        console.error('Error loading stores:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const response = await storeAPI.getStoreById(parseInt(currentStoreId, 10));
      const store = response.store;
      setSelectedTheme(store.storefrontTheme || 'auto');
      setSelectedLanguage(store.storefrontLanguage || 'auto');
    } catch (error: any) {
      showError(error.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentStoreId) {
      showError('Store ID is required');
      return;
    }

    try {
      setSaving(true);
      await storeAPI.updateStore(parseInt(currentStoreId, 10), {
        storefrontTheme: selectedTheme,
        storefrontLanguage: selectedLanguage,
      });
      showSuccess(t('storefront_saveSuccess') || 'Storefront preferences saved successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { 
      id: 'light', 
      name: t('themes_light') || 'Light', 
      description: t('themes_lightDesc') || 'Clean and bright theme',
      icon: '☀️',
      gradient: ['#FDB913', '#FDCB6E'],
    },
    { 
      id: 'dark', 
      name: t('themes_dark') || 'Dark', 
      description: t('themes_darkDesc') || 'Easy on the eyes',
      icon: '🌙',
      gradient: ['#3B82F6', '#60A5FA'],
    },
    { 
      id: 'auto', 
      name: t('themes_auto') || 'Auto', 
      description: t('storefront_autoThemeDesc') || 'Follows customer device settings',
      icon: '🔄',
      gradient: ['#6C5CE7', '#A29BFE'],
    },
  ];

  const languages = [
    { 
      id: 'en', 
      name: 'English', 
      description: 'Display storefront in English',
      icon: '🇬🇧',
      gradient: ['#0984E3', '#74B9FF'],
    },
    { 
      id: 'fr', 
      name: 'Français', 
      description: 'Afficher la boutique en français',
      icon: '🇫🇷',
      gradient: ['#6C5CE7', '#A29BFE'],
    },
    { 
      id: 'ar', 
      name: 'العربية', 
      description: 'عرض المتجر باللغة العربية',
      icon: '🇩🇿',
      gradient: ['#00B894', '#55EFC4'],
    },
    { 
      id: 'auto', 
      name: t('themes_auto') || 'Auto', 
      description: t('storefront_autoLangDesc') || 'Detect customer browser language',
      icon: '🌍',
      gradient: ['#E17055', '#FDCB6E'],
    },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textMuted, fontWeight: '600' }}>
          {t('common_loading') || 'Loading...'}
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
          <View style={[styles.headerLeft, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity 
              style={[styles.backBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} 
              onPress={goBack} 
              activeOpacity={0.7}
            >
              <BackArrowIcon color={COLORS.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: COLORS.text }]}>{t('storefront_preferences') || 'Storefront Preferences'}</Text>
              <Text style={[styles.subtitle, { color: COLORS.textMuted }]}>{t('storefront_subtitle') || 'Customer experience settings'}</Text>
            </View>
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

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* ── Hero Icon ── */}
        <View style={[styles.heroIcon, { backgroundColor: COLORS.primary + '15' }]}>
          <GlobeIcon color={COLORS.primary} />
        </View>

        <Text style={[styles.description, { color: COLORS.textSecondary }]}>
          {t('storefront_description') || 'Control how your customers see your online store. These settings affect the public storefront, not your seller dashboard.'}
        </Text>

        {/* ── Info Banner ── */}
        <View style={[styles.infoBanner, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '30' }]}>
          <Text style={[styles.infoBannerIcon]}>ℹ️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoBannerTitle, { color: COLORS.primary }]}>
              {t('storefront_liveUpdate') || 'Live Updates'}
            </Text>
            <Text style={[styles.infoBannerText, { color: COLORS.textSecondary }]}>
              {t('storefront_liveUpdateDesc') || 'Changes to theme and language are applied immediately to your storefront website. Customers will see the new settings on their next visit.'}
            </Text>
          </View>
        </View>

        {/* ── Theme Section ── */}
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          {t('storefront_themeTitle') || 'Storefront Theme'}
        </Text>
        <Text style={[styles.sectionDesc, { color: COLORS.textMuted }]}>
          {t('storefront_themeDesc') || 'Choose the color scheme customers will see'}
        </Text>

        <View style={{ gap: 12, marginBottom: 32 }}>
          {themes.map((theme, index) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.optionCard,
                  { 
                    backgroundColor: COLORS.surface, 
                    borderColor: isSelected ? theme.gradient[0] : COLORS.border,
                    borderWidth: isSelected ? 2 : 1,
                  }
                ]}
                onPress={() => setSelectedTheme(theme.id)}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <LinearGradient
                    colors={[theme.gradient[0] + '15', theme.gradient[1] + '08']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.optionGradient}
                  />
                )}
                <View style={[styles.optionIconBadge, { backgroundColor: theme.gradient[0] + '15' }]}>
                  <Text style={{ fontSize: 28 }}>{theme.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionName, { color: COLORS.text }]}>{theme.name}</Text>
                  <Text style={[styles.optionDesc, { color: COLORS.textSecondary }]}>{theme.description}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: theme.gradient[0] }]}>
                    <CheckIcon color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Language Section ── */}
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          {t('storefront_languageTitle') || 'Storefront Language'}
        </Text>
        <Text style={[styles.sectionDesc, { color: COLORS.textMuted }]}>
          {t('storefront_languageDesc') || 'Choose the language customers will see'}
        </Text>

        <View style={{ gap: 12, marginBottom: 32 }}>
          {languages.map((lang, index) => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.optionCard,
                  { 
                    backgroundColor: COLORS.surface, 
                    borderColor: isSelected ? lang.gradient[0] : COLORS.border,
                    borderWidth: isSelected ? 2 : 1,
                  }
                ]}
                onPress={() => setSelectedLanguage(lang.id)}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <LinearGradient
                    colors={[lang.gradient[0] + '15', lang.gradient[1] + '08']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.optionGradient}
                  />
                )}
                <View style={[styles.optionIconBadge, { backgroundColor: lang.gradient[0] + '15' }]}>
                  <Text style={{ fontSize: 28 }}>{lang.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionName, { color: COLORS.text }]}>{lang.name}</Text>
                  <Text style={[styles.optionDesc, { color: COLORS.textSecondary }]}>{lang.description}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: lang.gradient[0] }]}>
                    <CheckIcon color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Save Button ── */}
        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: COLORS.primary }, (saving || !currentStoreId) && { opacity: 0.6 }]} 
          onPress={handleSave}
          disabled={saving || !currentStoreId}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>{t('common_save') || 'Save Preferences'}</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.infoText, { color: COLORS.textMuted }]}>
          {t('storefront_info') || 'These settings will be applied immediately to your public storefront. Your seller dashboard will not be affected.'}
        </Text>

        {/* ── Preview Info ── */}
        <View style={[styles.previewBox, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <Text style={[styles.previewTitle, { color: COLORS.text }]}>
            🌐 {t('storefront_preview') || 'Preview Your Storefront'}
          </Text>
          <Text style={[styles.previewText, { color: COLORS.textSecondary }]}>
            {t('storefront_previewDesc') || 'Visit your store to see how customers will experience your selected theme and language settings.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginRight: 12 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  controls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  heroIcon: { width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20 },
  description: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 32 },

  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8, letterSpacing: -0.02 },
  sectionDesc: { fontSize: 13, lineHeight: 18, marginBottom: 16, fontWeight: '600' },

  optionCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  optionGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  optionIconBadge: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14, zIndex: 1 },
  optionName: { fontSize: 16, fontWeight: '800', marginBottom: 3, zIndex: 1 },
  optionDesc: { fontSize: 13, fontWeight: '600', zIndex: 1 },
  checkBadge: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8, zIndex: 1 },

  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  infoText: { fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 16 },

  infoBanner: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    marginBottom: 24,
    gap: 12,
  },
  infoBannerIcon: { fontSize: 24 },
  infoBannerTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  infoBannerText: { fontSize: 13, lineHeight: 18, fontWeight: '500' },

  previewBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  previewTitle: { fontSize: 14, fontWeight: '800', marginBottom: 6 },
  previewText: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
});

export default StorefrontPreferencesScreen;
