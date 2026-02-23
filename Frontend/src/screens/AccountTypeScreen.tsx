/**
 * AccountTypeScreen — 2026 Redesign
 * ✦ Dynamic theme (useTheme + getColors)
 * ✦ Full i18n + EN/AR/FR language cycler
 * ✦ Premium selection cards with animated indicator
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { profileAPI } from '../services/api.service';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

interface AccountTypeScreenProps { goBack?: () => void; }

/* ══════ ICONS ══════ */
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
const ShoppingBag = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 10C16 11.06 15.58 12.08 14.83 12.83C14.08 13.58 13.06 14 12 14C10.94 14 9.92 13.58 9.17 12.83C8.42 12.08 8 11.06 8 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const StoreIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9L12 2L21 9V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const LayersIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 17L12 22L22 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 12L12 17L22 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const CheckCircle = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M22 11.08V12C22 14.67 21.05 17.24 19.33 19.28C17.62 21.31 15.26 22.7 12.64 23.2C10.02 23.7 7.31 23.28 5 22C2.69 20.72 0.91 18.66 0.0300003 16.17C-0.849999 13.68 -0.0999987 10.96 1.46 8.71C3.02 6.45 5.35 4.82 8.04 4.08C10.74 3.35 13.6 3.57 16.14 4.71" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 4L12 14.01L9 11.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Note: ACCOUNT_TYPES defined inline in render to use t()

const AccountTypeScreen = ({ goBack }: AccountTypeScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const { message, showSuccess, showError, clear } = useStatusMessage();

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language as any) + 1) % langs.length]);
  };

  useEffect(() => {
    profileAPI.getProfile().then(r => {
      setSelected(r.user.accountType || null);
    }).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!selected) { showError('Please select an account type'); return; }
    try {
      setSaving(true);
      const r = await profileAPI.updateProfile({ accountType: selected });
      if (r.user?.accountType) setSelected(r.user.accountType);
      showSuccess('Account type updated successfully.');
    } catch (e: any) {
      showError(e.message || 'Failed to update account type.');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <View style={[{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textMuted, fontWeight: '600' }}>{t('common_loading')}</Text>
      </View>
    );
  }

  const types = [
    { id: 'buyer', emoji: '🛒', icon: (c: string) => <ShoppingBag color={c} />, accent: '#0984E3', label: t('accountType_buyer'), desc: t('accountType_buyerDesc') },
    { id: 'seller', emoji: '🏪', icon: (c: string) => <StoreIcon color={c} />, accent: '#00B894', label: t('accountType_seller'), desc: t('accountType_sellerDesc') },
    { id: 'both', emoji: '⚡', icon: (c: string) => <LayersIcon color={c} />, accent: '#6C5CE7', label: t('accountType_both'), desc: t('accountType_bothDesc') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          {/* Back button */}
          <TouchableOpacity
            style={[s.backBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }, isRTL && { marginRight: 0, marginLeft: 12 }]}
            onPress={goBack}
            activeOpacity={0.7}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              {isRTL
                ? <Path d="M5 12H19M12 5L19 12L12 19" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                : <Path d="M19 12H5M12 19L5 12L12 5" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              }
            </Svg>
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: COLORS.text }, isRTL && { textAlign: 'right' }]}>{t('settings_accountType')}</Text>
          <View style={[s.controls, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity style={[s.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={cycleLanguage} activeOpacity={0.7}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.text }}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={toggleTheme} activeOpacity={0.7}>
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </TouchableOpacity>
          </View>
        </View>

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* ── Subtitle ── */}
        <Text style={[s.subtitle, { color: COLORS.textMuted }, isRTL && { textAlign: 'right' }]}>{t('accountType_subheading')}</Text>

        {/* ── Type Cards ── */}
        <View style={{ gap: 14 }}>
          {types.map((type) => {
            const isSelected = selected === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[s.typeCard, { backgroundColor: COLORS.surface, borderColor: isSelected ? type.accent : COLORS.border, borderWidth: isSelected ? 2 : 1 }, isRTL && { flexDirection: 'row-reverse' }]}
                onPress={() => setSelected(type.id)}
                activeOpacity={0.7}
              >
                <View style={[s.iconBadge, { backgroundColor: type.accent + '18' }]}>
                  {type.icon(type.accent)}
                </View>
                <View style={[{ flex: 1 }, isRTL ? { marginRight: 16, alignItems: 'flex-end' } : { marginLeft: 16 }]}>
                  <Text style={[s.typeName, { color: isSelected ? type.accent : COLORS.text }]}>{type.label}</Text>
                  <Text style={[s.typeDesc, { color: COLORS.textMuted }]}>{type.desc}</Text>
                </View>
                <View style={[s.checkCircle, {
                  backgroundColor: isSelected ? type.accent : COLORS.border,
                  borderColor: isSelected ? type.accent : COLORS.border,
                }]}>
                  {isSelected && <CheckCircle color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Save ── */}
        <TouchableOpacity
          style={[s.saveBtn, { backgroundColor: COLORS.primary, opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={s.saveBtnText}>{t('accountType_saveChanges')}</Text>
          )}
        </TouchableOpacity>

        <Text style={[s.footerNote, { color: COLORS.textMuted }]}>
          {t('accountType_footer')}
        </Text>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  controls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  subtitle: { fontSize: 13, fontWeight: '500', marginBottom: 24, lineHeight: 20 },
  typeCard: { borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center' },
  iconBadge: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  typeName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  typeDesc: { fontSize: 12, fontWeight: '500', lineHeight: 18 },
  checkCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, flexShrink: 0 },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 28, marginBottom: 16 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  footerNote: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});

export default AccountTypeScreen;
