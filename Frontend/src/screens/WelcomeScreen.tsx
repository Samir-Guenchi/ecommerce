import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import { Logo } from '../components/Logo';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
}

const WelcomeScreen = ({ navigate }: WelcomeScreenProps) => {
  const [showContent, setShowContent] = useState(false);
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;
  
  // Professional subtle animations
  const float = useRef(new Animated.Value(0)).current;
  const statsCount = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

    // Logo animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowContent(true);
      // Animate stats counter
      Animated.timing(statsCount, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start();
    });
  }, []);

  const logoAnimatedStyle = {
    opacity: logoOpacity,
    transform: [{ scale: logoScale }],
  };

  const splashAnimatedStyle = {
    opacity: splashOpacity,
    zIndex: splashOpacity.interpolate({
      inputRange: [0, 0.1, 1],
      outputRange: [-1, 100, 100],
    }),
  };

  const contentAnimatedStyle = {
    opacity: contentFade,
  };

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  const handleNavigation = (mode: 'login' | 'signup') => {
    Animated.timing(screenFade, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigate?.('loginSignup', { initialMode: mode });
    });
  };

  // Animated user count
  const userCount = statsCount.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenFade }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Professional gradient background */}
      <LinearGradient
        colors={[COLORS.background, '#0D1420', COLORS.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Subtle grid pattern overlay */}
      <View style={styles.gridOverlay} />

      {/* Splash Screen */}
      <Animated.View style={[styles.splashContainer, splashAnimatedStyle]}>
        <Animated.View style={logoAnimatedStyle}>
          <Logo size={140} variant="full" />
        </Animated.View>
      </Animated.View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Animated.View style={contentAnimatedStyle}>

          {/* Logo */}
          <View style={styles.logoSection}>
            <Logo size={100} variant="full" showTagline />
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Algeria's Leading{'\n'}E-Commerce Platform
            </Text>
            <Text style={styles.heroSubtitle}>
              Secure, Fast, and Trusted by Millions
            </Text>
          </View>

          {/* Trust Indicators */}
          <View style={styles.trustSection}>
            <View style={styles.trustCard}>
              <LinearGradient
                colors={[COLORS.glass, COLORS.surfaceHighlight]}
                style={styles.trustCardGradient}
              >
                <View style={styles.trustIconContainer}>
                  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={COLORS.success} strokeWidth="2" />
                    <Path d="M8 12L11 15L16 9" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={styles.trustTitle}>Verified Sellers</Text>
                <Text style={styles.trustDesc}>100% authenticated merchants</Text>
              </LinearGradient>
            </View>

            <View style={styles.trustCard}>
              <LinearGradient
                colors={[COLORS.glass, COLORS.surfaceHighlight]}
                style={styles.trustCardGradient}
              >
                <View style={styles.trustIconContainer}>
                  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={COLORS.secondary} strokeWidth="2" />
                    <Path d="M2 17L12 22L22 17" stroke={COLORS.secondary} strokeWidth="2" />
                    <Path d="M2 12L12 17L22 12" stroke={COLORS.secondary} strokeWidth="2" />
                  </Svg>
                </View>
                <Text style={styles.trustTitle}>Fast Delivery</Text>
                <Text style={styles.trustDesc}>All 58 wilayas covered</Text>
              </LinearGradient>
            </View>

            <View style={styles.trustCard}>
              <LinearGradient
                colors={[COLORS.glass, COLORS.surfaceHighlight]}
                style={styles.trustCardGradient}
              >
                <View style={styles.trustIconContainer}>
                  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke={COLORS.primary} strokeWidth="2" />
                    <Path d="M9 12L11 14L15 10" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={styles.trustTitle}>Secure Payment</Text>
                <Text style={styles.trustDesc}>Bank-level encryption</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>10M+</Text>
                <Text style={styles.statLabel}>Active Users</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>50K+</Text>
                <Text style={styles.statLabel}>Verified Sellers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>58</Text>
                <Text style={styles.statLabel}>Wilayas</Text>
              </View>
            </LinearGradient>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleNavigation('signup')}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Create new account"
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Start Selling Now</Text>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleNavigation('login')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Sign in to existing account"
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>

        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: 'transparent',
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.xxl * 1.5,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: SPACING.m,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  trustSection: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  trustCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  trustCardGradient: {
    padding: SPACING.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 16,
    minHeight: 140,
  },
  trustIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  trustTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  trustDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  statsSection: {
    marginBottom: SPACING.xl,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  statsGradient: {
    flexDirection: 'row',
    padding: SPACING.l,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  ctaSection: {
    gap: SPACING.m,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    gap: SPACING.s,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    minHeight: 58,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  termsText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 16,
  },
});

export default WelcomeScreen;