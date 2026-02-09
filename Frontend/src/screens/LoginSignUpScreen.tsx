import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { getColors, SPACING, SHADOWS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { Logo } from '../components/Logo';
import { API_URL } from '../config/api.config';

interface LoginSignUpScreenProps {
  initialMode?: 'login' | 'signup';
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
  onAuthenticated?: () => void;
}

// Social Icons
const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </Svg>
);

const FacebookIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </Svg>
);

const LoginSignUpScreen: React.FC<LoginSignUpScreenProps> = ({
  initialMode = 'signup',
  navigate,
  resetTo,
  onAuthenticated,
}) => {
  const { mode } = useTheme();
  const COLORS = getColors(mode);
  
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scroll: { flex: 1 },
    content: { 
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
    },
    
    logoWrap: { alignItems: 'center', marginBottom: 40 },
    
    heading: { 
      fontSize: 28, 
      fontWeight: '700', 
      color: COLORS.text, 
      marginBottom: 8,
    },
    subheading: { 
      fontSize: 15, 
      color: COLORS.textSecondary, 
      marginBottom: 32,
    },
    
    tabs: {
      flexDirection: 'row',
      backgroundColor: COLORS.surface,
      borderRadius: 12,
      padding: 4,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    tabActive: {
      backgroundColor: COLORS.primary,
    },
    tabText: {
      fontSize: 15,
      fontWeight: '600',
      color: COLORS.textSecondary,
    },
    tabTextActive: {
      color: '#FFFFFF',
    },
    
    form: { gap: 20 },
    
    inputGroup: { gap: 8 },
    label: { 
      fontSize: 14, 
      fontWeight: '600', 
      color: COLORS.text,
    },
    input: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: COLORS.text,
    },
    
    errorBox: {
      backgroundColor: COLORS.error + '15',
      borderWidth: 1,
      borderColor: COLORS.error + '40',
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      fontSize: 14,
      color: COLORS.error,
      fontWeight: '500',
    },
    
    btn: {
      backgroundColor: COLORS.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 12,
      ...SHADOWS.medium,
    },
    btnDisabled: {
      opacity: 0.6,
    },
    btnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: COLORS.border,
    },
    dividerText: {
      fontSize: 13,
      color: COLORS.textMuted,
      fontWeight: '500',
    },
    
    socialBtns: { gap: 12 },
    socialBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 10,
    },
    socialBtnText: {
      fontSize: 15,
      fontWeight: '600',
      color: COLORS.text,
    },
    
    footer: {
      marginTop: 24,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    link: {
      color: COLORS.primary,
      fontWeight: '600',
    },
  });

  const handleAuth = async () => {
    setError('');
    
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = isLogin
        ? { email, password }
        : { fullName: name, email, password };
      
      const response = await fetch(`${API_URL}/auth/${isLogin ? 'login' : 'signup'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.error || 'Authentication failed');
      }
      
      if (data?.needsVerification) {
        navigate?.('emailVerification', {
          email: payload.email,
          user: data.user,
        });
        return;
      }
      
      if (data?.token) {
        await AsyncStorage.setItem('authToken', data.token);
        onAuthenticated?.();
        resetTo?.('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Check if OAuth is available
      const response = await fetch(`${API_URL}/auth/google`);
      const data = await response.json();
      
      if (response.status === 501) {
        setError(data.message || 'Google sign-in not available yet');
        return;
      }
      
      // If OAuth is configured, open the URL
      const googleAuthUrl = `${API_URL}/auth/google`;
      const supported = await Linking.canOpenURL(googleAuthUrl);
      
      if (supported) {
        await Linking.openURL(googleAuthUrl);
      } else {
        setError('Cannot open Google sign in');
      }
    } catch (err: any) {
      setError(err.message || 'Google sign in not available');
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      // Check if OAuth is available
      const response = await fetch(`${API_URL}/auth/facebook`);
      const data = await response.json();
      
      if (response.status === 501) {
        setError(data.message || 'Facebook sign-in not available yet');
        return;
      }
      
      // If OAuth is configured, open the URL
      const facebookAuthUrl = `${API_URL}/auth/facebook`;
      const supported = await Linking.canOpenURL(facebookAuthUrl);
      
      if (supported) {
        await Linking.openURL(facebookAuthUrl);
      } else {
        setError('Cannot open Facebook sign in');
      }
    } catch (err: any) {
      setError(err.message || 'Facebook sign in not available');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <Logo variant="full" size={64} />
        </View>
        
        <Text style={styles.heading}>
          {isLogin ? 'Welcome back' : 'Create account'}
        </Text>
        <Text style={styles.subheading}>
          {isLogin ? 'Sign in to continue' : 'Start selling across Algeria'}
        </Text>
        
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.tabActive]}
            onPress={() => setIsLogin(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.tabActive]}
            onPress={() => setIsLogin(false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
        
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        
        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>
          
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnText}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <View style={styles.socialBtns}>
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
            disabled={loading}
          >
            <GoogleIcon />
            <Text style={styles.socialBtnText}>Continue with Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={handleFacebookSignIn}
            activeOpacity={0.8}
            disabled={loading}
          >
            <FacebookIcon />
            <Text style={styles.socialBtnText}>Continue with Facebook</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Text 
              style={styles.link}
              onPress={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginSignUpScreen;
