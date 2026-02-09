import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { getColors, SPACING, SHADOWS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { Logo } from '../components/Logo';

interface WelcomeScreenProps {
  navigate?: (screenId: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigate }) => {
  const { mode } = useTheme();
  const COLORS = getColors(mode);

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: COLORS.background,
    },
    content: { 
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: 'space-between',
      paddingTop: 80,
      paddingBottom: 48,
    },
    
    top: { alignItems: 'center' },
    logoWrap: { marginBottom: 32 },
    
    heading: { 
      fontSize: 32, 
      fontWeight: '700', 
      color: COLORS.text, 
      textAlign: 'center',
      marginBottom: 12,
      letterSpacing: -0.5,
    },
    subheading: { 
      fontSize: 16, 
      color: COLORS.textSecondary, 
      textAlign: 'center',
      lineHeight: 24,
    },
    
    features: { 
      marginTop: 48,
      gap: 16,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: COLORS.primary,
    },
    featureText: {
      fontSize: 15,
      color: COLORS.text,
      fontWeight: '500',
    },
    
    bottom: { gap: 12 },
    btn: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryBtn: {
      backgroundColor: COLORS.primary,
      ...SHADOWS.medium,
    },
    primaryBtnText: { 
      color: '#FFFFFF', 
      fontSize: 16, 
      fontWeight: '600',
    },
    secondaryBtn: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: COLORS.border,
    },
    secondaryBtnText: { 
      color: COLORS.text, 
      fontSize: 16, 
      fontWeight: '600',
    },
    
    footer: { 
      marginTop: 20, 
      alignItems: 'center',
    },
    footerText: { 
      fontSize: 13, 
      color: COLORS.textMuted,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.content}>
        <View style={styles.top}>
          <View style={styles.logoWrap}>
            <Logo variant="full" size={72} />
          </View>
          
          <Text style={styles.heading}>Sell Anywhere in Algeria</Text>
          <Text style={styles.subheading}>
            Create your store, manage orders, and reach customers across all 58 wilayas
          </Text>
          
          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.dot} />
              <Text style={styles.featureText}>Free to start</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.dot} />
              <Text style={styles.featureText}>Nationwide delivery</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.dot} />
              <Text style={styles.featureText}>Secure payments</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.bottom}>
          <TouchableOpacity 
            style={[styles.btn, styles.primaryBtn]} 
            onPress={() => navigate?.('accountType')} 
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.btn, styles.secondaryBtn]} 
            onPress={() => navigate?.('loginSignup')} 
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>Sign In</Text>
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by Algerie Poste</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WelcomeScreen;
