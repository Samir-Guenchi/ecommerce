import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors, SPACING, SHADOWS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Logo } from '../components/Logo';
import { API_URL } from '../config/api.config';

interface AccountTypeSelectorScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
}

const AccountTypeSelectorScreen: React.FC<AccountTypeSelectorScreenProps> = ({ navigate, resetTo }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, language, setLanguage } = useTranslation();
  const [selected, setSelected] = useState<'buyer' | 'seller' | 'delivery'>('seller');
  const [loading, setLoading] = useState(false);

  // Cycle through languages: en → ar → fr → en
  const cycleLanguage = () => {
    const languageOrder: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const currentIndex = languageOrder.indexOf(language);
    const nextIndex = (currentIndex + 1) % languageOrder.length;
    setLanguage(languageOrder[nextIndex]);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { 
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 40,
    },
    
    headerControls: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12,
      marginBottom: 24,
    },
    controlBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
      justifyContent: 'center',
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

  const handleContinue = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken') || await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        Alert.alert(
          t('common_error') || 'Error',
          t('auth_pleaseLogin') || 'Please log in again'
        );
        navigate?.('loginSignup');
        return;
      }

      // Update user's accountType via API
      const response = await fetch(`${API_URL}/users/me/account-type`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accountType: selected }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update account type');
      }

      const data = await response.json();
      
      // Update user in AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));

      // Navigate based on selected type
      if (selected === 'buyer') {
        resetTo?.('buyerDashboard');
      } else if (selected === 'seller') {
        resetTo?.('dashboard'); // Seller dashboard
      } else if (selected === 'delivery') {
        resetTo?.('deliveryDashboard');
      }
    } catch (error: any) {
      console.error('Error updating account type:', error);
      Alert.alert(
        t('common_error') || 'Error',
        error.message || t('accountType_selectionError') || 'Failed to update account type. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Theme & Language Controls */}
      <View style={styles.headerControls}>
        <TouchableOpacity onPress={cycleLanguage} style={styles.controlBtn} activeOpacity={0.7}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
            <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={styles.controlBtn} activeOpacity={0.7}>
          {mode === 'light' ? (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="5" stroke={COLORS.text} strokeWidth="2" />
              <Path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
            </Svg>
          ) : (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.logoWrap}>
        <Logo variant="full" size={64} />
      </View>
      
      <Text style={styles.heading}>{t('accountType_heading')}</Text>
      <Text style={styles.subheading}>
        {t('accountType_subheading')}
      </Text>
      
      <View style={styles.options}>
        <TouchableOpacity
          style={[styles.option, selected === 'seller' && styles.optionActive]}
          onPress={() => setSelected('seller')}
          activeOpacity={0.8}
        >
          <View style={styles.optionTop}>
            <Text style={styles.optionTitle}>{t('accountType_seller')}</Text>
            <View style={[styles.radio, selected === 'seller' && styles.radioActive]}>
              {selected === 'seller' && <View style={styles.radioDot} />}
            </View>
          </View>
          <Text style={styles.optionDesc}>
            {t('accountType_sellerDesc')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.option, selected === 'buyer' && styles.optionActive]}
          onPress={() => setSelected('buyer')}
          activeOpacity={0.8}
        >
          <View style={styles.optionTop}>
            <Text style={styles.optionTitle}>{t('accountType_buyer')}</Text>
            <View style={[styles.radio, selected === 'buyer' && styles.radioActive]}>
              {selected === 'buyer' && <View style={styles.radioDot} />}
            </View>
          </View>
          <Text style={styles.optionDesc}>
            {t('accountType_buyerDesc')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, selected === 'delivery' && styles.optionActive]}
          onPress={() => setSelected('delivery')}
          activeOpacity={0.8}
        >
          <View style={styles.optionTop}>
            <Text style={styles.optionTitle}>{t('accountType_delivery')}</Text>
            <View style={[styles.radio, selected === 'delivery' && styles.radioActive]}>
              {selected === 'delivery' && <View style={styles.radioDot} />}
            </View>
          </View>
          <Text style={styles.optionDesc}>
            {t('accountType_deliveryDesc')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.6 }]}
        onPress={handleContinue}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.btnText}>{t('accountType_continue')}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AccountTypeSelectorScreen;
