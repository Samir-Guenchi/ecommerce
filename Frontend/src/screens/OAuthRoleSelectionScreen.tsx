/**
 * OAuthRoleSelectionScreen - Step 2: Choose Account Type
 * 
 * After setting password, user chooses their role
 * Then completes registration
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { API_URL } from '../config/api.config';
import { Logo } from '../components/Logo';

interface OAuthRoleSelectionScreenProps {
  navigate?: (screenId: string, params?: any) => void;
  resetTo?: (screenId: string) => void;
  oauthData?: {
    email: string;
    fullName: string;
    googleId: string;
    provider: string;
  };
  password?: string;
}

const OAuthRoleSelectionScreen: React.FC<OAuthRoleSelectionScreenProps> = ({ 
  navigate, 
  resetTo, 
  oauthData,
  password 
}) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, language, setLanguage } = useTranslation();

  const [accountType, setAccountType] = useState<'buyer' | 'seller' | 'delivery' | 'both' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const idx = langs.indexOf(language);
    setLanguage(langs[(idx + 1) % langs.length]);
  };

  const handleComplete = async () => {
    setError('');

    if (!accountType) {
      setError(t('oauth_selectAccountType'));
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        email: oauthData?.email,
        fullName: oauthData?.fullName,
        password,
        accountType,
        googleId: oauthData?.googleId,
      };

      console.log('📤 Sending OAuth complete request:', {
        ...requestData,
        password: '***hidden***'
      });

      const response = await fetch(`${API_URL}/auth/oauth/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('📥 OAuth complete response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || t('oauth_registrationFailed'));
      }

      // Save token and user data
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('accessToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));

      console.log('✅ OAuth registration complete, navigating to dashboard');

      // Navigate to dashboard
      resetTo?.('dashboard');
    } catch (err: any) {
      console.error('❌ OAuth complete error:', err);
      setError(err.message || t('oauth_registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!oauthData || !password) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: COLORS.error }]}>
            {t('oauth_invalidData')}
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

  const roleOptions = [
    {
      value: 'buyer' as const,
      icon: (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <Path d="M9 2L7 6H3L6 9L5 13L9 11L13 13L12 9L15 6H11L9 2Z" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M19 15H5C4 15 3 16 3 17V21H21V17C21 16 20 15 19 15Z" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ),
      title: t('oauth_buyerOption'),
      description: t('oauth_buyerDesc'),
    },
    {
      value: 'seller' as const,
      icon: (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="3" width="18" height="18" rx="2" stroke={COLORS.primary} strokeWidth="2" />
          <Path d="M3 9H21M9 3V9" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      ),
      title: t('oauth_sellerOption'),
      description: t('oauth_sellerDesc'),
    },
    {
      value: 'delivery' as const,
      icon: (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <Path d="M16 3H1V16H16V3Z" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M16 8H20L23 11V16H16V8Z" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="5.5" cy="18.5" r="2.5" stroke={COLORS.primary} strokeWidth="2" />
          <Circle cx="18.5" cy="18.5" r="2.5" stroke={COLORS.primary} strokeWidth="2" />
        </Svg>
      ),
      title: t('oauth_deliveryOption'),
      description: t('oauth_deliveryDesc'),
    },
    {
      value: 'both' as const,
      icon: (
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M2 17L12 22L22 17" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M2 12L12 17L22 12" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ),
      title: t('oauth_bothOption'),
      description: t('oauth_bothDesc'),
    },
  ];

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

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, { backgroundColor: COLORS.success }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={[styles.progressLine, { backgroundColor: COLORS.primary }]} />
            <View style={[styles.progressDot, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.progressNumber}>2</Text>
            </View>
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: COLORS.success }]}>
              {t('oauth_setPassword')}
            </Text>
            <Text style={[styles.progressLabel, { color: COLORS.primary, fontWeight: '700' }]}>
              {t('oauth_chooseRole')}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: COLORS.text }]}>{t('oauth_chooseAccountType')}</Text>
        <Text style={[styles.subtitle, { color: COLORS.textSecondary }]}>
          {t('oauth_selectRoleDescription')}
        </Text>

        {/* Error Message */}
        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: COLORS.error + '15', borderColor: COLORS.error + '40' }]}>
            <Text style={[styles.errorBannerText, { color: COLORS.error }]}>{error}</Text>
          </View>
        ) : null}

        {/* Role Options */}
        <View style={styles.rolesContainer}>
          {roleOptions.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.roleCard,
                {
                  backgroundColor: COLORS.surface,
                  borderColor: accountType === role.value ? COLORS.primary : COLORS.border,
                  borderWidth: accountType === role.value ? 2 : 1,
                },
              ]}
              onPress={() => setAccountType(role.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIcon, { backgroundColor: accountType === role.value ? COLORS.primary + '15' : COLORS.background }]}>
                {role.icon}
              </View>
              <Text style={[styles.roleTitle, { color: COLORS.text }]}>{role.title}</Text>
              <Text style={[styles.roleDescription, { color: COLORS.textSecondary }]}>{role.description}</Text>
              
              {accountType === role.value && (
                <View style={[styles.checkmark, { backgroundColor: COLORS.primary }]}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Complete Button */}
        <TouchableOpacity
          style={[styles.submitBtn, (loading || !accountType) && { opacity: 0.6 }]}
          onPress={handleComplete}
          disabled={loading || !accountType}
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
              <Text style={styles.submitText}>{t('oauth_completeButton')}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.hint, { color: COLORS.textMuted }]}>
          {t('oauth_canChangeRoleLater')}
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
  progressContainer: { marginBottom: 24 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  progressDot: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  progressNumber: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  progressLine: { width: 60, height: 3, marginHorizontal: 8 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 },
  progressLabel: { fontSize: 12, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  errorBanner: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 16 },
  errorBannerText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  rolesContainer: { marginBottom: 20 },
  roleCard: { borderRadius: 16, padding: 20, marginBottom: 12, position: 'relative' },
  roleIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  roleTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  roleDescription: { fontSize: 13, lineHeight: 18 },
  checkmark: { position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  submitGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  hint: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});

export default OAuthRoleSelectionScreen;
