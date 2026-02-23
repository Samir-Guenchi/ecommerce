/**
 * AdminProductsScreen — View All Platform Products
 * 
 * Features:
 * - View all products from all stores
 * - Filter by status (active, draft, out of stock)
 * - View product details and store owner
 * - Delete products with reason
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import AdminBottomNav, { AdminTabId } from './AdminBottomNav';
import { API_URL } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BackArrowIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19L5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ProductIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 16V8C21 7.47 20.74 6.97 20.31 6.65L13.31 1.65C12.93 1.38 12.47 1.38 12.09 1.65L5.09 6.65C4.66 6.97 4.4 7.47 4.4 8V16C4.4 16.53 4.66 17.03 5.09 17.35L12.09 22.35C12.47 22.62 12.93 22.62 13.31 22.35L20.31 17.35C20.74 17.03 21 16.53 21 16Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3.27 6.96L12 12.01L20.73 6.96" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 22.08V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H5H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  status: 'active' | 'draft' | 'out_of_stock';
  createdAt: string;
  store: {
    id: number;
    name: string;
    user: {
      id: number;
      email: string;
      fullName: string;
    };
  };
}

interface AdminProductsScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  goBack?: () => void;
}

const AdminProductsScreen: React.FC<AdminProductsScreenProps> = ({ navigate, goBack }) => {
  const { mode } = useTheme();
  const { t, isRTL } = useTranslation();
  const COLORS = getColors(mode);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'out_of_stock'>('all');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  const fetchProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct || !deleteReason.trim()) {
      Alert.alert(t('common_error'), t('admin_reasonRequired'));
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/admin/products/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: deleteReason }),
      });

      if (response.ok) {
        Alert.alert(t('admin_actionSuccess'), t('admin_updateSuccess'));
        setDeleteModalVisible(false);
        setDeleteReason('');
        setSelectedProduct(null);
        fetchProducts();
      } else {
        Alert.alert(t('common_error'), t('admin_actionFailed'));
      }
    } catch (error) {
      Alert.alert(t('common_error'), t('admin_actionFailed'));
    }
  };

  const handleTab = (tab: AdminTabId) => {
    if (tab === 'products') return;
    if (tab === 'dashboard') navigate?.('adminDashboard');
    if (tab === 'stores') navigate?.('adminStores');
    if (tab === 'sellers') navigate?.('adminSellers');
    if (tab === 'delivery') navigate?.('adminDelivery');
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const counts = {
    all: products.length,
    active: products.filter(p => p.status === 'active').length,
    draft: products.filter(p => p.status === 'draft').length,
    out_of_stock: products.filter(p => p.status === 'out_of_stock').length,
  };

  if (loading) {
    return (
      <View style={[styles.outer, { backgroundColor: COLORS.background }, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.outer, { backgroundColor: COLORS.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <BackArrowIcon color={COLORS.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>{t('admin_productsTitle')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filters */}
      <View style={[styles.filters, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          {(['all', 'active', 'draft', 'out_of_stock'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                { backgroundColor: filter === f ? COLORS.primary : COLORS.background, borderColor: COLORS.border },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, { color: filter === f ? '#FFF' : COLORS.text }]}>
                {f === 'all' ? t('admin_filterAll', { count: counts.all }) : 
                 f === 'active' ? t('admin_filterActive', { count: counts.active }) :
                 f === 'draft' ? t('admin_draft') + ` (${counts.draft})` :
                 t('admin_outOfStock') + ` (${counts.out_of_stock})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <ProductIcon color={COLORS.textMuted} size={48} />
            <Text style={[styles.emptyText, { color: COLORS.textMuted }]}>{t('admin_noProductsFound')}</Text>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <View key={product.id} style={[styles.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.productName, { color: COLORS.text }]}>{product.name}</Text>
                  <Text style={[styles.storeName, { color: COLORS.textMuted }]}>
                    {product.store.name} • {product.store.user.fullName}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: product.status === 'active' ? COLORS.success + '18' : COLORS.textMuted + '18' }]}>
                  <Text style={[styles.statusText, { color: product.status === 'active' ? COLORS.success : COLORS.textMuted }]}>
                    {product.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: COLORS.textMuted }]}>{t('admin_price')}:</Text>
                  <Text style={[styles.infoValue, { color: COLORS.text }]}>DZD {product.price.toLocaleString()}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: COLORS.textMuted }]}>{t('admin_stock')}:</Text>
                  <Text style={[styles.infoValue, { color: COLORS.text }]}>{product.stock}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: COLORS.textMuted }]}>{t('admin_owner')}:</Text>
                  <Text style={[styles.infoValue, { color: COLORS.text }]}>{product.store.user.email}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.deleteBtn, { backgroundColor: COLORS.error + '18' }]}
                onPress={() => {
                  setSelectedProduct(product);
                  setDeleteModalVisible(true);
                }}
              >
                <TrashIcon color={COLORS.error} />
                <Text style={[styles.deleteBtnText, { color: COLORS.error }]}>{t('admin_deleteProduct')}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Delete Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: COLORS.surface }]}>
            <Text style={[styles.modalTitle, { color: COLORS.text }]}>{t('admin_deleteProductTitle')}</Text>
            <Text style={[styles.modalDesc, { color: COLORS.textMuted }]}>
              {t('admin_deleteProductMsg', { name: selectedProduct?.name || '' })}
            </Text>
            <TextInput
              style={[styles.reasonInput, { backgroundColor: COLORS.background, color: COLORS.text, borderColor: COLORS.border }]}
              placeholder={t('admin_provideReason')}
              placeholderTextColor={COLORS.textMuted}
              value={deleteReason}
              onChangeText={setDeleteReason}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.background }]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeleteReason('');
                  setSelectedProduct(null);
                }}
              >
                <Text style={[styles.modalBtnText, { color: COLORS.text }]}>{t('admin_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.error }]}
                onPress={handleDeleteProduct}
              >
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>{t('common_delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AdminBottomNav activeTab="products" onTabPress={(tab) => {
        if (tab === 'dashboard') navigate?.('adminDashboard');
        if (tab === 'stores') navigate?.('adminStores');
        if (tab === 'sellers') navigate?.('adminSellers');
        if (tab === 'delivery') navigate?.('adminDelivery');
      }} />
    </View>
  );
};

const styles = StyleSheet.create({
  outer: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  filters: { paddingVertical: 12, borderBottomWidth: 1 },
  filtersContent: { paddingHorizontal: 20, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, fontWeight: '600', marginTop: 12 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  productName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  storeName: { fontSize: 13, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  cardBody: { gap: 8, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 13, fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '700' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, gap: 8 },
  deleteBtnText: { fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalDesc: { fontSize: 14, fontWeight: '600', marginBottom: 16, lineHeight: 20 },
  reasonInput: { borderRadius: 12, padding: 12, fontSize: 14, borderWidth: 1, marginBottom: 20, minHeight: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '700' },
});

export default AdminProductsScreen;
