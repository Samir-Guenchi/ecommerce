import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { deliveryAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

interface DeliveryScreenProps {
  goBack?: () => void;
}

const TruckIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M16 3H1V16H16V3Z" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 8H20L23 11V16H16V8Z" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5.5 21C6.88071 21 8 19.8807 8 18.5C8 17.1193 6.88071 16 5.5 16C4.11929 16 3 17.1193 3 18.5C3 19.8807 4.11929 21 5.5 21Z" stroke={COLORS.primary} strokeWidth="1.5" />
    <Path d="M18.5 21C19.8807 21 21 19.8807 21 18.5C21 17.1193 19.8807 16 18.5 16C17.1193 16 16 17.1193 16 18.5C16 19.8807 17.1193 21 18.5 21Z" stroke={COLORS.primary} strokeWidth="1.5" />
  </Svg>
);

const DeliveryScreen = ({ goBack }: DeliveryScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const { message, showSuccess, showError, clear } = useStatusMessage();

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await deliveryAPI.getDeliverySettings();
      const s = response.deliverySetting;
      setDeliveryFee(s.shippingCost?.toString() || '');
      setFreeDeliveryThreshold(s.freeShippingThreshold?.toString() || '');
      setEstimatedDays(s.estimatedDays?.toString() || '');
      setDeliveryEnabled(s.shippingCost > 0 || s.freeShippingThreshold !== null);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!deliveryFee && deliveryEnabled) { showError('Please enter a delivery fee.'); return; }
    try {
      setSaving(true);
      await deliveryAPI.updateDeliverySettings({
        shippingCost: parseFloat(deliveryFee) || 0,
        freeShippingThreshold: freeDeliveryThreshold ? parseFloat(freeDeliveryThreshold) : null,
        defaultShippingMethod: deliveryEnabled ? 'standard' : null,
        estimatedDays: estimatedDays ? parseInt(estimatedDays, 10) : null,
      });
      showSuccess('Delivery settings saved successfully.');
    } catch (e: any) {
      showError(e.message || 'Failed to save delivery settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading delivery settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackHeader title="Delivery" onBack={goBack} />
        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}><TruckIcon /></View>
          <Text style={styles.headerTitle}>Delivery Settings</Text>
          <Text style={styles.headerSub}>Configure delivery fees and options for your customers.</Text>
        </View>

        {/* Master Toggle */}
        <View style={styles.masterCard}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.toggleLabel}>Enable Delivery</Text>
              <Text style={styles.toggleDesc}>Allow customers to choose delivery for their orders</Text>
            </View>
            <Switch
              value={deliveryEnabled}
              onValueChange={setDeliveryEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
              thumbColor={deliveryEnabled ? COLORS.primary : COLORS.textMuted}
            />
          </View>
        </View>

        {/* Fee Settings */}
        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.settingsCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Delivery Fee (DZD)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
              value={deliveryFee}
              onChangeText={setDeliveryFee}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Free Delivery Threshold (DZD)</Text>
            <Text style={styles.inputHint}>Orders above this amount get free delivery</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5000"
              placeholderTextColor={COLORS.textMuted}
              value={freeDeliveryThreshold}
              onChangeText={setFreeDeliveryThreshold}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Time Settings */}
        <Text style={styles.sectionTitle}>Timing</Text>
        <View style={styles.settingsCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Estimated Delivery Days</Text>
            <Text style={styles.inputHint}>Shown to customers at checkout</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3"
              placeholderTextColor={COLORS.textMuted}
              value={estimatedDays}
              onChangeText={setEstimatedDays}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Preview */}
        {deliveryEnabled && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Customer Preview</Text>
            <Text style={styles.previewLine}>
              Delivery Fee: {deliveryFee ? `${deliveryFee} DZD` : 'Free'}
            </Text>
            {freeDeliveryThreshold ? (
              <Text style={styles.previewLine}>
                Free delivery on orders over {freeDeliveryThreshold} DZD
              </Text>
            ) : null}
            {estimatedDays ? (
              <Text style={styles.previewLine}>
                Estimated delivery: {estimatedDays} day{parseInt(estimatedDays) !== 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
        )}

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.background} /> : <Text style={styles.saveBtnText}>Save Settings</Text>}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Delivery settings apply to all orders. Customers will see these options at checkout.
        </Text>
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
  masterCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, borderWidth: 2, borderColor: COLORS.primary + '30', marginBottom: SPACING.lg },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  toggleDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase' as any, letterSpacing: 0.8, marginBottom: 10 },
  settingsCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: SPACING.lg },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  inputHint: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.text },
  previewCard: { backgroundColor: COLORS.primary + '10', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.primary + '30', marginBottom: SPACING.lg },
  previewTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginBottom: 8 },
  previewLine: { fontSize: 13, color: COLORS.text, lineHeight: 20 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: SPACING.md },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  footerText: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 16 },
});

export default DeliveryScreen;
