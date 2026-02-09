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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const LoginSignUpScreen: React.FC<LoginSignUpScreenProps> = ({
  initialMode = 'login',
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
