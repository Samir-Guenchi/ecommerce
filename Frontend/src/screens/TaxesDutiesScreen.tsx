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
import { taxAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

interface TaxesDutiesScreenProps {
  goBack?: () => void;
}

// Tax Icon
const TaxIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke={COLORS.textSecondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 17L12 22L22 17"
      stroke={COLORS.textSecondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 12L12 17L22 12"
      stroke={COLORS.textSecondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TaxesDutiesScreen = ({ goBack }: TaxesDutiesScreenProps) => {
  const { message, showSuccess, showError, clear } = useStatusMessage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState('');
  const [dutiesEnabled, setDutiesEnabled] = useState(false);
  const [dutiesRate, setDutiesRate] = useState('');

  useEffect(() => {
    loadTaxSettings();
  }, []);

  const loadTaxSettings = async () => {
    try {
      setLoading(true);
      const response = await taxAPI.getTaxSettings();
      const settings = response.taxSetting;
      setTaxRate(settings.taxRate?.toString() || '');
      setDutiesRate(settings.dutyRate?.toString() || '');
      setTaxEnabled(settings.taxRate > 0);
      setDutiesEnabled(settings.dutyRate > 0);
    } catch (error: any) {
      console.error('Error loading tax settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (taxEnabled && !taxRate) {
      showError('Please enter tax rate');
      return;
    }
    if (dutiesEnabled && !dutiesRate) {
      showError('Please enter duties rate');
      return;
    }
    
    try {
      setSaving(true);
      await taxAPI.updateTaxSettings({
        taxRate: taxEnabled ? (parseFloat(taxRate) || 0) : 0,
        dutyRate: dutiesEnabled ? (parseFloat(dutiesRate) || 0) : 0,
      });
      showSuccess('Your tax and duties settings have been saved.');
    } catch (error: any) {
      showError(error.message || 'Failed to save tax settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.text} />
        <Text style={{ marginTop: 12, fontSize: 14, color: COLORS.textSecondary }}>Loading tax settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <TaxIcon />
        </View>
      </View>
      <BackHeader title="Taxes & Duties" onBack={goBack} />
      <Text style={styles.subheading}>
        Manage tax settings and duty configurations.
      </Text>

      <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

      <View style={styles.formSection}>
        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Enable Taxes</Text>
            <Text style={styles.settingDescription}>
              Apply taxes to orders based on your location
            </Text>
          </View>
          <Switch
            value={taxEnabled}
            onValueChange={setTaxEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={taxEnabled ? COLORS.primary : COLORS.border}
          />
        </View>

        {taxEnabled && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tax Rate (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter tax rate percentage"
              placeholderTextColor={COLORS.textMuted}
              value={taxRate}
              onChangeText={setTaxRate}
              keyboardType="decimal-pad"
            />
          </View>
        )}

        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Enable Duties</Text>
            <Text style={styles.settingDescription}>
              Apply customs duties for international orders
            </Text>
          </View>
          <Switch
            value={dutiesEnabled}
            onValueChange={setDutiesEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={dutiesEnabled ? COLORS.primary : COLORS.border}
          />
        </View>

        {dutiesEnabled && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Duties Rate (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter duties rate percentage"
              placeholderTextColor={COLORS.textMuted}
              value={dutiesRate}
              onChangeText={setDutiesRate}
              keyboardType="decimal-pad"
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, saving && styles.submitButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={COLORS.background} />
        ) : (
          <Text style={styles.submitButtonText}>Save Settings</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.infoText}>
        Tax and duties will be automatically calculated and added to order totals at checkout.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 35,
  },
  subheading: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    marginBottom: 8,
  },
  settingRow: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  infoText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default TaxesDutiesScreen;
