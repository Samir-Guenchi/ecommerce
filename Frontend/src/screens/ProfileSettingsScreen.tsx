/**
 * ProfileSettingsScreen — 2026 Premium Design
 *
 * ✦ Dynamic theming (dark/light)
 * ✦ i18n support
 * ✦ Back button + theme/language controls
 * ✦ Premium form styling with gradient save button
 */
import React, { useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { profileAPI } from '../services/api.service';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';

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

interface ProfileSettingsScreenProps {
  onLogout?: () => void;
  goBack?: () => void;
}

const ProfileSettingsScreen = ({ onLogout, goBack }: ProfileSettingsScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, language, setLanguage, isRTL } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const idx = langs.indexOf(language);
    setLanguage(langs[(idx + 1) % langs.length]);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfile();
        const user = response.user;
        setFullName(user.fullName || '');
        setEmail(user.email);
        setPhone(user.phone || '');
        setBio(user.bio || '');
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!fullName) { setErrorMessage(t('profile_missingName')); return; }
    setStatusMessage('');
    setErrorMessage('');
    try {
      setSaving(true);
      await profileAPI.updateProfile({ fullName, phone: phone || undefined, bio: bio || undefined });
      setStatusMessage(t('profile_saved') || 'Profile updated successfully!');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.outer, { backgroundColor: COLORS.background }, s.center]}>
        <View style={{ backgroundColor: COLORS.surface, padding: 40, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 16, fontSize: 14, color: COLORS.textMuted, fontWeight: '600' }}>
            {t('profile_loading') || 'Loading profile...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.outer, { backgroundColor: COLORS.background }]}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ─── Header ────────────────────────────── */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity
            style={[s.backBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }, isRTL && { marginRight: 0, marginLeft: 12 }]}
            onPress={goBack}
            activeOpacity={0.7}
          >
            <BackArrowIcon color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: COLORS.text }, isRTL && { textAlign: 'right' }]}>{t('profile_title')}</Text>
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

        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={[s.avatar, { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary + '30' }]}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: COLORS.primary }}>
              {fullName ? fullName.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 12 }}>{fullName || 'User'}</Text>
          <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{email}</Text>
        </View>

        {/* Banners */}
        {statusMessage ? (
          <View style={[s.banner, { backgroundColor: COLORS.success + '15', borderColor: COLORS.success + '40' }]}>
            <Text style={[s.bannerText, { color: COLORS.success }]}>{statusMessage}</Text>
          </View>
        ) : null}
        {errorMessage ? (
          <View style={[s.banner, { backgroundColor: COLORS.error + '15', borderColor: COLORS.error + '40' }]}>
            <Text style={[s.bannerText, { color: COLORS.error }]}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* ─── Form Card ────────────────────────── */}
        <View style={[s.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={s.field}>
            <Text style={[s.label, { color: COLORS.text }]}>{t('profile_fullName') || 'Full Name'}</Text>
            <TextInput
              style={[s.input, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.text }]}
              placeholder={t('profile_fullNamePlaceholder') || 'Enter your full name'}
              placeholderTextColor={COLORS.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={s.field}>
            <Text style={[s.label, { color: COLORS.text }]}>{t('profile_email') || 'Email'}</Text>
            <TextInput
              style={[s.input, s.inputDisabled, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.textMuted }]}
              value={email}
              editable={false}
              keyboardType="email-address"
            />
            <Text style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>
              {t('profile_emailHint') || 'Email cannot be changed'}
            </Text>
          </View>

          <View style={s.field}>
            <Text style={[s.label, { color: COLORS.text }]}>{t('profile_phone') || 'Phone Number'}</Text>
            <TextInput
              style={[s.input, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.text }]}
              placeholder={t('profile_phonePlaceholder') || 'Enter your phone number'}
              placeholderTextColor={COLORS.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={[s.field, { marginBottom: 0 }]}>
            <Text style={[s.label, { color: COLORS.text }]}>{t('profile_bio') || 'Bio'}</Text>
            <TextInput
              style={[s.input, s.textArea, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.text }]}
              placeholder={t('profile_bioPlaceholder') || 'Tell us about yourself'}
              placeholderTextColor={COLORS.textMuted}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* ─── Save Button ────────────────────── */}
        <TouchableOpacity
          style={[s.submitBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.submitGradient}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={s.submitText}>{t('profile_save') || 'Save Changes'}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* ─── Logout Button ─────────────────── */}
        <TouchableOpacity
          style={[s.logoutBtn, { borderColor: COLORS.error + '40' }]}
          onPress={onLogout}
          disabled={!onLogout}
          activeOpacity={0.7}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M9 21H5C4.47 21 3.96 20.79 3.59 20.41C3.21 20.04 3 19.53 3 19V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H9" stroke={COLORS.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 17L21 12L16 7M21 12H9" stroke={COLORS.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.error, marginLeft: 10 }}>
            {t('profile_logout') || 'Log Out'}
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 12, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18, marginTop: 16 }}>
          {t('profile_privacyHint') || 'Your profile information will be visible based on your privacy settings.'}
        </Text>

      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  outer: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerControls: { flexDirection: 'row', gap: 8 },
  controlBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },

  banner: { borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1 },
  bannerText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  card: { borderRadius: 22, padding: 20, borderWidth: 1, marginBottom: 20 },

  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.2 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14 },
  inputDisabled: { opacity: 0.6 },
  textArea: { minHeight: 100, paddingTop: 14 },

  submitBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  submitGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 16, borderWidth: 1.5,
  },
});

export default ProfileSettingsScreen;
