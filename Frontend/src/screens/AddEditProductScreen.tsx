/**
 * AddEditProductScreen — Algérie Poste E-Commerce Product Editor
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
  Alert,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productAPI, storeAPI } from '../services/api.service';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import { confirmAction } from '../components/confirmAction';
import { API_URL } from '../config/api.config';
import { StoreIcon, ClockIcon, XCircleIcon, FileTextIcon, ShieldIcon } from '../components/ModernIcons';

interface AddEditProductScreenProps {
  navigate?: (screenId: string, params?: any) => void;
  goBack?: () => void;
  productId?: string;
}

/* ── Icons ──────────────────────────────────────────────────── */
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
const BackArrow = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19L5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ImagePlaceholderIcon = ({ color }: { color: string }) => (
  <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="1.5" />
    <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
    <Path d="M21 15L16 10L5 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ── Mock: Simulate admin review statuses ───────────────────── */
// In a real app the server would set these. Here we
// provide a dev-time toggle to simulate all 4 states.
type AdminMockState = 'approved' | 'pending' | 'rejected' | 'not_uploaded';

const AddEditProductScreen: React.FC<AddEditProductScreenProps> = ({ navigate, goBack, productId }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, language, setLanguage, isRTL } = useTranslation();

  const isEditMode = !!productId;

  /* ── State ──────────────────────────────────────────────── */
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Document restriction
  const [docStatus, setDocStatus] = useState<AdminMockState>('not_uploaded');
  const [rejectionReason, setRejectionReason] = useState('');
  const [checkingDocs, setCheckingDocs] = useState(true);

  // Dev mock toggle (remove in production)
  const [mockState, setMockState] = useState<AdminMockState>('approved');

  const { message, showSuccess, showError, clear } = useStatusMessage();

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language) + 1) % langs.length]);
  };

  /* ── Doc status check ───────────────────────────────────── */
  useEffect(() => {
    const check = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
        if (token) {
          const res = await fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const user = await res.json();
            if (user.sellerRegistration) {
              const vs = user.sellerRegistration.verificationStatus;
              if (vs === 'approved') setDocStatus('approved');
              else if (vs === 'rejected') {
                setDocStatus('rejected');
                setRejectionReason(user.sellerRegistration.rejectionReason || '');
              } else if (vs === 'pending') setDocStatus('pending');
              else setDocStatus('not_uploaded');
            } else {
              setDocStatus(user.accountStatus === 'active' ? 'approved' : 'not_uploaded');
            }
          }
        } else {
          // Offline/dev: use mock state
          setDocStatus(mockState);
        }
      } catch (_) {
        // Fallback to mock in dev
        setDocStatus(mockState);
      } finally {
        setCheckingDocs(false);
      }
    };
    check();
  }, [mockState]);

  /* ── Load data ──────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      try {
        const r = await storeAPI.getAllStores();
        setStores(r.stores || []);
        if (r.stores?.length > 0) setSelectedStoreId(r.stores[0].id);

        if (isEditMode && productId) {
          setLoading(true);
          const pr = await productAPI.getProductById(parseInt(productId, 10));
          const p = pr.product;
          setProductName(p.name);
          setProductPrice(p.price.toString());
          setProductDescription(p.description || '');
          setProductStock(p.stock.toString());
          setProductCategory(p.category || '');
          setProductImage(p.imagePath || null);
          setSelectedStoreId(p.storeId);
        }
      } catch (e: any) {
        showError(e.message || t('product_errorSave'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEditMode, productId]);

  /* ── Handlers ───────────────────────────────────────────── */
  const handleImageUpload = async () => {
    try {
      // For web, use native file input instead of ImagePicker
      if (Platform.OS === 'web') {
        // Create a hidden file input element
        const input = (document as any).createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e: any) => {
          const file = e.target.files?.[0];
          if (!file) return;

          console.log('[Image Upload] Selected file:', file.name, file.type, file.size);
          
          setImageUploading(true);
          try {
            const token = await AsyncStorage.getItem('authToken') || await AsyncStorage.getItem('accessToken');
            if (!token) {
              throw new Error('Authentication required');
            }

            const formData = new FormData();
            formData.append('image', file);

            console.log('[Image Upload] Uploading to:', `${API_URL}/upload`);

            const response = await fetch(`${API_URL}/upload`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: formData,
            });

            console.log('[Image Upload] Response status:', response.status);

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error('[Image Upload] Error response:', errorData);
              throw new Error(errorData.message || `Upload failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('[Image Upload] Success:', data);
            setProductImage(data.imagePath || data.path);
            showSuccess(t('product_imageUploaded') || 'Image uploaded successfully!');
          } catch (error: any) {
            console.error('[Image Upload] Error:', error);
            showError(error.message || 'Failed to upload image');
          } finally {
            setImageUploading(false);
          }
        };

        input.click();
        return;
      }

        // Native: Request permissions and use ImagePicker
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            t('common_error') || 'Error',
            'Sorry, we need camera roll permissions to upload images!',
            [{ text: 'OK' }]
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const imageUri = result.assets[0].uri;
          console.log('[Image Upload] Selected image:', imageUri);

          setImageUploading(true);
          try {
            const token = await AsyncStorage.getItem('authToken') || await AsyncStorage.getItem('accessToken');
            if (!token) {
              throw new Error('Authentication required');
            }

            const formData = new FormData();
            const filename = imageUri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            console.log('[Image Upload] File details:', { filename, type });

            formData.append('image', {
              uri: imageUri,
              name: filename,
              type,
            } as any);

            console.log('[Image Upload] Uploading to:', `${API_URL}/upload`);

            const response = await fetch(`${API_URL}/upload`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: formData,
            });

            console.log('[Image Upload] Response status:', response.status);

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error('[Image Upload] Error response:', errorData);
              throw new Error(errorData.message || `Upload failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('[Image Upload] Success:', data);
            setProductImage(data.imagePath || data.path);
            showSuccess(t('product_imageUploaded') || 'Image uploaded successfully!');
          } catch (error: any) {
            console.error('[Image Upload] Error:', error);
            showError(error.message || 'Failed to upload image');
          } finally {
            setImageUploading(false);
          }
        }
      } catch (error: any) {
        console.error('[Image Upload] Error:', error);
        showError(error.message || 'Failed to pick image');
      }
    }

  const handleSave = async () => {
    if (!productName.trim() || !productPrice.trim()) { showError(t('product_missingFields')); return; }
    if (!selectedStoreId) { showError(t('product_missingStore')); return; }
    try {
      setSaving(true);
      const data = {
        storeId: selectedStoreId,
        name: productName.trim(),
        description: productDescription.trim() || undefined,
        price: parseFloat(productPrice),
        stock: productStock ? parseInt(productStock, 10) : 0,
        category: productCategory.trim() || undefined,
        imagePath: productImage || undefined,
        status: 'active',
      };
      if (isEditMode && productId) {
        await productAPI.updateProduct(parseInt(productId, 10), data);
        showSuccess(t('product_updateSuccess'));
      } else {
        await productAPI.createProduct(data);
        showSuccess(t('product_createSuccess'));
      }
      if (goBack) goBack();
    } catch (e: any) {
      showError(e.message || t('product_errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const isRestricted = docStatus !== 'approved';

  /* ── Loading ────────────────────────────────────────────── */
  if (loading || checkingDocs) {
    return (
      <View style={[s.outer, { backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted, marginTop: 12, fontSize: 14, fontWeight: '600' }}>{t('common_loading')}</Text>
      </View>
    );
  }

  /* ── No stores ──────────────────────────────────────────── */
  if (stores.length === 0 && !isEditMode) {
    return (
      <View style={[s.outer, { backgroundColor: COLORS.background }]}>
        <View style={s.scrollInner}>
          {renderHeader()}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
            <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}>
              <StoreIcon size={34} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 8 }}>{t('product_noStore')}</Text>
            <Text style={{ fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 24 }}>{t('product_noStoreDesc')}</Text>
            <TouchableOpacity style={[s.goStoresBtn, { backgroundColor: COLORS.primary }]} onPress={() => navigate?.('stores')}>
              <Text style={{ color: '#FFF', fontWeight: '800' }}>{t('product_goToStores')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  function renderHeader() {
    return (
      <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity style={[s.backBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={goBack} activeOpacity={0.7}>
          <BackArrow color={COLORS.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: COLORS.text }]}>{isEditMode ? t('product_edit') : t('product_add')}</Text>
        <View style={[s.controls, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={[s.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={cycleLanguage} activeOpacity={0.7}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.text }}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={toggleTheme} activeOpacity={0.7}>
            {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── Doc restriction cards ──────────────────────────────── */
  function renderDocRestriction() {
    const isPending = docStatus === 'pending';
    const isRejected = docStatus === 'rejected';
    const color = isRejected ? COLORS.error : COLORS.warning;

    return (
      <View style={[s.restrictCard, { backgroundColor: COLORS.surface, borderColor: color + '40' }]}>
        <View style={[s.restrictIcon, { backgroundColor: color + '15' }]}>
          {isRejected ? (
            <XCircleIcon size={32} color={COLORS.error} strokeWidth={2} />
          ) : isPending ? (
            <ClockIcon size={32} color={COLORS.warning} strokeWidth={2} />
          ) : (
            <FileTextIcon size={32} color={COLORS.primary} strokeWidth={2} />
          )}
        </View>
        <Text style={[s.restrictTitle, { color }]}>{t('product_docRestricted')}</Text>
        <Text style={[s.restrictMsg, { color: COLORS.textMuted }]}>{t('product_docRestrictedMsg')}</Text>

        {isRejected && rejectionReason ? (
          <View style={[s.rejectionBox, { backgroundColor: COLORS.error + '10', borderColor: COLORS.error + '30' }]}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.error, marginBottom: 4 }}>{t('seller_rejectionLabel')}</Text>
            <Text style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 18 }}>{rejectionReason}</Text>
          </View>
        ) : null}

        {isPending ? (
          <View style={[s.pendingBadge, { backgroundColor: COLORS.warning + '14', borderColor: COLORS.warning + '30' }]}>
            <Text style={{ color: COLORS.warning, fontSize: 12, fontWeight: '700' }}>{t('seller_pendingBadge')}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[s.uploadDocBtn, { backgroundColor: isRejected ? COLORS.error : COLORS.primary }]}
          onPress={() => navigate?.('documentUpload', { accountType: 'seller' })}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>
            {isRejected ? t('docState_resubmit') : t('restrict_uploadDocs')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.outer, { backgroundColor: COLORS.background }]}>
      <ScrollView contentContainerStyle={s.scrollInner} showsVerticalScrollIndicator={false}>

        {renderHeader()}
        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* ── Subtitle ───────────────────────────────────── */}
        <Text style={[s.subtitle, { color: COLORS.textMuted }]}>
          {isEditMode ? t('product_editDesc') : t('product_addDesc')}
        </Text>

        {/* ── Doc restriction notice (non-blocking in edit, blocking in add) */}
        {isRestricted && !isEditMode && renderDocRestriction()}

        {/* ── Form (hidden when restricted in creation mode) */}
        {(!isRestricted || isEditMode) && (
          <>
            {/* ── Image upload ─────────────────────────── */}
            <TouchableOpacity style={[s.imagePicker, { backgroundColor: COLORS.surface, borderColor: productImage ? COLORS.success + '60' : COLORS.border }]} onPress={handleImageUpload} activeOpacity={0.7}>
              {imageUploading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : productImage ? (
                <View style={{ alignItems: 'center', gap: 6, width: '100%' }}>
                  <Image 
                    source={{ uri: productImage.startsWith('http') ? productImage : `${API_URL.replace('/api', '')}${productImage}` }} 
                    style={{ width: '100%', height: 200, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  <View style={[s.imageCheck, { backgroundColor: COLORS.success + '18', position: 'absolute', top: 8, right: 8 }]}>
                    <CheckIcon color={COLORS.success} />
                  </View>
                  <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 4 }}>{t('product_changeImage')}</Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <ImagePlaceholderIcon color={COLORS.textMuted} />
                  <Text style={{ color: COLORS.textMuted, fontSize: 12, fontWeight: '600' }}>{t('product_addImage')}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* ── Store selector ───────────────────────── */}
            <View style={[s.sectionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <Text style={[s.sectionLabel, { color: COLORS.textMuted }]}>{t('product_store')} *</Text>
              <View style={[s.chipRow, isRTL && { flexDirection: 'row-reverse' }]}>
                {stores.map(store => {
                  const active = selectedStoreId === store.id;
                  return (
                    <TouchableOpacity
                      key={store.id}
                      style={[s.chip, { backgroundColor: active ? COLORS.primary + '18' : COLORS.background, borderColor: active ? COLORS.primary : COLORS.border }]}
                      onPress={() => setSelectedStoreId(store.id)}
                    >
                      <Text style={[s.chipText, { color: active ? COLORS.primary : COLORS.textMuted }]}>{store.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Main form card ───────────────────────── */}
            <View style={[s.sectionCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <Field label={`${t('product_name')} *`} value={productName} set={setProductName} placeholder={t('product_namePlaceholder')} COLORS={COLORS} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Field label={`${t('product_price')} *`} value={productPrice} set={setProductPrice} placeholder={t('product_pricePlaceholder')} COLORS={COLORS} keyboard="decimal-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label={t('product_stock')} value={productStock} set={setProductStock} placeholder={t('product_stockPlaceholder')} COLORS={COLORS} keyboard="numeric" />
                </View>
              </View>
              <Field label={t('product_category')} value={productCategory} set={setProductCategory} placeholder={t('product_categoryPlaceholder')} COLORS={COLORS} />
              <Field label={t('product_description')} value={productDescription} set={setProductDescription} placeholder={t('product_descPlaceholder')} COLORS={COLORS} multiline />
            </View>

            {/* ── Official Verification Info Card ──────── */}
            {!isEditMode && (
              <View style={[s.infoCard, { backgroundColor: COLORS.primary + '0D', borderColor: COLORS.primary + '25' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <ShieldIcon size={18} color={COLORS.primary} strokeWidth={2} />
                  <Text style={{ fontSize: 13, color: COLORS.text, fontWeight: '700' }}>Algérie Poste Verification Policy</Text>
                </View>
                <Text style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 19 }}>
                  All listings comply with national commercial standards. Once submitted, your product will be validated by the seller moderation desk within 24 to 48 hours.
                </Text>
              </View>
            )}

            {/* ── Save button ──────────────────────────── */}
            <TouchableOpacity style={[s.saveBtn, { opacity: saving ? 0.7 : 1 }]} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
              <LinearGradient colors={['#0D2C74', '#1E40AF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveBtnGrad}>
                {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.saveBtnText}>{isEditMode ? t('product_update') : t('product_create')}</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={[s.footerNote, { color: COLORS.textMuted }]}>
              {isEditMode ? t('product_updateHint') : t('product_createHint')}
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
};

/* ── Reusable field ─────────────────────────────────────────── */
const Field = ({ label, value, set, placeholder, COLORS, keyboard, multiline }: any) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</Text>
    <TextInput
      style={[s.input, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.text, ...(multiline ? { minHeight: 90, paddingTop: 12, textAlignVertical: 'top' } : {}) }]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textMuted}
      value={value}
      onChangeText={set}
      keyboardType={keyboard || 'default'}
      multiline={!!multiline}
      numberOfLines={multiline ? 4 : 1}
    />
  </View>
);

const s = StyleSheet.create({
  outer: { flex: 1 },
  scrollInner: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  controls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  subtitle: { fontSize: 13, marginBottom: 20, lineHeight: 20 },
  imagePicker: { height: 110, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  imageCheck: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  sectionCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  saveBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  saveBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  footerNote: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  goStoresBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },

  // Doc restriction
  restrictCard: { borderRadius: 22, borderWidth: 2, padding: 24, alignItems: 'center', marginBottom: 20 },
  restrictIcon: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  restrictTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  restrictMsg: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 16, paddingHorizontal: 10 },
  rejectionBox: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 16, width: '100%' },
  pendingBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  uploadDocBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, marginBottom: 16 },
});

export default AddEditProductScreen;
