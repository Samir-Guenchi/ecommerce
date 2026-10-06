/**
 * StoresScreen — Algérie Poste E-Commerce Store Management
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import { confirmAction } from '../components/confirmAction';
import { storeAPI, orderAPI } from '../services/api.service';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { Logo } from '../components/Logo';
import BottomNav, { BottomTabId } from './BottomNav';
import { API_URL, getStorefrontUrl } from '../config/api.config';
import { StoreIcon, XCircleIcon, AlertTriangleIcon } from '../components/ModernIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_R = 22;

/* ═══════════════ ICONS ═══════════════ */
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
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);
const MapPinIcon = ({ color }: { color: string }) => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61 3.95 5.32 5.64 3.64C7.32 1.95 9.61 1 12 1C14.39 1 16.68 1.95 18.36 3.64C20.05 5.32 21 7.61 21 10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.5" />
  </Svg>
);
const GlobeIcon = ({ color }: { color: string }) => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
    <Path d="M2 12H22M12 2C14.5 4.5 16 8.5 16 12C16 15.5 14.5 19.5 12 22M12 2C9.5 4.5 8 8.5 8 12C8 15.5 9.5 19.5 12 22" stroke={color} strokeWidth="1.5" />
  </Svg>
);
const ExternalLinkIcon = ({ color }: { color: string }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path d="M18 13V19C18 19.53 17.79 20.04 17.41 20.41C17.04 20.79 16.53 21 16 21H5C4.47 21 3.96 20.79 3.59 20.41C3.21 20.04 3 19.53 3 19V8C3 7.47 3.21 6.96 3.59 6.59C3.96 6.21 4.47 6 5 6H11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 3H21V9M10 14L21 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const EditIcon = ({ color }: { color: string }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4C3.47 4 2.96 4.21 2.59 4.59C2.21 4.96 2 5.47 2 6V20C2 20.53 2.21 21.04 2.59 21.41C2.96 21.79 3.47 22 4 22H18C18.53 22 19.04 21.79 19.41 21.41C19.79 21.04 20 20.53 20 20V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5C18.89 2.11 19.41 1.9 19.95 1.9C20.49 1.9 21.01 2.11 21.4 2.5C21.79 2.89 22 3.41 22 3.95C22 4.49 21.79 5.01 21.4 5.4L12 15L8 16L9 12L18.5 2.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const SettingsIcon = ({ color }: { color: string }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path d="M19.4 15C19.27 15.3 19.23 15.64 19.29 15.96C19.34 16.29 19.5 16.58 19.73 16.82L19.79 16.88C20.16 17.25 20.37 17.75 20.37 18.27C20.37 18.79 20.16 19.29 19.79 19.66C19.42 20.03 18.92 20.24 18.4 20.24C17.88 20.24 17.38 20.03 17.01 19.66L16.95 19.6C16.71 19.37 16.42 19.21 16.09 19.16C15.77 19.1 15.43 19.14 15.13 19.27C14.83 19.4 14.58 19.61 14.4 19.88C14.23 20.14 14.13 20.46 14.13 20.78V21C14.13 21.52 13.92 22.02 13.55 22.39C13.18 22.76 12.68 22.97 12.16 22.97C11.64 22.97 11.14 22.76 10.77 22.39C10.4 22.02 10.19 21.52 10.19 21V20.91C10.18 20.58 10.07 20.25 9.86 19.98C9.66 19.71 9.38 19.51 9.07 19.4C8.77 19.27 8.43 19.23 8.11 19.29C7.79 19.34 7.49 19.5 7.25 19.73L7.19 19.79C6.82 20.16 6.32 20.37 5.8 20.37C5.28 20.37 4.78 20.16 4.41 19.79C4.04 19.42 3.83 18.92 3.83 18.4C3.83 17.88 4.04 17.38 4.41 17.01L4.47 16.95C4.7 16.71 4.86 16.42 4.91 16.09C4.97 15.77 4.93 15.43 4.8 15.13C4.67 14.83 4.46 14.58 4.19 14.4C3.93 14.23 3.61 14.13 3.29 14.13H3C2.48 14.13 1.98 13.92 1.61 13.55C1.24 13.18 1.03 12.68 1.03 12.16C1.03 11.64 1.24 11.14 1.61 10.77C1.98 10.4 2.48 10.19 3 10.19H3.09C3.42 10.18 3.75 10.07 4.02 9.86C4.29 9.66 4.49 9.38 4.6 9.07C4.73 8.77 4.77 8.43 4.71 8.11C4.66 7.79 4.5 7.49 4.27 7.25L4.21 7.19C3.84 6.82 3.63 6.32 3.63 5.8C3.63 5.28 3.84 4.78 4.21 4.41C4.58 4.04 5.08 3.83 5.6 3.83C6.12 3.83 6.62 4.04 6.99 4.41L7.05 4.47C7.29 4.7 7.58 4.86 7.91 4.91C8.23 4.97 8.57 4.93 8.87 4.8H8.93C9.23 4.67 9.48 4.46 9.66 4.19C9.84 3.93 9.94 3.61 9.94 3.29V3C9.94 2.48 10.15 1.98 10.52 1.61C10.89 1.24 11.39 1.03 11.91 1.03C12.43 1.03 12.93 1.24 13.3 1.61C13.67 1.98 13.88 2.48 13.88 3V3.09C13.88 3.41 13.98 3.74 14.16 4.01C14.34 4.28 14.59 4.49 14.9 4.6C15.2 4.73 15.54 4.77 15.86 4.71C16.19 4.66 16.49 4.5 16.73 4.27L16.79 4.21C17.16 3.84 17.66 3.63 18.18 3.63C18.7 3.63 19.2 3.84 19.57 4.21C19.94 4.58 20.15 5.08 20.15 5.6C20.15 6.12 19.94 6.62 19.57 6.99L19.51 7.05C19.28 7.29 19.12 7.58 19.07 7.91C19.01 8.23 19.05 8.57 19.18 8.87V8.93C19.31 9.23 19.52 9.48 19.79 9.66C20.06 9.84 20.38 9.94 20.7 9.94H21C21.52 9.94 22.02 10.15 22.39 10.52C22.76 10.89 22.97 11.39 22.97 11.91C22.97 12.43 22.76 12.93 22.39 13.3C22.02 13.67 21.52 13.88 21 13.88H20.91C20.59 13.88 20.26 13.98 19.99 14.16C19.72 14.34 19.51 14.59 19.4 14.9C19.27 15.2 19.23 15.54 19.4 15Z" stroke={color} strokeWidth="2" />
  </Svg>
);
const TrashIcon = ({ color }: { color: string }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H5H21M19 6L18.09 19.13C18.04 19.67 17.79 20.17 17.38 20.53C16.98 20.89 16.46 21.09 15.91 21.09H8.09C7.54 21.09 7.02 20.89 6.62 20.53C6.21 20.17 5.96 19.67 5.91 19.13L5 6M10 11V17M14 11V17M15 6V4C15 3.73 14.89 3.48 14.71 3.29C14.53 3.11 14.28 3 14 3H10C9.73 3 9.47 3.11 9.29 3.29C9.11 3.47 9 3.73 9 4V6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ═══════════════ STORE CARD ═══════════════ */
interface Store { id: number; name: string; status: string; location: string | null; description?: string | null; domain?: string | null; }

const StoreCard = ({ store, index, orderCount, COLORS, onEdit, onSettings, onDelete, onOpenStorefront, onToggleStatus, t }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const isActive = store.status?.toLowerCase() === 'active';
  const isDraft = store.status?.toLowerCase() === 'draft';
  const isSuspended = store.status?.toLowerCase() === 'suspended';

  const statusLabel = isActive 
    ? (t('stores_active') || 'En ligne') 
    : isDraft 
      ? (t('stores_draft') || 'Brouillon') 
      : (t('stores_suspended') || 'Suspendu');

  const statusColor = isActive ? COLORS.success : isDraft ? COLORS.warning : COLORS.error;

  return (
    <Animated.View style={[
      styles.storeCard,
      { backgroundColor: COLORS.surface, borderColor: COLORS.border, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      {/* Top Brand Accent Line */}
      <View style={[styles.cardTopAccent, { backgroundColor: isActive ? '#0D2C74' : COLORS.border }]} />

      <View style={styles.cardBody}>
        {/* Header: Avatar, Name, Location & Clean Status */}
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={['#0D2C74', '#1E40AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.storeAvatar}
          >
            <Text style={styles.storeAvatarText}>
              {store.name?.charAt(0)?.toUpperCase() || 'S'}
            </Text>
          </LinearGradient>

          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.storeName, { color: COLORS.text }]} numberOfLines={1}>{store.name}</Text>
              <View style={[styles.statusTag, { borderColor: statusColor + '40', backgroundColor: statusColor + '10' }]}>
                <Text style={[styles.statusTagText, { color: statusColor }]}>{statusLabel}</Text>
              </View>
            </View>

            {store.location ? (
              <View style={styles.locationRow}>
                <MapPinIcon color={COLORS.textMuted} />
                <Text style={[styles.locationText, { color: COLORS.textMuted }]} numberOfLines={1}>{store.location}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Suspended Warning */}
        {isSuspended && (
          <View style={[styles.suspendedWarning, { backgroundColor: COLORS.error + '10', borderColor: COLORS.error + '30' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AlertTriangleIcon size={14} color={COLORS.error} strokeWidth={2} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.error }}>
                {t('stores_suspendedByAdmin') || 'Suspendu par l\'administrateur'}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>
              {t('stores_contactAdmin') || 'Contactez le support pour réactiver votre boutique.'}
            </Text>
          </View>
        )}

        {/* Description */}
        {store.description ? (
          <Text style={[styles.storeDesc, { color: COLORS.textSecondary }]} numberOfLines={2}>{store.description}</Text>
        ) : null}

        {/* Metrics Bar */}
        <View style={[styles.metricsBar, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: COLORS.textMuted }]}>{t('dashboard_orders') || 'Commandes'}</Text>
            <Text style={[styles.metricValue, { color: COLORS.text }]}>{orderCount || 0}</Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: COLORS.border }]} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: COLORS.textMuted }]}>{t('store_domain') || 'Domaine Web'}</Text>
            <Text style={[styles.metricValue, { color: COLORS.primary }]} numberOfLines={1}>
              {store.domain ? `${store.domain}.dz` : 'Boutique AP'}
            </Text>
          </View>
        </View>

        {/* Prominent Storefront Button — Opens the real web storefront */}
        <TouchableOpacity
          style={[styles.openStorefrontBtn, { backgroundColor: '#0D2C74' }]}
          onPress={onOpenStorefront}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <GlobeIcon color="#FDB913" />
            <Text style={styles.openStorefrontText}>
              {t('stores_visitWeb') || 'Visiter le site web de la boutique'}
            </Text>
          </View>
          <ExternalLinkIcon color="#FFFFFF" />
        </TouchableOpacity>

        {/* Status Toggle (Draft vs Active) */}
        {!isSuspended && (
          <View style={[styles.toggleContainer, { borderTopColor: COLORS.border }]}>
            <Text style={[styles.toggleLabel, { color: COLORS.textSecondary }]}>
              {t('stores_storeStatus') || 'État de la boutique :'}
            </Text>
            <View style={[styles.segmentedTrack, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  isDraft && { backgroundColor: COLORS.warning + '25', borderColor: COLORS.warning }
                ]}
                onPress={() => onToggleStatus(store.id, 'draft')}
                activeOpacity={0.7}
              >
                <Text style={[styles.segmentText, { color: isDraft ? COLORS.warning : COLORS.textMuted, fontWeight: isDraft ? '800' : '600' }]}>
                  {t('stores_draft') || 'Brouillon'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  isActive && { backgroundColor: COLORS.success + '25', borderColor: COLORS.success }
                ]}
                onPress={() => onToggleStatus(store.id, 'active')}
                activeOpacity={0.7}
              >
                <Text style={[styles.segmentText, { color: isActive ? COLORS.success : COLORS.textMuted, fontWeight: isActive ? '800' : '600' }]}>
                  {t('stores_active') || 'Actif'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Manage Action Row */}
        <View style={[styles.actionRow, { borderTopColor: COLORS.border }]}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary + '10' }]} onPress={onEdit} activeOpacity={0.7}>
            <EditIcon color={COLORS.primary} />
            <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>{t('common_edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FDB91318' }]} onPress={onSettings} activeOpacity={0.7}>
            <SettingsIcon color="#B45309" />
            <Text style={[styles.actionBtnText, { color: '#B45309' }]}>{t('common_settings')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.error + '10' }]} onPress={onDelete} activeOpacity={0.7}>
            <TrashIcon color={COLORS.error} />
            <Text style={[styles.actionBtnText, { color: COLORS.error }]}>{t('common_delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

/* ═══════════════ MAIN ═══════════════ */
interface StoresScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
  goBack?: () => void;
}

const StoresScreen: React.FC<StoresScreenProps> = ({ navigate, resetTo, goBack }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderCounts, setOrderCounts] = useState<Record<number, number>>({});
  const [userType, setUserType] = useState<'buyer' | 'seller' | 'both'>('buyer');
  const [sellerStatus, setSellerStatus] = useState<'not_submitted' | 'pending' | 'approved' | 'rejected'>('not_submitted');
  const [rejectionReason, setRejectionReason] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { message, showSuccess, showError, showInfo, clear } = useStatusMessage();

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const idx = langs.indexOf(language);
    setLanguage(langs[(idx + 1) % langs.length]);
  };

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserType(user.accountType || 'buyer');
      }
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          const res = await fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const user = await res.json();
            
            setUserType(user.accountType || 'buyer');
            
            // Determine seller status
            let status: 'not_submitted' | 'pending' | 'approved' | 'rejected' = 'not_submitted';
            
            // Priority 1: Check sellerRegistration if it exists
            if (user.sellerRegistration) {
              const vs = user.sellerRegistration.verificationStatus;
              if (vs === 'approved') {
                status = 'approved';
              } else if (vs === 'rejected') {
                status = 'rejected';
                setRejectionReason(user.sellerRegistration.rejectionReason || '');
              } else if (vs === 'pending') {
                status = 'pending';
              } else {
                // sellerRegistration exists but status is not set - treat as not_submitted
                status = 'not_submitted';
              }
            }
            // Priority 2: Check documentsUploaded flag
            else if (user.documentsUploaded === true) {
              status = 'pending';
            }
            // Priority 3: If accountStatus is explicitly 'pending', treat as pending
            else if (user.accountStatus === 'pending') {
              status = 'pending';
            }
            // Default: not_submitted (don't auto-approve based on accountStatus alone)
            else {
              status = 'not_submitted';
            }
            
            setSellerStatus(status);
          }
        } catch (err) { 
          // Silent error handling
        }
      }
    } catch (e) { 
      // Silent error handling
    }
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await storeAPI.getAllStores();
      setStores(response.stores);
      const counts: Record<number, number> = {};
      for (const store of response.stores) {
        try {
          const ordersRes = await orderAPI.getAllOrders();
          counts[store.id] = (ordersRes.orders || []).filter((o: any) => o.storeId === store.id).length;
        } catch { counts[store.id] = 0; }
      }
      setOrderCounts(counts);
    } catch (error: any) {
      showError(error.message || 'Failed to load stores.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  };

  useEffect(() => {
    loadUserData();
    fetchStores();
  }, []);

  const handleDeleteStore = async (storeId: number, storeName: string) => {
    const confirmed = await confirmAction(t('stores_deleteTitle'), t('stores_deleteConfirm', { name: storeName }));
    if (!confirmed) return;
    try {
      await storeAPI.deleteStore(storeId);
      showSuccess(t('stores_deleteSuccess'));
      await fetchStores();
    } catch (error: any) {
      showError(error.message || t('stores_deleteFail'));
    }
  };

  const handleToggleStatus = async (storeId: number, newStatus: 'draft' | 'active') => {
    try {
      const response = await storeAPI.updateStore(storeId, { status: newStatus });
      showSuccess(t('stores_statusUpdated') || `Store status changed to ${newStatus}`);
      await fetchStores();
    } catch (error: any) {
      // Check if it's a suspended store error
      if (error.message?.includes('suspended') || error.message?.includes('admin')) {
        showError(t('stores_cannotActivateSuspended') || 'Cannot activate suspended store. Please contact admin.');
      } else {
        showError(error.message || t('stores_statusUpdateFailed') || 'Failed to update store status');
      }
    }
  };

  const handleOpenStorefront = async (domain: string) => {
    try {
      const url = getStorefrontUrl(domain);
      console.log('🌐 Opening Storefront URL:', url);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(url, '_blank');
      } else {
        const canOpen = await Linking.canOpenURL(url).catch(() => false);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          await Linking.openURL(url);
        }
      }
    } catch (err: any) {
      console.error('Failed to open storefront URL:', err);
      showError('Impossible d\'ouvrir le site de la boutique');
    }
  };

  const handleCreateStore = () => {
    if (sellerStatus === 'not_submitted') {
      // Navigate directly to document upload
      navigate?.('documentUpload', { accountType: 'seller' });
    } else if (sellerStatus === 'pending') {
      // Documents under review - show info message
      showInfo(t('stores_pendingMessage') || 'Your documents are under review. This typically takes 2-3 business days. You\'ll be notified once approved.');
      return;
    } else if (sellerStatus === 'approved') {
      // Approved - allow store creation
      navigate?.('addEditStore');
    } else {
      // Fallback for any other status
      navigate?.('addEditStore');
    }
  };

  const handleTabPress = (tab: BottomTabId) => {
    if (tab === 'stores') return;
    resetTo ? resetTo(tab) : navigate?.(tab);
  };

  const activeCount = stores.filter(s => s.status?.toLowerCase() === 'active' || s.status?.toLowerCase() === 'published').length;
  const totalOrders = Object.values(orderCounts).reduce((a, b) => a + b, 0);

  /* ─── Header (shared) ─────────────────────── */
  const Header = () => (
    <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
      <View style={[styles.headerLeft, isRTL && { flexDirection: 'row-reverse' }]}>
        <Logo variant="icon" size={38} />
        <View style={{ marginLeft: 10 }}>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>{t('nav_stores') || 'My Stores'}</Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: '500' }}>{stores.length} {t('stores_total') || 'stores'}</Text>
        </View>
      </View>
      <View style={[styles.headerControls, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
          onPress={cycleLanguage} activeOpacity={0.7}
        >
          <Text style={{ fontSize: 10, fontWeight: '700', color: COLORS.text }}>{language.toUpperCase()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
          onPress={toggleTheme} activeOpacity={0.7}
        >
          {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[{ flex: 1, backgroundColor: COLORS.background }, styles.center]}>
        <View style={{ backgroundColor: COLORS.surface, padding: 40, borderRadius: CARD_R, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 16, color: COLORS.textMuted, fontWeight: '600' }}>{t('stores_loading') || 'Loading stores...'}</Text>
        </View>
      </View>
    );
  }

  /* ─── BUYER RESTRICTION ───────────────────── */
  if (userType === 'buyer') {
    return (
      <View style={[styles.outer, { backgroundColor: COLORS.background }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Header />
          <View style={[styles.stateCard, { backgroundColor: COLORS.surface, borderColor: COLORS.warning + '30' }]}>
            <View style={[styles.stateIconBadge, { backgroundColor: COLORS.warning + '15' }]}>
              <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                <Path d="M3 9L12 2L21 9V20C21 20.53 20.79 21.04 20.41 21.41C20.04 21.79 19.53 22 19 22H5C4.47 22 3.96 21.79 3.59 21.41C3.21 21.04 3 20.53 3 20V9Z" stroke={COLORS.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M9 22V12H15V22" stroke={COLORS.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={[styles.stateTitle, { color: COLORS.warning }]}>{t('stores_sellerRequired')}</Text>
            <Text style={[styles.stateDesc, { color: COLORS.textSecondary }]}>
              {t('stores_sellerRequiredDesc')}
            </Text>
            <TouchableOpacity style={[styles.stateBtn, { backgroundColor: COLORS.primary }]} onPress={() => navigate?.('documentUpload', { accountType: 'seller' })} activeOpacity={0.8}>
              <Text style={styles.stateBtnText}>{t('stores_goToSettings')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <BottomNav activeTab="stores" onTabPress={handleTabPress} />
      </View>
    );
  }

  /* ─── SELLER VERIFICATION STATES ─────────── */
  // Only block if rejected - allow not_submitted and pending to see stores list
  if (sellerStatus === 'rejected') {
    const cfg = { 
      color: COLORS.error, 
      title: t('stores_rejected'), 
      desc: t('stores_rejectedDesc'), 
      btnText: t('stores_resubmit'), 
      btnNav: 'documentUpload' 
    };

    return (
      <View style={[styles.outer, { backgroundColor: COLORS.background }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Header />
          <View style={[styles.stateCard, { backgroundColor: COLORS.surface, borderColor: cfg.color + '30' }]}>
            <View style={[styles.stateIconBadge, { backgroundColor: cfg.color + '15' }]}>
              <XCircleIcon size={36} color={cfg.color} strokeWidth={2} />
            </View>
            <Text style={[styles.stateTitle, { color: cfg.color }]}>{cfg.title}</Text>
            <Text style={[styles.stateDesc, { color: COLORS.textSecondary }]}>{cfg.desc}</Text>

            {rejectionReason ? (
              <View style={[styles.rejectionBox, { backgroundColor: COLORS.error + '10', borderColor: COLORS.error + '30' }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.error, marginBottom: 4 }}>{t('stores_rejectionReason')}</Text>
                <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 }}>{rejectionReason}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={[styles.stateBtn, { backgroundColor: COLORS.primary }]} onPress={() => navigate?.(cfg.btnNav, { accountType: 'seller' })} activeOpacity={0.8}>
              <Text style={styles.stateBtnText}>{cfg.btnText}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <BottomNav activeTab="stores" onTabPress={handleTabPress} />
      </View>
    );
  }

  /* ─── ALL SELLERS — STORES LIST ────────── */
  // Show stores list for all sellers (not_submitted, pending, approved)
  // But only approved sellers can actually create stores (checked in handleCreateStore)
  return (
    <View style={[styles.outer, { backgroundColor: COLORS.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadUserData(); fetchStores(); }} tintColor={COLORS.primary} />}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Header />
          <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

          {/* ── Pending Review Banner ── */}
          {sellerStatus === 'pending' && (
            <View style={[styles.pendingBanner, { backgroundColor: COLORS.warning + '12', borderColor: COLORS.warning + '30' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <AlertTriangleIcon size={20} color={COLORS.warning} strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.warning, marginBottom: 4 }}>
                    {t('stores_underReview')}
                  </Text>
                  <Text style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 }}>
                    {t('stores_underReviewDesc')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── Hero Stats ── */}
          <View style={[styles.heroCard, { borderColor: COLORS.border }]}>
            <LinearGradient colors={['#0D2C74', '#1E40AF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGrad}>
              <View style={styles.heroRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{stores.length}</Text>
                  <Text style={styles.heroStatLabel}>{t('stores_total') || 'Total'}</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{activeCount}</Text>
                  <Text style={styles.heroStatLabel}>{t('dashboard_active') || 'Active'}</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{totalOrders}</Text>
                  <Text style={styles.heroStatLabel}>{t('dashboard_orders') || 'Orders'}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* ── Add Store Button ── */}
          <TouchableOpacity
            style={[styles.addStoreBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.primary + '40', borderStyle: 'dashed' }]}
            onPress={handleCreateStore}
            activeOpacity={0.7}
          >
            <View style={[styles.addStoreBtnIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <PlusIcon color={COLORS.primary} />
            </View>
            <Text style={[styles.addStoreBtnText, { color: COLORS.primary }]}>{t('stores_createStore') || 'Create New Store'}</Text>
          </TouchableOpacity>

          {/* ── Stores List ── */}
          {stores.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <StoreIcon size={34} color={COLORS.primary} strokeWidth={2} />
              </View>
              <Text style={[styles.emptyTitle, { color: COLORS.text }]}>{t('stores_noStores') || "You don't have any stores yet"}</Text>
              <Text style={[styles.emptyDesc, { color: COLORS.textSecondary }]}>{t('stores_noStoresDesc') || 'Get started by creating your first store above.'}</Text>
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              {stores.map((store, index) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  index={index}
                  orderCount={orderCounts[store.id] || 0}
                  COLORS={COLORS}
                  t={t}
                  onEdit={() => navigate?.('addEditStore', { storeId: store.id.toString() })}
                  onSettings={() => navigate?.('storeSettings', { storeId: store.id.toString() })}
                  onDelete={() => handleDeleteStore(store.id, store.name)}
                  onOpenStorefront={() => handleOpenStorefront(store.domain || '')}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
      <BottomNav activeTab="stores" onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  outer: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingTop: 54, paddingBottom: 155 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerControls: { flexDirection: 'row', gap: 8 },
  controlBtn: { width: 42, height: 42, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  heroCard: { borderRadius: CARD_R, overflow: 'hidden', marginBottom: 14, borderWidth: 1 },
  heroGrad: { padding: 22 },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  heroDivider: { width: 1, height: 44, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 10 },

  addStoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: CARD_R, paddingVertical: 16, borderWidth: 1.5, marginBottom: 14, gap: 12 },
  addStoreBtnIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  addStoreBtnText: { fontSize: 15, fontWeight: '700' },

  emptyCard: { borderRadius: CARD_R, padding: 40, borderWidth: 1, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  storeCard: { borderRadius: CARD_R, borderWidth: 1, overflow: 'hidden' },
  cardTopAccent: { height: 4 },
  cardBody: { padding: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  storeAvatar: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  storeAvatarText: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  headerInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  storeName: { fontSize: 17, fontWeight: '800', flex: 1, marginRight: 8 },
  statusTag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  statusTagText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, fontWeight: '500' },
  storeDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  suspendedWarning: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 12 },
  metricsBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12 },
  metricItem: { flex: 1, alignItems: 'center' },
  metricLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  metricValue: { fontSize: 14, fontWeight: '800' },
  metricDivider: { width: 1, height: 26 },
  openStorefrontBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
  openStorefrontText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1 },
  toggleLabel: { fontSize: 12, fontWeight: '600' },
  segmentedTrack: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, padding: 2, gap: 4 },
  segmentBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  segmentText: { fontSize: 11 },
  actionRow: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  actionBtnText: { fontSize: 12, fontWeight: '700' },

  stateCard: { borderRadius: CARD_R, padding: 32, alignItems: 'center', borderWidth: 1, marginTop: 8 },
  stateIconBadge: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  stateTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  stateDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  stateBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  stateBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  pendingBanner: { borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1 },
  rejectionBox: { width: '100%', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
});

export default StoresScreen;
