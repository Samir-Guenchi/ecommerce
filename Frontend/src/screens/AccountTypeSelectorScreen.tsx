import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { getColors, SPACING, SHADOWS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { Logo } from '../components/Logo';

interface AccountTypeSelectorScreenProps {
  navigate?: (screenId: string) => void;
}

const AccountTypeSelectorScreen: React.FC<AccountTypeSelectorScreenProps> = ({ navigate }) => {
  const { mode } = useTheme();
  const COLORS = getColors(mode);
  const [selected, setSelected] = useState<'buyer' | 'seller'>('seller');

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { 
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
    },
    
    logoWrap: { alignItems: 'center', marginBottom: 40 },
    
    heading: { 
      fontSize: 28, 
      fontWeight: '700', 
      color: COLORS.text, 
      marginBottom: 8,
    },
    subheading: { 
      fontSize: 15, 
      color: COLORS.textSecondary, 
      marginBottom: 40,
    },
    
    options: { gap: 16, marginBottom: 32 },
    
    option: {
      backgroundColor: COLORS.surface,
      borderWidth: 2,
      borderColor: COLORS.border,
      borderRadius: 16,
      padding: 20,
    },
    optionActive: {
      borderColor: COLORS.primary,
      backgroundColor: COLORS.primary + '08',
    },
    
    optionTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    optionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.text,
    },
    radio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: COLORS.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioActive: {
      borderColor: COLORS.primary,
    },
    radioDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: COLORS.primary,
    },
    
    optionDesc: {
      fontSize: 14,
      color: COLORS.textSecondary,
      lineHeight: 20,
    },
    
    btn: {
      backgroundColor: COLORS.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      ...SHADOWS.medium,
    },
    btnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const handleContinue = () => {
    // Navigate to signup with the selected account type
    navigate?.('loginSignup');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoWrap}>
        <Logo variant="full" size={64} />
      </View>
      
      <Text style={styles.heading}>What brings you here?</Text>
      <Text style={styles.subheading}>
        Choose your primary goal to get started
      </Text>
      
      <View style={styles.options}>
        <TouchableOpacity
          style={[styles.option, selected === 'seller' && styles.optionActive]}
          onPress={() => setSelected('seller')}
          activeOpacity={0.8}
        >
          <View style={styles.optionTop}>
            <Text style={styles.optionTitle}>I want to sell</Text>
            <View style={[styles.radio, selected === 'seller' && styles.radioActive]}>
              {selected === 'seller' && <View style={styles.radioDot} />}
            </View>
          </View>
          <Text style={styles.optionDesc}>
            Create your store and start selling products across Algeria
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.option, selected === 'buyer' && styles.optionActive]}
          onPress={() => setSelected('buyer')}
          activeOpacity={0.8}
        >
          <View style={styles.optionTop}>
            <Text style={styles.optionTitle}>I want to buy</Text>
            <View style={[styles.radio, selected === 'buyer' && styles.radioActive]}>
              {selected === 'buyer' && <View style={styles.radioDot} />}
            </View>
          </View>
          <Text style={styles.optionDesc}>
            Browse and shop from stores across Algeria
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.btn}
        onPress={handleContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AccountTypeSelectorScreen;
