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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { API_URL } from '../config/api.config';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          {/* Shield Icon */}
          <View style={styles.iconCircle}>
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
              <Path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill={COLORS.primary} />
            </Svg>
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to{' '}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
        </View>

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

          <Text style={styles.label} nativeID="code-label">Verification Code</Text>
          <TextInput
            style={styles.input}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Enter 6-digit code"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="default"
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            accessibilityLabelledBy="code-label"
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
              <ActivityIndicator color={COLORS.background} />
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.l,
    ...SHADOWS.glow,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 26,
    color: COLORS.text,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: 10,
    padding: SPACING.m,
    marginBottom: SPACING.m,
  },
  successText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 10,
    padding: SPACING.m,
    marginBottom: SPACING.m,
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
    marginBottom: SPACING.s,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.m,
    paddingVertical: 14,
    fontSize: 22,
    color: COLORS.text,
    marginBottom: SPACING.l,
    textAlign: 'center',
    letterSpacing: 6,
    fontWeight: '700',
    minHeight: 56,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: SPACING.l,
    minHeight: 48,
    ...SHADOWS.glow,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.s,
  },
  resendButton: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    minHeight: 44,
    lineHeight: 44,
  },
  resendButtonDisabled: {
    color: COLORS.textMuted,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: SPACING.m,
    minHeight: 48,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});