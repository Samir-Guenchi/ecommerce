import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, Modal,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import { confirmAction } from '../components/confirmAction';
import { userAPI } from '../services/api.service';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';

interface UsersPermissionsScreenProps { goBack?: () => void; }
interface User {
  id: number; email: string; fullName: string | null;
  accountType: string; accountStatus: string; createdAt: string; lastLogin: string | null;
}

const SunIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke="#FDB913" strokeWidth="2" />
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB913" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const MoonIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const EmptyUsersIcon = ({ color }: { color: string }) => (
  <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
    <Path d="M17 21V19C17 17.94 16.58 16.92 15.83 16.17C15.08 15.42 14.06 15 13 15H5C3.94 15 2.92 15.42 2.17 16.17C1.42 16.92 1 17.94 1 19V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.5" />
    <Path d="M23 21V19C23 18.11 22.7 17.25 22.16 16.55C21.62 15.85 20.86 15.35 20 15.13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 3.13C16.86 3.35 17.62 3.85 18.17 4.55C18.71 5.26 19.01 6.12 19.01 7C19.01 7.89 18.71 8.76 18.17 9.46C17.62 10.16 16.86 10.66 16 10.88" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UsersPermissionsScreen = ({ goBack }: UsersPermissionsScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const { message, showSuccess, showError, clear } = useStatusMessage();

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language as any) + 1) % langs.length]);
  };

  const fetchUsers = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const r = await userAPI.getAllUsers();
      setUsers(r.users || []);
    } catch (e: any) { showError(e.message || t('users_updateFailed')); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, []);

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      setEditSaving(true);
      await userAPI.updateUser(editUser.id, { fullName: editName.trim() || undefined, accountType: editRole as any });
      showSuccess(t('users_updated'));
      setEditUser(null);
      await fetchUsers();
    } catch (e: any) { showError(e.message || t('users_updateFailed')); }
    finally { setEditSaving(false); }
  };

  const handleUpdateStatus = async (userId: number, currentStatus: string) => {
    const next: Record<string, string> = { pending: 'active', active: 'suspended', suspended: 'inactive', inactive: 'pending' };
    const newStatus = next[currentStatus?.toLowerCase()] || 'active';
    const ok = await confirmAction(t('users_updateStatus'), t('users_changeStatusTo').replace('{status}', newStatus));
    if (!ok) return;
    try { await userAPI.updateUserStatus(userId, newStatus as any); showSuccess(t('users_statusUpdated')); await fetchUsers(); }
    catch (e: any) { showError(e.message || t('users_statusFailed')); }
  };

  const handleRemove = async (userId: number, name: string) => {
    const ok = await confirmAction(t('users_remove'), t('users_removeConfirm').replace('{name}', name));
    if (!ok) return;
    try { await userAPI.deleteUser(userId); showSuccess(t('users_removed')); await fetchUsers(); }
    catch (e: any) { showError(e.message || t('users_removeFailed')); }
  };

  const roleColors: Record<string, { bg: string; text: string }> = {
    admin: { bg: '#DC262618', text: '#DC2626' },
    seller: { bg: '#0D2C7418', text: '#0D2C74' },
    buyer: { bg: '#D9770618', text: '#D97706' },
  };
  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: COLORS.success + '18', text: COLORS.success },
    pending: { bg: COLORS.warning + '18', text: COLORS.warning },
    suspended: { bg: COLORS.error + '18', text: COLORS.error },
    inactive: { bg: COLORS.textMuted + '18', text: COLORS.textMuted },
  };

  const getRoleColor = (type: string) => roleColors[type?.toLowerCase()] || { bg: COLORS.border, text: COLORS.textMuted };
  const getStatusColor = (s: string) => statusColors[s?.toLowerCase()] || { bg: COLORS.warning + '18', text: COLORS.warning };

  const roles = ['admin', 'seller', 'buyer'];

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(true); }} tintColor={COLORS.primary} />}
      >
        {/* Header — back + title + controls in one row */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={goBack} activeOpacity={0.7}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d={isRTL ? 'M5 12H19M19 12L12 19M19 12L12 5' : 'M19 12H5M5 12L12 19M5 12L12 5'} stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: COLORS.text }]} numberOfLines={1}>{t('settings_usersPermissions')}</Text>
          <View style={[s.controls, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity style={[s.iconBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={cycleLanguage} activeOpacity={0.7}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.text }}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.iconBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={toggleTheme} activeOpacity={0.7}>
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </TouchableOpacity>
          </View>
        </View>

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* Stats row */}
        <View style={[s.statsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          {[
            { val: users.length, label: t('users_total'), color: COLORS.text },
            { val: users.filter(u => u.accountStatus === 'active').length, label: t('users_active'), color: COLORS.success },
            { val: users.filter(u => u.accountStatus === 'pending').length, label: t('users_pending'), color: COLORS.warning },
          ].map((item, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <Text style={[s.statVal, { color: item.color }]}>{item.val}</Text>
              <Text style={[s.statLabel, { color: COLORS.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* User list */}
        {users.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <EmptyUsersIcon color={COLORS.textMuted} />
            <Text style={[s.emptyTitle, { color: COLORS.text, marginTop: 16 }]}>{t('users_noUsers')}</Text>
            <Text style={[s.emptyDesc, { color: COLORS.textMuted }]}>{t('users_noUsersDesc')}</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {users.map((user) => {
              const rc = getRoleColor(user.accountType);
              const sc = getStatusColor(user.accountStatus);
              const initials = (user.fullName || user.email).charAt(0).toUpperCase();
              return (
                <View key={user.id} style={[s.userCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                  <View style={[s.cardTop, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[s.avatar, { backgroundColor: COLORS.primary + '20' }]}>
                      <Text style={[s.avatarText, { color: COLORS.primary }]}>{initials}</Text>
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <Text style={[s.userName, { color: COLORS.text }]}>{user.fullName || t('users_noName')}</Text>
                      <Text style={[s.userEmail, { color: COLORS.textMuted }]}>{user.email}</Text>
                    </View>
                  </View>
                  <View style={[s.badgeRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[s.badge, { backgroundColor: rc.bg }]}>
                      <Text style={[s.badgeText, { color: rc.text }]}>{user.accountType || 'N/A'}</Text>
                    </View>
                    <View style={[s.badge, { backgroundColor: sc.bg }]}>
                      <Text style={[s.badgeText, { color: sc.text }]}>{user.accountStatus || 'pending'}</Text>
                    </View>
                    {user.lastLogin && (
                      <Text style={[s.lastLogin, { color: COLORS.textMuted }]}>{t('users_lastLogin')} {new Date(user.lastLogin).toLocaleDateString()}</Text>
                    )}
                  </View>
                  <View style={[s.actionsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.primary + '12', borderColor: COLORS.primary + '30' }]}
                      onPress={() => { setEditUser(user); setEditName(user.fullName || ''); setEditRole(user.accountType); }} activeOpacity={0.7}>
                      <Text style={[s.actionBtnText, { color: COLORS.primary }]}>{t('common_edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.warning + '12', borderColor: COLORS.warning + '30' }]}
                      onPress={() => handleUpdateStatus(user.id, user.accountStatus)} activeOpacity={0.7}>
                      <Text style={[s.actionBtnText, { color: COLORS.warning }]}>{t('users_toggleStatus')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.error + '12', borderColor: COLORS.error + '30' }]}
                      onPress={() => handleRemove(user.id, user.fullName || user.email)} activeOpacity={0.7}>
                      <Text style={[s.actionBtnText, { color: COLORS.error }]}>{t('users_remove')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Role permissions card */}
        <View style={[s.rolesCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <Text style={[s.rolesTitle, { color: COLORS.text }]}>{t('users_rolePermissions')}</Text>
          {[
            { roleKey: 'users_roleAdmin' as const, descKey: 'users_roleAdminDesc' as const, color: '#DC2626' },
            { roleKey: 'users_roleSeller' as const, descKey: 'users_roleSellerDesc' as const, color: '#0D2C74' },
            { roleKey: 'users_roleBuyer' as const, descKey: 'users_roleBuyerDesc' as const, color: '#D97706' },
          ].map(item => (
            <View key={item.roleKey} style={[s.roleRow, { borderBottomColor: COLORS.border }]}>
              <View style={[s.roleDot, { backgroundColor: item.color }]} />
              <View>
                <Text style={[s.roleLabel, { color: COLORS.text }]}>{t(item.roleKey)}</Text>
                <Text style={[s.roleDesc, { color: COLORS.textMuted }]}>{t(item.descKey)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={!!editUser} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: COLORS.surface }]}>
            <View style={[s.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[s.modalTitle, { color: COLORS.text }]}>{t('users_editUser')}</Text>
              <TouchableOpacity style={[s.closeBtn, { backgroundColor: COLORS.background }]} onPress={() => setEditUser(null)}>
                <CloseIcon color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={{ marginBottom: 16 }}>
              <Text style={[s.fieldLabel, { color: COLORS.textMuted }]}>{t('users_fullName')}</Text>
              <TextInput style={[s.fieldInput, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.text }]}
                placeholder={t('users_enterFullName')} placeholderTextColor={COLORS.textMuted} value={editName} onChangeText={setEditName} />
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={[s.fieldLabel, { color: COLORS.textMuted }]}>{t('users_role')}</Text>
              <View style={[s.roleSelector, isRTL && { flexDirection: 'row-reverse' }]}>
                {roles.map(r => (
                  <TouchableOpacity key={r}
                    style={[s.roleChip, { backgroundColor: editRole === r ? COLORS.primary + '15' : COLORS.background, borderColor: editRole === r ? COLORS.primary : COLORS.border }]}
                    onPress={() => setEditRole(r)}>
                    <Text style={[s.roleChipText, { color: editRole === r ? COLORS.primary : COLORS.textMuted }]}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity style={[s.saveBtn, { backgroundColor: COLORS.primary, opacity: editSaving ? 0.7 : 1 }]} onPress={handleSaveEdit} disabled={editSaving}>
              {editSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.saveBtnText}>{t('common_save')}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  controls: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptyDesc: { fontSize: 13, textAlign: 'center' },
  userCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800' },
  userName: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  userEmail: { fontSize: 12 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  lastLogin: { fontSize: 10, marginLeft: 'auto' as any },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionBtnText: { fontSize: 11, fontWeight: '700' },
  rolesCard: { borderRadius: 18, borderWidth: 1, padding: 18, marginTop: 20 },
  rolesTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  roleRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, gap: 12 },
  roleDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  roleLabel: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  roleDesc: { fontSize: 12, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  roleSelector: { flexDirection: 'row', gap: 10 },
  roleChip: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  roleChipText: { fontSize: 13, fontWeight: '700' },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});

export default UsersPermissionsScreen;
