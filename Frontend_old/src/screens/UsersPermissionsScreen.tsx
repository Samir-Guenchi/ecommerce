import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { userAPI } from '../services/api.service';

// Users Icon
const UsersIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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

const UsersPermissionsScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.users);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to load users. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    Alert.alert('Add User', 'To add a new user, they need to sign up through the registration screen.');
  };

  const handleEditUser = (userId: number) => {
    Alert.alert('Edit User', 'User editing functionality will be available soon.');
  };

  const handleUpdateStatus = async (userId: number, currentStatus: string) => {
    // Determine next status (cycle through: pending -> active -> suspended -> inactive -> pending)
    const statusMap: Record<string, string> = {
      'pending': 'active',
      'active': 'suspended',
      'suspended': 'inactive',
      'inactive': 'pending',
    };
    
    const newStatus = statusMap[currentStatus.toLowerCase()] || 'active';

    Alert.alert(
      'Update Status',
      `Change user status from ${currentStatus} to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              setRefreshing(true);
              await userAPI.updateUserStatus(userId, newStatus as any);
              Alert.alert('Success', 'User status updated successfully.');
              await fetchUsers();
            } catch (error: any) {
              console.error('Error updating user status:', error);
              Alert.alert('Error', error.message || 'Failed to update user status.');
              setRefreshing(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveUser = (userId: number, userName: string) => {
    Alert.alert(
      'Remove User',
      `Are you sure you want to remove ${userName || 'this user'}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setRefreshing(true);
              await userAPI.deleteUser(userId);
              Alert.alert('Success', 'User removed successfully.');
              await fetchUsers();
            } catch (error: any) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', error.message || 'Failed to remove user.');
              setRefreshing(false);
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (accountType: string) => {
    switch (accountType?.toLowerCase()) {
      case 'admin':
        return '#FFEBEE';
      case 'seller':
        return '#E3F2FD';
      case 'buyer':
        return '#F3E5F5';
      default:
        return '#F5F5F5';
    }
  };

  const getRoleTextColor = (accountType: string) => {
    switch (accountType?.toLowerCase()) {
      case 'admin':
        return '#C62828';
      case 'seller':
        return '#1565C0';
      case 'buyer':
        return '#6A1B9A';
      default:
        return '#666';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return styles.statusActive;
      case 'pending':
        return styles.statusPending;
      case 'suspended':
        return styles.statusSuspended;
      case 'inactive':
        return styles.statusInactive;
      default:
        return styles.statusPending;
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return styles.statusTextActive;
      case 'pending':
        return styles.statusTextPending;
      case 'suspended':
        return styles.statusTextSuspended;
      case 'inactive':
        return styles.statusTextInactive;
      default:
        return styles.statusTextPending;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={fetchUsers}
          tintColor="#000000"
        />
      }
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <UsersIcon />
        </View>
      </View>
      <Text style={styles.heading}>Users & Permissions</Text>
      <Text style={styles.subheading}>
        Manage users and their permissions for your account.
      </Text>

      {users.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No users found</Text>
          <Text style={styles.emptyStateSubtext}>
            Users will appear here once they sign up.
          </Text>
        </View>
      ) : (
        <View style={styles.formSection}>
          {users.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user.fullName || 'No name provided'}
                </Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.userMeta}>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.accountType) }]}>
                    <Text style={[styles.roleText, { color: getRoleTextColor(user.accountType) }]}>
                      {user.accountType || 'N/A'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(user.accountStatus)]}>
                    <Text style={[styles.statusText, getStatusTextStyle(user.accountStatus)]}>
                      {user.accountStatus || 'Pending'}
                    </Text>
                  </View>
                </View>
                {user.lastLogin && (
                  <Text style={styles.lastLogin}>
                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                  </Text>
                )}
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleUpdateStatus(user.id, user.accountStatus)}
                  disabled={refreshing}
                >
                  <Text style={styles.actionButtonText}>Update Status</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={() => handleRemoveUser(user.id, user.fullName || user.email)}
                  disabled={refreshing}
                >
                  <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
        <Text style={styles.addButtonText}>+ Add User</Text>
      </TouchableOpacity>

      <View style={styles.permissionsInfo}>
        <Text style={styles.permissionsTitle}>Role Permissions</Text>
        <View style={styles.permissionItem}>
          <Text style={styles.permissionRole}>Admin:</Text>
          <Text style={styles.permissionDesc}>Full access to all features and settings</Text>
        </View>
        <View style={styles.permissionItem}>
          <Text style={styles.permissionRole}>Seller:</Text>
          <Text style={styles.permissionDesc}>Can manage products, orders, and store settings</Text>
        </View>
        <View style={styles.permissionItem}>
          <Text style={styles.permissionRole}>Buyer:</Text>
          <Text style={styles.permissionDesc}>Can browse and purchase products</Text>
        </View>
      </View>
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
  userCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusSuspended: {
    backgroundColor: '#FFEBEE',
  },
  statusInactive: {
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#2E7D32',
  },
  statusTextPending: {
    color: '#F57C00',
  },
  statusTextSuspended: {
    color: '#C62828',
  },
  statusTextInactive: {
    color: '#666666',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  lastLogin: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  removeButton: {
    borderColor: '#FFEBEE',
  },
  removeButtonText: {
    color: '#C62828',
  },
  addButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  permissionsInfo: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  permissionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  permissionItem: {
    marginBottom: 12,
  },
  permissionRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  permissionDesc: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
});

export default UsersPermissionsScreen;
