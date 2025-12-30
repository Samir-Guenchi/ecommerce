import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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

  useEffect(() => {
    // Logo animation sequence
    Animated.sequence([
      // Logo scales up and fades in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Hold for a moment
      Animated.delay(800),
      // Pulse effect
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Fade out splash and fade in content
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowContent(true);
    });
  }, [logoScale, logoOpacity, splashOpacity, contentFade]);

  const logoAnimatedStyle = {
    opacity: logoOpacity,
    transform: [{ scale: logoScale }],
  };

  const splashAnimatedStyle = {
    opacity: splashOpacity,
  };

  const contentAnimatedStyle = {
    opacity: contentFade,
  };

  const screenAnimatedStyle = {
    opacity: screenFade,
  };

  const handleNavigation = (mode: 'login' | 'signup') => {
    // Smooth fade out animation before navigation
    Animated.timing(screenFade, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigate?.('loginSignup', { initialMode: mode });
    });
  };

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      {/* Loading/Splash Screen */}
      {!showContent && (
        <Animated.View style={[styles.splashContainer, splashAnimatedStyle]}>
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.splashLogoContainer}>
              <Svg
                width={60}
                height={60}
                viewBox="0 0 24 24"
                fill="none"
              >
                <Path
                  d="M20 11.6211V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V11.6211M7.5 9.75C7.5 10.9926 6.49264 12 5.25 12C4.09397 12 3.14157 11.1282 3.01442 10.0062C2.99524 9.83688 3.02176 9.66657 3.06477 9.50173L4.10996 5.49516C4.3397 4.6145 5.13506 4 6.04519 4H17.9548C18.8649 4 19.6603 4.6145 19.89 5.49516L20.9352 9.50173C20.9782 9.66657 21.0048 9.83688 20.9856 10.0062C20.8584 11.1282 19.906 12 18.75 12C17.5074 12 16.5 10.9926 16.5 9.75M7.5 9.75C7.5 10.9926 8.50736 12 9.75 12C10.9926 12 12 10.9926 12 9.75M7.5 9.75L8 4M12 9.75C12 10.9926 13.0074 12 14.25 12C15.4926 12 16.5 10.9926 16.5 9.75M12 9.75V4M16.5 9.75L16 4"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </Animated.View>
        </Animated.View>
      )}

      {/* Main Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Animated.View style={contentAnimatedStyle}>
        {/* Storefront Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.storefrontIconContainer}>
            <Svg
              width={30}
              height={30}
              viewBox="0 0 24 24"
              fill="none"
            >
              <Path
                d="M20 11.6211V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V11.6211M7.5 9.75C7.5 10.9926 6.49264 12 5.25 12C4.09397 12 3.14157 11.1282 3.01442 10.0062C2.99524 9.83688 3.02176 9.66657 3.06477 9.50173L4.10996 5.49516C4.3397 4.6145 5.13506 4 6.04519 4H17.9548C18.8649 4 19.6603 4.6145 19.89 5.49516L20.9352 9.50173C20.9782 9.66657 21.0048 9.83688 20.9856 10.0062C20.8584 11.1282 19.906 12 18.75 12C17.5074 12 16.5 10.9926 16.5 9.75M7.5 9.75C7.5 10.9926 8.50736 12 9.75 12C10.9926 12 12 10.9926 12 9.75M7.5 9.75L8 4M12 9.75C12 10.9926 13.0074 12 14.25 12C15.4926 12 16.5 10.9926 16.5 9.75M12 9.75V4M16.5 9.75L16 4"
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>

        {/* Abstract Image Placeholder */}
        <View style={styles.imageContainer}>
          <View style={styles.abstractImage}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />
          </View>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>The best stores, all in one place.</Text>

        {/* Body Text */}
        <Text style={styles.bodyText}>
          Shop from a curated collection of independent brands and unique products.
        </Text>

        {/* Get Started Button */}
        <TouchableOpacity 
          style={styles.getStartedButton}
          onPress={() => handleNavigation('signup')}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>
            Already have an account?{' '}
            <Text 
              style={styles.signInLink}
              onPress={() => handleNavigation('login')}
            >
              Sign In
            </Text>
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
    backgroundColor: '#F5F5F5',
  },
  splashContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 60,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  splashLogoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storefrontIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  abstractImage: {
    width: 200,
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    top: 0,
    left: 0,
  },
  circle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    top: 50,
    right: 0,
  },
  circle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8E8E8',
    bottom: 0,
    left: 30,
  },
  headline: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  bodyText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 215,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  getStartedButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  signInContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  signInText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  signInLink: {
    color: '#000000',
    fontWeight: '600',
  },
});

export default WelcomeScreen;