import React, { useState } from 'react';
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
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

// Buyer Icon SVG Component
const BuyerIcon = ({ active }: { active?: boolean }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 11.6211V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V11.6211M7.5 9.75C7.5 10.9926 6.49264 12 5.25 12C4.09397 12 3.14157 11.1282 3.01442 10.0062C2.99524 9.83688 3.02176 9.66657 3.06477 9.50173L4.10996 5.49516C4.3397 4.6145 5.13506 4 6.04519 4H17.9548C18.8649 4 19.6603 4.6145 19.89 5.49516L20.9352 9.50173C20.9782 9.66657 21.0048 9.83688 20.9856 10.0062C20.8584 11.1282 19.906 12 18.75 12C17.5074 12 16.5 10.9926 16.5 9.75M7.5 9.75C7.5 10.9926 8.50736 12 9.75 12C10.9926 12 12 10.9926 12 9.75M7.5 9.75L8 4M12 9.75C12 10.9926 13.0074 12 14.25 12C15.4926 12 16.5 10.9926 16.5 9.75M12 9.75V4M16.5 9.75L16 4"
      stroke={active ? COLORS.primary : COLORS.textSecondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Seller Icon SVG Component
const SellerIcon = ({ active }: { active?: boolean }) => (
  <Svg width={28} height={28} viewBox="0 0 15 15" fill="none">
    <Path
      d="M5 3.5C5 2.11929 6.11929 1 7.5 1C8.88071 1 10 2.11929 10 3.5V4H11V3.5C11 1.567 9.433 0 7.5 0C5.567 0 4 1.567 4 3.5V4H5V3.5Z"
      fill={active ? COLORS.primary : COLORS.textSecondary}
    />
    <Path
      d="M1.90432 6.33435C1.98872 5.5747 2.63082 5 3.39514 5H11.6051C12.3694 5 13.0115 5.5747 13.0959 6.33435L13.8737 13.3344C13.9724 14.2229 13.2769 15 12.3828 15H2.61737C1.72335 15 1.02781 14.2229 1.12654 13.3344L1.90432 6.33435Z"
      fill={active ? COLORS.primary : COLORS.textSecondary}
    />
  </Svg>
);

interface AccountTypeSelectorScreenProps {
  navigate?: (screenId: string) => void;
}

const AccountTypeSelectorScreen = ({ navigate }: AccountTypeSelectorScreenProps) => {
  const [selectedType, setSelectedType] = useState<'buyer' | 'seller'>('buyer');
  const [isLoading, setIsLoading] = useState(false);
  const { message, showSuccess, showError, showInfo, clear } = useStatusMessage();

  const handleContinue = async () => {
    if (!navigate) return;

    setIsLoading(true);
    try {
      // Update account type in backend
      await profileAPI.updateProfile({ accountType: selectedType });

      // Navigate based on selection
      if (selectedType === 'seller') {
        navigate('sellerRegistration');
      } else {
        navigate('dashboard');
      }
    } catch (error) {
      showError('Failed to update account type. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isBuyer = selectedType === 'buyer';
  const isSeller = selectedType === 'seller';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Decorative Logo */}
      <View style={styles.logoContainer} accessibilityElementsHidden>
        <View style={styles.logo}>
          <View style={styles.logoInner} />
        </View>
      </View>

      {/* Heading */}
      <Text style={styles.question} accessibilityRole="header">
        How will you use our app?
      </Text>
      <Text style={styles.description}>
        Choose your primary role below. This helps us tailor your experience.
      </Text>
      <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

      {/* Account Type Options */}
      <View style={styles.optionsContainer} accessibilityRole="radiogroup">
        {/* Buyer Option */}
        <TouchableOpacity
          style={[styles.optionCard, isBuyer && styles.optionCardSelected]}
          onPress={() => setSelectedType('buyer')}
          accessibilityRole="radio"
          accessibilityState={{ checked: isBuyer }}
          accessibilityLabel="Buyer — Browse and buy from stores"
          activeOpacity={0.7}
        >
          <View style={[
            styles.radioButtonContainer,
            isBuyer && styles.radioButtonContainerSelected,
          ]}>
            {isBuyer && <View style={styles.radioButtonSelected} />}
          </View>
          <View style={styles.optionContent}>
            <View style={[styles.iconContainer, isBuyer && styles.iconContainerSelected]}>
              <BuyerIcon active={isBuyer} />
            </View>
            <Text style={[styles.optionTitle, isBuyer && styles.optionTitleSelected]}>Buyer</Text>
            <Text style={styles.optionDescription}>Browse and buy from stores.</Text>
          </View>
        </TouchableOpacity>

        {/* Seller Option */}
        <TouchableOpacity
          style={[styles.optionCard, isSeller && styles.optionCardSelected]}
          onPress={() => setSelectedType('seller')}
          accessibilityRole="radio"
          accessibilityState={{ checked: isSeller }}
          accessibilityLabel="Seller — Open a store and sell items"
          activeOpacity={0.7}
        >
          <View style={[
            styles.radioButtonContainer,
            isSeller && styles.radioButtonContainerSelected,
          ]}>
            {isSeller && <View style={styles.radioButtonSelected} />}
          </View>
          <View style={styles.optionContent}>
            <View style={[styles.iconContainer, isSeller && styles.iconContainerSelected]}>
              <SellerIcon active={isSeller} />
            </View>
            <Text style={[styles.optionTitle, isSeller && styles.optionTitleSelected]}>Seller</Text>
            <Text style={styles.optionDescription}>Open a store and sell items.</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
        onPress={handleContinue}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel={`Continue as ${selectedType}`}
        accessibilityState={{ disabled: isLoading }}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.background} />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
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
    justifyContent: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
    paddingTop: 72,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logo: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
    marginBottom: SPACING.md,
  },
  logoInner: {
    width: 26,
    height: 26,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
  question: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  optionCard: {
    flex: 1,
    borderRadius: 14,
    padding: SPACING.lg,
    position: 'relative',
    backgroundColor: COLORS.surface,
    minHeight: 160,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primary + '0F',
  },
  radioButtonContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonContainerSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  optionContent: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainerSelected: {
    backgroundColor: COLORS.primaryMuted,
  },
  optionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: COLORS.primary,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: COLORS.background,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
});

export default AccountTypeSelectorScreen;