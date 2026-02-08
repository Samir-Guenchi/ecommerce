import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
  AccessibilityInfo,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { API_URL } from '../config/api.config';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

interface LoginSignUpScreenProps {
  initialMode?: 'login' | 'signup';
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string, params?: Record<string, any>) => void;
  onAuthenticated?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

// Reusable themed Eye icon
const EyeIcon = ({ visible, color = COLORS.textSecondary }: { visible: boolean; color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    {visible ? (
      <Path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill={color}/>
    ) : (
      <Path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill={color}/>
    )}
  </Svg>
);

const LoginSignUpScreen = ({
  initialMode = 'login',
  navigate: _navigate,
  resetTo,
  onAuthenticated,
}: LoginSignUpScreenProps) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;
  const screenFade = useRef(new Animated.Value(1)).current;
  
  // Loading screen animations
  const loadingLogoScale = useRef(new Animated.Value(0)).current;
  const loadingLogoOpacity = useRef(new Animated.Value(0)).current;
  const loadingSplashOpacity = useRef(new Animated.Value(0)).current;
  const loadingTextOpacity = useRef(new Animated.Value(0)).current;
  const loadingTextSlide = useRef(new Animated.Value(10)).current;
  const loadingDotsOpacity = useRef(new Animated.Value(0)).current;
  const [loadingStatus, setLoadingStatus] = useState('');
  
  // Animated dots for loading indicator
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;
    let abortController: AbortController;
    
    // Check if admin exists
    const checkAdmin = async () => {
      console.log(`Attempting to check admin at: ${API_URL}/auth/check-admin`);
      
      // Add timeout to prevent infinite loading (5 seconds)
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('Admin check timeout after 5 seconds - proceeding with default state');
          if (abortController) {
            abortController.abort();
          }
          setCheckingAdmin(false);
          setIsAdminMode(false);
          setIsLogin(initialMode === 'login');
          
          // Show UI even on timeout
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }, 5000); // 5 second timeout
      
      try {
        abortController = new AbortController();
        const signal = abortController.signal;
        
        const response = await Promise.race([
          fetch(`${API_URL}/auth/check-admin`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal,
          }),
          new Promise<Response>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 5000)
          ),
        ]) as Response;
        
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        if (!isMounted) return;
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Admin check response:', data);
        
        if (!isMounted) return;
        
        setIsAdminMode(!data.adminExists);
        setCheckingAdmin(false);
        
        // If admin doesn't exist, force signup mode
        if (!data.adminExists) {
          setIsLogin(false);
        } else {
          setIsLogin(initialMode === 'login');
        }
        
        // Smooth entrance animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error: any) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        if (!isMounted) return;

        // If request was aborted (timeout or unmount), quietly show UI
        if (error.name === 'AbortError') {
          setCheckingAdmin(false);
          setIsAdminMode(false);
          setIsLogin(initialMode === 'login');
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
          return;
        }

        console.error('Error checking admin:', error);
        // Log more details for debugging
        if (error.message?.includes('network request failed') || 
            error.name === 'TypeError' || 
            error.message?.includes('timeout')) {
          console.error('Network error: Make sure the backend server is running and accessible');
          console.error(`Platform: ${Platform.OS}`);
          console.error(`Attempted to connect to: ${API_URL}/auth/check-admin`);
          if (Platform.OS === 'android') {
            console.error('For Android emulator, ensure backend is running and accessible at http://10.0.2.2:3000');
            console.error('Make sure the backend server is listening on 0.0.0.0 (all interfaces)');
          } else {
            console.error('For iOS simulator, ensure backend is running and accessible at http://localhost:3000');
          }
        }
        
        setCheckingAdmin(false);
        setIsAdminMode(false);
        setIsLogin(initialMode === 'login');
        
        // Still show the UI even if check fails
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };
    
    checkAdmin();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (abortController) {
        abortController.abort();
      }
    };
  }, [initialMode, fadeAnim, slideAnim]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  const screenAnimatedStyle = {
    opacity: screenFade,
  };

  const loadingLogoAnimatedStyle = {
    opacity: loadingLogoOpacity,
    transform: [{ scale: loadingLogoScale }],
  };

  const loadingSplashAnimatedStyle = {
    opacity: loadingSplashOpacity,
  };

  // Animate loading dots in sequence
  useEffect(() => {
    if (isLoading) {
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dot1Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot1Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isLoading) {
            animateDots();
          }
        });
      };
      animateDots();
    }
  }, [isLoading]);

  const handleAuth = async () => {
    if (isLoading) {
      return;
    }

    if (isLogin) {
      if (!email || !password) {
        setAuthError('Please enter both email and password.');
        return;
      }
    } else {
      if (!name || !email || !password) {
        setAuthError('Please fill in name, email, and password.');
        return;
      }
      if (!isAdminMode && password !== confirmPassword) {
        setAuthError('Password and confirmation must match.');
        return;
      }
    }

    setAuthError('');

    // Reset all animation values
    loadingLogoScale.setValue(0);
    loadingLogoOpacity.setValue(0);
    loadingSplashOpacity.setValue(0);
    loadingTextOpacity.setValue(0);
    loadingTextSlide.setValue(10);
    loadingDotsOpacity.setValue(0);
    dot1Opacity.setValue(0.3);
    dot2Opacity.setValue(0.3);
    dot3Opacity.setValue(0.3);
    
    setIsLoading(true);
    setLoadingStatus(isLogin ? 'Signing you in...' : 'Creating your account...');
    
    // Fade out current screen
    Animated.timing(screenFade, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Show loading screen
      Animated.sequence([
        // Show splash background
        Animated.timing(loadingSplashOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Logo scales up and fades in
        Animated.parallel([
          Animated.spring(loadingLogoScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(loadingLogoOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Show text and dots
        Animated.parallel([
          Animated.timing(loadingTextOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(loadingTextSlide, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(loadingDotsOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(async () => {
        try {
          const payload = isLogin
            ? { email, password }
            : { fullName: name, email, password };

          const response = await fetch(`${API_URL}/auth/${isLogin ? 'login' : 'signup'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            // Check if account needs verification
            if (data?.needsVerification) {
              setIsLoading(false);
              setLoadingStatus('');
              Animated.timing(screenFade, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start();
              
              // Navigate to email verification screen
              _navigate?.('emailVerification', {
                email: payload.email,
                user: data.user,
              });
              return;
            }
            
            throw new Error(data?.error || 'Authentication failed');
          }

          // Check if account needs verification (for successful signup)
          if (data?.needsVerification) {
            setIsLoading(false);
            setLoadingStatus('');
            Animated.timing(screenFade, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start();
            
            // Navigate to email verification screen
            _navigate?.('emailVerification', {
              email: payload.email,
              user: data.user,
            });
            return;
          }

          if (!data?.token) {
            setIsLoading(false);
            setLoadingStatus('');
            Animated.timing(screenFade, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start();
            setAuthError(data?.message || 'Please verify your account to continue.');
            return;
          }

          await AsyncStorage.setItem('authToken', data.token);
          setLoadingStatus('Success! Redirecting...');

          Animated.sequence([
            Animated.parallel([
              Animated.timing(loadingSplashOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(loadingLogoOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(loadingTextOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(loadingDotsOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ]),
          ]).start(() => {
            setIsLoading(false);
            onAuthenticated?.();
            resetTo?.('dashboard');
          });
        } catch (error: any) {
          console.error('Authentication error:', error);
          setIsLoading(false);
          setLoadingStatus('');
          Animated.timing(screenFade, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          setAuthError(error?.message || 'Authentication failed. Please try again.');
        }
      });
    });
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Loading Screen */}
      {isLoading && (
        <Animated.View style={[styles.loadingContainer, loadingSplashAnimatedStyle]}>
          {/* Background decorative circles */}
          <View style={styles.loadingBackgroundCircles}>
            <View style={styles.loadingCircle1} />
            <View style={styles.loadingCircle2} />
            <View style={styles.loadingCircle3} />
          </View>

          {/* Logo */}
          <Animated.View style={[styles.loadingLogoContainer, loadingLogoAnimatedStyle]}>
            <View style={styles.loadingLogoCircle}>
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

          {/* Status Text */}
          <Animated.View 
            style={[
              styles.loadingTextContainer,
              {
                opacity: loadingTextOpacity,
                transform: [{ translateY: loadingTextSlide }],
              }
            ]}
          >
            <Text style={styles.loadingStatusText}>
              {loadingStatus || (isLogin ? 'Signing you in...' : 'Creating your account...')}
            </Text>
          </Animated.View>

          {/* Animated Loading Dots */}
          <Animated.View 
            style={[
              styles.loadingDotsContainer,
              { opacity: loadingDotsOpacity }
            ]}
          >
            <Animated.View style={[styles.loadingDot, { opacity: dot1Opacity }]} />
            <Animated.View style={[styles.loadingDot, { opacity: dot2Opacity }]} />
            <Animated.View style={[styles.loadingDot, { opacity: dot3Opacity }]} />
          </Animated.View>
        </Animated.View>
      )}

      {checkingAdmin ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M2 17L12 22L22 17" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              <Path d="M2 12L12 17L22 12" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
            </Svg>
          </View>
          <Text style={styles.loadingText}>Connecting to server...</Text>
          <Text style={styles.loadingSubtext}>Please ensure the backend server is running</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View style={[styles.contentWrapper, screenAnimatedStyle]}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={animatedStyle}>

        {/* Decorative Header */}
        <View style={styles.headerGraphic}>
          <Svg width={120} height={120} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="authGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0" stopColor={COLORS.primary} stopOpacity="0.15" />
                <Stop offset="1" stopColor={COLORS.primary} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="100" cy="100" r="80" fill="url(#authGrad)" />
            <Path
              d="M100 40 C 133 40 160 67 160 100 C 160 133 133 160 100 160 C 67 160 40 133 40 100"
              stroke={COLORS.primary}
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
            />
            <Circle cx="100" cy="100" r="4" fill={COLORS.primary} />
          </Svg>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image source={require('./logo.png')} style={styles.logo} />
          </View>
        </View>

        {/* Eyebrow */}
        <Text style={styles.eyebrow}>ALGERIE POSTE</Text>

        {/* Main Heading */}
        <Text style={styles.heading}>
          {isAdminMode 
            ? 'Create Admin Account' 
            : isLogin 
            ? 'Welcome back' 
            : 'Create your account'}
        </Text>
        <Text style={styles.subheading}>
          {isAdminMode
            ? 'Set up your administrator credentials'
            : isLogin
            ? 'Sign in to continue to your marketplace'
            : 'Join Algeria\'s premium e-commerce marketplace'}
        </Text>

        {/* Toggle Buttons - Only show if not admin mode */}
        {!isAdminMode && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
              onPress={() => setIsLogin(true)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isLogin }}
              accessibilityLabel="Switch to login form"
            >
              <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
              onPress={() => setIsLogin(false)}
              accessibilityRole="tab"
              accessibilityState={{ selected: !isLogin }}
              accessibilityLabel="Switch to sign up form"
            >
              <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isAdminMode && (
          <View style={styles.adminBanner}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={COLORS.primary} strokeWidth="2" />
            </Svg>
            <Text style={styles.adminNote}>
              First admin account — full system access will be granted.
            </Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Inline Error Banner */}
          {authError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{authError}</Text>
            </View>
          ) : null}
          {isLogin ? (
            <>
              {/* LOGIN FORM */}
              <View style={styles.inputGroup}>
                <Text style={styles.label} nativeID="email-label">Email address</Text>
                <View style={styles.inputWrapper}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" style={styles.inputIcon}>
                    <Path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill={COLORS.textMuted} />
                  </Svg>
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    accessibilityLabelledBy="email-label"
                    accessibilityLabel="Email address input"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.passwordLabelRow}>
                  <Text style={styles.label} nativeID="password-label">Password</Text>
                  <TouchableOpacity
                    accessibilityRole="link"
                    accessibilityLabel="Forgot password? Tap to reset"
                  >
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" style={styles.inputIcon}>
                    <Path d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13 14 13.9 14 15 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9S15.1 4.29 15.1 6V8Z" fill={COLORS.textMuted} />
                  </Svg>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    textContentType="password"
                    accessibilityLabelledBy="password-label"
                    accessibilityLabel="Password input"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon visible={showPassword} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleAuth}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Sign in to your account"
              >
                <Text style={styles.primaryButtonText}>Sign In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* SIGN UP FORM */}
              <View style={styles.inputGroup}>
                <Text style={styles.label} nativeID="name-label">Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" style={styles.inputIcon}>
                    <Path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill={COLORS.textMuted} />
                  </Svg>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLORS.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoComplete="name"
                    textContentType="name"
                    accessibilityLabelledBy="name-label"
                    accessibilityLabel="Full name input"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label} nativeID="signup-email-label">Email address</Text>
                <View style={styles.inputWrapper}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" style={styles.inputIcon}>
                    <Path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill={COLORS.textMuted} />
                  </Svg>
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    accessibilityLabelledBy="signup-email-label"
                    accessibilityLabel="Email address input"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label} nativeID="signup-password-label">Password</Text>
                <View style={styles.inputWrapper}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" style={styles.inputIcon}>
                    <Path d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13 14 13.9 14 15 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9S15.1 4.29 15.1 6V8Z" fill={COLORS.textMuted} />
                  </Svg>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password-new"
                    textContentType="newPassword"
                    accessibilityLabelledBy="signup-password-label"
                    accessibilityLabel="Password input"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon visible={showPassword} />
                  </TouchableOpacity>
                </View>
              </View>

              {!isAdminMode && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label} nativeID="confirm-password-label">Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" style={styles.inputIcon}>
                      <Path d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13 14 13.9 14 15 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9S15.1 4.29 15.1 6V8Z" fill={COLORS.textMuted} />
                    </Svg>
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter your password"
                      placeholderTextColor={COLORS.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      textContentType="newPassword"
                      accessibilityLabelledBy="confirm-password-label"
                      accessibilityLabel="Confirm password input"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                      accessibilityRole="button"
                      accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      <EyeIcon visible={showConfirmPassword} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleAuth}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={isAdminMode ? 'Create admin account' : 'Create a new account'}
              >
                <Text style={styles.primaryButtonText}>
                  {isAdminMode ? 'Create Admin Account' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Separator - Only show if not admin mode */}
        {!isAdminMode && (
          <>
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OR CONTINUE WITH</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialButton}
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
              >
                <Svg viewBox="0 0 24 24" width={20} height={20}>
                  <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </Svg>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                accessibilityRole="button"
                accessibilityLabel="Continue with Facebook"
              >
                <Svg viewBox="0 0 24 24" width={20} height={20}>
                  <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </Svg>
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink} accessibilityRole="link">Terms of Service</Text> and{' '}
                <Text style={styles.termsLink} accessibilityRole="link">Privacy Policy</Text>
              </Text>
            </View>
          </>
        )}
              </Animated.View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },

  // === Loading States ===
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingSpinner: {
    marginBottom: SPACING.l,
  },
  loadingText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  loadingSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },

  // === Loading Animation Backgrounds ===
  loadingBackgroundCircles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  loadingCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.surfaceHighlight,
    top: -100,
    right: -100,
    opacity: 0.15,
  },
  loadingCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.surface,
    bottom: -50,
    left: -50,
    opacity: 0.2,
  },
  loadingCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.surfaceHighlight,
    top: '50%',
    left: '50%',
    marginLeft: -75,
    marginTop: -75,
    opacity: 0.1,
  },
  loadingLogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 10,
  },
  loadingLogoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...SHADOWS.glow,
  },
  loadingTextContainer: {
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 10,
    paddingHorizontal: 32,
  },
  loadingStatusText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  loadingDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    zIndex: 10,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginHorizontal: 4,
  },

  // === Header & Branding ===
  headerGraphic: {
    alignItems: 'center',
    marginBottom: -SPACING.m,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  logo: {
    width: 36,
    height: 36,
    tintColor: COLORS.primary,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 2.5,
    textAlign: 'center',
    marginBottom: SPACING.s,
    textTransform: 'uppercase',
  },
  heading: {
    ...TYPOGRAPHY.h1,
    fontSize: 26,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  subheading: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.l,
    lineHeight: 20,
    paddingHorizontal: SPACING.m,
  },

  // === Toggle ===
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 3,
    marginBottom: SPACING.l,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.glow,
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // === Admin Banner ===
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '14',
    borderRadius: 10,
    padding: SPACING.m,
    marginBottom: SPACING.l,
    gap: SPACING.s,
  },
  adminNote: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    lineHeight: 17,
  },

  // === Form ===
  formContainer: {
    gap: 0,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 10,
    padding: SPACING.m,
    marginBottom: SPACING.m,
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: SPACING.m,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPassword: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.m,
    minHeight: 48, // Accessibility: minimum 48px touch target
  },
  inputIcon: {
    marginRight: SPACING.s,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  eyeButton: {
    padding: SPACING.s,
    minWidth: 44, // Accessibility: minimum touch target
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // === Buttons ===
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.m,
    marginBottom: SPACING.l,
    minHeight: 48,
    ...SHADOWS.glow,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.button,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // === Separator ===
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  separatorText: {
    marginHorizontal: SPACING.m,
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 1,
  },

  // === Social Auth ===
  socialRow: {
    flexDirection: 'row',
    gap: SPACING.m,
    marginBottom: SPACING.l,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 12,
    gap: SPACING.s,
    minHeight: 48,
  },
  socialText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },

  // === Terms ===
  termsContainer: {
    marginTop: SPACING.s,
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default LoginSignUpScreen;
