/**
 * AccountBlockedScreen - Shows suspension or deletion message
 * Displays the reason and prevents access to the app
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors, SPACING, SHADOWS, RADIUS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';

interface AccountBlockedScreenProps {
  status?: 'suspended' | 'deleted';
  reason?: string;
  email?: string;
  suspendedAt?: string;
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
}

/* ═══ ICONS ═══ */
const XCircleIcon = ({ color, size = 64 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M15 9l-6 6M9 9l6 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const BanIcon = ({ color, size = 64 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M4.93 4.93l14.14 14.14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const LogOutIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const AccountBlockedScreen: React.FC<AccountBlockedScreenProps> = ({
  status = 'suspended',
  reason,
  email,
  suspendedAt,
  navigate,
  resetTo,
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

  const handleLogout = async () => {
    // Clear all auth data
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('userData');
    
    // Navigate back to login
    resetTo?.('loginSignUp');
  };

  const isDeleted = status === 'deleted';
  const iconColor = COLORS.error;
  const bgColor = COLORS.error + '12';
  const borderColor = COLORS.error + '30';

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    headerControls: {
      flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
      gap: 12, paddingHorizontal: 24, paddingVertical: SPACING.sm,
    },
    controlBtn: {
      width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface,
      borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
    },
    scroll: { flex: 1 },
    content: { padding: 24, paddingTop: 40, paddingBottom: 120, alignItems: 'center' },

    /* Status Card */
    statusCard: {
      backgroundColor: bgColor,
      borderWidth: 2,
      borderColor: borderColor,
      borderRadius: 28,
      padding: 40,
      alignItems: 'center',
      width: '100%',
      maxWidth: 500,
      ...SHADOWS.large,
    },
    iconCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: COLORS.error + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '900',
      color: COLORS.error,
      marginBottom: 12,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
    },

    /* Reason Box */
    reasonBox: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      marginBottom: 24,
    },
    reasonLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.error,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    reasonText: {
      fontSize: 15,
      color: COLORS.text,
      lineHeight: 22,
      fontStyle: 'italic',
    },

    /* Info Box */
    infoBox: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      marginBottom: 24,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    infoRowLast: {
      borderBottomWidth: 0,
    },
    infoLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.textMuted,
    },
    infoValue: {
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.text,
    },

    /* Actions */
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: COLORS.primary,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 16,
      width: '100%',
      ...SHADOWS.medium,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    /* Help Text */
    helpText: {
      fontSize: 13,
      color: COLORS.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginTop: 24,
      paddingHorizontal: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerControls}>
        <TouchableOpacity onPress={cycleLanguage} style={styles.controlBtn} activeOpacity={0.7}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.primary }}>{language.toUpperCase()}</Text>
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

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.iconCircle}>
            {isDeleted ? <BanIcon color={iconColor} /> : <XCircleIcon color={iconColor} />}
          </View>

          <Text style={styles.title}>
            {isDeleted ? t('account_deleted') || 'Account Deleted' : t('account_suspended') || 'Account Suspended'}
          </Text>

          <Text style={styles.subtitle}>
            {isDeleted
              ? t('account_deletedMessage') || 'Your account has been permanently deleted by an administrator. You can no longer access this application.'
              : t('account_suspendedMessage') || 'Your account has been suspended by an administrator. You cannot access the application until the suspension is lifted.'}
          </Text>

          {reason && (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>
                {isDeleted ? t('account_deletionReason') || 'Deletion Reason' : t('account_suspensionReason') || 'Suspension Reason'}
              </Text>
              <Text style={styles.reasonText}>"{reason}"</Text>
            </View>
          )}

          <View style={styles.infoBox}>
            {email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('profile_email') || 'Email'}</Text>
                <Text style={styles.infoValue}>{email}</Text>
              </View>
            )}
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>
                {isDeleted ? t('account_deletedOn') || 'Deleted On' : t('account_suspendedOn') || 'Suspended On'}
              </Text>
              <Text style={styles.infoValue}>
                {suspendedAt ? new Date(suspendedAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleLogout} activeOpacity={0.8}>
            <LogOutIcon color="#FFFFFF" />
            <Text style={styles.actionButtonText}>{t('auth_logout') || 'Log Out'}</Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            {isDeleted
              ? t('account_deletedHelp') || 'If you believe this is a mistake, please contact support.'
              : t('account_suspendedHelp') || 'If you believe this is a mistake or would like to appeal, please contact support.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default AccountBlockedScreen;
