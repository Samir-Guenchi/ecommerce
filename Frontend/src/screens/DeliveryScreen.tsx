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
import { deliveryAPI } from '../services/api.service';

// Delivery Icon
const DeliveryIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 3H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 21C21.1046 21 22 20.1046 22 19C22 17.8954 21.1046 17 20 17C18.8954 17 18 17.8954 18 19C18 20.1046 18.8954 21 20 21Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DeliveryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');

  useEffect(() => {
    loadDeliverySettings();
  }, []);

  const loadDeliverySettings = async () => {
    try {
      setLoading(true);
      const response = await deliveryAPI.getDeliverySettings();
      const settings = response.deliverySetting;
      setDeliveryFee(settings.shippingCost?.toString() || '');
      setFreeDeliveryThreshold(settings.freeShippingThreshold?.toString() || '');
      setDeliveryEnabled(settings.shippingCost > 0 || settings.freeShippingThreshold !== null);
    } catch (error: any) {
      console.error('Error loading delivery settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!deliveryFee) {
      Alert.alert('Error', 'Please enter delivery fee');
      return;
    }
    
    try {
      setSaving(true);
      await deliveryAPI.updateDeliverySettings({
        shippingCost: parseFloat(deliveryFee) || 0,
        freeShippingThreshold: freeDeliveryThreshold ? parseFloat(freeDeliveryThreshold) : null,
        defaultShippingMethod: deliveryEnabled ? 'standard' : null,
      });
      Alert.alert('Success', 'Your delivery settings have been saved.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save delivery settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={{ marginTop: 12, fontSize: 14, color: '#666' }}>Loading delivery settings...</Text>
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
          <DeliveryIcon />
        </View>
      </View>
      <Text style={styles.heading}>Delivery</Text>
      <Text style={styles.subheading}>
        Configure delivery settings and preferences.
      </Text>

      <View style={styles.formSection}>
        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Enable Delivery</Text>
            <Text style={styles.settingDescription}>
              Allow customers to choose delivery for their orders
            </Text>
          </View>
          <Switch
            value={deliveryEnabled}
            onValueChange={setDeliveryEnabled}
            trackColor={{ false: '#E0E0E0', true: '#000000' }}
            thumbColor={deliveryEnabled ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Delivery Fee</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter delivery fee"
            placeholderTextColor="#999"
            value={deliveryFee}
            onChangeText={setDeliveryFee}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Free Delivery Threshold</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter minimum order amount for free delivery"
            placeholderTextColor="#999"
            value={freeDeliveryThreshold}
            onChangeText={setFreeDeliveryThreshold}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Estimated Delivery Days</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter estimated delivery time in days"
            placeholderTextColor="#999"
            value={estimatedDays}
            onChangeText={setEstimatedDays}
            keyboardType="numeric"
          />
        </View>
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
        Delivery settings will apply to all orders. Customers will see these options at checkout.
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
  infoText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default DeliveryScreen;
