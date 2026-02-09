import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { API_URL } from '../config/api.config';
import { getColors, SPACING, SHADOWS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { Logo } from '../components/Logo';

interface EmailVerificationScreenProps {
  email: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    accountType: string;
    accountStatus: string;
  };
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string, params?: Record<string, any>) => void;
  onAuthenticated?: () => void;
}

export default function EmailVerificationScreen({
  email,
  user,
  navigate: _navigate,
  resetTo,
  onAuthenticated,
}: EmailVerificationScreenProps) {
  const { mode } = useTheme();
  const COLORS = getColors(mode);

  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Start countdown timer for resend button
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const verifyEmail = async () => {
    const code = verificationCode.trim();
    if (!code) {
      setErrorMessage('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));

        setStatusMessage('Email verified successfully!');

        // Navigate to main app after a brief moment
        setTimeout(() => {
          onAuthenticated?.();
        }, 600);
      } else {
        setErrorMessage(data.error || 'Verification failed. Please check the code and try again.');
      }
    } catch (error) {
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (resendTimer > 0) return;

    setIsResending(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage('New verification code sent to your email!');
        setResendTimer(60); // 60 seconds cooldown
      } else {
        setErrorMessage(data.error || 'Failed to resend code');
      }
    } catch (error) {
      setErrorMessage('Network error. Please check your connection.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    resetTo?.('loginSignup', { initialMode: 'login' });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scroll: { flex: 1 },
    content: { 
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
      justifyContent: 'center',
    },
    
    logoWrap: { alignItems: 'center', marginBottom: 32 },
    
    heading: { 
      fontSize: 28, 
      fontWeight: '700', 
      color: COLORS.text, 
      marginBottom: 8,
      textAlign: 'center',
    },
    subheading: { 
      fontSize: 15, 
      color: COLORS.textSecondary, 
      marginBottom: 40,
      textAlign: 'center',
      lineHeight: 22,
    },
    emailText: {
      fontWeight: '600',
      color: COLORS.primary,
    },
    
    form: { marginBottom: 24 },
    
    successBanner: {
      backgroundColor: COLORS.successBg,
      borderWidth: 1,
      borderColor: COLORS.success,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    successText: {
      color: COLORS.success,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    errorBanner: {
      backgroundColor: COLORS.errorBg,
      borderWidth: 1,
      borderColor: COLORS.error,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    errorText: {
      color: COLORS.error,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.textSecondary,
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    input: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 24,
      color: COLORS.text,
      marginBottom: 20,
      textAlign: 'center',
      letterSpacing: 8,
      fontWeight: '700',
      minHeight: 56,
    },
    
    button: {
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 20,
      minHeight: 52,
      ...SHADOWS.medium,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    
    resendContainer: { alignItems: 'center', marginBottom: 24 },
    resendText: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginBottom: 8,
    },
    resendButton: {
      fontSize: 15,
      fontWeight: '600',
      color: COLORS.primary,
      paddingVertical: 8,
    },
    resendButtonDisabled: { color: COLORS.textMuted },
    
    backButton: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    backButtonText: {
      fontSize: 15,
      color: COLORS.textSecondary,
      fontWeight: '500',
    },
  });

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
        
        <Text style={styles.heading}>Verify Your Email</Text>
        <Text style={styles.subheading}>
          We've sent a 6-digit code to{'\n'}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        <View style={styles.form}>
          {/* Status/Error Messages */}
          {statusMessage ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{statusMessage}</Text>
            </View>
          ) : null}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="000000"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="default"
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            accessibilityLabel="Enter verification code"
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={verifyEmail}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Verify your email address"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Verify Email</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity
              onPress={resendCode}
              disabled={resendTimer > 0 || isResending}
              accessibilityRole="button"
              accessibilityLabel={resendTimer > 0 ? `Resend code available in ${resendTimer} seconds` : 'Resend verification code'}
            >
              <Text
                style={[
                  styles.resendButton,
                  (resendTimer > 0 || isResending) && styles.resendButtonDisabled,
                ]}
              >
                {isResending
                  ? 'Sending...'
                  : resendTimer > 0
                  ? `Resend in ${resendTimer}s`
                  : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToLogin}
          accessibilityRole="button"
          accessibilityLabel="Go back to login screen"
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
