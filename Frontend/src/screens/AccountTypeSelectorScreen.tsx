import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { profileAPI } from '../services/api.service';

// Buyer Icon SVG Component
const BuyerIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 11.6211V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V11.6211M7.5 9.75C7.5 10.9926 6.49264 12 5.25 12C4.09397 12 3.14157 11.1282 3.01442 10.0062C2.99524 9.83688 3.02176 9.66657 3.06477 9.50173L4.10996 5.49516C4.3397 4.6145 5.13506 4 6.04519 4H17.9548C18.8649 4 19.6603 4.6145 19.89 5.49516L20.9352 9.50173C20.9782 9.66657 21.0048 9.83688 20.9856 10.0062C20.8584 11.1282 19.906 12 18.75 12C17.5074 12 16.5 10.9926 16.5 9.75M7.5 9.75C7.5 10.9926 8.50736 12 9.75 12C10.9926 12 12 10.9926 12 9.75M7.5 9.75L8 4M12 9.75C12 10.9926 13.0074 12 14.25 12C15.4926 12 16.5 10.9926 16.5 9.75M12 9.75V4M16.5 9.75L16 4"
      stroke="#000000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Seller Icon SVG Component
const SellerIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 15 15" fill="none">
    <Path
      d="M5 3.5C5 2.11929 6.11929 1 7.5 1C8.88071 1 10 2.11929 10 3.5V4H11V3.5C11 1.567 9.433 0 7.5 0C5.567 0 4 1.567 4 3.5V4H5V3.5Z"
      fill="#000000"
    />
    <Path
      d="M1.90432 6.33435C1.98872 5.5747 2.63082 5 3.39514 5H11.6051C12.3694 5 13.0115 5.5747 13.0959 6.33435L13.8737 13.3344C13.9724 14.2229 13.2769 15 12.3828 15H2.61737C1.72335 15 1.02781 14.2229 1.12654 13.3344L1.90432 6.33435Z"
      fill="#000000"
    />
  </Svg>
);

interface AccountTypeSelectorScreenProps {
  navigate?: (screenId: string) => void;
}

const AccountTypeSelectorScreen = ({ navigate }: AccountTypeSelectorScreenProps) => {
  const [selectedType, setSelectedType] = useState<'buyer' | 'seller'>('buyer');
  const [isLoading, setIsLoading] = useState(false);

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
      Alert.alert('Error', 'Failed to update account type. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <View style={styles.logoInner} />
        </View>
      </View>

      {/* Main Heading */}
      <Text style={styles.question}>How will you use our app?</Text>
      <Text style={styles.description}>
        Choose your primary role below. This helps us tailor your experience.
      </Text>

      {/* Account Type Options */}
      <View style={styles.optionsContainer}>
        {/* Buyer Option */}
        <TouchableOpacity
          style={[styles.optionCard, selectedType === 'buyer' && styles.optionCardSelected]}
          onPress={() => setSelectedType('buyer')}
        >
          <View style={styles.radioButtonContainer}>
            {selectedType === 'buyer' && <View style={styles.radioButtonSelected} />}
          </View>
          <View style={styles.optionContent}>
            <View style={styles.iconContainer}>
              <BuyerIcon />
            </View>
            <Text style={styles.optionTitle}>Buyer</Text>
            <Text style={styles.optionDescription}>Browse and buy from stores.</Text>
          </View>
        </TouchableOpacity>

        {/* Seller Option */}
        <TouchableOpacity
          style={[styles.optionCard, selectedType === 'seller' && styles.optionCardSelected]}
          onPress={() => setSelectedType('seller')}
        >
          <View style={styles.radioButtonContainer}>
            {selectedType === 'seller' && <View style={styles.radioButtonSelected} />}
          </View>
          <View style={styles.optionContent}>
            <View style={styles.iconContainer}>
              <SellerIcon />
            </View>
            <Text style={styles.optionTitle}>Seller</Text>
            <Text style={styles.optionDescription}>Open a store and sell items.</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <TouchableOpacity 
        style={[styles.continueButton, isLoading && styles.continueButtonDisabled]} 
        onPress={handleContinue}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
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
    backgroundColor: '#F5F5F5',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
    backgroundColor: '#000000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
    marginBottom: 16,
  },
  logoInner: {
    width: 30,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
  question: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 18,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  optionCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  optionCardSelected: {
    borderColor: '#333',
    borderWidth: 2,
  },
  radioButtonContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  optionContent: {
    alignItems: 'center',
    paddingTop: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
  },
  continueButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default AccountTypeSelectorScreen;