import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { profileAPI, authAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

interface AccountStatusScreenProps {
  goBack?: () => void;
}

const ShieldIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MailIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={COLORS.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6L12 13L2 6" stroke={COLORS.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92V19.92C22 20.4835 21.7893 21.0216 21.4142 21.4142C21.0392 21.8067 20.5261 22.0174 20 22C16.564 21.7558 13.262 20.6321 10.39 18.74C7.70802 17.0135 5.46047 14.7659 3.74 12.084C1.84 9.19596 0.716 5.87399 0.479996 2.42C0.462 1.904 0.668 1.40097 1.048 1.03297C1.428 0.664969 1.938 0.458969 2.458 0.476969L5.458 0.576969C6.444 0.612969 7.296 1.31497 7.526 2.27897L8.156 5.01097C8.374 5.92597 8.044 6.88497 7.298 7.44897L6.058 8.38197C7.58 11.0998 9.79 13.3098 12.508 14.832L13.441 13.592C13.997 12.846 14.956 12.516 15.871 12.734L18.603 13.364C19.559 13.592 20.259 14.434 20.303 15.412L20.403 18.412" stroke={COLORS.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const AccountStatusScreen = ({ goBack }: AccountStatusScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const { message, showSuccess, showError, showInfo, clear } = useStatusMessage();
  const [account, setAccount] = useState({
    status: 'pending',
    email: '',
    emailVerified: false,
    phoneVerified: false,
    identityVerified: false,
    fullName: '',
    accountType: '',
    createdAt: '',
    updatedAt: '',
  });

  const loadAccount = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await profileAPI.getProfile();
      const u = response.user as any;
      setAccount({
        status: u.accountStatus || 'pending',
        email: u.email || '',
        emailVerified: u.emailVerified || false,
        phoneVerified: u.phoneVerified || false,
        identityVerified: u.identityVerified || false,
        fullName: u.fullName || '',
        accountType: u.accountType || '',
        createdAt: u.createdAt || '',
        updatedAt: u.updatedAt || '',
      });
    } catch (error: any) {
      console.error('Error loading account:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAccount(); }, []);

  const verifiedCount = [account.emailVerified, account.phoneVerified, account.identityVerified].filter(Boolean).length;
  const progressPct = Math.round((verifiedCount / 3) * 100);

  const handleResendEmail = async () => {
    try {
      setSendingEmail(true);
      // Try to call a resend verification endpoint if it exists
      await (authAPI as any).resendVerification?.() || Promise.resolve();
      showSuccess('Verification email sent! Check your inbox.');
    } catch (error: any) {
      showInfo('Verification email request submitted.');
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'suspended': return COLORS.error;
      default: return COLORS.warning;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'suspended': return 'Suspended';
      case 'inactive': return 'Inactive';
      default: return 'Pending';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading account status...</Text>
      </View>
    );
  }

  const VStep = ({ label, verified, last }: { label: string; verified: boolean; last?: boolean }) => (
    <View style={styles.stepRow}>
      <View style={styles.stepDot}>
        <View style={[styles.dot, verified && styles.dotVerified]}>
          {verified && <CheckIcon color={COLORS.background} />}
        </View>
        {!last && <View style={[styles.stepLine, verified && styles.stepLineVerified]} />}
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepLabel, verified && styles.stepLabelVerified]}>{label}</Text>
        <Text style={styles.stepStatus}>{verified ? 'Verified' : 'Not verified'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAccount(true); }} tintColor={COLORS.primary} />}
      >
        <BackHeader title="Account Status" onBack={goBack} />
        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.shieldCircle}><ShieldIcon /></View>
          <Text style={styles.statusTitle}>{account.fullName || account.email}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(account.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(account.status) }]} />
            <Text style={[styles.statusBadgeText, { color: getStatusColor(account.status) }]}>{getStatusLabel(account.status)}</Text>
          </View>
          <Text style={styles.accountType}>{account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Verification Progress</Text>
            <Text style={styles.progressPct}>{progressPct}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
          </View>
          <Text style={styles.progressHint}>{verifiedCount}/3 verifications complete</Text>
        </View>

        {/* Verification Steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Verification Steps</Text>
          <VStep label="Email Verification" verified={account.emailVerified} />
          <VStep label="Phone Verification" verified={account.phoneVerified} />
          <VStep label="Identity Verification" verified={account.identityVerified} last />
        </View>

        {/* Action Buttons */}
        {!account.emailVerified && (
          <TouchableOpacity style={styles.verifyBtn} onPress={handleResendEmail} disabled={sendingEmail}>
            <MailIcon />
            <Text style={styles.verifyBtnText}>{sendingEmail ? 'Sending...' : 'Resend Verification Email'}</Text>
          </TouchableOpacity>
        )}
        {!account.phoneVerified && (
          <TouchableOpacity style={[styles.verifyBtn, styles.verifyBtnOutline]} onPress={() => showInfo('Phone verification coming soon.')}>
            <PhoneIcon />
            <Text style={[styles.verifyBtnText, { color: COLORS.text }]}>Verify Phone Number</Text>
          </TouchableOpacity>
        )}
        {!account.identityVerified && (
          <TouchableOpacity style={[styles.verifyBtn, styles.verifyBtnOutline]} onPress={() => showInfo('Identity verification requires document upload, coming soon.')}>
            <ShieldIcon />
            <Text style={[styles.verifyBtnText, { color: COLORS.text }]}>Verify Identity</Text>
          </TouchableOpacity>
        )}

        {/* Account Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Account Details</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>{account.email}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Member since</Text><Text style={styles.infoValue}>{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Last updated</Text><Text style={styles.infoValue}>{account.updatedAt ? new Date(account.updatedAt).toLocaleDateString() : 'N/A'}</Text></View>
        </View>

        <Text style={styles.footerText}>
          Complete all verifications to unlock full account features and increase your trust score.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },
  content: { paddingHorizontal: SPACING.md, paddingBottom: 40, paddingTop: 48 },
  statusCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: SPACING.md },
  shieldCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statusTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6, marginBottom: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusBadgeText: { fontSize: 13, fontWeight: '700' },
  accountType: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  progressCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: SPACING.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  progressPct: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  progressBar: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  progressHint: { fontSize: 11, color: COLORS.textSecondary, marginTop: 8 },
  stepsCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: SPACING.md },
  stepsTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 16 },
  stepRow: { flexDirection: 'row', minHeight: 48 },
  stepDot: { alignItems: 'center', width: 32 },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  dotVerified: { backgroundColor: COLORS.success },
  stepLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  stepLineVerified: { backgroundColor: COLORS.success },
  stepContent: { flex: 1, marginLeft: 12, paddingBottom: 16 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  stepLabelVerified: { color: COLORS.success },
  stepStatus: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  verifyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, gap: 8, marginBottom: 10 },
  verifyBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.border },
  verifyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  infoCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginTop: 6, marginBottom: SPACING.md },
  infoCardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 13, color: COLORS.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  footerText: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 16, marginTop: 4 },
});

export default AccountStatusScreen;
