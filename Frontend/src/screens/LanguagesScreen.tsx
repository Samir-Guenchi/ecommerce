import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { profileAPI } from '../services/api.service';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import type { SupportedLanguage } from '../i18n';

/* ─── Globe icon ─── */
const GlobeIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <SvgCircle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
    <Path d="M2 12H22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M12 2C14.5 4.74 15.92 8.29 16 12C15.92 15.71 14.5 19.26 12 22C9.5 19.26 8.08 15.71 8 12C8.08 8.29 9.5 4.74 12 2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ─── Check icon ─── */
const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SunIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <SvgCircle cx="12" cy="12" r="5" stroke="#FDB913" strokeWidth="2" />
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB913" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const MoonIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface LanguagesScreenProps {
  goBack?: () => void;
}

const LANGUAGES = [
  { id: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { id: 'ar', name: 'Arabic', native: 'العربية', flag: '🇩🇿' },
  { id: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
];

const LanguagesScreen = ({ goBack }: LanguagesScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, setLanguage: setAppLanguage, language: currentLang, isRTL } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [savedLanguage, setSavedLanguage] = useState<string>('en');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  /* ── Load current preference ── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { user } = await profileAPI.getProfile();
        const lang = user.languagePreference || 'en';
        setSelectedLanguage(lang);
        setSavedLanguage(lang);
      } catch (err: any) {
        console.error('Error loading language:', err);
        setErrorMessage('Could not load language preference');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── Show & auto-hide toast ── */
  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setStatusMessage('');
    } else {
      setStatusMessage(msg);
      setErrorMessage('');
    }
    fadeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setStatusMessage('');
      setErrorMessage('');
    });
  };

  /* ── Auto-save on tap ── */
  const handleSelect = async (langId: string) => {
    if (langId === savedLanguage || saving) return;
    setSelectedLanguage(langId);
    setSaving(true);
    try {
      await profileAPI.updateProfile({ languagePreference: langId });
      setSavedLanguage(langId);
      /* Sync with i18n context so all screens update immediately */
      setAppLanguage(langId as SupportedLanguage);
      const langName = LANGUAGES.find(l => l.id === langId)?.name ?? langId;
      showToast(`Switched to ${langName}`);
    } catch (err: any) {
      setSelectedLanguage(savedLanguage); // revert on error
      showToast(err.message || 'Failed to update language', true);
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: COLORS.textSecondary }]}>{t('common_loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: COLORS.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header with back, title, and controls */}
      <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={goBack} activeOpacity={0.7}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d={isRTL ? 'M5 12H19M19 12L12 19M19 12L12 5' : 'M19 12H5M5 12L12 19M5 12L12 5'} stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.text }]} numberOfLines={1}>{t('languages_title')}</Text>
        <View style={[styles.controls, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={toggleTheme} activeOpacity={0.7}>
            {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Hero area ── */}
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: COLORS.primary + '18' }]}>
          <GlobeIcon color={COLORS.primary} />
        </View>
        <Text style={[styles.heroTitle, { color: COLORS.text }]}>{t('languages_displayLanguage')}</Text>
        <Text style={[styles.heroSub, { color: COLORS.textSecondary }]}>
          {t('languages_description')}
        </Text>
      </View>

      {/* ── Toast banner ── */}
      {(statusMessage || errorMessage) ? (
        <Animated.View
          style={[
            styles.toast,
            errorMessage ? [styles.toastError, { backgroundColor: COLORS.error + '18', borderColor: COLORS.error + '40' }] : [styles.toastSuccess, { backgroundColor: COLORS.success + '18', borderColor: COLORS.success + '40' }],
            { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }] },
          ]}
        >
          <Text style={[styles.toastText, errorMessage ? { color: COLORS.error } : { color: COLORS.success }]}>
            {errorMessage || statusMessage}
          </Text>
        </Animated.View>
      ) : null}

      {/* ── Language cards ── */}
      <View style={styles.cards}>
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.id;
          return (
            <TouchableOpacity
              key={lang.id}
              style={[styles.card, { backgroundColor: COLORS.surface, borderColor: isSelected ? COLORS.primary : 'transparent' }, isSelected && { backgroundColor: COLORS.primary + '0D' }]}
              onPress={() => handleSelect(lang.id)}
              activeOpacity={0.65}
              disabled={saving}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.langName, { color: isSelected ? COLORS.primary : COLORS.text }]}>{lang.name}</Text>
                <Text style={[styles.langNative, { color: isSelected ? COLORS.primaryLight : COLORS.textSecondary }]}>{lang.native}</Text>
              </View>
              {isSelected ? (
                <View style={[styles.checkBadge, { backgroundColor: COLORS.primary }]}>
                  <CheckIcon color="#FFFFFF" />
                </View>
              ) : (
                <View style={[styles.radioOuter, { borderColor: COLORS.border }]}><View style={styles.radioInner} /></View>
              )}
              {saving && isSelected && (
                <ActivityIndicator size="small" color={COLORS.primary} style={styles.savingSpinner} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Info ── */}
      <Text style={[styles.infoText, { color: COLORS.textMuted }]}>
        {t('languages_syncInfo')}
      </Text>
    </ScrollView>
  );
};

/* ─── Styles ─── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    paddingTop: 54,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  controls: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  /* Hero */
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  /* Toast */
  toast: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  toastSuccess: {},
  toastError: {},
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* Cards */
  cards: {
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  flag: {
    fontSize: 28,
    marginRight: 14,
  },
  cardText: {
    flex: 1,
  },
  langName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  langNative: {
    fontSize: 13,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {},
  savingSpinner: {
    position: 'absolute',
    right: 16,
  },

  /* Info */
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
});

export default LanguagesScreen;
