/**
 * ProductsScreen — 2026 Redesign
 * ✦ Lang/Theme controls in header
 * ✦ Full i18n coverage
 * ✦ Premium product cards with stock indicator
 * ✦ Gradient summary strip
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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import * as API from '../services/api.service';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BottomNav, { BottomTabId } from './BottomNav';
import { confirmAction } from '../components/confirmAction';

const { width: W } = Dimensions.get('window');
const CARD_R = 18;

/* ══════ ICONS ══════ */
const SunIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke="#FDB913" strokeWidth="2" />
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB913" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const MoonIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const PlusIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);
const EditIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4C3.47 4 2.96 4.21 2.59 4.59C2.21 4.96 2 5.47 2 6V20C2 20.53 2.21 21.04 2.59 21.41C2.96 21.79 3.47 22 4 22H18C18.53 22 19.04 21.79 19.41 21.41C19.79 21.04 20 20.53 20 20V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5C18.89 2.11 19.43 1.89 20 1.89C20.57 1.89 21.11 2.11 21.5 2.5C21.89 2.89 22.11 3.43 22.11 4C22.11 4.57 21.89 5.11 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const TrashIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H5H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 6V4C8 3.47 8.21 2.96 8.59 2.59C8.96 2.21 9.47 2 10 2H14C14.53 2 15.04 2.21 15.41 2.59C15.79 2.96 16 3.47 16 4V6M19 6V20C19 20.53 18.79 21.04 18.41 21.41C18.04 21.79 17.53 22 17 22H7C6.47 22 5.96 21.79 5.59 21.41C5.21 21.04 5 20.53 5 20V6H19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  status: string;
  store?: { name: string } | null;
  storeId?: number;
}

interface Store { id: number; name: string; }

interface ProductsScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
  goBack?: () => void;
}

