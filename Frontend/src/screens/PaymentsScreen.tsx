/**
 * PaymentsScreen — 2026 Redesign
 * ✦ Dynamic theme (useTheme + getColors)
 * ✦ Full i18n + EN/AR/FR language cycler
 * ✦ Premium payment cards with brand gradients
 * ✦ Bottom sheet modal for adding payment
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Modal, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import { confirmAction } from '../components/confirmAction';
import { paymentAPI } from '../services/api.service';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';

interface PaymentsScreenProps { goBack?: () => void; }

/* ══════ ICONS ══════ */
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
const CardIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M21 4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H21C22.1 20 23 19.1 23 18V6C23 4.9 22.1 4 21 4Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M1 10H23" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const PlusIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);
const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);


const PaymentsScreen = ({ goBack }: PaymentsScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { message, showSuccess, showError, clear } = useStatusMessage();
  const [formType, setFormType] = useState<'credit_card' | 'debit_card'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cvv, setCvv] = useState('');

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language as any) + 1) % langs.length]);
  };

  const loadPayments = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const r = await paymentAPI.getAllPayments();
      setPaymentMethods(r.paymentMethods || []);
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadPayments(); }, []);

  const resetForm = () => { setCardNumber(''); setCardExpiry(''); setCardHolder(''); setCvv(''); setFormType('credit_card'); };

  const handleAddPayment = async () => {
    if (!cardHolder.trim()) { showError('Please enter cardholder name.'); return; }
    if (cardNumber.replace(/\s/g, '').length < 13) { showError('Invalid card number.'); return; }
    if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) { showError('Enter expiry as MM/YY.'); return; }
    try {
      setSaving(true);
      await paymentAPI.createPayment({
        type: formType,
        cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
        cardExpiry, cardHolder,
        isDefault: paymentMethods.length === 0,
      });
      showSuccess('Payment method added!');
      setShowAddModal(false); resetForm();
      await loadPayments();
    } catch (e: any) { showError(e.message || 'Failed to add payment.'); }
    finally { setSaving(false); }
  };

  const CARD_GRADIENTS: Record<string, [string, string]> = {
    credit_card: ['#0D2C74', '#1E40AF'],
    debit_card: ['#1E3A8A', '#3B82F6'],
    bank_account: ['#B45309', '#FDB913'],
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPayments(true); }} tintColor={COLORS.primary} />}
      >
        {/* ── Header ── */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <BackHeader title={t('settings_payments')} onBack={goBack} />
          <View style={[s.controls, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity style={[s.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={cycleLanguage} activeOpacity={0.7}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.text }}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={toggleTheme} activeOpacity={0.7}>
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </TouchableOpacity>
          </View>
        </View>

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* Stats strip */}
        <View style={[s.statsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          {[
            { val: paymentMethods.length, label: 'Methods', color: COLORS.primary },
            { val: paymentMethods.filter(m => m.isDefault).length, label: 'Default', color: COLORS.success },
          ].map((item, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <Text style={[s.statVal, { color: item.color }]}>{item.val}</Text>
              <Text style={[s.statLabel, { color: COLORS.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Payment cards */}
        {paymentMethods.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <CardIcon color={COLORS.primary} />
            </View>
            <Text style={[s.emptyTitle, { color: COLORS.text }]}>No Payment Methods</Text>
            <Text style={[s.emptyDesc, { color: COLORS.textMuted }]}>Add a card to get started with billing.</Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {paymentMethods.map((method) => {
              const grad = CARD_GRADIENTS[method.type] || CARD_GRADIENTS.credit_card;
              return (
                <LinearGradient key={method.id} colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
                  {method.isDefault && (
                    <View style={[s.defaultBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                      <CheckIcon color="#FFFFFF" />
                      <Text style={s.defaultText}>Default</Text>
                    </View>
                  )}
                  <View style={[s.cardTop, isRTL && { flexDirection: 'row-reverse' }]}>
                    <CardIcon color="rgba(255,255,255,0.7)" />
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', marginLeft: 8 }}>
                      {method.type?.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={s.cardNum}>**** **** **** {method.cardLast4 || '0000'}</Text>
                  <View style={[s.cardBot, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View>
                      <Text style={s.cardBotLabel}>HOLDER</Text>
                      <Text style={s.cardBotVal}>{method.cardHolder || 'N/A'}</Text>
                    </View>
                    {method.cardExpiry && (
                      <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
                        <Text style={s.cardBotLabel}>EXPIRES</Text>
                        <Text style={s.cardBotVal}>{method.cardExpiry}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[s.cardActions, isRTL && { flexDirection: 'row-reverse' }]}>
                    {!method.isDefault && (
                      <TouchableOpacity style={[s.cardBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} onPress={async () => {
                        await paymentAPI.updatePayment(method.id, { isDefault: true });
                        showSuccess('Default updated.'); loadPayments();
                      }}>
                        <Text style={s.cardBtnText}>Set Default</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[s.cardBtn, { backgroundColor: 'rgba(239,68,68,0.25)' }]} onPress={async () => {
                      const ok = await confirmAction('Remove', 'Remove this payment method?');
                      if (!ok) return;
                      await paymentAPI.deletePayment(method.id);
                      showSuccess('Removed.'); loadPayments();
                    }}>
                      <Text style={[s.cardBtnText, { color: '#FCA5A5' }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              );
            })}
          </View>
        )}

        <TouchableOpacity style={[s.addBtn, { backgroundColor: COLORS.primary }]} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
          <PlusIcon color="#FFFFFF" />
          <Text style={s.addBtnText}>Add Payment Method</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Payment Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: COLORS.surface }]}>
            <View style={[s.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[s.modalTitle, { color: COLORS.text }]}>Add Payment Method</Text>
              <TouchableOpacity style={[s.closeBtn, { backgroundColor: COLORS.background }]} onPress={() => { setShowAddModal(false); resetForm(); }}>
                <CloseIcon color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={s.typeRow}>
              {(['credit_card', 'debit_card'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[s.typeChip, { backgroundColor: formType === type ? COLORS.primary + '15' : COLORS.background, borderColor: formType === type ? COLORS.primary : COLORS.border }]}
                  onPress={() => setFormType(type)}
                >
                  <Text style={[s.typeChipText, { color: formType === type ? COLORS.primary : COLORS.textMuted }]}>
                    {type === 'credit_card' ? 'Credit' : 'Debit'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {[
              { lbl: 'Cardholder Name', placeholder: 'John Doe', val: cardHolder, set: setCardHolder, keyboard: 'default' as any },
              { lbl: 'Card Number', placeholder: '1234 5678 9012 3456', val: cardNumber, set: (v: string) => setCardNumber(v.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim()), keyboard: 'number-pad' as any },
            ].map(item => (
              <View key={item.lbl} style={{ marginBottom: 14 }}>
                <Text style={[s.fieldLabel, { color: COLORS.textMuted }]}>{item.lbl}</Text>
                <TextInput style={[s.fieldInput, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.text }]}
                  placeholder={item.placeholder} placeholderTextColor={COLORS.textMuted}
                  value={item.val} onChangeText={item.set} keyboardType={item.keyboard} />
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[
                { lbl: 'Expiry', placeholder: 'MM/YY', val: cardExpiry, set: (v: string) => { const d = v.replace(/\D/g, '').substring(0, 4); setCardExpiry(d.length > 2 ? `${d.substring(0, 2)}/${d.substring(2)}` : d); }, keyboard: 'number-pad' as any, ml: 5 },
                { lbl: 'CVV', placeholder: '123', val: cvv, set: setCvv, keyboard: 'number-pad' as any, ml: 4 },
              ].map(item => (
                <View key={item.lbl} style={{ flex: 1 }}>
                  <Text style={[s.fieldLabel, { color: COLORS.textMuted }]}>{item.lbl}</Text>
                  <TextInput style={[s.fieldInput, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.text }]}
                    placeholder={item.placeholder} placeholderTextColor={COLORS.textMuted}
                    value={item.val} onChangeText={item.set} keyboardType={item.keyboard} maxLength={item.ml} secureTextEntry={item.lbl === 'CVV'} />
                </View>
              ))}
            </View>
            <TouchableOpacity style={[s.saveBtn, { backgroundColor: COLORS.primary, opacity: saving ? 0.7 : 1 }]} onPress={handleAddPayment} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.saveBtnText}>Add Payment Method</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  controls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  emptyDesc: { fontSize: 13, textAlign: 'center', maxWidth: 220, lineHeight: 20 },
  card: { borderRadius: 20, padding: 20, gap: 8 },
  defaultBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  defaultText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardNum: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', letterSpacing: 2, marginVertical: 8 },
  cardBot: { flexDirection: 'row', justifyContent: 'space-between' },
  cardBotLabel: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1 },
  cardBotVal: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cardBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  cardBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  addBtn: { borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeChip: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  typeChipText: { fontSize: 13, fontWeight: '700' },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});

export default PaymentsScreen;
