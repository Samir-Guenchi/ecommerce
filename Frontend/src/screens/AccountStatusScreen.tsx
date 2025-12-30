import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { profileAPI } from '../services/api.service';

// Status Icon
const StatusIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
      fill="#666"
    />
  </Svg>
);

const AccountStatusScreen = () => {
  const [loading, setLoading] = useState(true);
  const [accountStatus, setAccountStatus] = useState({
    status: 'Pending',
    verificationLevel: 'Level 0',
    emailVerified: false,
    phoneVerified: false,
    identityVerified: false,
    lastVerified: null as string | null,
  });

  useEffect(() => {
    const loadAccountStatus = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfile();
        const user = response.user;
        
        // Determine verification level based on verified fields
        let verificationLevel = 'Level 0';
        let verifiedCount = 0;
        if (user.emailVerified) verifiedCount++;
        if (user.phoneVerified) verifiedCount++;
        if (user.identityVerified) verifiedCount++;
        
        if (verifiedCount === 1) verificationLevel = 'Level 1';
        else if (verifiedCount === 2) verificationLevel = 'Level 2';
        else if (verifiedCount === 3) verificationLevel = 'Level 3';

        setAccountStatus({
          status: user.accountStatus === 'active' ? 'Verified' : user.accountStatus === 'suspended' ? 'Suspended' : 'Pending',
          verificationLevel,
          emailVerified: user.emailVerified || false,
          phoneVerified: user.phoneVerified || false,
          identityVerified: user.identityVerified || false,
          lastVerified: user.updatedAt || null,
        });
      } catch (error: any) {
        console.error('Error loading account status:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAccountStatus();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={{ marginTop: 12, fontSize: 14, color: '#666' }}>Loading account status...</Text>
      </View>
    );
  }

  const StatusBadge = ({ status, verified }: { status: string; verified: boolean }) => (
    <View style={[styles.badge, verified ? styles.badgeVerified : styles.badgePending]}>
      <Text style={[styles.badgeText, verified ? styles.badgeTextVerified : styles.badgeTextPending]}>
        {verified ? '✓ Verified' : 'Pending'}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <StatusIcon />
        </View>
      </View>
      <Text style={styles.heading}>Account Status</Text>
      <Text style={styles.subheading}>
        View your account status and verification details.
      </Text>

      <View style={styles.formSection}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Account Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusValue}>{accountStatus.status}</Text>
            <StatusBadge status={accountStatus.status} verified={true} />
          </View>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Verification Level</Text>
          <Text style={styles.statusValue}>{accountStatus.verificationLevel}</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Email Verification</Text>
          <StatusBadge status="Email" verified={accountStatus.emailVerified} />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Phone Verification</Text>
          <StatusBadge status="Phone" verified={accountStatus.phoneVerified} />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Identity Verification</Text>
          <StatusBadge status="Identity" verified={accountStatus.identityVerified} />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Last Verified</Text>
          <Text style={styles.statusValue}>{accountStatus.lastVerified}</Text>
        </View>
      </View>

      <Text style={styles.infoText}>
        Complete all verifications to unlock full account features and increase your trust score.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 35,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    marginBottom: 8,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeVerified: {
    backgroundColor: '#E8F5E9',
  },
  badgePending: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextVerified: {
    color: '#2E7D32',
  },
  badgeTextPending: {
    color: '#F57C00',
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default AccountStatusScreen;
