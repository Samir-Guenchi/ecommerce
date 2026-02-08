import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { Logo } from '../components/Logo';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
}

const WelcomeScreen = ({ navigate }: WelcomeScreenProps) => {
  const { mode } = useTheme();
  const COLORS = getColors(mode);
  
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    // Logo animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(splashOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(contentFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleNavigation = (mode: 'login' | 'signup') => {
    Animated.timing(screenFade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      navigate?.('loginSignup', { initialMode: mode });
    });
  };

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -15] });

  return (
    <Animated.View style={[styles.container, { opacity: screenFade, backgroundColor: COLORS.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      {/* Gradient background */}
      <LinearGradient
        colors={mode === 'dark' 
          ? [COLORS.background, '#0D1420', COLORS.background]
          : ['#EFF6FF', '#DBEAFE', '#EFF6FF']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Splash Screen */}
      <Animated.View style={[styles.splashContainer, { opacity: splashOpacity, zIndex: splashOpacity.interpolate({ inputRange: [0, 0.1, 1], outputRange: [-1, 100, 100] }) }]}>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <Logo size={140} variant="full" />
        </Animated.View>
      </Animated.View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: contentFade }}>

          {/* Logo */}
          <Animated.View style={[styles.logoSection, { transform: [{ translateY: floatY }] }]}>
            <Logo size={110} variant="full" />
          </Animated.View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, { color: COLORS.text }]}>
              Your Gateway to{'\n'}Algeria's Marketplace
            </Text>
            <Text style={[styles.heroSubtitle, { color: COLORS.textSecondary }]}>
              Build, sell, and grow your business with Algeria's most trusted e-commerce platform
            </Text>
          </View>

          {/* Feature Cards */}
          <View style={styles.featuresSection}>
            <View style={[styles.featureCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M2 17L12 22L22 17" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M2 12L12 17L22 12" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={[styles.featureTitle, { color: COLORS.text }]}>Nationwide Delivery</Text>
              <Text style={[styles.featureDesc, { color: COLORS.textMuted }]}>Reach customers across all 58 wilayas with reliable shipping</Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: COLORS.secondary + '15' }]}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke={COLORS.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M9 12L11 14L15 10" stroke={COLORS.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={[styles.featureTitle, { color: COLORS.text }]}>Secure Payments</Text>
              <Text style={[styles.featureDesc, { color: COLORS.textMuted }]}>Bank-level encryption and trusted payment methods</Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <Path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3Z" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M2 9H22" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M7 15H7.01" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M11 15H13" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={[styles.featureTitle, { color: COLORS.text }]}>Easy Setup</Text>
              <Text style={[styles.featureDesc, { color: COLORS.textMuted }]}>Launch your store in minutes with our intuitive tools</Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleNavigation('signup')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: COLORS.borderLight, backgroundColor: COLORS.surface }]}
              onPress={() => handleNavigation('login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, { color: COLORS.text }]}>Sign In</Text>
            </TouchableOpacity>

            <Text style={[styles.termsText, { color: COLORS.textMuted }]}>
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </View>

        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  splashContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48, paddingTop: 60 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  heroSection: { alignItems: 'center', marginBottom: 40 },
  heroTitle: { fontSize: 34, fontWeight: '800', textAlign: 'center', lineHeight: 42, marginBottom: 16, letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 16, fontWeight: '500', textAlign: 'center', lineHeight: 24, paddingHorizontal: 8 },
  featuresSection: { gap: 16, marginBottom: 40 },
  featureCard: { borderRadius: 20, padding: 24, borderWidth: 1 },
  featureIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  featureTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  featureDesc: { fontSize: 14, lineHeight: 21 },
  ctaSection: { gap: 14 },
  primaryButton: { borderRadius: 16, overflow: 'hidden' },
  buttonGradient: { flexDirection: 'row', paddingVertical: 18, alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
  secondaryButton: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', borderWidth: 2 },
  secondaryButtonText: { fontSize: 17, fontWeight: '600' },
  termsText: { fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});

export default WelcomeScreen;
