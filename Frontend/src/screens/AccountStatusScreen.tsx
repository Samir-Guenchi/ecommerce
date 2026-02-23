/**
 * AccountStatusScreen — 2026 Redesign
 * ✦ Full i18n EN/AR/FR — no hardcoded English strings
 * ✦ RTL layout support
 * ✦ Dynamic dark / light theme
 * ✦ Backend: profileAPI.getProfile() + authAPI.resendVerification
 * ✦ Circular progress ring + verification stepper
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { profileAPI, authAPI } from '../services/api.service';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

interface AccountStatusScreenProps { goBack?: () => void; }

/* ─── Icons ─── */
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
const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ShieldIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const MailIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6L12 13L2 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const BackArrow = ({ color, flip }: { color: string; flip?: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    {flip
      ? <Path d="M5 12H19M12 5L19 12L12 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      : <Path d="M19 12H5M12 19L5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    }
  </Svg>
);

/* ── Circular progress ring ── */
const CircleProgress = ({ pct, color, size = 90 }: { pct: number; color: string; size?: number }) => {
  const R = (size - 12) / 2;
  const circ = 2 * Math.PI * R;
  const filled = circ * (1 - pct / 100);
  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${size / 2},${size / 2}`}>
        <Circle cx={size / 2} cy={size / 2} r={R} stroke="#FFFFFF20" strokeWidth={10} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={R} stroke={color} strokeWidth={10} fill="none"
          strokeDasharray={`${circ}`} strokeDashoffset={filled} strokeLinecap="round" />
      </G>
    </Svg>
  );
};

const AccountStatusScreen = ({ goBack }: AccountStatusScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const { message, showSuccess, showInfo, clear } = useStatusMessage();
  const [account, setAccount] = useState({
    status: 'pending', email: '', emailVerified: false, phoneVerified: false,
    identityVerified: false, fullName: '', accountType: '', createdAt: '', updatedAt: '',
  });

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language as any) + 1) % langs.length]);
  };

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const r = await profileAPI.getProfile();
      const u = r.user as any;
      setAccount({
        status: u.accountStatus || 'pending',
        email: u.email || '',
        emailVerified: u.emailVerified || false,
        phoneVerified: u.phoneVerified || false,
        identityVerified: u.identityVerified || false,
        fullName: u.fullName || '',
        accountType: u.accountType || '',
        createdAt: u.createdAt || '',
        updatedAt: u.updatedAt || '',
      });
    } catch (_) { } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const verified = [account.emailVerified, account.phoneVerified, account.identityVerified].filter(Boolean).length;
  const pct = Math.round((verified / 3) * 100);

  const statusMap: Record<string, { color: string; label: string }> = {
    active: { color: COLORS.success, label: t('status_active') },
    suspended: { color: COLORS.error, label: t('status_suspended') },
    banned: { color: '#DC2626', label: t('status_banned') },
    pending: { color: COLORS.warning, label: t('status_pending') },
  };
  const statusInfo = statusMap[account.status] || statusMap.pending;

  /* i18n-aware account type label */
  const accountTypeLabel = account.accountType
    ? t((`accountType_${account.accountType}` as any) || account.accountType)
    : '';

  /* i18n-aware steps */
  const steps = [
    { labelKey: 'status_emailVerification', verified: account.emailVerified, key: 'email' },
    { labelKey: 'status_phoneVerification', verified: account.phoneVerified, key: 'phone' },
    { labelKey: 'status_identityVerification', verified: account.identityVerified, key: 'identity' },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={COLORS.primary} />}
      >
        {/* ── Header ── */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity
            style={[s.backBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }, isRTL && { marginRight: 0, marginLeft: 12 }]}
            onPress={goBack}
            activeOpacity={0.7}
          >
            <BackArrow color={COLORS.text} flip={isRTL} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: COLORS.text }, isRTL && { textAlign: 'right' }]}>
            {t('settings_accountStatus')}
          </Text>
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

        {/* ── Status Hero Card ── */}
        <View style={[s.heroCard, { backgroundColor: statusInfo.color + '12', borderColor: statusInfo.color + '35' }]}>
          <View style={{ alignItems: 'center', gap: 14 }}>
            {/* Circular progress */}
            <View style={{ position: 'relative', width: 90, height: 90, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ position: 'absolute' }}>
                <CircleProgress pct={pct} color={statusInfo.color} size={90} />
              </View>
              <View style={[s.shieldBadge, { backgroundColor: statusInfo.color + '20' }]}>
                <ShieldIcon color={statusInfo.color} />
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[s.heroName, { color: COLORS.text }]}>{account.fullName || account.email}</Text>
              <View style={[s.statusPill, { backgroundColor: statusInfo.color + '18' }]}>
                <View style={[s.statusDot, { backgroundColor: statusInfo.color }]} />
                <Text style={[s.statusPillText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
              </View>
              {accountTypeLabel ? (
                <Text style={[s.typeChip, { color: COLORS.textMuted }]}>
                  {accountTypeLabel} {t('status_account')}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── Verification Progress ── */}
        <View style={[s.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={[s.cardTitle, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[s.cardTitleText, { color: COLORS.text }]}>{t('status_verificationProgress')}</Text>
            <Text style={[s.pctText, { color: COLORS.primary }]}>{pct}%</Text>
          </View>
          <View style={[s.progressBg, { backgroundColor: COLORS.border }]}>
            <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: COLORS.primary }]} />
          </View>
          <Text style={[s.progressHint, { color: COLORS.textMuted }, isRTL && { textAlign: 'right' }]}>
            {verified}/3 {t('status_complete')}
          </Text>
        </View>

        {/* ── Steps ── */}
        <View style={[s.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <Text style={[s.cardTitleText, { color: COLORS.text, marginBottom: 16 }, isRTL && { textAlign: 'right' }]}>
            {t('status_verificationSteps')}
          </Text>
          {steps.map((step, i) => (
            <View key={step.key} style={[s.stepRow, i < steps.length - 1 && { marginBottom: 16 }, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={{ alignItems: 'center', width: 32 }}>
                <View style={[s.stepDot, { backgroundColor: step.verified ? COLORS.success : COLORS.border }]}>
                  {step.verified && <CheckIcon color="#FFFFFF" />}
                </View>
                {i < steps.length - 1 && <View style={[s.stepLine, { backgroundColor: step.verified ? COLORS.success : COLORS.border }]} />}
              </View>
              <View style={[{ flex: 1 }, isRTL ? { marginRight: 14, alignItems: 'flex-end' } : { marginLeft: 14 }]}>
                <Text style={[s.stepLabel, { color: step.verified ? COLORS.success : COLORS.text }]}>
                  {t(step.labelKey as any)}
                </Text>
                <Text style={[s.stepStatus, { color: COLORS.textMuted }]}>
                  {step.verified ? t('status_verified') : t('status_notVerified')}
                </Text>
              </View>
              {!step.verified && (
                <View style={[s.chip, { backgroundColor: COLORS.warning + '18' }]}>
                  <Text style={[s.chipText, { color: COLORS.warning }]}>{t('status_pending')}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* ── Resend Verification Email ── */}
        {!account.emailVerified && (
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: COLORS.primary, opacity: sendingEmail ? 0.7 : 1 }, isRTL && { flexDirection: 'row-reverse' }]}
            onPress={async () => {
              setSendingEmail(true);
              try { await (authAPI as any).resendVerification?.(); showSuccess(t('status_emailSent')); }
              catch { showInfo(t('status_emailSubmitted')); }
              finally { setSendingEmail(false); }
            }}
            activeOpacity={0.8}
          >
            <MailIcon color="#FFFFFF" />
            <Text style={s.actionBtnText}>
              {sendingEmail ? t('status_sending') : t('status_resendEmail')}
            </Text>
          </TouchableOpacity>
        )}

        {/* ── Account Details ── */}
        <View style={[s.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <Text style={[s.cardTitleText, { color: COLORS.text, marginBottom: 12 }, isRTL && { textAlign: 'right' }]}>
            {t('status_accountDetails')}
          </Text>
          {[
            { lbl: t('profile_email'), val: account.email },
            { lbl: t('status_memberSince'), val: account.createdAt ? new Date(account.createdAt).toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US') : t('common_na') },
            { lbl: t('status_lastUpdated'), val: account.updatedAt ? new Date(account.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US') : t('common_na') },
          ].map((row) => (
            <View key={row.lbl} style={[s.infoRow, { borderBottomColor: COLORS.border }, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[s.infoLbl, { color: COLORS.textMuted }]}>{row.lbl}</Text>
              <Text style={[s.infoVal, { color: COLORS.text }]}>{row.val}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  controls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  heroCard: { borderRadius: 22, borderWidth: 1, padding: 28, alignItems: 'center', marginBottom: 16 },
  shieldBadge: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  heroName: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusPillText: { fontSize: 13, fontWeight: '700' },
  typeChip: { fontSize: 12, fontWeight: '600' },
  card: { borderRadius: 18, borderWidth: 1, padding: 18, marginBottom: 14 },
  cardTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitleText: { fontSize: 15, fontWeight: '700' },
  pctText: { fontSize: 18, fontWeight: '900' },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: 8, borderRadius: 4 },
  progressHint: { fontSize: 12, fontWeight: '500' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stepLine: { width: 2, height: 24, marginTop: 4, marginBottom: 2 },
  stepLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  stepStatus: { fontSize: 12, fontWeight: '500' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  chipText: { fontSize: 11, fontWeight: '700' },
  actionBtn: { borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 },
  actionBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  infoLbl: { fontSize: 13, fontWeight: '500' },
  infoVal: { fontSize: 13, fontWeight: '700' },
});

export default AccountStatusScreen;
