import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import BackHeader from '../components/BackHeader';

interface PoliciesScreenProps {
  navigate?: (screenId: string, params?: any) => void;
  goBack?: () => void;
}

const ShieldIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FileIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6C5.47 2 4.96 2.21 4.59 2.59C4.21 2.96 4 3.47 4 4V20C4 20.53 4.21 21.04 4.59 21.41C4.96 21.79 5.47 22 6 22H18C18.53 22 19.04 21.79 19.41 21.41C19.79 21.04 20 20.53 20 20V8L14 2Z" stroke={COLORS.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2V8H20" stroke={COLORS.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 13H8" stroke={COLORS.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 17H8" stroke={COLORS.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 9H8" stroke={COLORS.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronRight = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18L15 12L9 6" stroke={COLORS.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 6L18 18" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const POLICIES = [
  {
    id: '1',
    title: 'Terms of Service',
    icon: 'terms',
    lastUpdated: '2025-01-15',
    summary: 'Rules governing the use of our platform.',
    content: 'These Terms of Service govern your use of the Algerie Post E-Commerce platform.\n\n1. ACCEPTANCE OF TERMS\nBy accessing or using our services, you agree to be bound by these Terms.\n\n2. USER ACCOUNTS\nYou are responsible for maintaining the confidentiality of your account credentials.\n\n3. SELLER OBLIGATIONS\nSellers must provide accurate product information and fulfill orders in a timely manner.\n\n4. PROHIBITED ACTIVITIES\nYou may not use the platform for illegal activities, fraud, or to infringe on intellectual property rights.\n\n5. PAYMENT TERMS\nAll transactions are processed securely. Sellers receive payments after order completion.\n\n6. LIMITATION OF LIABILITY\nOur liability is limited to the fees paid for the use of the platform.\n\n7. MODIFICATIONS\nWe reserve the right to modify these terms at any time with prior notice.',
  },
  {
    id: '2',
    title: 'Privacy Policy',
    icon: 'privacy',
    lastUpdated: '2025-01-15',
    summary: 'How we handle and protect your data.',
    content: 'This Privacy Policy describes how we collect, use, and protect your personal information.\n\n1. INFORMATION WE COLLECT\nWe collect information you provide directly (name, email, phone) and usage data.\n\n2. HOW WE USE YOUR DATA\nYour data is used to provide services, improve the platform, and communicate with you.\n\n3. DATA SHARING\nWe do not sell personal data. Information may be shared with delivery partners for order fulfillment.\n\n4. DATA SECURITY\nWe implement industry-standard security measures to protect your data.\n\n5. YOUR RIGHTS\nYou have the right to access, correct, or delete your personal data.\n\n6. COOKIES\nWe use cookies to improve your browsing experience.\n\n7. CONTACT\nFor privacy concerns, contact our data protection officer.',
  },
  {
    id: '3',
    title: 'Refund Policy',
    icon: 'refund',
    lastUpdated: '2025-01-10',
    summary: 'Conditions for returns and refunds.',
    content: 'Our Refund Policy outlines the conditions under which refunds may be issued.\n\n1. ELIGIBILITY\nRefund requests must be made within 14 days of delivery.\n\n2. CONDITIONS\nItems must be unused, in original packaging, and with all tags attached.\n\n3. PROCESS\nTo request a refund, contact the seller through your order page.\n\n4. TIMELINE\nRefunds are processed within 5-10 business days after approval.\n\n5. EXCEPTIONS\nPerishable goods, digital products, and custom items are non-refundable.\n\n6. SELLER DISPUTES\nDisputes between buyers and sellers are mediated by our support team.',
  },
  {
    id: '4',
    title: 'Shipping Policy',
    icon: 'shipping',
    lastUpdated: '2025-01-10',
    summary: 'Delivery methods, times, and costs.',
    content: 'This Shipping Policy covers delivery services on the Algerie Post E-Commerce platform.\n\n1. DELIVERY METHODS\nWe offer standard and express delivery options across all 58 wilayas.\n\n2. ESTIMATED DELIVERY TIMES\nStandard: 3-7 business days. Express: 1-3 business days.\n\n3. SHIPPING COSTS\nCosts vary by destination wilaya and package weight.\n\n4. TRACKING\nAll shipments include tracking numbers for real-time monitoring.\n\n5. DELIVERY ISSUES\nIf a package is damaged or lost, contact support within 48 hours.\n\n6. FREE SHIPPING\nFree shipping may be available for orders above the seller threshold.',
  },
  {
    id: '5',
    title: 'Cookie Policy',
    icon: 'cookie',
    lastUpdated: '2025-01-15',
    summary: 'How we use cookies and similar technologies.',
    content: 'This Cookie Policy explains how we use cookies on the platform.\n\n1. WHAT ARE COOKIES\nCookies are small files stored on your device to improve your experience.\n\n2. TYPES OF COOKIES\nWe use essential cookies (required for operation) and analytics cookies.\n\n3. MANAGING COOKIES\nYou can control cookies through your browser settings.\n\n4. THIRD-PARTY COOKIES\nSome cookies may be set by analytics providers.\n\n5. UPDATES\nThis policy may be updated periodically.',
  },
];

const getIconColor = (icon: string) => {
  switch (icon) {
    case 'terms': return COLORS.primary;
    case 'privacy': return COLORS.success;
    case 'refund': return COLORS.warning;
    case 'shipping': return COLORS.secondary;
    case 'cookie': return '#A78BFA';
    default: return COLORS.textSecondary;
  }
};

const PoliciesScreen: React.FC<PoliciesScreenProps> = ({ navigate, goBack }) => {
  const [selectedPolicy, setSelectedPolicy] = useState<typeof POLICIES[0] | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackHeader title="Policies" onBack={goBack} />

        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <ShieldIcon />
          </View>
          <Text style={styles.headerTitle}>Legal & Policies</Text>
          <Text style={styles.headerSub}>
            Review our policies and terms that govern the use of our platform.
          </Text>
        </View>

        {/* Policy Cards */}
        <View style={styles.policyList}>
          {POLICIES.map((policy) => {
            const iconColor = getIconColor(policy.icon);
            return (
              <TouchableOpacity
                key={policy.id}
                style={styles.policyCard}
                onPress={() => setSelectedPolicy(policy)}
                activeOpacity={0.7}
              >
                <View style={[styles.policyIconCircle, { backgroundColor: iconColor + '15' }]}>
                  <FileIcon />
                </View>
                <View style={styles.policyInfo}>
                  <Text style={styles.policyTitle}>{policy.title}</Text>
                  <Text style={styles.policySummary} numberOfLines={1}>{policy.summary}</Text>
                  <Text style={styles.policyDate}>Updated {new Date(policy.lastUpdated).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                </View>
                <ChevronRight />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.infoText}>
          These policies are subject to change. We will notify you of significant updates via email.
        </Text>
      </ScrollView>

      {/* Policy Detail Modal */}
      <Modal visible={!!selectedPolicy} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPolicy?.title}</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedPolicy(null)}>
                <CloseIcon />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDate}>Last updated: {selectedPolicy?.lastUpdated}</Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalBody}>{selectedPolicy?.content}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setSelectedPolicy(null)}>
              <Text style={styles.modalDoneText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.md, paddingBottom: 40, paddingTop: 48 },
  headerCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.lg },
  headerIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  headerSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18 },
  policyList: { gap: 10 },
  policyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14 },
  policyIconCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  policyInfo: { flex: 1 },
  policyTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 3 },
  policySummary: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  policyDate: { fontSize: 10, color: COLORS.textMuted },
  infoText: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 16, marginTop: SPACING.lg },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, flex: 1 },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  modalDate: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.md },
  modalScroll: { maxHeight: 400 },
  modalBody: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  modalDoneBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: SPACING.md },
  modalDoneText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default PoliciesScreen;
