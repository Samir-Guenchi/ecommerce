/**
 * AdminUsersScreen - Manage all users (view, approve, suspend, ban)
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { getColors, SPACING, SHADOWS, RADIUS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import { API_URL } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdminUsersScreenProps {
  filter?: 'all' | 'seller' | 'buyer' | 'delivery' | 'pending';
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  goBack?: () => void;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  accountType: 'buyer' | 'seller' | 'delivery' | 'admin';
  accountStatus: 'pending' | 'verified' | 'rejected' | 'suspended' | 'banned';
  documentsUploaded: boolean;
  createdAt: string;
}

const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({
  filter = 'all',
  navigate,
  goBack,
}) => {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const COLORS = getColors(mode);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(filter);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    content: {
      flex: 1,
    },
    header: {
      padding: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      backgroundColor: COLORS.surface,
    },
    searchInput: {
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: 12,
      fontSize: 15,
      color: COLORS.text,
      marginBottom: SPACING.md,
    },
    filterTabs: {
      flexDirection: 'row',
      gap: SPACING.sm,
      flexWrap: 'wrap',
    },
    filterTab: {
      paddingHorizontal: SPACING.md,
      paddingVertical: 8,
      borderRadius: RADIUS.sm,
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.surface,
    },
    filterTabActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    filterTabText: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.text,
    },
    filterTabTextActive: {
      color: '#FFFFFF',
    },
    usersList: {
      padding: SPACING.md,
    },
    userCard: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      ...SHADOWS.small,
    },
    userCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: SPACING.sm,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginBottom: SPACING.xs,
    },
    userMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    badge: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: RADIUS.sm,
    },
    badgeType: {
      backgroundColor: COLORS.primary + '20',
    },
    badgeStatus: {
      backgroundColor: COLORS.textMuted + '20',
    },
    badgeStatusVerified: {
      backgroundColor: COLORS.success + '20',
    },
    badgeStatusPending: {
      backgroundColor: COLORS.warning + '20',
    },
    badgeStatusRejected: {
      backgroundColor: COLORS.error + '20',
    },
    badgeStatusSuspended: {
      backgroundColor: COLORS.error + '20',
    },
    badgeStatusBanned: {
      backgroundColor: '#000000' + '20',
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.text,
    },
    userActions: {
      flexDirection: 'row',
      gap: SPACING.xs,
      flexWrap: 'wrap',
    },
    actionBtn: {
      paddingHorizontal: SPACING.md,
      paddingVertical: 8,
      borderRadius: RADIUS.sm,
      borderWidth: 1,
    },
    approveBtn: {
      backgroundColor: COLORS.success + '20',
      borderColor: COLORS.success,
    },
    rejectBtn: {
      backgroundColor: COLORS.error + '20',
      borderColor: COLORS.error,
    },
    suspendBtn: {
      backgroundColor: COLORS.warning + '20',
      borderColor: COLORS.warning,
    },
    banBtn: {
      backgroundColor: '#000000' + '20',
      borderColor: '#000000',
    },
    activateBtn: {
      backgroundColor: COLORS.success + '20',
      borderColor: COLORS.success,
    },
    viewDocsBtn: {
      backgroundColor: COLORS.primary + '20',
      borderColor: COLORS.primary,
    },
    actionBtnText: {
      fontSize: 13,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.xl,
    },
    emptyStateText: {
      fontSize: 16,
      color: COLORS.textSecondary,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        applyFilters(data.users || [], activeFilter, searchQuery);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = (userList: User[], filterType: string, search: string) => {
    let filtered = userList;

    // Apply type filter
    if (filterType !== 'all') {
      if (filterType === 'pending') {
        filtered = filtered.filter(u => u.accountStatus === 'pending');
      } else {
        filtered = filtered.filter(u => u.accountType === filterType);
      }
    }

    // Apply search
    if (search) {
      filtered = filtered.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters(users, activeFilter, searchQuery);
  }, [activeFilter, searchQuery, users]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleAction = async (
    userId: number,
    action: 'approve' | 'reject' | 'suspend' | 'ban' | 'unban' | 'activate'
  ) => {
    const confirmMessages = {
      approve: t('admin_confirmApprove'),
      reject: t('admin_confirmReject'),
      suspend: t('admin_confirmSuspend'),
      ban: t('admin_confirmBan'),
      unban: 'Are you sure you want to unban this user?',
      activate: 'Are you sure you want to activate this user?',
    };

    Alert.alert(
      'Confirm Action',
      confirmMessages[action],
      [
        { text: t('common_cancel'), style: 'cancel' },
        {
          text: t('common_confirm'),
          onPress: async () => {
            setActionLoading(userId);
            try {
              const token = await AsyncStorage.getItem('authToken');
              const response = await fetch(`${API_URL}/admin/users/${userId}/${action}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Success', t('admin_actionSuccess'));
                fetchUsers();
              } else {
                throw new Error('Action failed');
              }
            } catch (error) {
              Alert.alert('Error', t('admin_actionError'));
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'verified':
        return styles.badgeStatusVerified;
      case 'pending':
        return styles.badgeStatusPending;
      case 'rejected':
        return styles.badgeStatusRejected;
      case 'suspended':
        return styles.badgeStatusSuspended;
      case 'banned':
        return styles.badgeStatusBanned;
      default:
        return styles.badgeStatus;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return t('status_verified');
      case 'pending':
        return t('status_pending');
      case 'rejected':
        return t('status_rejected');
      case 'suspended':
        return t('status_suspended');
      case 'banned':
        return t('status_banned');
      default:
        return status;
    }
  };

  const getAccountTypeText = (type: string) => {
    switch (type) {
      case 'seller':
        return t('admin_sellers');
      case 'buyer':
        return t('admin_buyers');
      case 'delivery':
        return t('admin_delivery');
      case 'admin':
        return 'Admin';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <BackHeader title={t('admin_users')} onBack={goBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackHeader title={t('admin_users')} onBack={goBack} />
      
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('admin_searchUsers')}
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterTabText, activeFilter === 'all' && styles.filterTabTextActive]}>
              {t('admin_allUsers')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'pending' && styles.filterTabActive]}
            onPress={() => setActiveFilter('pending')}
          >
            <Text style={[styles.filterTabText, activeFilter === 'pending' && styles.filterTabTextActive]}>
              {t('admin_pendingVerifications')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'seller' && styles.filterTabActive]}
            onPress={() => setActiveFilter('seller')}
          >
            <Text style={[styles.filterTabText, activeFilter === 'seller' && styles.filterTabTextActive]}>
              {t('admin_sellers')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'buyer' && styles.filterTabActive]}
            onPress={() => setActiveFilter('buyer')}
          >
            <Text style={[styles.filterTabText, activeFilter === 'buyer' && styles.filterTabTextActive]}>
              {t('admin_buyers')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'delivery' && styles.filterTabActive]}
            onPress={() => setActiveFilter('delivery')}
          >
            <Text style={[styles.filterTabText, activeFilter === 'delivery' && styles.filterTabTextActive]}>
              {t('admin_delivery')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {searchQuery ? 'No users match your search' : t('admin_noUsers')}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.usersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userCardHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.userMeta}>
                    <View style={[styles.badge, styles.badgeType]}>
                      <Text style={styles.badgeText}>
                        {getAccountTypeText(user.accountType)}
                      </Text>
                    </View>
                    <View style={[styles.badge, getStatusBadgeStyle(user.accountStatus)]}>
                      <Text style={styles.badgeText}>
                        {getStatusText(user.accountStatus)}
                      </Text>
                    </View>
                    {user.documentsUploaded && (
                      <View style={[styles.badge, styles.badgeStatus]}>
                        <Text style={styles.badgeText}>{t('admin_documents')}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.userActions}>
                {user.accountStatus === 'pending' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleAction(user.id, 'approve')}
                      disabled={actionLoading === user.id}
                    >
                      <Text style={styles.actionBtnText}>
                        {actionLoading === user.id ? '...' : t('admin_approve')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleAction(user.id, 'reject')}
                      disabled={actionLoading === user.id}
                    >
                      <Text style={styles.actionBtnText}>
                        {actionLoading === user.id ? '...' : t('admin_reject')}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {user.accountStatus === 'verified' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.suspendBtn]}
                    onPress={() => handleAction(user.id, 'suspend')}
                    disabled={actionLoading === user.id}
                  >
                    <Text style={styles.actionBtnText}>
                      {actionLoading === user.id ? '...' : t('admin_suspend')}
                    </Text>
                  </TouchableOpacity>
                )}

                {user.accountStatus === 'suspended' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.activateBtn]}
                    onPress={() => handleAction(user.id, 'activate')}
                    disabled={actionLoading === user.id}
                  >
                    <Text style={styles.actionBtnText}>
                      {actionLoading === user.id ? '...' : t('admin_activate')}
                    </Text>
                  </TouchableOpacity>
                )}

                {user.accountStatus !== 'banned' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.banBtn]}
                    onPress={() => handleAction(user.id, 'ban')}
                    disabled={actionLoading === user.id}
                  >
                    <Text style={styles.actionBtnText}>
                      {actionLoading === user.id ? '...' : t('admin_ban')}
                    </Text>
                  </TouchableOpacity>
                )}

                {user.accountStatus === 'banned' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.activateBtn]}
                    onPress={() => handleAction(user.id, 'unban')}
                    disabled={actionLoading === user.id}
                  >
                    <Text style={styles.actionBtnText}>
                      {actionLoading === user.id ? '...' : t('admin_unban')}
                    </Text>
                  </TouchableOpacity>
                )}

                {user.documentsUploaded && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.viewDocsBtn]}
                    onPress={() => navigate?.('userDocuments', { userId: user.id })}
                  >
                    <Text style={styles.actionBtnText}>{t('admin_viewDocuments')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default AdminUsersScreen;
