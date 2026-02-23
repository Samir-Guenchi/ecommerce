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
import Svg, { Path, Circle } from 'react-native-svg';
import { getColors, SPACING, SHADOWS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Logo } from '../components/Logo';
import { API_URL } from '../config/api.config';

interface LoginSignUpScreenProps {
  initialMode?: 'login' | 'signup';
  accountType?: 'buyer' | 'seller' | 'delivery';
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
  accountType = 'buyer',
  navigate,
  resetTo,
  onAuthenticated,
}) => {
  const { mode, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const COLORS = getColors(mode);

  const cycleLanguage = () => {
    const languageOrder: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const currentIndex = languageOrder.indexOf(language);
    const nextIndex = (currentIndex + 1) % languageOrder.length;
    setLanguage(languageOrder[nextIndex]);
  };
  
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  const [showPasswordHints, setShowPasswordHints] = useState(false);

  // Password strength checker
  const checkPasswordStrength = (pwd: string) => {
    if (!pwd) {
      return { score: 0, feedback: '' };
    }

    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (pwd.length >= 8) {
      score += 1;
    } else {
      feedback.push(t('auth_passwordLength'));
    }

    // Uppercase check
    if (/[A-Z]/.test(pwd)) {
      score += 1;
    } else {
      feedback.push(t('auth_passwordUppercase'));
    }

    // Lowercase check
    if (/[a-z]/.test(pwd)) {
      score += 1;
    } else {
      feedback.push(t('auth_passwordLowercase'));
    }

    // Number check
    if (/[0-9]/.test(pwd)) {
      score += 1;
    } else {
      feedback.push(t('auth_passwordNumber'));
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      score += 1;
    } else {
      feedback.push(t('auth_passwordSpecial'));
    }

    const strengthLabels = ['', t('auth_passwordWeak'), t('auth_passwordFair'), t('auth_passwordGood'), t('auth_passwordStrong'), t('auth_passwordVeryStrong')];
    const strengthLabel = strengthLabels[score] || '';

    return {
      score,
      feedback: feedback.length > 0 ? `${t('auth_passwordMissing')}: ${feedback.join(', ')}` : strengthLabel,
    };
  };

  // Update password strength when password changes
  React.useEffect(() => {
    if (!isLogin && password) {
      setPasswordStrength(checkPasswordStrength(password));
    }
  }, [password, isLogin]);

  // Handle OAuth callback
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const oauthSuccess = urlParams.get('oauth');
      const oauthError = urlParams.get('error');

      if (token && oauthSuccess === 'success') {
        // Save token and fetch user data
        (async () => {
          try {
            setLoading(true);
            
            // Save token
            await AsyncStorage.setItem('accessToken', token);
            
            // Fetch user data
            const response = await fetch(`${API_URL}/users/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (!response.ok) {
              throw new Error('Failed to fetch user data');
            }
            
            const user = await response.json();
            
            // Save user data
            await AsyncStorage.setItem('user', JSON.stringify(user));
            
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Navigate based on user's accountType
            if (!user.accountType || user.accountType === 'buyer') {
              navigate?.('accountType');
            } else if (user.accountType === 'admin') {
              resetTo?.('adminDashboard');
            } else if (user.accountType === 'seller' || user.accountType === 'delivery') {
              // Check if documents are uploaded/verified
              if (user.accountStatus === 'pending') {
                navigate?.('documentUpload');
              } else if (user.accountStatus === 'active') {
                resetTo?.(user.accountType === 'seller' ? 'dashboard' : 'deliveryDashboard');
              } else {
                navigate?.('documentUpload');
              }
            } else {
              resetTo?.('buyerDashboard');
            }
          } catch (err) {
            console.error('OAuth callback error:', err);
            setError(t('auth_oauthFailed'));
            // Clear URL parameters even on error
            window.history.replaceState({}, document.title, window.location.pathname);
          } finally {
            setLoading(false);
          }
        })();
      } else if (oauthError) {
        setError(t('auth_oauthFailed'));
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scroll: { flex: 1 },
    headerControls: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    controlBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: { 
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
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
    
    passwordStrength: {
      marginTop: 8,
      gap: 6,
    },
    strengthBars: {
      flexDirection: 'row',
      gap: 4,
    },
    strengthBar: {
      flex: 1,
      height: 4,
      backgroundColor: COLORS.border,
      borderRadius: 2,
    },
    strengthText: {
      fontSize: 12,
      fontWeight: '600',
    },
    passwordHints: {
      marginTop: 8,
      padding: 12,
      backgroundColor: COLORS.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    hintsTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: 6,
    },
    hintItem: {
      fontSize: 12,
      color: COLORS.textSecondary,
      marginBottom: 2,
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
      setError(t('auth_fillAllFields'));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth_validEmail'));
      return;
    }
    
    if (!isLogin) {
      // Password strength validation for sign up
      if (passwordStrength.score < 3) {
        setError(t('auth_passwordTooWeak') + ' ' + passwordStrength.feedback);
        setShowPasswordHints(true);
        return;
      }

      if (password !== confirmPassword) {
        setError(t('auth_passwordsNoMatch'));
        return;
      }
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
        // Check for suspension or deletion
        if (data?.error && (data.error.includes('Account Suspended') || data.error.includes('Account Deleted'))) {
          // Extract reason from error message
          const reason = data.reason || data.error.split(': ')[1] || data.error;
          const accountStatus = data.accountStatus || (data.error.includes('Suspended') ? 'suspended' : 'deleted');
          
          // Navigate to account blocked screen with reason
          navigate?.('accountBlocked', {
            status: accountStatus,
            reason: reason,
            email: payload.email,
            suspendedAt: data.suspendedAt || new Date().toISOString(),
          });
          return;
        }
        
        throw new Error(data?.error || t('auth_failed'));
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
        await AsyncStorage.setItem('accessToken', data.token);
        
        // Save user data for later use
        if (data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        }
        
        // After signup - ALWAYS go to role selection first
        if (!isLogin) {
          navigate?.('accountType');
          return;
        }
        
        // Login flow - route based on existing account type and status
        const user = data.user;
        
        // No account type yet? Go to role selector
        if (!user?.accountType) {
          navigate?.('accountType');
          return;
        }
        
        // Admin goes to admin dashboard
        if (user.accountType === 'admin') {
          console.log('🔐 Admin user detected, navigating to adminDashboard');
          // Ensure user data is saved before navigation
          await AsyncStorage.setItem('userData', JSON.stringify(user));
          resetTo?.('adminDashboard');
          return;
        }
        
        // Buyer goes straight to buyer dashboard
        if (user.accountType === 'buyer') {
          resetTo?.('buyerDashboard');
          return;
        }
        
        // Seller and delivery: check document status
        if (user.accountType === 'seller' || user.accountType === 'delivery') {
          if (user.accountStatus === 'active' || user.accountStatus === 'verified') {
            resetTo?.(user.accountType === 'seller' ? 'dashboard' : 'deliveryDashboard');
          } else {
            navigate?.('documentUpload', { accountType: user.accountType });
          }
          return;
        }
        
        // Fallback
        resetTo?.('buyerDashboard');
      }
    } catch (err: any) {
      setError(err.message || t('auth_somethingWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Redirect to Google OAuth in same window
      const googleAuthUrl = `${API_URL}/auth/google`;
      
      // For web, redirect in same window
      if (Platform.OS === 'web') {
        window.location.href = googleAuthUrl;
      } else {
        // For mobile, use Linking
        const supported = await Linking.canOpenURL(googleAuthUrl);
        if (supported) {
          await Linking.openURL(googleAuthUrl);
        } else {
          setError(t('auth_googleUnavailable'));
        }
      }
    } catch (err: any) {
      setError(err.message || t('auth_googleUnavailable'));
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      // Facebook OAuth coming soon
      setError(t('auth_facebookSoon'));
    } catch (err: any) {
      setError(err.message || t('auth_facebookUnavailable'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Theme & Language Controls */}
      <View style={styles.headerControls}>
        <TouchableOpacity onPress={cycleLanguage} style={styles.controlBtn} activeOpacity={0.7}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
            <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={styles.controlBtn} activeOpacity={0.7}>
          {mode === 'light' ? (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="5" stroke={COLORS.text} strokeWidth="2" />
              <Path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
            </Svg>
          ) : (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
        </TouchableOpacity>
      </View>

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
          {isLogin ? t('auth_welcomeBack') : t('auth_createAccount')}
        </Text>
        <Text style={styles.subheading}>
          {isLogin ? t('auth_signInContinue') : t('auth_startSelling')}
        </Text>
        
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.tabActive]}
            onPress={() => setIsLogin(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
              {t('auth_signIn')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.tabActive]}
            onPress={() => setIsLogin(false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
              {t('auth_signUp')}
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
              <Text style={styles.label}>{t('auth_fullName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth_fullNamePlaceholder')}
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth_email')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth_emailPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('auth_password')}</Text>
            <TextInput
              style={styles.input}
              placeholder={isLogin ? t('auth_passwordPlaceholder') : t('auth_createPasswordPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (!isLogin) setShowPasswordHints(true);
              }}
              secureTextEntry
              editable={!loading}
            />
            {!isLogin && password && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        passwordStrength.score >= level && {
                          backgroundColor:
                            passwordStrength.score <= 2
                              ? COLORS.error
                              : passwordStrength.score === 3
                              ? COLORS.warning
                              : COLORS.success,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    {
                      color:
                        passwordStrength.score <= 2
                          ? COLORS.error
                          : passwordStrength.score === 3
                          ? COLORS.warning
                          : COLORS.success,
                    },
                  ]}
                >
                  {passwordStrength.feedback}
                </Text>
              </View>
            )}
            {!isLogin && showPasswordHints && passwordStrength.score < 3 && (
              <View style={styles.passwordHints}>
                <Text style={styles.hintsTitle}>{t('auth_passwordMustInclude')}</Text>
                <Text style={styles.hintItem}>• {t('auth_passwordLength')}</Text>
                <Text style={styles.hintItem}>• {t('auth_passwordUppercase')}</Text>
                <Text style={styles.hintItem}>• {t('auth_passwordLowercase')}</Text>
                <Text style={styles.hintItem}>• {t('auth_passwordNumber')}</Text>
                <Text style={styles.hintItem}>• {t('auth_passwordSpecial')}</Text>
              </View>
            )}
          </View>
          
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('auth_confirmPassword')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth_confirmPasswordPlaceholder')}
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
                {isLogin ? t('auth_signIn') : t('auth_createAccount')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('auth_orContinueWith')}</Text>
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
            <Text style={styles.socialBtnText}>{t('auth_continueGoogle')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={handleFacebookSignIn}
            activeOpacity={0.8}
            disabled={loading}
          >
            <FacebookIcon />
            <Text style={styles.socialBtnText}>{t('auth_continueFacebook')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isLogin ? t('auth_noAccount') : t('auth_haveAccount')}
            <Text 
              style={styles.link}
              onPress={() => setIsLogin(!isLogin)}
            >
              {isLogin ? t('auth_signUp') : t('auth_signIn')}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginSignUpScreen;