const ProductsScreen: React.FC<ProductsScreenProps> = ({ navigate, resetTo, goBack }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { message, showSuccess, showError, clear } = useStatusMessage();

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language as any) + 1) % langs.length]);
  };

  const fetchProducts = async () => {
    try {
      const [productsRes, storesRes] = await Promise.all([
        API.productAPI.getAllProducts(),
        API.storeAPI.getAllStores(),
      ]);
      setProducts(productsRes.products || []);
      setStores(storesRes.stores || []);
    } catch (error: any) {
      showError(error.message || 'Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAddProduct = () => {
    if (stores.length === 0) {
      Alert.alert(t('products_noStore'), t('products_noStoreDesc'), [
        { text: t('common_cancel'), style: 'cancel' },
        { text: 'Create Store', onPress: () => navigate?.('addEditStore') },
      ]);
      return;
    }
    navigate?.('addEditProduct');
  };

  const handleEditProduct = (id: number) => navigate?.('addEditProduct', { productId: id.toString() });

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = await confirmAction(
      t('products_deleteTitle'),
      t('products_deleteConfirm').replace('{name}', product.name)
    );
    if (!confirmed) return;
    try {
      await API.productAPI.deleteProduct(product.id.toString());
      setProducts(prev => prev.filter(p => p.id !== product.id));
      showSuccess(t('products_deleteSuccess'));
    } catch (error: any) {
      showError(error.message || t('products_deleteFail'));
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return { bg: COLORS.success + '18', text: COLORS.success, dot: COLORS.success };
      case 'low_stock': case 'low stock': return { bg: COLORS.warning + '18', text: COLORS.warning, dot: COLORS.warning };
      case 'out_of_stock': case 'out of stock': return { bg: COLORS.error + '18', text: COLORS.error, dot: COLORS.error };
      default: return { bg: COLORS.border, text: COLORS.textMuted, dot: COLORS.textMuted };
    }
  };

  const handleTabPress = (tab: BottomTabId) => {
    if (tab === 'products') return;
    resetTo ? resetTo(tab) : navigate?.(tab);
  };

  const activeCount = products.filter(p => p.status?.toLowerCase() === 'active').length;
  const lowStock = products.filter(p => ['low_stock', 'low stock'].includes(p.status?.toLowerCase())).length;
  const outOfStock = products.filter(p => ['out_of_stock', 'out of stock'].includes(p.status?.toLowerCase())).length;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textMuted, fontWeight: '600' }}>{t('products_loading')}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} tintColor={COLORS.primary} />}
      >
        {/* ── Header ── */}
        <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: COLORS.text }]}>{t('nav_products')}</Text>
            <Text style={[styles.subtitle, { color: COLORS.textMuted }]}>{t('products_subtitle')}</Text>
          </View>
          <View style={[styles.controls, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={cycleLanguage} activeOpacity={0.7}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.text }}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={toggleTheme} activeOpacity={0.7}>
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: COLORS.primary }]} onPress={handleAddProduct} activeOpacity={0.8}>
              <PlusIcon color="#FFFFFF" />
              <Text style={styles.addBtnText}>{t('products_addProduct')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* ── Gradient Summary Strip ── */}
        <LinearGradient colors={['#00B894', '#00B894BB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.summaryGrad}>
          {[
            { val: products.length, label: t('products_total') },
            { val: activeCount, label: t('seller_active') },
            { val: lowStock, label: t('seller_lowStock') },
            { val: outOfStock, label: t('seller_outOfStock') },
          ].map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.sumDiv} />}
              <View style={styles.sumItem}>
                <Text style={styles.sumVal}>{item.val}</Text>
                <Text style={styles.sumLabel}>{item.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </LinearGradient>

        {/* ── Product list ── */}
        {products.length === 0 ? (
          <View style={{ padding: 48, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🛍️</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 8 }}>{t('products_noProducts')}</Text>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }}>
              {stores.length === 0 ? t('products_createStoreFirst') : t('products_addFirst')}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {products.map((product) => {
              const sc = getStatusConfig(product.status);
              const storeName = product.store?.name || 'No Store';
              const stockPct = Math.min((product.stock / 100) * 100, 100);
              return (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                  onPress={() => handleEditProduct(product.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardTop, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.productName, { color: COLORS.text }]} numberOfLines={1}>{product.name}</Text>
                      <Text style={[styles.storeName, { color: COLORS.textMuted }]}>{storeName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
                      <Text style={[styles.statusText, { color: sc.text }]}>{product.status}</Text>
                    </View>
                  </View>

                  <View style={[styles.cardMid, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.productPrice, { color: COLORS.primary }]}>{(+product.price || 0).toFixed(2)} DZD</Text>
                    <Text style={[styles.stockText, { color: COLORS.textSecondary }]}>
                      {t('products_stock')}: {product.stock}
                    </Text>
                  </View>

                  {/* Stock bar */}
                  <View style={[styles.stockBarBg, { backgroundColor: COLORS.border }]}>
                    <View style={[styles.stockBarFill, { width: `${stockPct}%` as any, backgroundColor: product.stock > 20 ? COLORS.success : product.stock > 5 ? COLORS.warning : COLORS.error }]} />
                  </View>

                  <View style={[styles.cardActions, isRTL && { flexDirection: 'row-reverse' }]}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary + '12', borderColor: COLORS.primary + '30' }]} onPress={() => handleEditProduct(product.id)} activeOpacity={0.7}>
                      <EditIcon color={COLORS.primary} />
                      <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>{t('common_edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.error + '12', borderColor: COLORS.error + '30' }]} onPress={() => handleDeleteProduct(product)} activeOpacity={0.7}>
                      <TrashIcon color={COLORS.error} />
                      <Text style={[styles.actionBtnText, { color: COLORS.error }]}>{t('common_delete')}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  controls: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  ctrlBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, gap: 6 },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },

  summaryGrad: { borderRadius: CARD_R, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sumItem: { flex: 1, alignItems: 'center' },
  sumVal: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  sumLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  sumDiv: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },

  productCard: { borderRadius: CARD_R, borderWidth: 1, padding: 16, gap: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  storeName: { fontSize: 12, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexShrink: 0 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardMid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 22, fontWeight: '900' },
  stockText: { fontSize: 13, fontWeight: '600' },
  stockBarBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  stockBarFill: { height: 4, borderRadius: 2 },
  cardActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
});

export default ProductsScreen;
