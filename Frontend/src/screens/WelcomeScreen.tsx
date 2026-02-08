import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { getColors, SHADOWS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { Logo } from '../components/Logo';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
}

const WelcomeScreen = ({ navigate }: WelcomeScreenProps) => {
  const { mode } = useTheme();
  const COLORS = getColors(mode);
  
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    // Pulse animation for CTA
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();

    // Logo animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(splashOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(contentFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();

    // Testimonial rotation
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleNavigation = (navMode: 'login' | 'signup') => {
    Animated.timing(screenFade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      navigate?.('loginSignup', { initialMode: navMode });
    });
  };

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });

  const testimonials = [
    { name: 'Ahmed B.', city: 'Oran', text: 'بفضل هذا التطبيق، زادت مبيعاتي 300٪ في 3 أشهر', sales: '+300%' },
    { name: 'Fatima K.', city: 'Algiers', text: 'Simple, rapide et efficace. Mes clients adorent!', sales: '500+ orders' },
    { name: 'Karim M.', city: 'Constantine', text: 'Best decision for my business. Professional support!', sales: '50K DA/month' },
  ];

  return (
    <Animated.View style={[styles.container, { opacity: screenFade }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      {/* Dynamic gradient background */}
      <LinearGradient
        colors={mode === 'dark' 
          ? [COLORS.background, '#0D1420', '#1A1F35', COLORS.background]
          : ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#EFF6FF']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated background shapes */}
      <Animated.View style={[styles.bgShape1, { transform: [{ translateY: floatY }], opacity: 0.1 }]}>
        <Svg width={200} height={200} viewBox="0 0 200 200">
          <Circle cx="100" cy="100" r="80" fill={COLORS.primary} />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.bgShape2, { transform: [{ translateY: floatY }], opacity: 0.08 }]}>
        <Svg width={150} height={150} viewBox="0 0 200 200">
          <Circle cx="100" cy="100" r="60" fill={COLORS.secondary} />
        </Svg>
      </Animated.View>

      {/* Splash Screen */}
      <Animated.View style={[styles.splashContainer, { 
        opacity: splashOpacity, 
        zIndex: splashOpacity.interpolate({ inputRange: [0, 0.1, 1], outputRange: [-1, 100, 100] }) 
      }]}>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <Logo size={140} variant="full" />
        </Animated.View>
      </Animated.View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: contentFade }}>

          {/* Logo with floating animation */}
          <Animated.View style={[styles.logoSection, { transform: [{ translateY: floatY }] }]}>
            <Logo size={90} variant="full" />
          </Animated.View>

          {/* Hero Section - Expert Level */}
          <View style={styles.heroSection}>
            <View style={[styles.badge, { borderColor: COLORS.secondary, backgroundColor: COLORS.secondaryMuted }]}>
              <Text style={[styles.badgeText, { color: COLORS.secondary }]}>🇩🇿 Official Algerie Poste Platform</Text>
            </View>
            
            <Text style={[styles.heroTitle, { color: COLORS.text }]}>
              من <Text style={{ color: COLORS.primary }}>وهران</Text> إلى{' '}
              <Text style={{ color: COLORS.secondary }}>قسنطينة</Text>
            </Text>
            <Text style={[styles.heroSubtitle, { color: COLORS.text }]}>
              Your Store, All 58 Wilayas
            </Text>
            <Text style={[styles.heroDescription, { color: COLORS.textSecondary }]}>
              Join 10,000+ Algerian entrepreneurs who chose to grow with us
            </Text>
          </View>

          {/* Social Proof - Testimonial Carousel */}
          <View style={[styles.testimonialCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
            <View style={styles.testimonialHeader}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Text key={i} style={styles.star}>⭐</Text>
                ))}
              </View>
              <Text style={[styles.testimonialMeta, { color: COLORS.textMuted }]}>
                Real seller from {testimonials[currentTestimonial].city}
              </Text>
            </View>
            <Text style={[styles.testimonialText, { color: COLORS.text }]}>
              "{testimonials[currentTestimonial].text}"
            </Text>
            <View style={styles.testimonialFooter}>
              <View>
                <Text style={[styles.testimonialName, { color: COLORS.text }]}>
                  {testimonials[currentTestimonial].name}
                </Text>
                <Text style={[styles.testimonialCity, { color: COLORS.textMuted }]}>
                  {testimonials[currentTestimonial].city}
                </Text>
              </View>
              <View style={[styles.salesBadge, { backgroundColor: COLORS.success + '20' }]}>
                <Text style={[styles.salesText, { color: COLORS.success }]}>
                  {testimonials[currentTestimonial].sales}
                </Text>
              </View>
            </View>
            <View style={styles.dotsContainer}>
              {testimonials.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === currentTestimonial ? COLORS.primary : COLORS.border }
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Value Propositions - Expert Grid */}
          <View style={styles.valuesGrid}>
            <View style={[styles.valueCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <LinearGradient
                colors={[COLORS.primary + '20', COLORS.primary + '05']}
                style={styles.valueGradient}
              >
                <View style={[styles.valueIcon, { backgroundColor: COLORS.primary }]}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M2 17L12 22L22 17" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M2 12L12 17L22 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={[styles.valueTitle, { color: COLORS.text }]}>58 Wilayas</Text>
                <Text style={[styles.valueDesc, { color: COLORS.textMuted }]}>
                  Adrar → Tlemcen{'\n'}Complete coverage
                </Text>
              </LinearGradient>
            </View>

            <View style={[styles.valueCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <LinearGradient
                colors={[COLORS.secondary + '20', COLORS.secondary + '05']}
                style={styles.valueGradient}
              >
                <View style={[styles.valueIcon, { backgroundColor: COLORS.secondary }]}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="2.5" />
                    <Path d="M12 6V12L16 14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  </Svg>
                </View>
                <Text style={[styles.valueTitle, { color: COLORS.text }]}>24-72h</Text>
                <Text style={[styles.valueDesc, { color: COLORS.textMuted }]}>
                  Fast delivery{'\n'}Trusted couriers
                </Text>
              </LinearGradient>
            </View>

            <View style={[styles.valueCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <LinearGradient
                colors={[COLORS.success + '20', COLORS.success + '05']}
                style={styles.valueGradient}
              >
                <View style={[styles.valueIcon, { backgroundColor: COLORS.success }]}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M9 12L11 14L15 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={[styles.valueTitle, { color: COLORS.text }]}>100% Secure</Text>
                <Text style={[styles.valueDesc, { color: COLORS.textMuted }]}>
                  Bank-level{'\n'}encryption
                </Text>
              </LinearGradient>
            </View>

            <View style={[styles.valueCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <LinearGradient
                colors={[COLORS.info + '20', COLORS.info + '05']}
                style={styles.valueGradient}
              >
                <View style={[styles.valueIcon, { backgroundColor: COLORS.info }]}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="2.5" />
                    <Path d="M2 12H22M12 2C14.5 4.74 16 8.29 16 12C16 15.71 14.5 19.26 12 22C9.5 19.26 8 15.71 8 12C8 8.29 9.5 4.74 12 2Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={[styles.valueTitle, { color: COLORS.text }]}>AR/FR/EN</Text>
                <Text style={[styles.valueDesc, { color: COLORS.textMuted }]}>
                  Local support{'\n'}3 languages
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Trust Signals */}
          <View style={[styles.trustSection, { backgroundColor: COLORS.surfaceHighlight, borderColor: COLORS.border }]}>
            <View style={styles.trustRow}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M22 11.08V12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C12.96 2 13.88 2.14 14.75 2.4" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M22 4L12 14.01L9 11.01" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[styles.trustText, { color: COLORS.textSecondary }]}>
                10,000+ active sellers
              </Text>
            </View>
            <View style={styles.trustRow}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M22 4L12 14.01L9 11.01" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[styles.trustText, { color: COLORS.textSecondary }]}>
                Official Algerie Poste partner
              </Text>
            </View>
            <View style={styles.trustRow}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C12.96 2 13.88 2.14 14.75 2.4" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M22 4L12 14.01L9 11.01" stroke={COLORS.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[styles.trustText, { color: COLORS.textSecondary }]}>
                Free setup & training
              </Text>
            </View>
          </View>

          {/* CTA Conversion Design */}
          <View style={styles.ctaSection}>
            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => handleNavigation('signup')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryLight, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <View style={styles.buttonContent}>
                    <View>
                      <Text style={styles.primaryButtonText}>ابدأ البيع الآن</Text>
                      <Text style={styles.primaryButtonSubtext}>Start Selling Today • Free</Text>
                    </View>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                      <Path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: COLORS.borderLight, backgroundColor: COLORS.surface }]}
              onPress={() => handleNavigation('login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, { color: COLORS.text }]}>
                تسجيل الدخول • Sign In
              </Text>
            </TouchableOpacity>

            <Text style={[styles.footerText, { color: COLORS.textMuted }]}>
              🇩🇿 Made in Algeria, for Algerians
            </Text>
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
  splashContainer: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scrollView: { flex: 1 },
  content: { 
    flexGrow: 1, 
    paddingHorizontal: 20, 
    paddingBottom: 48, 
    paddingTop: 50 
  },
  
  // Background shapes
  bgShape1: { position: 'absolute', top: -50, right: -50 },
  bgShape2: { position: 'absolute', bottom: 100, left: -30 },
  
  // Logo
  logoSection: { 
    alignItems: 'center', 
    marginBottom: 20 
  },
  
  // Hero Section
  heroSection: { 
    alignItems: 'center', 
    marginBottom: 28 
  },
  badge: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginBottom: 16 
  },
  badgeText: { 
    fontSize: 12, 
    fontWeight: '700', 
    letterSpacing: 0.5 
  },
  heroTitle: { 
    fontSize: 36, 
    fontWeight: '900', 
    textAlign: 'center', 
    lineHeight: 44, 
    marginBottom: 8, 
    letterSpacing: -0.5 
  },
  heroSubtitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 12 
  },
  heroDescription: { 
    fontSize: 15, 
    fontWeight: '500', 
    textAlign: 'center', 
    lineHeight: 22 
  },
  
  // Testimonial
  testimonialCard: { 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 24, 
    borderWidth: 1,
    ...SHADOWS.medium
  },
  testimonialHeader: { marginBottom: 16 },
  starsContainer: { 
    flexDirection: 'row', 
    marginBottom: 8, 
    gap: 2 
  },
  star: { fontSize: 16 },
  testimonialMeta: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  testimonialText: { 
    fontSize: 16, 
    lineHeight: 26, 
    fontWeight: '500', 
    marginBottom: 20,
    fontStyle: 'italic'
  },
  testimonialFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16
  },
  testimonialName: { 
    fontSize: 15, 
    fontWeight: '700', 
    marginBottom: 2 
  },
  testimonialCity: { 
    fontSize: 13, 
    fontWeight: '600' 
  },
  salesBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  salesText: { 
    fontSize: 13, 
    fontWeight: '800' 
  },
  dotsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 8 
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4 
  },
  
  // Values Grid
  valuesGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, 
    marginBottom: 24 
  },
  valueCard: { 
    width: '48%', 
    borderRadius: 20, 
    overflow: 'hidden', 
    borderWidth: 1 
  },
  valueGradient: { 
    padding: 20, 
    alignItems: 'center' 
  },
  valueIcon: { 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12,
    ...SHADOWS.medium
  },
  valueTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    marginBottom: 6, 
    textAlign: 'center' 
  },
  valueDesc: { 
    fontSize: 12, 
    lineHeight: 18, 
    textAlign: 'center',
    fontWeight: '600'
  },
  
  // Trust Section
  trustSection: { 
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 28, 
    borderWidth: 1,
    gap: 12
  },
  trustRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  trustText: { 
    fontSize: 14, 
    fontWeight: '600', 
    flex: 1 
  },
  
  // CTA
  ctaSection: { gap: 14 },
  primaryButton: { 
    borderRadius: 18, 
    overflow: 'hidden',
    ...SHADOWS.large
  },
  buttonGradient: { padding: 4 },
  buttonContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20
  },
  primaryButtonText: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#FFFFFF', 
    letterSpacing: 0.3,
    marginBottom: 2
  },
  primaryButtonSubtext: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: 'rgba(255,255,255,0.95)' 
  },
  secondaryButton: { 
    borderRadius: 18, 
    paddingVertical: 18, 
    alignItems: 'center', 
    borderWidth: 2 
  },
  secondaryButtonText: { 
    fontSize: 16, 
    fontWeight: '700' 
  },
  footerText: { 
    fontSize: 14, 
    textAlign: 'center', 
    marginTop: 12,
    fontWeight: '700'
  },
  termsText: { 
    fontSize: 12, 
    textAlign: 'center', 
    marginTop: 4,
    fontWeight: '500'
  },
});

export default WelcomeScreen;
