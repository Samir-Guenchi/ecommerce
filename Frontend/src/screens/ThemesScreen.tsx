/**
 * ThemesScreen — 2026 Premium Redesign
 *
 * ✦ Bento-style theme cards with gradient accents
 * ✦ Animated selection states
 * ✦ Modern glassmorphism effects
 * ✦ Full i18n and dark mode support
 */
import React, { useState, useRef, useEffect } from 'react';
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
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

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
const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ThemeIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2.69L5 6.69L12 10.69L19 6.69L12 2.69Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 12L12 16L19 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 17.31L12 21.31L19 17.31" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface ThemesScreenProps {
  navigate?: (screenId: string) => void;
  goBack?: () => void;
}

const ThemesScreen: React.FC<ThemesScreenProps> = ({ navigate, goBack }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, language, setLanguage, isRTL } = useTranslation();
  const { message, showSuccess, showError, clear } = useStatusMessage();
  const [selectedTheme, setSelectedTheme] = useState<string>(mode);

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const idx = langs.indexOf(language);
    setLanguage(langs[(idx + 1) % langs.length]);
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
      description: t('themes_autoDesc') || 'Follows system settings',
      icon: '🔄',
      gradient: ['#6C5CE7', '#A29BFE'],
    },
  ];

  const handleSave = () => {
    if (!selectedTheme) {
      showError(t('themes_selectError') || 'Please select a theme');
      return;
    }
    // Apply theme
    if (selectedTheme !== 'auto') {
      toggleTheme();
    }
    showSuccess(t('themes_saveSuccess') || 'Your theme preference has been saved.');
  };

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
              <Text style={[styles.title, { color: COLORS.text }]}>{t('settings_themes') || 'Themes'}</Text>
              <Text style={[styles.subtitle, { color: COLORS.textMuted }]}>{t('themes_subtitle') || 'Customize appearance'}</Text>
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
          <ThemeIcon color={COLORS.primary} />
        </View>

        <Text style={[styles.description, { color: COLORS.textSecondary }]}>
          {t('themes_description') || 'Choose a theme for your store appearance. The theme will be applied immediately.'}
        </Text>

        {/* ── Theme Cards ── */}
        <View style={{ gap: 12, marginBottom: 24 }}>
          {themes.map((theme, index) => {
            const isSelected = selectedTheme === theme.id;
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
                key={theme.id} 
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
              >
                <TouchableOpacity
                  style={[
                    styles.themeCard,
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
                      style={styles.themeGradient}
                    />
                  )}
                  <View style={[styles.themeIconBadge, { backgroundColor: theme.gradient[0] + '15' }]}>
                    <Text style={{ fontSize: 28 }}>{theme.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.themeName, { color: COLORS.text }]}>{theme.name}</Text>
                    <Text style={[styles.themeDesc, { color: COLORS.textSecondary }]}>{theme.description}</Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: theme.gradient[0] }]}>
                      <CheckIcon color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* ── Save Button ── */}
        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: COLORS.primary }]} 
          onPress={handleSave} 
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>{t('common_save') || 'Save Theme'}</Text>
        </TouchableOpacity>

        <Text style={[styles.infoText, { color: COLORS.textMuted }]}>
          {t('themes_info') || 'The theme will be applied to your store immediately. Customers will see the selected theme.'}
        </Text>
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
  description: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 24 },

  themeCard: {
    borderRadius: CARD_R,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  themeGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  themeIconBadge: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14, zIndex: 1 },
  themeName: { fontSize: 16, fontWeight: '800', marginBottom: 3, zIndex: 1 },
  themeDesc: { fontSize: 13, fontWeight: '600', zIndex: 1 },
  checkBadge: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8, zIndex: 1 },

  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  infoText: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});

export default ThemesScreen;
