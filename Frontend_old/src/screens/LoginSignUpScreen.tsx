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
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { API_URL } from '../config/api.config';

interface LoginSignUpScreenProps {
  initialMode?: 'login' | 'signup';
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string, params?: Record<string, any>) => void;
  onAuthenticated?: () => void;
}

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
        Alert.alert('Missing information', 'Please enter both email and password.');
        return;
      }
    } else {
      if (!name || !email || !password) {
        Alert.alert('Missing information', 'Please fill in name, email, and password.');
        return;
      }
      if (!isAdminMode && password !== confirmPassword) {
        Alert.alert('Password mismatch', 'Password and confirmation must match.');
        return;
      }
    }

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
            Alert.alert(
              'Verification needed',
              data?.message || 'Please verify your account to continue.'
            );
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
          Alert.alert('Authentication failed', error?.message || 'Please try again.');
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
            >
              <Animated.View style={animatedStyle}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('./logo.png')} style={styles.logo} />
        </View>

        {/* Main Heading */}
        <Text style={styles.heading}>
          {isAdminMode 
            ? 'Create Admin Account' 
            : isLogin 
            ? 'Sign in to your account' 
            : 'Create a new account'}
        </Text>

        {/* Toggle Buttons - Only show if not admin mode */}
        {!isAdminMode && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isAdminMode && (
          <Text style={styles.adminNote}>
            You are creating the first admin account. This account will have full system access.
          </Text>
        )}

        {/* Conditional Form */}
        {isLogin ? (
          <>
            {/* LOGIN FORM */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.passwordLabelContainer}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    {showPassword ? (
                      <Path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="black"/>
                    ) : (
                      <Path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92 1.11-1.11c-1.73-4.39-6-7.5-11-7.5-1.55 0-3.04.3-4.38.84l1.47 1.47C8.95 6.17 10.43 6 12 6c-3.31 0-6 2.69-6 6 0 1.32.43 2.54 1.17 3.53L4.27 17.27C2.54 15.61 1 13.87 1 12c1.73-4.39 6-7.5 11-7.5zM3.51 3.51L2.1 2.1l19.8 19.8 1.41-1.41L3.51 3.51zM12 9c1.66 0 3 1.34 3 3 0 .35-.07.68-.19.98L13.6 11.4c.05-.08.1-.16.1-.4 0-.55-.45-1-1-1s-1 .45-1 1c0 .24.05.52.14.76l-1.75 1.75c-.31-.12-.64-.21-.99-.21-1.66 0-3 1.34-3 3 0 .35.07.68.19.98l-1.75 1.75C7.32 16.68 7 16.35 7 16c0-2.76 2.24-5 5-5z" fill="black"/>
                    )}
                  </Svg>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.signInButton}
              onPress={handleAuth}
              activeOpacity={0.8}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* SIGN UP FORM */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    {showPassword ? (
                      <Path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="black"/>
                    ) : (
                      <Path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92 1.11-1.11c-1.73-4.39-6-7.5-11-7.5-1.55 0-3.04.3-4.38.84l1.47 1.47C8.95 6.17 10.43 6 12 6c-3.31 0-6 2.69-6 6 0 1.32.43 2.54 1.17 3.53L4.27 17.27C2.54 15.61 1 13.87 1 12c1.73-4.39 6-7.5 11-7.5zM3.51 3.51L2.1 2.1l19.8 19.8 1.41-1.41L3.51 3.51zM12 9c1.66 0 3 1.34 3 3 0 .35-.07.68-.19.98L13.6 11.4c.05-.08.1-.16.1-.4 0-.55-.45-1-1-1s-1 .45-1 1c0 .24.05.52.14.76l-1.75 1.75c-.31-.12-.64-.21-.99-.21-1.66 0-3 1.34-3 3 0 .35.07.68.19.98l-1.75 1.75C7.32 16.68 7 16.35 7 16c0-2.76 2.24-5 5-5z" fill="black"/>
                    )}
                  </Svg>
                </TouchableOpacity>
              </View>
            </View>

            {!isAdminMode && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24">
                      {showConfirmPassword ? (
                        <Path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="black"/>
                      ) : (
                        <Path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92 1.11-1.11c-1.73-4.39-6-7.5-11-7.5-1.55 0-3.04.3-4.38.84l1.47 1.47C8.95 6.17 10.43 6 12 6c-3.31 0-6 2.69-6 6 0 1.32.43 2.54 1.17 3.53L4.27 17.27C2.54 15.61 1 13.87 1 12c1.73-4.39 6-7.5 11-7.5zM3.51 3.51L2.1 2.1l19.8 19.8 1.41-1.41L3.51 3.51zM12 9c1.66 0 3 1.34 3 3 0 .35-.07.68-.19.98L13.6 11.4c.05-.08.1-.16.1-.4 0-.55-.45-1-1-1s-1 .45-1 1c0 .24.05.52.14.76l-1.75 1.75c-.31-.12-.64-.21-.99-.21-1.66 0-3 1.34-3 3 0 .35.07.68.19.98l-1.75 1.75C7.32 16.68 7 16.35 7 16c0-2.76 2.24-5 5-5z" fill="black"/>
                      )}
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={styles.signInButton}
              onPress={handleAuth}
              activeOpacity={0.8}
            >
              <Text style={styles.signInButtonText}>
                {isAdminMode ? 'Create Admin Account' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Separator - Only show if not admin mode */}
        {!isAdminMode && (
          <>
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OR CONTINUE WITH</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Social Buttons as Circles */}
            <View style={styles.socialCircleContainer}>
              <TouchableOpacity style={styles.socialCircle}>
                <Svg viewBox="0 0 24 24" width={20} height={20}>
                  <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="black"/>
                  <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="black"/>
                  <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="black"/>
                  <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="black"/>
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialCircle}>
                <Svg viewBox="0 0 24 24" width={20} height={20}>
                  <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="black"/>
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialCircle}>
                <Svg viewBox="0 0 16 16" width={20} height={20}>
                  <Path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" fill="black"/>
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy.</Text>
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
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  keyboardContainer: { flex: 1 },
  contentWrapper: { flex: 1 },
  loadingContainer: {
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
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
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
    backgroundColor: '#E8E8E8',
    top: -100,
    right: -100,
    opacity: 0.5,
  },
  loadingCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F0F0F0',
    bottom: -50,
    left: -50,
    opacity: 0.5,
  },
  loadingCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E0E0E0',
    top: '50%',
    left: '50%',
    marginLeft: -75,
    marginTop: -75,
    opacity: 0.3,
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
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingTextContainer: {
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 10,
    paddingHorizontal: 32,
  },
  loadingStatusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 16,
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
    backgroundColor: '#666666',
    marginHorizontal: 3,
  },
  scrollContent: { flexGrow: 1, justifyContent: 'flex-start', paddingHorizontal: 16, paddingBottom: 40, paddingTop: 60 },
  logoContainer: { alignItems: 'center', marginBottom: 16 },
  logo: { width: 60, height: 60, marginBottom: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 32, fontFamily: 'cursive' },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 8, padding: 2, marginBottom: 20 },
  toggleButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  toggleButtonActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: 13, color: '#666', fontWeight: '500' },
  toggleTextActive: { color: '#333', fontWeight: '600' },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 13, color: '#333', marginBottom: 6, fontWeight: '500' },
  passwordLabelContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  forgotPassword: { fontSize: 11, color: '#333', textDecorationLine: 'underline' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 10, fontSize: 13, backgroundColor: '#fff', color: '#000' },
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, backgroundColor: '#fff', paddingHorizontal: 10 },
  passwordInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#000' },
  eyeIcon: { padding: 6 },
  signInButton: { backgroundColor: '#000', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 16, marginBottom: 32 },
  signInButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  separatorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  separatorLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  separatorText: { marginHorizontal: 10, fontSize: 11, color: '#999', fontWeight: '500' },
  socialCircleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16, gap: 32 },
  socialCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, backgroundColor: '#f5f5f5' },
  termsContainer: { marginTop: 20, alignItems: 'center' },
  termsText: { fontSize: 11, color: '#999', textAlign: 'center' },
  termsLink: { color: '#333', textDecorationLine: 'underline' },
  adminNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
});

export default LoginSignUpScreen;
