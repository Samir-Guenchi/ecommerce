import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
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
            <Logo size={100} variant="full" />
          </Animated.View>

          {/* Hero Section - More Human */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, { color: COLORS.text }]}>
              من وهران إلى قسنطينة{'\n'}
              <Text style={{ color: COLORS.secondary }}>سوقك الإلكتروني</Text>
            </Text>
            <Text style={[styles.heroSubtitle, { color: COLORS.textSecondary }]}>
              From Oran to Constantine, your digital marketplace
            </Text>
            <Text style={[styles.heroDescription, { color: COLORS.textMuted }]}>
              Join thousands of Algerian entrepreneurs building their dreams online
            </Text>
          </View>

          {/* Algerian Touch - Community Stats */}
          <View style={[styles.communityCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
            <View style={styles.communityHeader}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Circle cx="9" cy="7" r="4" stroke={COLORS.primary} strokeWidth="2" />
                <Path d="M3 21V19C3 16.7909 4.79086 15 7 15H11C13.2091 15 15 16.7909 15 19V21" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" />
                <Path d="M16 11L18 13L22 9" stroke={COLORS.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[styles.communityTitle, { color: COLORS.text }]}>
                Growing Together
              </Text>
            </View>
            <Text style={[styles.communityText, { color: COLORS.textSecondary }]}>
              Real Algerian sellers, from Algiers to Tamanrasset, building successful businesses with Algerie Poste
            </Text>
          </View>

          {/* Features - Algerian Context */}
          <View style={styles.featuresSection}>
            <View style={[styles.featureCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M2 17L12 22L22 17" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M2 12L12 17L22 12" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={[styles.featureTitle, { color: COLORS.text }]}>كل الولايات</Text>
              <Text style={[styles.featureDesc, { color: COLORS.textMuted }]}>
                Deliver to all 58 wilayas - from Adrar to Tizi Ouzou
              </Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: COLORS.secondary + '15' }]}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke={COLORS.secondary} strokeWidth="2" />
                  <Path d="M12 6V12L16 14" stroke={COLORS.secondary} strokeWidth="2" strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={[styles.featureTitle, { color: COLORS.text }]}>توصيل سريع</Text>
              <Text style={[styles.featureDesc, { color: COLORS.textMuted }]}>
                Fast delivery with trusted Algerian couriers
              </Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <Path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Circle cx="12" cy="7" r="4" stroke={COLORS.success} strokeWidth="2" />
                </Svg>
              </View>
              <Text style={[styles.featureTitle, { color: COLORS.text }]}>دعم محلي</Text>
              <Text style={[styles.featureDesc, { color: COLORS.textMuted }]}>
                Support in Arabic, French, and English
              </Text>
            </View>
          </View>

          {/* Trust Badge - Algerian Style */}
          <View style={[styles.trustBadge, { backgroundColor: COLORS.surfaceHighlight, borderColor: COLORS.border }]}>
            <View style={styles.trustRow}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke={COLORS.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M9 12L11 14L15 10" stroke={COLORS.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.trustTitle, { color: COLORS.text }]}>
                  Trusted by Algerian Businesses
                </Text>
                <Text style={[styles.trustDesc, { color: COLORS.textMuted }]}>
                  Official Algerie Poste platform - secure and reliable
                </Text>
              </View>
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
                <Text style={styles.primaryButtonText}>ابدأ البيع الآن</Text>
                <Text style={styles.primaryButtonSubtext}>Start Selling</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: COLORS.borderLight, backgroundColor: COLORS.surface }]}
              onPress={() => handleNavigation('login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, { color: COLORS.text }]}>
                تسجيل الدخول • Sign In
              </Text>
            </TouchableOpacity>

            <Text style={[styles.termsText, { color: COLORS.textMuted }]}>
              🇩🇿 Made for Algeria, by Algerians
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
  logoSection: { alignItems: 'center', marginBottom: 24 },
  
  // Hero Section
  heroSection: { alignItems: 'center', marginBottom: 32 },
  heroTitle: { 
    fontSize: 32, 
    fontWeight: '800', 
    textAlign: 'center', 
    lineHeight: 42, 
    marginBottom: 12, 
    letterSpacing: -0.5 
  },
  heroSubtitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    textAlign: 'center', 
    lineHeight: 24, 
    marginBottom: 8 
  },
  heroDescription: { 
    fontSize: 14, 
    fontWeight: '500', 
    textAlign: 'center', 
    lineHeight: 21, 
    paddingHorizontal: 16 
  },
  
  // Community Card
  communityCard: { 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 24, 
    borderWidth: 1 
  },
  communityHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    gap: 12 
  },
  communityTitle: { 
    fontSize: 18, 
    fontWeight: '700' 
  },
  communityText: { 
    fontSize: 14, 
    lineHeight: 22 
  },
  
  // Features
  featuresSection: { gap: 16, marginBottom: 24 },
  featureCard: { 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  featureIcon: { 
    width: 56, 
    height: 56, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  featureTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 4,
    flex: 1
  },
  featureDesc: { 
    fontSize: 13, 
    lineHeight: 19,
    flex: 1
  },
  
  // Trust Badge
  trustBadge: { 
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 32, 
    borderWidth: 1 
  },
  trustRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  trustTitle: { 
    fontSize: 15, 
    fontWeight: '700', 
    marginBottom: 4 
  },
  trustDesc: { 
    fontSize: 13, 
    lineHeight: 19 
  },
  
  // CTA
  ctaSection: { gap: 14 },
  primaryButton: { 
    borderRadius: 16, 
    overflow: 'hidden' 
  },
  buttonGradient: { 
    paddingVertical: 20, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  primaryButtonText: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#FFFFFF', 
    letterSpacing: 0.3,
    marginBottom: 2
  },
  primaryButtonSubtext: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: 'rgba(255,255,255,0.9)' 
  },
  secondaryButton: { 
    borderRadius: 16, 
    paddingVertical: 18, 
    alignItems: 'center', 
    borderWidth: 2 
  },
  secondaryButtonText: { 
    fontSize: 16, 
    fontWeight: '700' 
  },
  termsText: { 
    fontSize: 13, 
    textAlign: 'center', 
    marginTop: 8, 
    lineHeight: 20,
    fontWeight: '600'
  },
});

export default WelcomeScreen;
