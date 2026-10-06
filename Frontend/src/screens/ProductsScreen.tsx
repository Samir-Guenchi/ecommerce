/**
 * ProductsScreen — Algérie Poste E-Commerce Product Management
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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import * as API from '../services/api.service';
import { getImageUrl } from '../config/api.config';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BottomNav, { BottomTabId } from './BottomNav';
import { confirmAction } from '../components/confirmAction';
import { PackageIcon, StoreIcon, CheckCircleIcon, AlertTriangleIcon } from '../components/ModernIcons';

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
  description?: string | null;
  price: number;
  stock: number;
  status: string;
  category?: string | null;
  imagePath?: string | null;
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
      await API.productAPI.deleteProduct(Number(product.id));
      setProducts(prev => prev.filter(p => p.id !== product.id));
      showSuccess(t('products_deleteSuccess'));
    } catch (error: any) {
      showError(error.message || t('products_deleteFail'));
    }
  };

  const getStatusConfig = (status: string, stock: number) => {
    const s = status?.toLowerCase();
    if (stock <= 0 || s === 'out_of_stock' || s === 'out of stock') {
      return {
        label: t('seller_outOfStock') || 'Épuisé',
        color: COLORS.error,
        icon: <AlertTriangleIcon size={13} color={COLORS.error} strokeWidth={2.2} />
      };
    }
    if (stock < 10 || s === 'low_stock' || s === 'low stock') {
      return {
        label: t('seller_lowStock') || 'Stock faible',
        color: COLORS.warning,
        icon: <AlertTriangleIcon size={13} color={COLORS.warning} strokeWidth={2.2} />
      };
    }
    return {
      label: t('seller_active') || 'En vente',
      color: COLORS.success,
      icon: <CheckCircleIcon size={13} color={COLORS.success} strokeWidth={2.2} />
    };
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

        {/* ── Algérie Poste Summary Strip ── */}
        <LinearGradient colors={['#0D2C74', '#1E40AF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.summaryGrad}>
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
            <View style={[styles.emptyIconBadge, { backgroundColor: COLORS.primary + '15' }]}>
              <PackageIcon size={36} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 8 }}>{t('products_noProducts')}</Text>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }}>
              {stores.length === 0 ? t('products_createStoreFirst') : t('products_addFirst')}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {products.map((product) => {
              const sc = getStatusConfig(product.status, product.stock);
              const storeName = product.store?.name || 'Boutique Principale';
              const initial = product.name?.charAt(0)?.toUpperCase() || 'P';
              const imgUri = getImageUrl(product.imagePath);

              return (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                  onPress={() => handleEditProduct(product.id)}
                  activeOpacity={0.75}
                >
                  {/* Top: Product Image Photo + Metadata & Store + Clean Typographic Status (NO bubble, NO dot) */}
                  <View style={[styles.cardHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[styles.productAvatar, { backgroundColor: COLORS.border + '25', borderColor: COLORS.border }]}>
                      {imgUri ? (
                        <Image
                          source={{ uri: imgUri }}
                          style={styles.avatarImg}
                          resizeMode="cover"
                        />
                      ) : (
                        <LinearGradient
                          colors={['#0D2C74', '#1E40AF']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.avatarGrad}
                        >
                          <Text style={styles.avatarInitial}>{initial}</Text>
                        </LinearGradient>
                      )}
                    </View>

                    <View style={styles.productInfo}>
                      <View style={[styles.metaRow, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={[styles.refCode, { color: COLORS.textMuted }]}>
                          REF #{product.id}
                        </Text>
                        {product.category ? (
                          <Text style={[styles.categoryBadge, { color: COLORS.textSecondary }]}>
                            • {product.category}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={[styles.productName, { color: COLORS.text }]} numberOfLines={1}>
                        {product.name}
                      </Text>
                      <View style={[styles.storeBadge, isRTL && { flexDirection: 'row-reverse' }]}>
                        <StoreIcon size={12} color={COLORS.textMuted} />
                        <Text style={[styles.storeName, { color: COLORS.textMuted }]} numberOfLines={1}>
                          {storeName}
                        </Text>
                      </View>
                    </View>

                    {/* Innovative Status: Clean typography + icon (NO bubble, NO dot!) */}
                    <View style={styles.statusIndicator}>
                      {sc.icon}
                      <Text style={[styles.statusLabel, { color: sc.color }]}>{sc.label}</Text>
                    </View>
                  </View>

                  {/* Mid: Price and Stock Meter */}
                  <View style={[styles.priceStockRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View>
                      <Text style={[styles.priceLabel, { color: COLORS.textMuted }]}>Prix de vente</Text>
                      <Text style={[styles.productPrice, { color: COLORS.text }]}>
                        {(+product.price || 0).toLocaleString()} DZD
                      </Text>
                    </View>

                    {/* Innovative Stock Gauge */}
                    <View style={styles.stockGaugeWrap}>
                      <View style={styles.stockTextRow}>
                        <PackageIcon size={12} color={COLORS.textSecondary} />
                        <Text style={[styles.stockValueText, { color: COLORS.textSecondary }]}>
                          {product.stock} {product.stock > 1 ? 'unités' : 'unité'}
                        </Text>
                      </View>
                      {/* Discrete 3-segment health bar */}
                      <View style={styles.segmentTrack}>
                        <View
                          style={[
                            styles.segmentBar,
                            { backgroundColor: product.stock > 0 ? (product.stock > 10 ? COLORS.success : COLORS.warning) : COLORS.border }
                          ]}
                        />
                        <View
                          style={[
                            styles.segmentBar,
                            { backgroundColor: product.stock > 10 ? COLORS.success : COLORS.border }
                          ]}
                        />
                        <View
                          style={[
                            styles.segmentBar,
                            { backgroundColor: product.stock > 30 ? COLORS.success : COLORS.border }
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={[styles.cardActions, isRTL && { flexDirection: 'row-reverse' }, { borderTopColor: COLORS.border }]}>
                    <TouchableOpacity
                      style={[styles.editBtn, { backgroundColor: COLORS.primary + '10' }]}
                      onPress={() => handleEditProduct(product.id)}
                      activeOpacity={0.7}
                    >
                      <EditIcon color={COLORS.primary} />
                      <Text style={[styles.editBtnText, { color: COLORS.primary }]}>
                        {t('common_edit') || 'Modifier l\'article'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.deleteBtn, { backgroundColor: COLORS.error + '10' }]}
                      onPress={() => handleDeleteProduct(product)}
                      activeOpacity={0.7}
                    >
                      <TrashIcon color={COLORS.error} />
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
  content: { padding: 20, paddingTop: 54, paddingBottom: 155 },
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

  productCard: { borderRadius: CARD_R, borderWidth: 1, padding: 16, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  productAvatar: { width: 56, height: 56, borderRadius: 14, overflow: 'hidden', flexShrink: 0, borderWidth: 1 },
  avatarImg: { width: '100%', height: '100%' },
  avatarGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  productInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  refCode: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  categoryBadge: { fontSize: 10, fontWeight: '600' },
  productName: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  storeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  storeName: { fontSize: 11, fontWeight: '600' },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  statusLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },

  priceStockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  productPrice: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginTop: 2 },
  stockGaugeWrap: { alignItems: 'flex-end', gap: 4 },
  stockTextRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stockValueText: { fontSize: 12, fontWeight: '600' },
  segmentTrack: { flexDirection: 'row', gap: 3 },
  segmentBar: { width: 18, height: 4, borderRadius: 2 },

  cardActions: { flexDirection: 'row', gap: 8, paddingTop: 10, borderTopWidth: 1 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  editBtnText: { fontSize: 12, fontWeight: '700' },
  deleteBtn: { width: 40, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  emptyIconBadge: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
});

export default ProductsScreen;
