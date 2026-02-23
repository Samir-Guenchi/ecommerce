/**
 * DocumentUploadScreen - 3-state document verification system
 * States: incomplete → in_review → accepted/rejected
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { getColors, SPACING, SHADOWS, RADIUS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api.config';

type DocumentStatus = 'incomplete' | 'in_review' | 'accepted' | 'rejected';

interface DocumentUploadScreenProps {
  accountType?: 'seller' | 'delivery';
  navigate?: (screenId: string, params?: Record<string, any>) => void;
  resetTo?: (screenId: string) => void;
  goBack?: () => void;
}

interface DocumentItem {
  type: string;
  label: string;
  description: string;
  required: boolean;
  file?: any;
  uploaded: boolean;
}

/* ═══ ICONS ═══ */
const ShieldCheckIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const AlertTriangleIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 9v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="17" r="0.5" fill={color} stroke={color} strokeWidth="1" />
  </Svg>
);

const XCircleIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M15 9l-6 6M9 9l6 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const FileIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UploadCloudIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M16 16l-4-4-4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 12v9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DocumentUploadScreen: React.FC<DocumentUploadScreenProps> = ({
  accountType: propAccountType,
  navigate,
  resetTo,
  goBack,
}) => {
  const { mode, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const COLORS = getColors(mode);

  const cycleLanguage = () => {
    const languageOrder: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const currentIndex = languageOrder.indexOf(language);
    const nextIndex = (currentIndex + 1) % languageOrder.length;
    setLanguage(languageOrder[nextIndex]);
  };

  const [accountType, setAccountType] = useState<'seller' | 'delivery'>(propAccountType || 'seller');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus>('incomplete');
  const [rejectionReason, setRejectionReason] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const getDocumentsList = (type: string): DocumentItem[] => {
    if (type === 'seller') {
      return [
        { type: 'business_license', label: t('docs_businessLicense'), description: t('docs_businessLicenseDesc'), required: true, uploaded: false },
        { type: 'id_card', label: t('docs_idCard'), description: t('docs_idCardDesc'), required: true, uploaded: false },
      ];
    }
    return [
      { type: 'id_card', label: t('docs_idCard'), description: t('docs_idCardDesc'), required: true, uploaded: false },
      { type: 'driver_license', label: t('docs_driverLicense'), description: t('docs_driverLicenseDesc'), required: true, uploaded: false },
      { type: 'vehicle_registration', label: t('docs_vehicleRegistration'), description: t('docs_vehicleRegistrationDesc'), required: false, uploaded: false },
    ];
  };

  const [documents, setDocuments] = useState<DocumentItem[]>(getDocumentsList(accountType));

  // Fetch current document status from backend
  useEffect(() => {
    const fetchDocumentStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
        if (!token) { setDocumentStatus('incomplete'); setLoading(false); return; }

        const response = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const user = await response.json();
          
          if (!propAccountType && user.accountType) {
            const type = user.accountType === 'delivery' ? 'delivery' : 'seller';
            setAccountType(type);
            setDocuments(getDocumentsList(type));
          }
          
          // Determine document status
          let newStatus: DocumentStatus = 'incomplete';
          
          // Priority 1: Check sellerRegistration if it exists
          if (user.sellerRegistration) {
            const vs = user.sellerRegistration.verificationStatus;
            if (vs === 'approved') {
              newStatus = 'accepted';
            } else if (vs === 'rejected') {
              newStatus = 'rejected';
              setRejectionReason(user.sellerRegistration.rejectionReason || '');
            } else if (vs === 'pending') {
              newStatus = 'in_review';
            } else {
              newStatus = 'incomplete';
            }
          }
          // Priority 2: Check documentsUploaded flag
          else if (user.documentsUploaded === true) {
            newStatus = 'in_review';
          }
          // Priority 3: Check if explicitly rejected
          else if (user.accountStatus === 'rejected') {
            newStatus = 'rejected';
            setRejectionReason(user.rejectionReason || '');
          }
          // Default: incomplete
          else {
            newStatus = 'incomplete';
          }
          
          setDocumentStatus(newStatus);
        }
      } catch (err) {
        // Silent error handling
      } finally {
        setLoading(false);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      }
    };
    fetchDocumentStatus();
  }, []);

  // Pulse animation for in-review state
  useEffect(() => {
    if (documentStatus === 'in_review') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [documentStatus]);

  const handleSelectFile = async (documentType: string) => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,application/pdf';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          setDocuments(prev => prev.map(doc =>
            doc.type === documentType ? { ...doc, file, uploaded: true } : doc
          ));
        }
      };
      input.click();
    } else {
      Alert.alert('Upload Document', 'Mobile document upload coming soon.');
    }
  };

  const handleSkip = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ accountStatus: 'pending', documentsUploaded: false }),
      });
      resetTo?.(accountType === 'seller' ? 'dashboard' : 'buyerDashboard');
    } catch (err: any) {
      setError(err.message || t('docs_uploadError'));
    }
  };

  const handleSubmit = async () => {
    setError('');
    const missingRequired = documents.filter(doc => doc.required && !doc.uploaded);
    if (missingRequired.length > 0) {
      setError(`Please upload: ${missingRequired.map(d => d.label).join(', ')}`);
      return;
    }
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('authToken');
      const formData = new FormData();
      documents.forEach(doc => { if (doc.file) formData.append(doc.type, doc.file); });
      const response = await fetch(`${API_URL}/seller-registrations/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      
      // Update user status
      await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ accountStatus: 'pending', documentsUploaded: true }),
      });
      
      // Update local state
      setDocumentStatus('in_review');
      
      // Show success message
      Alert.alert(
        t('docs_uploadSuccess') || 'Success',
        t('docs_uploadSuccessMessage') || 'Your documents have been submitted for review. You will be notified once they are reviewed.',
        [
          {
            text: t('common_ok') || 'OK',
            onPress: () => {
              // Navigate back to stores with resetTo to force refresh
              if (resetTo) {
                resetTo('stores');
              } else if (goBack) {
                goBack();
              }
            }
          }
        ]
      );
    } catch (err: any) {
      setError(err.message || t('docs_uploadError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = () => {
    setDocumentStatus('incomplete');
    setDocuments(getDocumentsList(accountType));
    setRejectionReason('');
    setError('');
  };

  const allRequiredUploaded = documents.filter(doc => doc.required).every(doc => doc.uploaded);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    headerControls: {
      flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
      gap: 12, paddingHorizontal: 24, paddingVertical: SPACING.sm,
    },
    controlBtn: {
      width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface,
      borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
    },
    scroll: { flex: 1 },
    content: { padding: 24, paddingBottom: 120 },

    /* Status Banner */
    statusBanner: { borderRadius: 24, padding: 28, marginBottom: 28, alignItems: 'center' },
    statusIconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    statusTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8, textAlign: 'center', letterSpacing: -0.3 },
    statusMessage: { fontSize: 15, lineHeight: 22, textAlign: 'center', opacity: 0.8, marginBottom: 20, paddingHorizontal: 8 },
    statusAction: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, minWidth: 200, alignItems: 'center' },
    statusActionText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

    /* Rejection Box */
    rejectionBox: {
      borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1,
      borderColor: COLORS.error + '30', backgroundColor: COLORS.error + '08',
    },
    rejectionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.error, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    rejectionText: { fontSize: 15, color: COLORS.error, lineHeight: 22, fontStyle: 'italic' },

    /* Step Indicator */
    stepIndicator: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 28 },
    stepDot: { width: 10, height: 10, borderRadius: 5 },
    stepDotActive: { width: 32, borderRadius: 5 },

    /* Header */
    header: { marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 8, letterSpacing: -0.5 },
    subtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },

    /* Warning */
    warningBox: {
      backgroundColor: COLORS.warning + '12', borderWidth: 1, borderColor: COLORS.warning + '30',
      borderRadius: 16, padding: SPACING.md, marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    warningText: { fontSize: 14, color: COLORS.warning, lineHeight: 20, flex: 1 },

    /* Document Cards */
    documentsList: { gap: 16 },
    documentCard: {
      backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
      borderRadius: 20, padding: 20, ...SHADOWS.small,
    },
    documentCardUploaded: { borderColor: COLORS.success + '60', backgroundColor: COLORS.success + '08' },
    documentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    documentTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    documentIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    documentTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1 },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    requiredBadge: { backgroundColor: COLORS.error + '15' },
    optionalBadge: { backgroundColor: COLORS.textMuted + '15' },
    badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    requiredText: { color: COLORS.error },
    optionalText: { color: COLORS.textMuted },
    documentDesc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 20, paddingLeft: 50 },
    uploadButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      paddingVertical: 14, paddingHorizontal: SPACING.md, borderRadius: 14, gap: 10,
      borderWidth: 2, borderColor: COLORS.primary + '40', backgroundColor: COLORS.primary + '06',
    },
    uploadButtonUploaded: { borderColor: COLORS.success, backgroundColor: COLORS.success + '10' },
    uploadButtonText: { fontSize: 14, fontWeight: '700' },

    /* Error */
    errorBox: {
      backgroundColor: COLORS.error + '12', borderWidth: 1, borderColor: COLORS.error + '30',
      borderRadius: 16, padding: SPACING.md, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 10,
    },
    errorText: { fontSize: 14, color: COLORS.error, fontWeight: '600', flex: 1 },

    /* Footer */
    footer: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
      padding: 20, ...SHADOWS.medium,
    },
    buttonRow: { flexDirection: 'row', gap: 14 },
    button: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    skipButton: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
    submitButton: { backgroundColor: COLORS.primary, ...SHADOWS.medium },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { fontSize: 16, fontWeight: '700' },
    skipButtonText: { color: COLORS.text },
    submitButtonText: { color: '#FFFFFF' },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  /* ═══ ACCEPTED STATE ═══ */
  const renderAcceptedState = () => (
    <View style={[styles.statusBanner, { backgroundColor: COLORS.success + '12' }]}>
      <View style={[styles.statusIconCircle, { backgroundColor: COLORS.success + '20' }]}>
        <ShieldCheckIcon color={COLORS.success} size={36} />
      </View>
      <Text style={[styles.statusTitle, { color: COLORS.success }]}>{t('docState_accepted')}</Text>
      <Text style={[styles.statusMessage, { color: COLORS.success }]}>{t('docState_acceptedMsg')}</Text>
      <TouchableOpacity
        style={[styles.statusAction, { backgroundColor: COLORS.success }]}
        onPress={() => resetTo?.(accountType === 'seller' ? 'dashboard' : 'buyerDashboard')}
        activeOpacity={0.8}
      >
        <Text style={styles.statusActionText}>{t('nav_dashboard')}</Text>
      </TouchableOpacity>
    </View>
  );

  /* ═══ IN REVIEW STATE ═══ */
  const renderInReviewState = () => (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <View style={[styles.statusBanner, { backgroundColor: COLORS.warning + '12' }]}>
        <View style={[styles.statusIconCircle, { backgroundColor: COLORS.warning + '20' }]}>
          <ClockIcon color={COLORS.warning} size={36} />
        </View>
        <Text style={[styles.statusTitle, { color: COLORS.warning }]}>{t('docState_inReview')}</Text>
        <Text style={[styles.statusMessage, { color: COLORS.textSecondary }]}>{t('docState_inReviewMsg')}</Text>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotActive, { backgroundColor: COLORS.success }]} />
          <View style={[styles.stepDot, styles.stepDotActive, { backgroundColor: COLORS.warning }]} />
          <View style={[styles.stepDot, { backgroundColor: COLORS.border }]} />
        </View>
        <TouchableOpacity
          style={[styles.statusAction, { backgroundColor: COLORS.warning }]}
          onPress={() => resetTo?.(accountType === 'seller' ? 'dashboard' : 'buyerDashboard')}
          activeOpacity={0.8}
        >
          <Text style={styles.statusActionText}>{t('nav_dashboard')}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  /* ═══ REJECTED STATE ═══ */
  const renderRejectedState = () => (
    <>
      <View style={[styles.statusBanner, { backgroundColor: COLORS.error + '10' }]}>
        <View style={[styles.statusIconCircle, { backgroundColor: COLORS.error + '20' }]}>
          <XCircleIcon color={COLORS.error} size={36} />
        </View>
        <Text style={[styles.statusTitle, { color: COLORS.error }]}>{t('docState_rejected')}</Text>
        <Text style={[styles.statusMessage, { color: COLORS.textSecondary }]}>{t('docState_rejectedMsg')}</Text>
      </View>
      {rejectionReason ? (
        <View style={styles.rejectionBox}>
          <Text style={styles.rejectionLabel}>{t('docState_rejectionReason')}</Text>
          <Text style={styles.rejectionText}>"{rejectionReason}"</Text>
        </View>
      ) : null}
      <TouchableOpacity
        style={[styles.statusAction, { backgroundColor: COLORS.primary, alignSelf: 'center', marginBottom: 24 }]}
        onPress={handleResubmit}
        activeOpacity={0.8}
      >
        <Text style={styles.statusActionText}>{t('docState_resubmit')}</Text>
      </TouchableOpacity>
    </>
  );

  /* ═══ INCOMPLETE STATE (upload form) ═══ */
  const renderIncompleteState = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>
          {accountType === 'seller' ? t('docs_sellerTitle') : t('docs_deliveryTitle')}
        </Text>
        <Text style={styles.subtitle}>
          {accountType === 'seller' ? t('docs_sellerSubtitle') : t('docs_deliverySubtitle')}
        </Text>
      </View>

      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepDotActive, { backgroundColor: COLORS.primary }]} />
        <View style={[styles.stepDot, { backgroundColor: COLORS.border }]} />
        <View style={[styles.stepDot, { backgroundColor: COLORS.border }]} />
      </View>

      <View style={styles.warningBox}>
        <AlertTriangleIcon color={COLORS.warning} size={20} />
        <Text style={styles.warningText}>{t('docs_skipWarning')}</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <XCircleIcon color={COLORS.error} size={18} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.documentsList}>
        {documents.map((doc) => (
          <View key={doc.type} style={[styles.documentCard, doc.uploaded && styles.documentCardUploaded]}>
            <View style={styles.documentHeader}>
              <View style={styles.documentTitleRow}>
                <View style={[styles.documentIconWrap, { backgroundColor: doc.uploaded ? COLORS.success + '15' : COLORS.primary + '10' }]}>
                  {doc.uploaded ? <ShieldCheckIcon color={COLORS.success} size={20} /> : <FileIcon color={COLORS.primary} size={20} />}
                </View>
                <Text style={styles.documentTitle}>{doc.label}</Text>
              </View>
              <View style={[styles.badge, doc.required ? styles.requiredBadge : styles.optionalBadge]}>
                <Text style={[styles.badgeText, doc.required ? styles.requiredText : styles.optionalText]}>
                  {doc.required ? t('docs_required') : t('docs_optional')}
                </Text>
              </View>
            </View>
            <Text style={styles.documentDesc}>{doc.description}</Text>
            <TouchableOpacity
              style={[styles.uploadButton, doc.uploaded && styles.uploadButtonUploaded]}
              onPress={() => handleSelectFile(doc.type)}
              activeOpacity={0.8}
            >
              {doc.uploaded ? <ShieldCheckIcon color={COLORS.success} size={18} /> : <UploadCloudIcon color={COLORS.primary} size={18} />}
              <Text style={[styles.uploadButtonText, { color: doc.uploaded ? COLORS.success : COLORS.primary }]}>
                {doc.uploaded ? t('docs_fileSelected') : t('docs_selectFile')}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <BackHeader title="" onBack={goBack} />
      <View style={styles.headerControls}>
        <TouchableOpacity onPress={cycleLanguage} style={styles.controlBtn} activeOpacity={0.7}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={COLORS.text} strokeWidth="2" />
            <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={COLORS.text} strokeWidth="2" />
          </Svg>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={styles.controlBtn} activeOpacity={0.7}>
          {mode === 'light' ? (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="5" stroke={COLORS.text} strokeWidth="2" />
              <Path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
            </Svg>
          ) : (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {documentStatus === 'accepted' && renderAcceptedState()}
          {documentStatus === 'in_review' && renderInReviewState()}
          {documentStatus === 'rejected' && renderRejectedState()}
          {documentStatus === 'incomplete' && renderIncompleteState()}
        </Animated.View>
      </ScrollView>

      {documentStatus === 'incomplete' && (
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.skipButton]} onPress={handleSkip} activeOpacity={0.8} disabled={submitting}>
              <Text style={[styles.buttonText, styles.skipButtonText]}>{t('docs_skip')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, (!allRequiredUploaded || submitting) && styles.buttonDisabled]}
              onPress={handleSubmit} activeOpacity={0.8} disabled={!allRequiredUploaded || submitting}
            >
              {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[styles.buttonText, styles.submitButtonText]}>{t('docs_submit')}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default DocumentUploadScreen;
