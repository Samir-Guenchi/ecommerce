import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { getColors, SPACING, SHADOWS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Logo } from '../components/Logo';

interface WelcomeScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigate }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, language, setLanguage } = useTranslation();

  console.log('WelcomeScreen rendered, navigate function:', typeof navigate, navigate);

  const cycleLanguage = () => {
    const languageOrder: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const currentIndex = languageOrder.indexOf(language);
    const nextIndex = (currentIndex + 1) % languageOrder.length;
    setLanguage(languageOrder[nextIndex]);
  };

  const handleGetStarted = () => {
    console.log('🔵 Get Started button clicked - going to SIGNUP');
    if (navigate) {
      navigate('loginSignup', { initialMode: 'signup' });
      console.log('🔵 navigate called with signup mode');
    } else {
      console.error('❌ navigate function is undefined!');
    }
  };

  const handleSignIn = () => {
    console.log('🟢 Sign In button clicked - going to LOGIN');
    if (navigate) {
      navigate('loginSignup', { initialMode: 'login' });
      console.log('🟢 navigate called with login mode');
    } else {
      console.error('❌ navigate function is undefined!');
    }
  };

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: COLORS.background,
    },
    headerControls: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 24,
      paddingTop: 16,
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
    content: { 
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: 'space-between',
      paddingTop: 32,
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
      
      <View style={styles.content}>
        <View style={styles.top}>
          <View style={styles.logoWrap}>
            <Logo variant="full" size={72} />
          </View>
          
          <Text style={styles.heading}>{t('welcome_heading')}</Text>
          <Text style={styles.subheading}>
            {t('welcome_subheading')}
          </Text>
          
          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.dot} />
              <Text style={styles.featureText}>{t('welcome_feature1')}</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.dot} />
              <Text style={styles.featureText}>{t('welcome_feature2')}</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.dot} />
              <Text style={styles.featureText}>{t('welcome_feature3')}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.bottom}>
          <TouchableOpacity 
            style={[styles.btn, styles.primaryBtn]} 
            onPress={handleGetStarted} 
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>{t('welcome_getStarted')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.btn, styles.secondaryBtn]} 
            onPress={handleSignIn} 
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>{t('welcome_signIn')}</Text>
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('welcome_poweredBy')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WelcomeScreen;
