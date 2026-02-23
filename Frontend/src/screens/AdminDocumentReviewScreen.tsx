/**
 * AdminDocumentReviewScreen — Premium Document Review Interface
 * 
 * Shows pending registrations with actual document URLs/files,
 * enhanced rejection modal with required reason, and premium card design.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
  Linking,
  Modal,
  Animated,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors, SPACING, SHADOWS, RADIUS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api.config';

const CARD_RADIUS = 22;
const GRID_GAP = 14;

interface AdminDocumentReviewScreenProps {
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
  goBack?: () => void;
}

interface DocumentInfo {
  type: string;
  url: string;
  label: string;
}

interface PendingUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  accountType: 'seller' | 'delivery';
  accountStatus: string;
  documentsUploaded: boolean;
  createdAt: string;
  documents?: DocumentInfo[];
  document1Path?: string;
  document2Path?: string;
  document3Path?: string;
}

/* ═══ ICONS ═══ */
const ShieldCheckIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const XCircleIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M15 9l-6 6M9 9l6 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const FileTextIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
  </Svg>
);

const ExternalLinkIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 3h6v6M10 14L21 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MailIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const AdminDocumentReviewScreen: React.FC<AdminDocumentReviewScreenProps> = ({
  navigate,
  resetTo,
  goBack,
}) => {
  const { mode, toggleTheme } = useTheme();
  const { t, language, setLanguage, isRTL } = useTranslation();
  const COLORS = getColors(mode);

  const cycleLanguage = () => {
    const languageOrder: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const currentIndex = languageOrder.indexOf(language);
    const nextIndex = (currentIndex + 1) % languageOrder.length;
    setLanguage(languageOrder[nextIndex]);
  };

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalUserId, setRejectModalUserId] = useState<string | null>(null);
  const [rejectModalReason, setRejectModalReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'seller' | 'delivery'>('all');
  const [imageViewerUrl, setImageViewerUrl] = useState<string | null>(null);

  const fetchPendingUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/admin/registrations/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const registrations = data.registrations || data.users || data || [];
        // Map registration data to our PendingUser format
        const mapped = registrations.map((reg: any) => {
          // Helper function to validate document path
          const isValidPath = (path: any) => {
            return path && 
                   path !== 'null' && 
                   path !== 'undefined' && 
                   path !== '' && 
                   typeof path === 'string' &&
                   path.trim().length > 0;
          };

          return {
            id: reg.id || reg.userId,
            fullName: reg.user?.fullName || reg.fullName || 'Unknown',
            email: reg.user?.email || reg.email || '',
            phone: reg.user?.phone || reg.phone || '',
            accountType: reg.user?.accountType || reg.accountType || 'seller',
            accountStatus: reg.verificationStatus || reg.accountStatus || 'pending',
            documentsUploaded: true,
            createdAt: reg.createdAt || new Date().toISOString(),
            document1Path: reg.document1Path,
            document2Path: reg.document2Path,
            document3Path: reg.document3Path,
            documents: [
              isValidPath(reg.document1Path) && { type: 'document1', url: reg.document1Path, label: 'Document 1 (ID Card)' },
              isValidPath(reg.document2Path) && { type: 'document2', url: reg.document2Path, label: 'Document 2 (Business License)' },
              isValidPath(reg.document3Path) && { type: 'document3', url: reg.document3Path, label: 'Document 3 (Additional)' },
            ].filter(Boolean),
          };
        });
        setPendingUsers(mapped);
      } else {
        // Fallback to admin/users endpoint
        const fallbackRes = await fetch(`${API_URL}/admin/users?status=pending&documentsUploaded=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          setPendingUsers(data.users || data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPendingUsers(); }, []);

  const handleApprove = async (userId: string) => {
    Alert.alert(
      'Confirm Approval',
      'Are you sure you want to approve this registration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            setActionLoading(userId);
            try {
              const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
              const response = await fetch(`${API_URL}/admin/registrations/${userId}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              });
              if (!response.ok) {
                // Try fallback endpoint
                await fetch(`${API_URL}/admin/users/${userId}/verify`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ accountStatus: 'active', rejectionReason: '' }),
                });
              }
              setPendingUsers(prev => prev.filter(u => u.id !== userId));
              Alert.alert('✅ Success', 'Registration has been approved successfully.');
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to approve registration. Please try again.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const openRejectModal = (userId: string) => {
    setRejectModalUserId(userId);
    setRejectModalReason(rejectionReasons[userId] || '');
  };

  const handleReject = async () => {
    if (!rejectModalUserId) return;
    const reason = rejectModalReason.trim();
    if (!reason) {
      Alert.alert('⚠️ Required', 'Please provide a reason for rejection.');
      return;
    }
    setActionLoading(rejectModalUserId);
    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/admin/registrations/${rejectModalUserId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        // Try fallback endpoint
        await fetch(`${API_URL}/admin/users/${rejectModalUserId}/verify`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ accountStatus: 'rejected', rejectionReason: reason }),
        });
      }
      setPendingUsers(prev => prev.filter(u => u.id !== rejectModalUserId));
      setRejectModalUserId(null);
      setRejectModalReason('');
      Alert.alert('✅ Done', 'Registration has been rejected.');
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to reject registration. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const openDocument = (url: string) => {
    // Comprehensive URL validation
    if (!url || 
        url === 'null' || 
        url === 'undefined' || 
        url === '' || 
        typeof url !== 'string' ||
        url.trim().length === 0) {
      Alert.alert(
        t('admin_error') || 'Error', 
        t('admin_docNotAvailable') || 'Document path not available. This registration may have been created before the file upload system was configured. Please ask the user to resubmit their documents.'
      );
      return;
    }

    const fullUrl = url.startsWith('http') ? url : `${API_URL}/${url}`;
    
    // Check if it's an image
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
    
    if (isImage) {
      // Open in image viewer modal
      setImageViewerUrl(fullUrl);
    } else {
      // Open PDF or other documents in browser
      Linking.openURL(fullUrl).catch((err) => {
        console.error('Failed to open document:', err);
        Alert.alert(
          t('admin_error') || 'Error', 
          t('admin_docOpenFailed') || 'Unable to open document. Please check if the file exists on the server.'
        );
      });
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  const filteredUsers = pendingUsers.filter(u => {
    if (filter === 'all') return true;
    return u.accountType === filter;
  });

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    headerControls: {
      flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
      gap: 10, paddingHorizontal: 24, paddingVertical: SPACING.sm,
    },
    controlBtn: {
      width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.surface,
      borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
    },
    scroll: { flex: 1 },
    content: { padding: 24, paddingBottom: 40 },

    /* Header Section */
    pageHeader: { marginBottom: 24 },
    pageTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 6, letterSpacing: -0.5 },
    pageSubtitle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },

    /* Filter Tabs */
    filterRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    filterTab: {
      paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14,
      backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    },
    filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterTabText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
    filterTabTextActive: { color: '#FFFFFF' },

    /* Counter Badge */
    counterRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    counterCard: {
      flex: 1, borderRadius: 18, padding: 18, alignItems: 'center',
      backgroundColor: COLORS.warning + '12', borderWidth: 1, borderColor: COLORS.warning + '25',
    },
    counterValue: { fontSize: 36, fontWeight: '900', color: COLORS.warning, letterSpacing: -2 },
    counterLabel: { fontSize: 11, fontWeight: '700', color: COLORS.warning, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },

    /* User Card */
    userCard: {
      backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
      borderRadius: CARD_RADIUS, marginBottom: 16, overflow: 'hidden',
      ...SHADOWS.small,
    },
    userCardHeader: {
      flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14,
    },
    userAvatar: {
      width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 3 },
    userEmail: { fontSize: 12, color: COLORS.textSecondary },
    userMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    userMetaText: { fontSize: 11, color: COLORS.textMuted },
    userTypeBadge: {
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    },
    userTypeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

    /* Expanded Section */
    expandedSection: {
      borderTopWidth: 1, borderTopColor: COLORS.border, padding: 20,
      backgroundColor: COLORS.background,
    },
    sectionLabel: {
      fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 12,
      textTransform: 'uppercase', letterSpacing: 0.5,
    },

    /* Document Cards */
    documentCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
      padding: 14, borderRadius: 14, marginBottom: 10,
    },
    docIconWrap: {
      width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    },
    docInfo: { flex: 1 },
    docLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
    docUrl: { fontSize: 11, color: COLORS.textMuted },
    docViewBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: COLORS.primary + '12', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    },
    docViewText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

    /* No Documents */
    noDocsBanner: {
      backgroundColor: COLORS.warning + '10', borderWidth: 1, borderColor: COLORS.warning + '25',
      borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16,
    },
    noDocsText: { fontSize: 13, fontWeight: '600', color: COLORS.warning, textAlign: 'center' },

    /* Action Buttons */
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    actionBtn: {
      flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
      flexDirection: 'row', justifyContent: 'center', gap: 8,
    },
    approveBtn: { backgroundColor: '#10B981' },
    rejectBtn: { backgroundColor: COLORS.error },
    actionBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

    /* Empty State */
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: {
      width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center',
      backgroundColor: COLORS.success + '15', marginBottom: 20,
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
    emptyMessage: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },

    /* Modal */
    modalOverlay: {
      flex: 1, justifyContent: 'center', alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalCard: {
      width: '90%', maxWidth: 400, borderRadius: CARD_RADIUS,
      backgroundColor: COLORS.surface, padding: 24,
      ...SHADOWS.large,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
    modalSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 20 },
    modalInput: {
      backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border,
      borderRadius: 14, padding: 14, fontSize: 15, color: COLORS.text,
      minHeight: 100, textAlignVertical: 'top',
    },
    modalInputFocused: { borderColor: COLORS.error },
    modalCharCount: { fontSize: 12, color: COLORS.textMuted, textAlign: 'right', marginTop: 8, marginBottom: 16 },
    modalActions: { flexDirection: 'row', gap: 12 },
    modalCancelBtn: {
      flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
      backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
    },
    modalCancelText: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    modalRejectBtn: {
      flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
      backgroundColor: COLORS.error, flexDirection: 'row', justifyContent: 'center', gap: 6,
    },
    modalRejectText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

    /* Image Viewer Modal */
    imageViewerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageViewerClose: {
      position: 'absolute',
      top: 50,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    imageViewerCloseText: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    imageViewerScroll: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    imageViewerImage: {
      width: '100%',
      height: 600,
      maxWidth: 800,
    },
    imageViewerHint: {
      position: 'absolute',
      bottom: 40,
      fontSize: 13,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ padding: 40, borderRadius: CARD_RADIUS, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 16, fontSize: 14, fontWeight: '600', color: COLORS.textMuted }}>Loading registrations...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackHeader title="" onBack={goBack} />
      <View style={styles.headerControls}>
        <TouchableOpacity onPress={cycleLanguage} style={styles.controlBtn} activeOpacity={0.7}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.primary }}>{language.toUpperCase()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={styles.controlBtn} activeOpacity={0.7}>
          {mode === 'light' ? (
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="5" stroke={COLORS.text} strokeWidth="2" />
              <Path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
            </Svg>
          ) : (
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPendingUsers(); }} />}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>{t('admin_documentsReview') || 'Document Review'}</Text>
          <Text style={styles.pageSubtitle}>{t('admin_docReviewDesc') || 'Review and verify uploaded documents from sellers and delivery personnel.'}</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {(['all', 'seller', 'delivery'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f === 'all' ? `All (${pendingUsers.length})` : f === 'seller' ? `Sellers (${pendingUsers.filter(u => u.accountType === 'seller').length})` : `Delivery (${pendingUsers.filter(u => u.accountType === 'delivery').length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Counter */}
        <View style={styles.counterRow}>
          <View style={styles.counterCard}>
            <Text style={styles.counterValue}>{filteredUsers.length}</Text>
            <Text style={styles.counterLabel}>{t('admin_reviewPending') || 'Pending Review'}</Text>
          </View>
        </View>

        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <ShieldCheckIcon color={COLORS.success} size={36} />
            </View>
            <Text style={styles.emptyTitle}>{t('admin_noDocsToReview') || 'All Clear!'}</Text>
            <Text style={styles.emptyMessage}>{t('admin_noPending') || 'No pending registrations to review at this time.'}</Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <TouchableOpacity
                style={styles.userCardHeader}
                onPress={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.userAvatar, { backgroundColor: user.accountType === 'seller' ? COLORS.primary + '15' : COLORS.secondary + '15' }]}>
                  <UserIcon color={user.accountType === 'seller' ? COLORS.primary : COLORS.secondary} size={22} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.userMeta}>
                    <ClockIcon color={COLORS.textMuted} size={11} />
                    <Text style={styles.userMetaText}>{getTimeAgo(user.createdAt)}</Text>
                  </View>
                </View>
                <View style={[styles.userTypeBadge, {
                  backgroundColor: user.accountType === 'seller' ? COLORS.primary + '15' : COLORS.secondary + '15',
                }]}>
                  <Text style={[styles.userTypeText, {
                    color: user.accountType === 'seller' ? COLORS.primary : COLORS.secondary,
                  }]}>
                    {user.accountType}
                  </Text>
                </View>
              </TouchableOpacity>

              {expandedUser === user.id && (
                <View style={styles.expandedSection}>
                  {/* Documents Section */}
                  <Text style={styles.sectionLabel}>📄 Uploaded Documents</Text>

                  {user.documents && user.documents.length > 0 ? (
                    user.documents.map((doc, idx) => (
                      <View key={idx} style={styles.documentCard}>
                        <View style={[styles.docIconWrap, { backgroundColor: COLORS.primary + '12' }]}>
                          <FileTextIcon color={COLORS.primary} size={18} />
                        </View>
                        <View style={styles.docInfo}>
                          <Text style={styles.docLabel}>{doc.label || `Document ${idx + 1}`}</Text>
                          <Text style={styles.docUrl} numberOfLines={1}>{doc.url}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.docViewBtn}
                          onPress={() => openDocument(doc.url)}
                          activeOpacity={0.7}
                        >
                          <ExternalLinkIcon color={COLORS.primary} size={14} />
                          <Text style={styles.docViewText}>View</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    /* Fallback: show generic document chips */
                    <View style={styles.noDocsBanner}>
                      <Text style={styles.noDocsText}>
                        Documents uploaded but URLs not available in API response.
                        {'\n'}Please check the server file storage.
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleApprove(user.id)}
                      activeOpacity={0.8}
                      disabled={actionLoading === user.id}
                    >
                      {actionLoading === user.id ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <ShieldCheckIcon color="#FFFFFF" size={18} />
                          <Text style={styles.actionBtnText}>{t('admin_approve') || 'Approve'}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => openRejectModal(user.id)}
                      activeOpacity={0.8}
                      disabled={actionLoading === user.id}
                    >
                      {actionLoading === user.id ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <XCircleIcon color="#FFFFFF" size={18} />
                          <Text style={styles.actionBtnText}>{t('admin_reject') || 'Reject'}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Rejection Modal */}
      <Modal
        visible={rejectModalUserId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalUserId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚠️ Reject Registration</Text>
            <Text style={styles.modalSubtitle}>
              Please provide a clear reason for rejection. The user will see this message and can resubmit their documents.
            </Text>
            <TextInput
              style={[styles.modalInput, rejectModalReason.length > 0 && styles.modalInputFocused]}
              placeholder="Enter rejection reason (required)..."
              placeholderTextColor={COLORS.textMuted}
              value={rejectModalReason}
              onChangeText={setRejectModalReason}
              multiline
              numberOfLines={4}
              autoFocus
            />
            <Text style={styles.modalCharCount}>{rejectModalReason.length}/500</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { setRejectModalUserId(null); setRejectModalReason(''); }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalRejectBtn, !rejectModalReason.trim() && { opacity: 0.5 }]}
                onPress={handleReject}
                activeOpacity={0.8}
                disabled={!rejectModalReason.trim() || actionLoading !== null}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <XCircleIcon color="#FFFFFF" size={16} />
                    <Text style={styles.modalRejectText}>Reject</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewerUrl !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setImageViewerUrl(null)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity
            style={styles.imageViewerClose}
            onPress={() => setImageViewerUrl(null)}
            activeOpacity={0.8}
          >
            <Text style={styles.imageViewerCloseText}>✕</Text>
          </TouchableOpacity>
          {imageViewerUrl && (
            <ScrollView
              contentContainerStyle={styles.imageViewerScroll}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <Image
                source={{ uri: imageViewerUrl }}
                style={styles.imageViewerImage}
                resizeMode="contain"
              />
            </ScrollView>
          )}
          <Text style={styles.imageViewerHint}>{t('admin_pinchToZoom') || 'Pinch to zoom • Tap X to close'}</Text>
        </View>
      </Modal>
    </View>
  );
};

export default AdminDocumentReviewScreen;
