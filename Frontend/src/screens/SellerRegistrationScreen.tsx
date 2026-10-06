import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle } from 'react-native-svg';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { Logo } from '../components/Logo';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import { confirmAction } from '../components/confirmAction';

/* Icons */
const SunIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB913" strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="#FDB913" strokeWidth="2" />
  </Svg>
);

const MoonIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UploadIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 8L12 3L7 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 3V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface DocumentUploadProps {
  label: string;
  description: string;
  fileName?: string;
  onPress: () => void;
  COLORS: any;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ label, description, fileName, onPress, COLORS }) => (
  <TouchableOpacity
    style={[styles.documentCard, { backgroundColor: COLORS.surface, borderColor: fileName ? COLORS.success + '30' : COLORS.border }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.documentIcon, { backgroundColor: fileName ? COLORS.success + '15' : COLORS.surfaceHighlight }]}>
      {fileName ? <CheckIcon color={COLORS.success} /> : <UploadIcon color={COLORS.textSecondary} />}
    </View>
    <View style={styles.documentInfo}>
      <Text style={[styles.documentLabel, { color: COLORS.text }]}>{label}</Text>
      <Text style={[styles.documentDescription, { color: COLORS.textMuted }]}>{description}</Text>
      {fileName ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
          <CheckIcon color={COLORS.success} />
          <Text style={[styles.documentFileName, { color: COLORS.success }]} numberOfLines={1}>{fileName}</Text>
        </View>
      ) : (
        <Text style={[styles.documentPlaceholder, { color: COLORS.textSecondary }]}>Tap to upload</Text>
      )}
    </View>
  </TouchableOpacity>
);

interface SellerRegistrationScreenProps {
  navigate?: (screenId: string) => void;
  goBack?: () => void;
}

const SellerRegistrationScreen = ({ navigate, goBack }: SellerRegistrationScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [ssid, setSsid] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [commercialRegister, setCommercialRegister] = useState<string | undefined>(undefined);
  const [taxCertificate, setTaxCertificate] = useState<string | undefined>(undefined);
  const [identityDocument, setIdentityDocument] = useState<string | undefined>(undefined);
  const { message, showSuccess, showError, clear } = useStatusMessage();

  const handleDocumentUpload = async (
    setter: (value: string) => void,
    documentName: string,
  ) => {
    // In production, integrate with react-native-document-picker
    const confirmed = await confirmAction(
      'Upload Document',
      `Select ${documentName} from your device. Supported formats: PDF, JPG, PNG (Max 5MB)`,
    );
    if (confirmed) {
      setter(`${documentName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
      showSuccess(`${documentName} uploaded successfully`);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!fullName.trim()) {
      showError('Please enter your full name');
      return;
    }

    if (!ssid.trim() || ssid.length < 10) {
      showError('Please enter a valid SSID (Social Security ID)');
      return;
    }

    if (!businessId.trim()) {
      showError('Please enter your business registration number');
      return;
    }

    if (!commercialRegister || !taxCertificate || !identityDocument) {
      showError('Please upload all required documents');
      return;
    }

    try {
      setLoading(true);
      // TODO: API call to submit seller registration
      // await sellerAPI.submitRegistration({ fullName, ssid, businessId, documents: [...] });
      
      showSuccess('Registration submitted successfully! You will be notified once reviewed.');
      
      setTimeout(() => {
        navigate?.('stores');
      }, 2000);
    } catch (error: any) {
      showError(error.message || 'Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo and Theme Toggle */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={goBack} activeOpacity={0.7}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Logo variant="icon" size={36} />
          <TouchableOpacity
            style={[styles.themeToggle, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.headerSection}>
          <View style={[styles.iconBadge, { backgroundColor: COLORS.primary + '15' }]}>
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M2 17L12 22L22 17" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M2 12L12 17L22 12" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={[styles.heading, { color: COLORS.text }]}>Seller Registration</Text>
          <Text style={[styles.subheading, { color: COLORS.textSecondary }]}>
            Complete your seller verification to start selling on Algerie Poste E-Commerce platform
          </Text>
        </View>

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* Personal Information */}
        <View style={[styles.section, { backgroundColor: COLORS.surface }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: COLORS.text }]}>Full Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.text }]}
              placeholder="Enter your full legal name"
              placeholderTextColor={COLORS.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: COLORS.text }]}>SSID (Social Security ID) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.text }]}
              placeholder="Enter your 15-digit SSID"
              placeholderTextColor={COLORS.textMuted}
              value={ssid}
              onChangeText={setSsid}
              keyboardType="numeric"
              maxLength={15}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: COLORS.text }]}>Business Registration Number <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.text }]}
              placeholder="Enter your NIF or RC number"
              placeholderTextColor={COLORS.textMuted}
              value={businessId}
              onChangeText={setBusinessId}
            />
          </View>
        </View>

        {/* Required Documents */}
        <View style={styles.documentsSection}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Required Documents</Text>
          <Text style={[styles.sectionDescription, { color: COLORS.textSecondary }]}>
            Upload clear copies of the following documents (PDF, JPG, or PNG format, max 5MB each)
          </Text>

          <DocumentUpload
            label="Commercial Register (RC)"
            description="Official business registration certificate"
            fileName={commercialRegister}
            onPress={() => handleDocumentUpload(setCommercialRegister, 'Commercial Register')}
            COLORS={COLORS}
          />

          <DocumentUpload
            label="Tax Certificate (NIF)"
            description="Tax identification number certificate"
            fileName={taxCertificate}
            onPress={() => handleDocumentUpload(setTaxCertificate, 'Tax Certificate')}
            COLORS={COLORS}
          />

          <DocumentUpload
            label="Identity Document"
            description="National ID card or passport"
            fileName={identityDocument}
            onPress={() => handleDocumentUpload(setIdentityDocument, 'Identity Document')}
            COLORS={COLORS}
          />
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: COLORS.info + '10', borderColor: COLORS.info + '30' }]}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={COLORS.info} strokeWidth="2" />
            <Path d="M12 16V12M12 8H12.01" stroke={COLORS.info} strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={[styles.infoText, { color: COLORS.text }]}>
            Your documents will be reviewed by our admin team within 2-3 business days. You'll receive a notification once your application is processed.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: COLORS.primary }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit for Review</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACING.md,
    paddingTop: 48,
    paddingBottom: 40,
  },

  /* Top Header */
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  /* Header Section */
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 20,
  },

  /* Section */
  section: {
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },

  /* Input */
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },

  /* Documents */
  documentsSection: {
    marginBottom: SPACING.md,
  },
  documentCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
  },
  documentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  documentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  documentLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 12,
    marginBottom: 6,
  },
  documentFileName: {
    fontSize: 13,
    fontWeight: '600',
  },
  documentPlaceholder: {
    fontSize: 13,
    fontStyle: 'italic',
  },

  /* Info Box */
  infoBox: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },

  /* Submit Button */
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SellerRegistrationScreen;
