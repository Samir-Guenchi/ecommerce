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
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import { useTranslation } from '../i18n';
import type { SupportedLanguage } from '../i18n';
import BackHeader from '../components/BackHeader';

/* ─── Globe icon ─── */
const GlobeIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <SvgCircle cx="12" cy="12" r="10" stroke={COLORS.primary} strokeWidth="1.5" />
    <Path d="M2 12H22" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M12 2C14.5 4.74 15.92 8.29 16 12C15.92 15.71 14.5 19.26 12 22C9.5 19.26 8.08 15.71 8 12C8.08 8.29 9.5 4.74 12 2Z" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ─── Check icon ─── */
const CheckIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={COLORS.background} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface LanguagesScreenProps {
  goBack?: () => void;
}

const LANGUAGES = [
  { id: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { id: 'ar', name: 'Arabic', native: 'العربية', flag: '🇩🇿' },
  { id: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { id: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
];

const LanguagesScreen = ({ goBack }: LanguagesScreenProps) => {
  const { t, setLanguage: setAppLanguage, language: currentLang } = useTranslation();
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
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading preferences…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackHeader title={t('languages_title')} onBack={goBack} />

      {/* ── Hero area ── */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <GlobeIcon />
        </View>
        <Text style={styles.heroTitle}>{t('languages_displayLanguage')}</Text>
        <Text style={styles.heroSub}>
          {t('languages_description')}
        </Text>
      </View>

      {/* ── Toast banner ── */}
      {(statusMessage || errorMessage) ? (
        <Animated.View
          style={[
            styles.toast,
            errorMessage ? styles.toastError : styles.toastSuccess,
            { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }] },
          ]}
        >
          <Text style={[styles.toastText, errorMessage ? styles.toastTextError : styles.toastTextSuccess]}>
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
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => handleSelect(lang.id)}
              activeOpacity={0.65}
              disabled={saving}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.langName, isSelected && styles.langNameSelected]}>{lang.name}</Text>
                <Text style={[styles.langNative, isSelected && styles.langNativeSelected]}>{lang.native}</Text>
              </View>
              {isSelected ? (
                <View style={styles.checkBadge}>
                  <CheckIcon />
                </View>
              ) : (
                <View style={styles.radioOuter}><View style={styles.radioInner} /></View>
              )}
              {saving && isSelected && (
                <ActivityIndicator size="small" color={COLORS.primary} style={styles.savingSpinner} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Info ── */}
      <Text style={styles.infoText}>
        {t('languages_syncInfo')}
      </Text>
    </ScrollView>
  );
};

/* ─── Styles ─── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 48,
    paddingTop: 35,
  },
  loadingText: {
    marginTop: 12,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },

  /* Hero */
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  /* Toast */
  toast: {
    borderRadius: 10,
    padding: 12,
    marginBottom: SPACING.md,
  },
  toastSuccess: {
    backgroundColor: COLORS.success + '18',
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  toastError: {
    backgroundColor: COLORS.error + '18',
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  toastText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  toastTextSuccess: {
    color: COLORS.success,
  },
  toastTextError: {
    color: COLORS.error,
  },

  /* Cards */
  cards: {
    marginBottom: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '0D',
  },
  flag: {
    fontSize: 28,
    marginRight: 14,
  },
  cardText: {
    flex: 1,
  },
  langName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  langNameSelected: {
    color: COLORS.primary,
  },
  langNative: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  langNativeSelected: {
    color: COLORS.primaryLight,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
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
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
});

export default LanguagesScreen;
