import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import { profileAPI } from '../services/api.service';
import { useTranslation } from '../i18n';
import BottomNav, { BottomTabId } from './BottomNav';

/* ─── Icon helpers ─── */
const ChevronRight = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18L15 12L9 6" stroke={COLORS.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ProfileIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21V19C20 17.94 19.58 16.92 18.83 16.17C18.08 15.42 17.06 15 16 15H8C6.94 15 5.92 15.42 5.17 16.17C4.42 16.92 4 17.94 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <SvgCircle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
  </Svg>
);

const AccountTypeIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 17L12 22L22 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 12L12 17L22 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const StatusIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M22 11.08V12C21.99 14.52 21.14 16.96 19.59 18.94C18.03 20.92 15.87 22.27 13.44 22.78C11.01 23.29 8.49 22.93 6.29 21.78C4.1 20.62 2.37 18.73 1.42 16.42C0.47 14.1 0.34 11.51 1.06 9.1C1.78 6.69 3.3 4.63 5.37 3.25C7.44 1.87 9.93 1.25 12.41 1.49C14.89 1.73 17.18 2.82 18.93 4.56" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 4L12 14.01L9 11.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrackingIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <SvgCircle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const BillingIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H21C22.1 20 23 19.1 23 18V6C23 4.9 22.1 4 21 4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M1 10H23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PaymentIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 5H9.5C8.57 5 7.68 5.37 7.02 6.02C6.37 6.68 6 7.57 6 8.5C6 9.43 6.37 10.32 7.02 10.98C7.68 11.63 8.57 12 9.5 12H14.5C15.43 12 16.32 12.37 16.98 13.02C17.63 13.68 18 14.57 18 15.5C18 16.43 17.63 17.32 16.98 17.98C16.32 18.63 15.43 19 14.5 19H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DeliveryIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M16 3H1V16H16V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 8H20L23 11V16H16V8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <SvgCircle cx="5.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2" />
    <SvgCircle cx="18.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2" />
  </Svg>
);

const TaxIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M4 7V4H20V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 20H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 4V20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LocationIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61 3.95 5.32 5.64 3.64C7.32 1.95 9.61 1 12 1C14.39 1 16.68 1.95 18.36 3.64C20.05 5.32 21 7.61 21 10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <SvgCircle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const NotificationIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 006 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.69 21.9 12.35 22 12 22C11.65 22 11.31 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LanguageIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <SvgCircle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M2 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 2C14.5 4.74 15.92 8.29 16 12C15.92 15.71 14.5 19.26 12 22C9.5 19.26 8.08 15.71 8 12C8.08 8.29 9.5 4.74 12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PolicyIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 16V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 8H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UsersIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M17 21V19C17 17.94 16.58 16.92 15.83 16.17C15.08 15.42 14.06 15 13 15H5C3.94 15 2.92 15.42 2.17 16.17C1.42 16.92 1 17.94 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <SvgCircle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path d="M23 21V19C23 18.11 22.7 17.25 22.16 16.55C21.62 15.85 20.86 15.35 20 15.13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 3.13C16.86 3.35 17.62 3.85 18.17 4.55C18.71 5.26 19.01 6.12 19.01 7C19.01 7.89 18.71 8.76 18.17 9.46C17.62 10.16 16.86 10.66 16 10.88" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LogOutIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5C4.47 21 3.96 20.79 3.59 20.41C3.21 20.04 3 19.53 3 19V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H9" stroke={COLORS.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 17L21 12L16 7" stroke={COLORS.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 12H9" stroke={COLORS.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ─── Section color map ─── */
const SECTION_COLORS = {
  account: '#6C5CE7',
  store: '#00CEC9',
  preferences: '#A29BFE',
  support: '#FD79A8',
};

/* ─── SettingItem component ─── */
interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isLast?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, subtitle, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.settingItem, !isLast && styles.settingItemBorder]}
    onPress={onPress}
    activeOpacity={0.6}
  >
    <View style={styles.settingLeft}>
      {icon}
      <View style={styles.settingTextWrap}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
    <ChevronRight />
  </TouchableOpacity>
);

/* ─── Section label ─── */
const SectionHeader = ({ label }: { label: string }) => (
  <Text style={styles.sectionLabel}>{label}</Text>
);

/* ─── Icon badge ─── */
const IconBadge = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <View style={[styles.iconBadge, { backgroundColor: color + '18' }]}>
    {children}
  </View>
);

/* ─── Main screen ─── */
interface UserSettingsScreenProps {
  navigate?: (screenId: string) => void;
  resetTo?: (screenId: string) => void;
  onLogout?: () => void;
}

