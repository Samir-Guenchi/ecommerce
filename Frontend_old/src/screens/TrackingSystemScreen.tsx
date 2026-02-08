import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tracking Icon
const TrackingIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TrackingSystemScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enableTracking, setEnableTracking] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    loadTrackingPreferences();
  }, []);

  const loadTrackingPreferences = async () => {
    try {
      setLoading(true);
      const preferencesStr = await AsyncStorage.getItem('trackingPreferences');
      if (preferencesStr) {
        const preferences = JSON.parse(preferencesStr);
        setEnableTracking(preferences.enableTracking !== false);
        setEmailNotifications(preferences.emailNotifications !== false);
        setSmsNotifications(preferences.smsNotifications === true);
        setPushNotifications(preferences.pushNotifications !== false);
      }
    } catch (error: any) {
      console.error('Error loading tracking preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const preferences = {
        enableTracking,
        emailNotifications,
        smsNotifications,
        pushNotifications,
      };
      await AsyncStorage.setItem('trackingPreferences', JSON.stringify(preferences));
      Alert.alert('Success', 'Your tracking preferences have been saved.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save tracking preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={{ marginTop: 12, fontSize: 14, color: '#666' }}>Loading preferences...</Text>
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
          <TrackingIcon />
        </View>
      </View>
      <Text style={styles.heading}>Tracking System</Text>
      <Text style={styles.subheading}>
        Configure your tracking system preferences and settings.
      </Text>

      <View style={styles.formSection}>
        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Enable Tracking</Text>
            <Text style={styles.settingDescription}>
              Allow the system to track your orders and shipments
            </Text>
          </View>
          <Switch
            value={enableTracking}
            onValueChange={setEnableTracking}
            trackColor={{ false: '#E0E0E0', true: '#000000' }}
            thumbColor={enableTracking ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive tracking updates via email
            </Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: '#E0E0E0', true: '#000000' }}
            thumbColor={emailNotifications ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>SMS Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive tracking updates via SMS
            </Text>
          </View>
          <Switch
            value={smsNotifications}
            onValueChange={setSmsNotifications}
            trackColor={{ false: '#E0E0E0', true: '#000000' }}
            thumbColor={smsNotifications ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive tracking updates via push notifications
            </Text>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: '#E0E0E0', true: '#000000' }}
            thumbColor={pushNotifications ? '#FFFFFF' : '#F4F3F4'}
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
          <Text style={styles.submitButtonText}>Save Preferences</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.infoText}>
        You can change these settings at any time. Notifications will be sent based on your preferences.
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
    marginBottom: 12,
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

export default TrackingSystemScreen;
