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
            throw new Error(data?.error || 'Authentication failed');
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
          <View style={styles.logo}>
            <View style={styles.logoInner} />
          </View>
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
                  <Text style={styles.eyeIconText}>{showPassword ? '👁' : '👁'}</Text>
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
                  <Text style={styles.eyeIconText}>{showPassword ? '👁' : '👁'}</Text>
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
                    <Text style={styles.eyeIconText}>
                      {showConfirmPassword ? '👁' : '👁'}
                    </Text>
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
              <TouchableOpacity style={[styles.socialCircle, { backgroundColor: '#000' }]}>
                <Text style={styles.socialCircleText}>G</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialCircle, { backgroundColor: '#000' }]}>
                <Text style={styles.socialCircleText}>f</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialCircle, { backgroundColor: '#000' }]}>
                <Text style={styles.socialCircleText}>X</Text>
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
  logo: { width: 60, height: 60, backgroundColor: '#000', borderRadius: 8, justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '45deg' }], marginBottom: 16 },
  logoInner: { width: 30, height: 30, backgroundColor: '#fff', borderRadius: 4, transform: [{ rotate: '45deg' }] },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 32 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 8, padding: 2, marginBottom: 20 },
  toggleButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  toggleButtonActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: 13, color: '#666', fontWeight: '500' },
  toggleTextActive: { color: '#333', fontWeight: '600' },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 13, color: '#333', marginBottom: 6, fontWeight: '500' },
  passwordLabelContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  forgotPassword: { fontSize: 11, color: '#333', textDecorationLine: 'underline' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 10, fontSize: 13, backgroundColor: '#fff' },
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, backgroundColor: '#fff', paddingHorizontal: 10 },
  passwordInput: { flex: 1, paddingVertical: 10, fontSize: 13 },
  eyeIcon: { padding: 6 },
  eyeIconText: { fontSize: 18 },
  signInButton: { backgroundColor: '#000', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 16, marginBottom: 32 },
  signInButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  separatorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  separatorLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  separatorText: { marginHorizontal: 10, fontSize: 11, color: '#999', fontWeight: '500' },
  socialCircleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16, gap: 32 },
  socialCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  socialCircleText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
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
