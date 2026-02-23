/**
 * PasswordSetupScreen - Set Password for Existing OAuth User
 * 
 * For OAuth users who don't have a password yet
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { API_URL } from '../config/api.config';
import { Logo } from '../components/Logo';

interface PasswordSetupScreenProps {
  navigate?: (screenId: string, params?: any) => void;
  resetTo?: (screenId: string) => void;
  userData?: {
    userId: number;
    email: string;
    fullName: string;
  };
}

const PasswordSetupScreen: React.FC<PasswordSetupScreenProps> = ({ navigate, resetTo, userData }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, language, setLanguage } = useTranslation();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const idx = langs.indexOf(language);
    setLanguage(langs[(idx + 1) % langs.length]);
  };

  const handleSetPassword = async () => {
    setError('');

    // Validation
    if (!password) {
      setError(t('oauth_passwordRequired'));
      return;
    }

    if (password.length < 6) {
      setError(t('oauth_passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('oauth_passwordsNoMatch'));
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/oauth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData?.userId,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('password_setup_failed'));
      }

      // Save token and user data
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('accessToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));

      // Navigate to dashboard
      resetTo?.('dashboard');
    } catch (err: any) {
      setError(err.message || t('password_setup_failed'));
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: COLORS.error }]}>
            {t('password_setup_invalidData')}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: COLORS.primary }]}
            onPress={() => resetTo?.('welcome')}
          >
            <Text style={styles.buttonText}>{t('oauth_goToWelcome')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Header Controls */}
      <View style={styles.headerControls}>
        <TouchableOpacity onPress={cycleLanguage} style={[styles.controlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.text }}>{language.toUpperCase()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={[styles.controlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          {mode === 'dark' ? (
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="5" stroke="#FDB913" strokeWidth="2" />
              <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB913" strokeWidth="2" strokeLinecap="round" />
            </Svg>
          ) : (
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo variant="full" size={64} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: COLORS.text }]}>{t('password_setup_title')}</Text>
        <Text style={[styles.subtitle, { color: COLORS.textSecondary }]}>
          {t('password_setup_subtitle')}
        </Text>

        {/* User Info Card */}
        <View style={[styles.infoCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={styles.infoRow}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" />
              <Circle cx="12" cy="7" r="4" stroke={COLORS.primary} strokeWidth="2" />
            </Svg>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.infoLabel, { color: COLORS.textMuted }]}>{t('oauth_fullName')}</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>{userData.fullName}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={COLORS.primary} strokeWidth="2" />
              <Path d="M22 6l-10 7L2 6" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" />
            </Svg>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.infoLabel, { color: COLORS.textMuted }]}>{t('oauth_email')}</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>{userData.email}</Text>
            </View>
          </View>
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: COLORS.info + '15', borderColor: COLORS.info + '40' }]}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={COLORS.info} strokeWidth="2" />
            <Path d="M12 16v-4M12 8h.01" stroke={COLORS.info} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={[styles.infoBannerText, { color: COLORS.info }]}>
            {t('password_setup_info')}
          </Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: COLORS.error + '15', borderColor: COLORS.error + '40' }]}>
            <Text style={[styles.errorBannerText, { color: COLORS.error }]}>{error}</Text>
          </View>
        ) : null}

        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          {/* Password */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: COLORS.text }]}>{t('password_setup_newPassword')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.text, flex: 1 }]}
                placeholder={t('oauth_passwordMinChars')}
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  {showPassword ? (
                    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" stroke={COLORS.textMuted} strokeWidth="2" />
                  ) : (
                    <>
                      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke={COLORS.textMuted} strokeWidth="2" strokeLinecap="round" />
                      <Path d="M1 1l22 22" stroke={COLORS.textMuted} strokeWidth="2" strokeLinecap="round" />
                    </>
                  )}
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: COLORS.text }]}>{t('password_setup_confirmPassword')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.text }]}
              placeholder={t('oauth_reenterPassword')}
              placeholderTextColor={COLORS.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleSetPassword}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>{t('password_setup_button')}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.hint, { color: COLORS.textMuted }]}>
          {t('password_setup_hint').replace('{email}', userData.email)}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerControls: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', gap: 8, zIndex: 10 },
  controlBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 70, paddingBottom: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  infoCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600' },
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 16 },
  infoBannerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  errorBanner: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 16 },
  errorBannerText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  formCard: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.2 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center' },
  eyeButton: { position: 'absolute', right: 12, padding: 8 },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  submitGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  hint: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});

export default PasswordSetupScreen;
