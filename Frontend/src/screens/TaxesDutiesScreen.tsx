import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { taxAPI } from '../services/api.service';

// Tax Icon
const TaxIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 17L12 22L22 17"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 12L12 17L22 12"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TaxesDutiesScreen = () => {
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
      Alert.alert('Error', 'Please enter tax rate');
      return;
    }
    if (dutiesEnabled && !dutiesRate) {
      Alert.alert('Error', 'Please enter duties rate');
      return;
    }
    
    try {
      setSaving(true);
      await taxAPI.updateTaxSettings({
        taxRate: taxEnabled ? (parseFloat(taxRate) || 0) : 0,
        dutyRate: dutiesEnabled ? (parseFloat(dutiesRate) || 0) : 0,
      });
      Alert.alert('Success', 'Your tax and duties settings have been saved.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save tax settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={{ marginTop: 12, fontSize: 14, color: '#666' }}>Loading tax settings...</Text>
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
      <Text style={styles.heading}>Taxes & Duties</Text>
      <Text style={styles.subheading}>
        Manage tax settings and duty configurations.
      </Text>

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
            trackColor={{ false: '#E0E0E0', true: '#000000' }}
            thumbColor={taxEnabled ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        {taxEnabled && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tax Rate (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter tax rate percentage"
              placeholderTextColor="#999"
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
            trackColor={{ false: '#E0E0E0', true: '#000000' }}
            thumbColor={dutiesEnabled ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        {dutiesEnabled && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Duties Rate (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter duties rate percentage"
              placeholderTextColor="#999"
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
          <ActivityIndicator color="#FFFFFF" />
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
    backgroundColor: '#F5F5F5',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 35,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 13,
    color: '#666',
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
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    marginBottom: 8,
  },
  settingRow: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    color: '#000000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    color: '#000000',
  },
  submitButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default TaxesDutiesScreen;
