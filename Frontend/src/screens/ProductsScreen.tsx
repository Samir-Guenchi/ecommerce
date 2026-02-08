import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import { confirmAction } from '../components/confirmAction';
import { productAPI, storeAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import { useTranslation } from '../i18n';
import BottomNav, { BottomTabId } from './BottomNav';
import BackHeader from '../components/BackHeader';

/* Icons */
const PlusIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M5 12H19" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const TrashIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H5H21" stroke={COLORS.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke={COLORS.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface Product {
  id: number;
  name: string;
  price: number;
  status: string;
  stock: number;
  imagePath: string | null;
  description: string | null;
}

interface ProductsScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
  goBack?: () => void;
}

const ProductsScreen: React.FC<ProductsScreenProps> = ({ navigate, resetTo, goBack }) => {
  const { t, isRTL } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const { message, showSuccess, showError, showInfo, clear } = useStatusMessage();

  const fetchStores = async () => {
    try {
      const response = await storeAPI.getAllStores();
      setStores(response.stores);
      return response.stores;
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      return [];
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      setProducts(response.products);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      showError(error.message || 'Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchStores();
      await fetchProducts();
    };
    loadData();
  }, []);

  const handleAddProduct = async () => {
    if (stores.length === 0) {
      const confirmed = await confirmAction(t('products_noStore'), t('products_noStoreDesc'));
      if (confirmed) navigate?.('stores');
      return;
    }
    navigate?.('addEditProduct');
  };

  const handleEditProduct = (productId: number) => {
    navigate?.('addEditProduct', { productId: productId.toString() });
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    const confirmed = await confirmAction(t('products_deleteTitle'), t('products_deleteConfirm', { name: productName }));
    if (!confirmed) return;
    try {
      await productAPI.deleteProduct(productId);
      showSuccess(t('products_deleteSuccess'));
      await fetchProducts();
    } catch (error: any) {
      showError(error.message || t('products_deleteFail'));
    }
  };

  const handleTabPress = (tab: BottomTabId) => {
    if (tab === 'products') return;
    resetTo ? resetTo(tab) : navigate?.(tab);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { bg: COLORS.success + '20', color: COLORS.success };
      case 'draft': return { bg: COLORS.warning + '20', color: COLORS.warning };
      default: return { bg: COLORS.textMuted + '20', color: COLORS.textMuted };
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('products_loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchProducts(); }} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={[styles.header, isRTL && styles.rowReverse]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, isRTL && styles.textRight]}>{t('nav_products')}</Text>
            <Text style={[styles.subtitle, isRTL && styles.textRight]}>{t('products_subtitle')}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddProduct}>
            <PlusIcon />
            <Text style={styles.addBtnText}>{t('products_addProduct')}</Text>
          </TouchableOpacity>
        </View>

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* Summary bar */}
        <View style={[styles.summaryRow, isRTL && styles.rowReverse]}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{products.length}</Text>
            <Text style={styles.summaryLabel}>{t('products_total')}</Text>
          </View>
          <View style={[styles.summaryItem, styles.summaryItemBorder]}>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>{products.filter(p => p.status === 'active').length}</Text>
            <Text style={styles.summaryLabel}>{t('dashboard_active')}</Text>
          </View>
          <View style={[styles.summaryItem, styles.summaryItemBorder]}>
            <Text style={[styles.summaryValue, { color: COLORS.warning }]}>{products.filter(p => p.stock < 10).length}</Text>
            <Text style={styles.summaryLabel}>{t('dashboard_lowStock')}</Text>
          </View>
        </View>

        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t('products_noProducts')}</Text>
            <Text style={styles.emptySubtitle}>
              {stores.length === 0 ? t('products_createStoreFirst') : t('products_addFirst')}
            </Text>
          </View>
        ) : (
          <View>
            {products.map((product) => {
              const s = getStatusStyle(product.status);
              return (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => handleEditProduct(product.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardBody, isRTL && styles.rowReverse]}>
                    {/* product image placeholder */}
                    <View style={styles.productImg}>
                      <Text style={styles.productImgText}>{product.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    {/* info */}
                    <View style={styles.productInfo}>
                      <Text style={[styles.productName, isRTL && styles.textRight]} numberOfLines={1}>{product.name}</Text>
                      <Text style={[styles.productPrice, isRTL && styles.textRight]}>
                        ${product.price != null ? Number(product.price).toFixed(2) : '0.00'}
                      </Text>
                    </View>
                    {/* meta */}
                    <View style={styles.productMeta}>
                      <View style={[styles.badge, { backgroundColor: s.bg }]}>
                        <Text style={[styles.badgeText, { color: s.color }]}>
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.stockText}>{t('products_stock')}: {product.stock}</Text>
                    </View>
                  </View>
                  {/* Quick action row */}
                  <View style={[styles.cardActions, isRTL && styles.rowReverse]}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => handleEditProduct(product.id)}>
                      <Text style={styles.editBtnText}>{t('common_edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteProduct(product.id, product.name)}>
                      <TrashIcon />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
      <BottomNav activeTab="products" onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingTop: 48, paddingBottom: 110 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },
  rowReverse: { flexDirection: 'row-reverse' as any },
  textRight: { textAlign: 'right' as any },

  /* Header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  title: { fontSize: 26, fontWeight: '600', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, gap: 6 },
  addBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },

  /* Summary */
  summaryRow: { flexDirection: 'row', backgroundColor: COLORS.surfaceHighlight, borderRadius: 12, marginBottom: SPACING.md, overflow: 'hidden' },
  summaryItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  summaryItemBorder: { borderLeftWidth: 1, borderLeftColor: COLORS.borderLight },
  summaryValue: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  summaryLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },

  /* Empty */
  emptyState: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },

  /* Product card */
  productCard: { backgroundColor: COLORS.surface, borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  cardBody: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  productImg: { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  productImgText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  productInfo: { flex: 1, marginRight: 10 },
  productName: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  productPrice: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  productMeta: { alignItems: 'flex-end', gap: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  stockText: { fontSize: 11, color: COLORS.textSecondary },

  /* Card actions */
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  editBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRightWidth: 1, borderRightColor: COLORS.borderLight },
  editBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  deleteBtn: { paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
});

export default ProductsScreen;
