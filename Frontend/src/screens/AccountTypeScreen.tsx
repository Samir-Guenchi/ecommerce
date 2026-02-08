import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { profileAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

interface AccountTypeScreenProps {
  goBack?: () => void;
}

// Account Type Icon
const AccountTypeIcon = () => (
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

const AccountTypeScreen = ({ goBack }: AccountTypeScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { message, showSuccess, showError, clear } = useStatusMessage();

  const accountTypes = [
    { id: 'buyer', name: 'Buyer', description: 'Purchase products and services' },
    { id: 'seller', name: 'Seller', description: 'Sell products and manage store' },
    { id: 'both', name: 'Both', description: 'Buy and sell on the platform' },
  ];

  useEffect(() => {
    const loadAccountType = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfile();
        const user = response.user;
        setSelectedType(user.accountType || null);
      } catch (error: any) {
        console.error('Error loading account type:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAccountType();
  }, []);

  const handleSave = async () => {
    if (!selectedType) {
      showError('Please select an account type');
      return;
    }
    
    try {
      setSaving(true);
      const response = await profileAPI.updateProfile({ accountType: selectedType });
      // Update local state with the response
      if (response.user && response.user.accountType) {
        setSelectedType(response.user.accountType);
      }
      showSuccess('Your account type has been updated successfully.');
    } catch (error: any) {
      showError(error.message || 'Failed to update account type.');
      // Reload account type on error to ensure consistency
      try {
        const response = await profileAPI.getProfile();
        setSelectedType(response.user.accountType || null);
      } catch (reloadError) {
        console.error('Error reloading account type:', reloadError);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.text} />
        <Text style={{ marginTop: 12, fontSize: 14, color: COLORS.textSecondary }}>Loading account type...</Text>
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
          <AccountTypeIcon />
        </View>
      </View>
      <BackHeader title="Account Type" onBack={goBack} />
      <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />
      <Text style={styles.subheading}>
        Select your account type. You can change this later if needed.
      </Text>

      <View style={styles.formSection}>
        {accountTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeCard,
              selectedType === type.id && styles.typeCardSelected,
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <View style={styles.typeContent}>
              <Text
                style={[
                  styles.typeName,
                  selectedType === type.id && styles.typeNameSelected,
                ]}
              >
                {type.name}
              </Text>
              <Text
                style={[
                  styles.typeDescription,
                  selectedType === type.id && styles.typeDescriptionSelected,
                ]}
              >
                {type.description}
              </Text>
            </View>
            {selectedType === type.id && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, saving && styles.submitButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={COLORS.background} />
        ) : (
          <Text style={styles.submitButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.infoText}>
        Changing your account type may affect your access to certain features.
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
  typeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  typeContent: {
    flex: 1,
  },
  typeName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  typeNameSelected: {
    color: COLORS.text,
  },
  typeDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  typeDescriptionSelected: {
    color: COLORS.text,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: 'bold',
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

export default AccountTypeScreen;
