import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import { confirmAction } from '../components/confirmAction';
import { userAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import BackHeader from '../components/BackHeader';

interface UsersPermissionsScreenProps {
  goBack?: () => void;
}

const UsersIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
    <Path d="M6 6L18 18" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

interface User {
  id: number;
  email: string;
  fullName: string | null;
  accountType: string;
  accountStatus: string;
  createdAt: string;
  lastLogin: string | null;
}

const UsersPermissionsScreen = ({ goBack }: UsersPermissionsScreenProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const { message, showSuccess, showError, showInfo, clear } = useStatusMessage();

  const fetchUsers = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.users || []);
    } catch (error: any) {
      showError(error.message || 'Failed to load users.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, []);

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setEditName(user.fullName || '');
    setEditRole(user.accountType || 'buyer');
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      setEditSaving(true);
      await userAPI.updateUser(editUser.id, {
        fullName: editName.trim() || undefined,
        accountType: editRole as any,
      });
      showSuccess('User updated successfully.');
      setEditUser(null);
      await fetchUsers();
    } catch (error: any) {
      showError(error.message || 'Failed to update user.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleUpdateStatus = async (userId: number, currentStatus: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'active', 'active': 'suspended', 'suspended': 'inactive', 'inactive': 'pending',
    };
    const newStatus = statusMap[currentStatus.toLowerCase()] || 'active';
    const confirmed = await confirmAction('Update Status', `Change status to "${newStatus}"?`);
    if (!confirmed) return;
    try {
      await userAPI.updateUserStatus(userId, newStatus as any);
      showSuccess('Status updated.');
      await fetchUsers();
    } catch (error: any) {
      showError(error.message || 'Failed to update status.');
    }
  };

  const handleRemoveUser = async (userId: number, userName: string) => {
    const confirmed = await confirmAction('Remove User', `Remove ${userName || 'this user'}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await userAPI.deleteUser(userId);
      showSuccess('User removed.');
      await fetchUsers();
    } catch (error: any) {
      showError(error.message || 'Failed to remove user.');
    }
  };

  const getRoleBadge = (type: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      admin: { bg: COLORS.error + '15', color: COLORS.error },
      seller: { bg: '#60A5FA15', color: '#60A5FA' },
      buyer: { bg: '#C084FC15', color: '#C084FC' },
    };
    return map[type?.toLowerCase()] || { bg: COLORS.surface, color: COLORS.textSecondary };
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      active: { bg: COLORS.success + '15', color: COLORS.success },
      pending: { bg: COLORS.warning + '15', color: COLORS.warning },
      suspended: { bg: COLORS.error + '15', color: COLORS.error },
      inactive: { bg: COLORS.textMuted + '15', color: COLORS.textMuted },
    };
    return map[status?.toLowerCase()] || { bg: COLORS.warning + '15', color: COLORS.warning };
  };

  const roles = ['admin', 'seller', 'buyer'];

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(true); }} tintColor={COLORS.primary} />}
      >
        <BackHeader title="Users & Permissions" onBack={goBack} />
        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{users.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>{users.filter(u => u.accountStatus === 'active').length}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: COLORS.warning }]}>{users.filter(u => u.accountStatus === 'pending').length}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>

        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}><UsersIcon /></View>
            <Text style={styles.emptyTitle}>No Users</Text>
            <Text style={styles.emptySubtitle}>Users will appear here once they register.</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {users.map((user) => {
              const role = getRoleBadge(user.accountType);
              const status = getStatusBadge(user.accountStatus);
              return (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{(user.fullName || user.email).charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.userName}>{user.fullName || 'No name'}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                  </View>
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: role.bg }]}>
                      <Text style={[styles.badgeText, { color: role.color }]}>{user.accountType || 'N/A'}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.badgeText, { color: status.color }]}>{user.accountStatus || 'pending'}</Text>
                    </View>
                    {user.lastLogin && (
                      <Text style={styles.lastLogin}>Last: {new Date(user.lastLogin).toLocaleDateString()}</Text>
                    )}
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditUser(user)}>
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdateStatus(user.id, user.accountStatus)}>
                      <Text style={styles.actionBtnText}>Toggle Status</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.removeBtn]} onPress={() => handleRemoveUser(user.id, user.fullName || user.email)}>
                      <Text style={[styles.actionBtnText, styles.removeBtnText]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={() => showInfo('New users register through the sign-up screen.')}>
          <Text style={styles.addBtnText}>+ Invite User</Text>
        </TouchableOpacity>

        {/* Role Info */}
        <View style={styles.rolesCard}>
          <Text style={styles.rolesTitle}>Role Permissions</Text>
          <View style={styles.roleRow}><Text style={styles.roleLabel}>Admin</Text><Text style={styles.roleDesc}>Full access to all features and settings</Text></View>
          <View style={styles.roleRow}><Text style={styles.roleLabel}>Seller</Text><Text style={styles.roleDesc}>Manage products, orders, and store settings</Text></View>
          <View style={styles.roleRow}><Text style={styles.roleLabel}>Buyer</Text><Text style={styles.roleDesc}>Browse and purchase products</Text></View>
        </View>
      </ScrollView>

      {/* Edit User Modal */}
      <Modal visible={!!editUser} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setEditUser(null)}>
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput style={styles.formInput} placeholder="Enter full name" placeholderTextColor={COLORS.textMuted} value={editName} onChangeText={setEditName} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Role</Text>
              <View style={styles.roleSelector}>
                {roles.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, editRole === r && styles.roleChipActive]}
                    onPress={() => setEditRole(r)}
                  >
                    <Text style={[styles.roleChipText, editRole === r && styles.roleChipTextActive]}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={[styles.saveBtn, editSaving && { opacity: 0.6 }]} onPress={handleSaveEdit} disabled={editSaving}>
              {editSaving ? <ActivityIndicator color={COLORS.background} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },
  content: { paddingHorizontal: SPACING.md, paddingBottom: 40, paddingTop: 48 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.md },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  summaryLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500', textTransform: 'uppercase' as any },
  emptyContainer: { alignItems: 'center', marginTop: 48 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
  userCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16 },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  userName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  userEmail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' as any },
  lastLogin: { fontSize: 10, color: COLORS.textMuted, marginLeft: 'auto' as any },
  userActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  actionBtnText: { fontSize: 11, fontWeight: '600', color: COLORS.text },
  removeBtn: { borderColor: COLORS.error + '30' },
  removeBtnText: { color: COLORS.error },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: SPACING.lg, marginBottom: SPACING.md },
  addBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  rolesCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16 },
  rolesTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  roleRow: { marginBottom: 10 },
  roleLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  roleDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  formInput: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.text },
  roleSelector: { flexDirection: 'row', gap: 10 },
  roleChip: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  roleChipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  roleChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  roleChipTextActive: { color: COLORS.primary },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default UsersPermissionsScreen;
