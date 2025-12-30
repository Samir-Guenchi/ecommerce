import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { storeAPI, orderAPI } from '../services/api.service';

// Store Icon
const StoreIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 21H21"
      stroke="#666"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 21V7L13 2V7"
      stroke="#666"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 21V11L13 7"
      stroke="#666"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Bottom bar icons (same visual language as other screens)
const DashboardIcon = ({ active }: { active: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? '#000000' : 'none'}
      fillOpacity={active ? 0.1 : 0}
    />
    <Path
      d="M9 22V12H15V22"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ProductsIcon = ({ active }: { active: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? '#000000' : 'none'}
      fillOpacity={active ? 0.1 : 0}
    />
    <Path
      d="M3 6H21"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 10C16 10.7956 15.6839 11.5587 15.1213 12.1213C14.5587 12.6839 13.7956 13 13 13C12.2044 13 11.4413 12.6839 10.8787 12.1213C10.3161 11.5587 10 10.7956 10 10"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const OrdersIcon = ({ active }: { active: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? '#000000' : 'none'}
      fillOpacity={active ? 0.1 : 0}
    />
    <Path
      d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V5"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12L11 14L15 10"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StoresIcon = ({ active }: { active: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3V21H21"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 16L12 11L16 15L21 10"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 10L10 7L13 10L16 7L19 10"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SettingsIcon = ({ active }: { active: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? '#000000' : 'none'}
      fillOpacity={active ? 0.1 : 0}
    />
    <Path
      d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01131 9.77251C4.28063 9.5799 4.48571 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.29C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
      stroke={active ? '#000000' : '#666666'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface StoresScreenProps {
  navigate?: (screenId: string) => void;
}

interface Store {
  id: number;
  name: string;
  status: string;
  location: string | null;
  description: string | null;
  createdAt: string;
}

const StoresScreen: React.FC<StoresScreenProps> = ({ navigate }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [storeOrderCounts, setStoreOrderCounts] = useState<Record<number, number>>({});

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await storeAPI.getAllStores();
      setStores(response.stores);

      // Fetch order counts for each store
      try {
        const ordersResponse = await orderAPI.getAllOrders();
        const counts: Record<number, number> = {};
        ordersResponse.orders.forEach((order: any) => {
          counts[order.storeId] = (counts[order.storeId] || 0) + 1;
        });
        setStoreOrderCounts(counts);
      } catch (error) {
        // If orders fail, continue without order counts
        console.error('Failed to fetch order counts:', error);
      }
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      Alert.alert('Error', error.message || 'Failed to load stores.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleModify = (storeId: number) => {
    if (navigate) {
      navigate('addEditStore', { storeId: storeId.toString() });
    }
  };

  const handlePublish = async (storeId: number, storeName: string) => {
    try {
      await storeAPI.updateStore(storeId, { status: 'active' });
      Alert.alert('Success', `${storeName} has been published!`);
      fetchStores(); // Refresh the list
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to publish store');
    }
  };

  const handleOpenSettings = (storeId: number) => {
    if (navigate) {
      navigate('storeSettings', { storeId: storeId.toString() });
    }
  };

  const handleDeleteStore = async (storeId: number, storeName: string) => {
    Alert.alert(
      'Delete Store',
      `Are you sure you want to delete "${storeName}"? This will also delete all products in this store.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storeAPI.deleteStore(storeId);
              Alert.alert('Success', 'Store deleted successfully.');
              await fetchStores();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete store.');
            }
          },
        },
      ]
    );
  };

  const handleTabPress = (tab: string) => {
    if (!navigate) return;
    if (tab === 'dashboard') {
      navigate('dashboard');
    } else if (tab === 'products') {
      navigate('products');
    } else if (tab === 'orders') {
      navigate('orders');
    } else if (tab === 'stores') {
      // already here
    } else if (tab === 'userSettings') {
      navigate('userSettings');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading stores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchStores}
            tintColor="#000000"
          />
        }
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <StoreIcon />
          </View>
        </View>
        <Text style={styles.heading}>Stores</Text>
        <Text style={styles.subheading}>
          Manage all your stores and quickly access their settings.
        </Text>

        {stores.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No stores found</Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first store to get started.
            </Text>
          </View>
        ) : (
          <View style={styles.listSection}>
            {stores.map((store) => (
              <View key={store.id} style={styles.storeCard}>
                <View style={styles.storeInfoRow}>
                  <Text style={styles.storeName} numberOfLines={1}>
                    {store.name}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      store.status === 'active'
                        ? styles.statusActive
                        : styles.statusDraft,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        store.status === 'active'
                          ? styles.statusTextActive
                          : styles.statusTextDraft,
                      ]}
                    >
                      {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.storeMeta}>
                  {store.location || 'No location'} · {storeOrderCounts[store.id] || 0} orders
                </Text>
                {store.domain && (
                  <Text style={styles.storeDomain}>{store.domain}</Text>
                )}
                <View style={styles.actionsRow}>
                  {store.status === 'draft' && (
                    <TouchableOpacity
                      style={styles.publishButton}
                      onPress={() => handlePublish(store.id, store.name)}
                    >
                      <Text style={styles.publishButtonText}>Publish</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.modifyButton}
                    onPress={() => handleModify(store.id)}
                  >
                    <Text style={styles.modifyButtonText}>Modify</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => handleOpenSettings(store.id)}
                  >
                    <Text style={styles.settingsButtonText}>Open settings</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Floating Add Store Button */}
      <TouchableOpacity 
        style={styles.floatingAddButton} 
        onPress={() => navigate?.('addEditStore')}
        activeOpacity={0.8}
      >
        <View style={styles.floatingAddButtonContent}>
          <Text style={styles.floatingAddButtonIcon}>+</Text>
          <Text style={styles.floatingAddButtonText}>Add Store</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('dashboard')}
          activeOpacity={0.7}
        >
          <DashboardIcon active={false} />
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('products')}
          activeOpacity={0.7}
        >
          <ProductsIcon active={false} />
          <Text style={styles.navLabel}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('orders')}
          activeOpacity={0.7}
        >
          <OrdersIcon active={false} />
          <Text style={styles.navLabel}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('stores')}
          activeOpacity={0.7}
        >
          <StoresIcon active />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Stores</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('userSettings')}
          activeOpacity={0.7}
        >
          <SettingsIcon active={false} />
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 35,
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
    marginBottom: 24,
    lineHeight: 18,
  },
  listSection: {
    marginBottom: 8,
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  storeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
  },
  storeMeta: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusDraft: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#2E7D32',
  },
  statusTextDraft: {
    color: '#F57C00',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  modifyButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  modifyButtonText: {
    fontSize: 11,
    color: '#111111',
    fontWeight: '500',
  },
  publishButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#28a745',
    marginRight: 8,
  },
  publishButtonText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  settingsButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#000000',
  },
  settingsButtonText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingBottom: 14,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  navLabel: {
    fontSize: 9,
    color: '#666666',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#000000',
    fontWeight: '700',
  },
});

export default StoresScreen;



