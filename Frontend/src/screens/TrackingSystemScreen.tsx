import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

interface TrackingSystemScreenProps {
  goBack?: () => void;
}

const EyeIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BellIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 006 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={COLORS.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21A2 2 0 0110.27 21" stroke={COLORS.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrackingSystemScreen = ({ goBack }: TrackingSystemScreenProps) => {
  const { message, showSuccess, showError, clear } = useStatusMessage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enableTracking, setEnableTracking] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [orderStatusAlerts, setOrderStatusAlerts] = useState(true);

  useEffect(() => { loadPrefs(); }, []);

  const loadPrefs = async () => {
    try {
      setLoading(true);
      const str = await AsyncStorage.getItem('trackingPreferences');
      if (str) {
        const p = JSON.parse(str);
        setEnableTracking(p.enableTracking !== false);
        setEmailNotifications(p.emailNotifications !== false);
        setSmsNotifications(p.smsNotifications === true);
        setPushNotifications(p.pushNotifications !== false);
        setRealTimeUpdates(p.realTimeUpdates !== false);
        setOrderStatusAlerts(p.orderStatusAlerts !== false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await AsyncStorage.setItem('trackingPreferences', JSON.stringify({
        enableTracking, emailNotifications, smsNotifications,
        pushNotifications, realTimeUpdates, orderStatusAlerts,
      }));
      showSuccess('Tracking preferences saved successfully.');
    } catch (e: any) {
      showError(e.message || 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  const ToggleRow = ({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) => (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
        thumbColor={value ? COLORS.primary : COLORS.textMuted}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackHeader title="Tracking System" onBack={goBack} />
        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}><EyeIcon /></View>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerSub}>Configure how you and your customers track orders and receive updates.</Text>
        </View>

        {/* Master Toggle */}
        <View style={styles.masterCard}>
          <ToggleRow label="Enable Tracking" desc="Allow the system to track orders and shipments" value={enableTracking} onChange={setEnableTracking} />
        </View>

        {/* Notification Settings */}
        <Text style={styles.sectionTitle}>Notification Channels</Text>
        <View style={styles.settingsCard}>
          <ToggleRow label="Email Notifications" desc="Receive tracking updates via email" value={emailNotifications} onChange={setEmailNotifications} />
          <View style={styles.divider} />
          <ToggleRow label="SMS Notifications" desc="Receive tracking updates via SMS" value={smsNotifications} onChange={setSmsNotifications} />
          <View style={styles.divider} />
          <ToggleRow label="Push Notifications" desc="Receive push notifications on your device" value={pushNotifications} onChange={setPushNotifications} />
        </View>

        {/* Advanced */}
        <Text style={styles.sectionTitle}>Advanced</Text>
        <View style={styles.settingsCard}>
          <ToggleRow label="Real-time Updates" desc="Show live tracking updates as they happen" value={realTimeUpdates} onChange={setRealTimeUpdates} />
          <View style={styles.divider} />
          <ToggleRow label="Order Status Alerts" desc="Get notified on every order status change" value={orderStatusAlerts} onChange={setOrderStatusAlerts} />
        </View>

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.background} /> : <Text style={styles.saveBtnText}>Save Preferences</Text>}
        </TouchableOpacity>

        <Text style={styles.footerText}>You can change these settings at any time. Notifications will be sent based on your preferences.</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },
  content: { paddingHorizontal: SPACING.md, paddingBottom: 40, paddingTop: 48 },
  headerCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: SPACING.lg },
  headerIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  headerSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18 },
  masterCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, borderWidth: 2, borderColor: COLORS.primary + '30', marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase' as any, letterSpacing: 0.8, marginBottom: 10 },
  settingsCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: SPACING.lg },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  toggleDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 16 },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 14 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: SPACING.md },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  footerText: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 16 },
});

export default TrackingSystemScreen;
