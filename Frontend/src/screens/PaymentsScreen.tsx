import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import { confirmAction } from '../components/confirmAction';
import { paymentAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import BackHeader from '../components/BackHeader';

interface PaymentsScreenProps {
  goBack?: () => void;
}

const CardIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H21C22.1 20 23 19.1 23 18V6C23 4.9 22.1 4 21 4Z" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M1 10H23" stroke={COLORS.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19" stroke={COLORS.background} strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M5 12H19" stroke={COLORS.background} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
    <Path d="M6 6L18 18" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const PaymentsScreen = ({ goBack }: PaymentsScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { message, showSuccess, showError, clear } = useStatusMessage();

  // Add form state
  const [formType, setFormType] = useState<'credit_card' | 'debit_card' | 'bank_account'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cvv, setCvv] = useState('');

  const loadPayments = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await paymentAPI.getAllPayments();
      setPaymentMethods(response.paymentMethods || []);
    } catch (error: any) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadPayments(); }, []);

  const resetForm = () => {
    setCardNumber('');
    setCardExpiry('');
    setCardHolder('');
    setCvv('');
    setFormType('credit_card');
  };

  const handleAddPayment = async () => {
    if (!cardHolder.trim()) { showError('Please enter cardholder name.'); return; }
    if (cardNumber.replace(/\s/g, '').length < 13) { showError('Please enter a valid card number.'); return; }
    if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) { showError('Please enter expiry as MM/YY.'); return; }

    try {
      setSaving(true);
      await paymentAPI.createPayment({
        type: formType,
        cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
        cardExpiry,
        cardHolder,
        isDefault: paymentMethods.length === 0,
      });
      showSuccess('Payment method added successfully.');
      setShowAddModal(false);
      resetForm();
      await loadPayments();
    } catch (error: any) {
      showError(error.message || 'Failed to add payment method.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await paymentAPI.updatePayment(id, { isDefault: true });
      showSuccess('Payment method set as default.');
      await loadPayments();
    } catch (error: any) {
      showError(error.message || 'Failed to set default payment method.');
    }
  };

  const handleRemove = async (id: number) => {
    const confirmed = await confirmAction('Remove Payment', 'Are you sure you want to remove this payment method?');
    if (!confirmed) return;
    try {
      await paymentAPI.deletePayment(id);
      showSuccess('Payment method removed.');
      await loadPayments();
    } catch (error: any) {
      showError(error.message || 'Failed to remove payment method.');
    }
  };

  const formatCardInput = (text: string) => {
    const digits = text.replace(/\D/g, '').substring(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, '').substring(0, 4);
    if (digits.length > 2) return digits.substring(0, 2) + '/' + digits.substring(2);
    return digits;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'credit_card': return 'Credit Card';
      case 'debit_card': return 'Debit Card';
      case 'bank_account': return 'Bank Account';
      default: return type;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPayments(true); }} tintColor={COLORS.primary} />}
      >
        <BackHeader title="Payments" onBack={goBack} />
        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{paymentMethods.length}</Text>
            <Text style={styles.summaryLabel}>Methods</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>{paymentMethods.filter(m => m.isDefault).length}</Text>
            <Text style={styles.summaryLabel}>Default</Text>
          </View>
        </View>

        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <CardIcon />
            </View>
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptySubtitle}>Add a payment method to get started with billing.</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {paymentMethods.map((method) => (
              <View key={method.id} style={[styles.paymentCard, method.isDefault && styles.paymentCardDefault]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconCircle}>
                    <CardIcon />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.cardType}>{getTypeLabel(method.type)}</Text>
                    {method.cardLast4 && <Text style={styles.cardNumber}>**** **** **** {method.cardLast4}</Text>}
                  </View>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                {method.cardExpiry && <Text style={styles.cardExpiry}>Expires {method.cardExpiry}</Text>}
                {method.cardHolder && <Text style={styles.cardHolder}>{method.cardHolder}</Text>}
                <View style={styles.cardActions}>
                  {!method.isDefault && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleSetDefault(method.id)}>
                      <Text style={styles.actionBtnText}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.actionBtn, styles.removeBtn]} onPress={() => handleRemove(method.id)}>
                    <Text style={[styles.actionBtnText, styles.removeBtnText]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add Button */}
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <PlusIcon />
          <Text style={styles.addBtnText}>Add Payment Method</Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          Payment methods are securely stored and encrypted. You can add multiple methods for convenience.
        </Text>
      </ScrollView>

      {/* Add Payment Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => { setShowAddModal(false); resetForm(); }}>
                <CloseIcon />
              </TouchableOpacity>
            </View>

            {/* Type Selector */}
            <View style={styles.typeRow}>
              {(['credit_card', 'debit_card'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, formType === type && styles.typeChipActive]}
                  onPress={() => setFormType(type)}
                >
                  <Text style={[styles.typeChipText, formType === type && styles.typeChipTextActive]}>
                    {type === 'credit_card' ? 'Credit' : 'Debit'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cardholder Name</Text>
              <TextInput style={styles.formInput} placeholder="John Doe" placeholderTextColor={COLORS.textMuted} value={cardHolder} onChangeText={setCardHolder} />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Card Number</Text>
              <TextInput style={styles.formInput} placeholder="1234 5678 9012 3456" placeholderTextColor={COLORS.textMuted} value={cardNumber} onChangeText={t => setCardNumber(formatCardInput(t))} keyboardType="number-pad" maxLength={19} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Expiry</Text>
                <TextInput style={styles.formInput} placeholder="MM/YY" placeholderTextColor={COLORS.textMuted} value={cardExpiry} onChangeText={t => setCardExpiry(formatExpiry(t))} keyboardType="number-pad" maxLength={5} />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>CVV</Text>
                <TextInput style={styles.formInput} placeholder="123" placeholderTextColor={COLORS.textMuted} value={cvv} onChangeText={setCvv} keyboardType="number-pad" maxLength={4} secureTextEntry />
              </View>
            </View>

            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleAddPayment} disabled={saving}>
              {saving ? <ActivityIndicator color={COLORS.background} /> : <Text style={styles.saveBtnText}>Add Payment Method</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },
  content: { paddingHorizontal: SPACING.md, paddingBottom: 40, paddingTop: 48 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.md },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  summaryLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500', textTransform: 'uppercase' as any },
  emptyContainer: { alignItems: 'center', marginTop: 48 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
  paymentCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16 },
  paymentCardDefault: { borderColor: COLORS.primary, borderWidth: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
  cardType: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  cardNumber: { fontSize: 13, color: COLORS.textSecondary, fontFamily: 'monospace' as any, marginTop: 2 },
  defaultBadge: { backgroundColor: COLORS.success + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  defaultText: { fontSize: 10, fontWeight: '700', color: COLORS.success },
  cardExpiry: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  cardHolder: { fontSize: 13, color: COLORS.text, fontWeight: '500', marginBottom: 10 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  removeBtn: { borderColor: COLORS.error + '30' },
  removeBtnText: { color: COLORS.error },
  addBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, marginTop: SPACING.lg, gap: 8 },
  addBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  infoText: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 16, marginTop: SPACING.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.md },
  typeChip: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  typeChipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  typeChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  typeChipTextActive: { color: COLORS.primary },
  formGroup: { marginBottom: 14 },
  formLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  formInput: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.text },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default PaymentsScreen;