const UserSettingsScreen: React.FC<UserSettingsScreenProps> = ({ navigate, resetTo, onLogout }) => {
  const { t, isRTL } = useTranslation();
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { user } = await profileAPI.getProfile();
        setProfileName(user.fullName || 'Store Owner');
        setProfileEmail(user.email || '');
      } catch {
        setProfileName('Store Owner');
      } finally {
        setProfileLoading(false);
      }
    };
    load();
  }, []);

  const go = (id: string) => navigate?.(id) ?? console.log(`Pressed: ${id}`);

  const handleTabPress = (tab: BottomTabId) => {
    if (tab === 'userSettings') return;
    resetTo ? resetTo(tab) : navigate?.(tab);
  };

  const initials = profileName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SO';

  return (
    <View style={styles.outer}>
      <ScrollView style={styles.scroller} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Profile header ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {profileLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {profileLoading ? 'Loading…' : profileName}
            </Text>
            {profileEmail ? (
              <Text style={styles.profileEmail} numberOfLines={1}>{profileEmail}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.profileEditBtn}
            onPress={() => go('profileSettings')}
            activeOpacity={0.7}
          >
            <Text style={styles.profileEditText}>{t('common_edit')}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Account ── */}
        <SectionHeader label={t('settings_account')} />
        <View style={styles.sectionCard}>
          <SettingItem
            icon={<IconBadge color={SECTION_COLORS.account}><ProfileIcon color={SECTION_COLORS.account} /></IconBadge>}
            title={t('settings_profileSettings')}
            subtitle={t('settings_profileSettingsDesc')}
            onPress={() => go('profileSettings')}
          />
          <SettingItem
            icon={<IconBadge color={SECTION_COLORS.account}><AccountTypeIcon color={SECTION_COLORS.account} /></IconBadge>}
            title={t('settings_accountType')}
            subtitle={t('settings_accountTypeDesc')}
            onPress={() => go('userAccountType')}
          />
          <SettingItem
            icon={<IconBadge color={SECTION_COLORS.account}><StatusIcon color={SECTION_COLORS.account} /></IconBadge>}
            title={t('settings_accountStatus')}
            subtitle={t('settings_accountStatusDesc')}
            onPress={() => go('accountStatus')}
            isLast
          />
        </View>

        {/* ── Store Management ── */}
        <SectionHeader label={t('settings_storeManagement')} />
        <View style={styles.sectionCard}>
          <SettingItem
            icon={<IconBadge color={SECTION_COLORS.store}><TrackingIcon color={SECTION_COLORS.store} /></IconBadge>}
            title={t('settings_tracking')}
            subtitle={t('settings_trackingDesc')}
            onPress={() => go('trackingSystem')}
          />
          <SettingItem
            icon={<IconBadge color={SECTION_COLORS.store}><BillingIcon color={SECTION_COLORS.store} /></IconBadge>}
            title={t('settings_planBilling')}
            subtitle={t('settings_planBillingDesc')}
            onPress={() => go('planBilling')}
          />
          <SettingItem
            icon={<IconBadge color={SECTION_COLORS.store}><PaymentIcon color={SECTION_COLORS.store} /></IconBadge>}
            title={t('settings_payments')}
            subtitle={t('settings_paymentsDesc')}
            onPress={() => go('payments')}
          />
          <SettingItem
            icon={<IconBadge color={SECTION_COLORS.store}><DeliveryIcon color={SECTION_COLORS.store} /></IconBadge>}
            title={t('settings_delivery')}
            subtitle={t('settings_deliveryDesc')}
            onPress={() => go('delivery')}
          />
          <SettingItem
            icon={<IconBadge color={SECTION_COLORS.store}><TaxIcon color={SECTION_COLORS.store} /></IconBadge>}
            title={t('settings_taxes')}
            subtitle={t('settings_taxesDesc')}
            onPress={() => go('taxesDuties')}
          />
          <SettingItem
            icon={<IconBadge color={SECTION_COLORS.store}><LocationIcon color={SECTION_COLORS.store} /></IconBadge>}
            title={t('settings_locations')}
            subtitle={t('settings_locationsDesc')}
            onPress={() => go('locations')}
            isLast
          />
        </View>

        {/* ── Preferences ── */}
        <SectionHeader label={t('settings_preferences')} />
        <View style={styles.sectionCard}>
          <SettingItem
            icon={<IconBadge color={SECTION_COLORS.preferences}><NotificationIcon color={SECTION_COLORS.preferences} /></IconBadge>}
            title={t('settings_notifications')}
            subtitle={t('settings_notificationsDesc')}
            onPress={() => go('notifications')}
          />
          <SettingItem
            icon={<IconBadge color={SECTION_COLORS.preferences}><LanguageIcon color={SECTION_COLORS.preferences} /></IconBadge>}
            title={t('settings_languages')}
            subtitle={t('settings_languagesDesc')}
            onPress={() => go('languages')}
            isLast
          />
        </View>

        {/* ── Support & Legal ── */}
        <SectionHeader label={t('settings_supportLegal')} />
        <View style={styles.sectionCard}>
          <SettingItem
            icon={<IconBadge color={SECTION_COLORS.support}><PolicyIcon color={SECTION_COLORS.support} /></IconBadge>}
            title={t('settings_policies')}
            subtitle={t('settings_policiesDesc')}
            onPress={() => go('policies')}
          />
          <SettingItem
            icon={<IconBadge color={SECTION_COLORS.support}><UsersIcon color={SECTION_COLORS.support} /></IconBadge>}
            title={t('settings_usersPermissions')}
            subtitle={t('settings_usersPermissionsDesc')}
            onPress={() => go('usersPermissions')}
            isLast
          />
        </View>

        {/* ── Logout ── */}
        {onLogout && (
          <TouchableOpacity style={styles.logoutRow} onPress={onLogout} activeOpacity={0.6}>
            <LogOutIcon />
            <Text style={styles.logoutText}>{t('settings_logout')}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
      <BottomNav activeTab="userSettings" onTabPress={handleTabPress} />
    </View>
  );
};

/* ─── Styles ─── */
const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroller: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: 52,
    paddingBottom: 110,
  },

  /* Profile card */
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profileEditBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceHighlight,
  },
  profileEditText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  /* Sections */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },

  /* Setting item */
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: SPACING.md,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  /* Icon badge */
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Logout */
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '10',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: 10,
  },

  /* Footer */
  versionText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
});

export default UserSettingsScreen;