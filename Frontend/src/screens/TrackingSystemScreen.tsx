/**
 * TrackingSystemScreen — 2026 Redesign
 * ✦ Full i18n EN/AR/FR — zero hardcoded English strings
 * ✦ RTL layout support
 * ✦ Dynamic dark/light theme
 * ✦ Settings persisted via AsyncStorage
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Switch, ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

interface TrackingSystemScreenProps { goBack?: () => void; }

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
const EyeIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
  </Svg>
);
const MailIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6L12 13L2 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const SmsIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15C21 15.53 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const BellIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 006 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21A2 2 0 0110.27 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ZapIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const AlertIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M22 12H18L15 21L9 3L6 12H2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ══════ MAIN SCREEN ══════ */
const TrackingSystemScreen = ({ goBack }: TrackingSystemScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const { message, showSuccess, showError, clear } = useStatusMessage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enableTracking, setEnableTracking] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [realTime, setRealTime] = useState(true);
  const [statusAlerts, setStatusAlerts] = useState(true);

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language as any) + 1) % langs.length]);
  };

  useEffect(() => {
    AsyncStorage.getItem('trackingPreferences')
      .then(str => {
        if (str) {
          const p = JSON.parse(str);
          setEnableTracking(p.enableTracking !== false);
          setEmailNotif(p.emailNotifications !== false);
          setSmsNotif(p.smsNotifications === true);
          setPushNotif(p.pushNotifications !== false);
          setRealTime(p.realTimeUpdates !== false);
          setStatusAlerts(p.orderStatusAlerts !== false);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await AsyncStorage.setItem('trackingPreferences', JSON.stringify({
        enableTracking,
        emailNotifications: emailNotif,
        smsNotifications: smsNotif,
        pushNotifications: pushNotif,
        realTimeUpdates: realTime,
        orderStatusAlerts: statusAlerts,
      }));
      showSuccess(t('tracking_savedSuccess'));
    } catch (e: any) {
      showError(t('tracking_saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  /* ── Toggle Row ── */
  const ToggleRow = ({
    icon, label, desc, value, onChange, accent,
  }: {
    icon: React.ReactNode;
    label: string;
    desc: string;
    value: boolean;
    onChange: (v: boolean) => void;
    accent: string;
  }) => (
    <View style={[s.toggleRow, isRTL && { flexDirection: 'row-reverse' }]}>
      <View style={[s.toggleIcon, { backgroundColor: accent + '18' }]}>{icon}</View>
      <View style={{ flex: 1, marginHorizontal: 14 }}>
        <Text style={[s.toggleLabel, { color: COLORS.text, textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
        <Text style={[s.toggleDesc, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.border, true: accent + '70' }}
        thumbColor={value ? accent : COLORS.textMuted}
        ios_backgroundColor={COLORS.border}
      />
    </View>
  );

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
      >
        {/* ── Header ── */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <BackHeader title={t('settings_tracking')} onBack={goBack} />
          <View style={[s.controls, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity
              style={[s.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={cycleLanguage}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.text }}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </TouchableOpacity>
          </View>
        </View>

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* ── Hero Card ── */}
        <View style={[
          s.heroCard,
          { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '30' },
          isRTL && { flexDirection: 'row-reverse' },
        ]}>
          <View style={[s.heroIcon, { backgroundColor: COLORS.primary + '20' }]}>
            <EyeIcon color={COLORS.primary} />
          </View>
          <View style={{ marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0, flex: 1 }}>
            <Text style={[s.heroTitle, { color: COLORS.text, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('tracking_heroTitle')}
            </Text>
            <Text style={[s.heroDesc, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('settings_trackingDesc')}
            </Text>
          </View>
        </View>

        {/* ── Master Toggle ── */}
        <View style={[s.card, { backgroundColor: COLORS.surface, borderColor: COLORS.primary + '40' }]}>
          <ToggleRow
            icon={<EyeIcon color={COLORS.primary} />}
            label={t('tracking_enableTracking')}
            desc={t('tracking_enableTrackingDesc')}
            value={enableTracking}
            onChange={setEnableTracking}
            accent={COLORS.primary}
          />
        </View>

        {/* ── Notification Channels ── */}
        <Text style={[s.sectionLabel, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('tracking_notificationChannels')}
        </Text>
        <View style={[s.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <ToggleRow
            icon={<MailIcon color="#0984E3" />}
            label={t('tracking_emailNotif')}
            desc={t('tracking_emailNotifDesc')}
            value={emailNotif}
            onChange={setEmailNotif}
            accent="#0984E3"
          />
          <View style={[s.divider, { backgroundColor: COLORS.border }]} />
          <ToggleRow
            icon={<SmsIcon color="#6C5CE7" />}
            label={t('tracking_smsNotif')}
            desc={t('tracking_smsNotifDesc')}
            value={smsNotif}
            onChange={setSmsNotif}
            accent="#6C5CE7"
          />
          <View style={[s.divider, { backgroundColor: COLORS.border }]} />
          <ToggleRow
            icon={<BellIcon color="#E17055" />}
            label={t('tracking_pushNotif')}
            desc={t('tracking_pushNotifDesc')}
            value={pushNotif}
            onChange={setPushNotif}
            accent="#E17055"
          />
        </View>

        {/* ── Advanced ── */}
        <Text style={[s.sectionLabel, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('tracking_advanced')}
        </Text>
        <View style={[s.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <ToggleRow
            icon={<ZapIcon color="#00B894" />}
            label={t('tracking_realTimeUpdates')}
            desc={t('tracking_realTimeUpdatesDesc')}
            value={realTime}
            onChange={setRealTime}
            accent="#00B894"
          />
          <View style={[s.divider, { backgroundColor: COLORS.border }]} />
          <ToggleRow
            icon={<AlertIcon color="#FDCB6E" />}
            label={t('tracking_orderStatusAlerts')}
            desc={t('tracking_orderStatusAlertsDesc')}
            value={statusAlerts}
            onChange={setStatusAlerts}
            accent="#FDCB6E"
          />
        </View>

        {/* ── Save ── */}
        <TouchableOpacity
          style={[s.saveBtn, { backgroundColor: COLORS.primary, opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={s.saveBtnText}>{t('tracking_savePreferences')}</Text>
          }
        </TouchableOpacity>

        <Text style={[s.footerText, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('tracking_footerNote')}
        </Text>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  controls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  heroCard: { borderRadius: 18, borderWidth: 1, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  heroIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  heroTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  heroDesc: { fontSize: 12, fontWeight: '500' },
  sectionLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  card: { borderRadius: 18, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  toggleIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  toggleLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  toggleDesc: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  divider: { height: 1, marginHorizontal: 16 },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 14 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  footerText: { fontSize: 12, lineHeight: 18 },
});

export default TrackingSystemScreen;
