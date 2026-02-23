/**
 * DeliveryRegisterScreen — register current user as a delivery person
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { getColors, SPACING, RADIUS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { deliveryPersonAPI } from '../services/api.service';
import BackHeader from '../components/BackHeader';

interface Props {
  navigate?: (screen: string, params?: any) => void;
  goBack?: () => void;
}

const DeliveryRegisterScreen: React.FC<Props> = ({ navigate, goBack }) => {
  const { mode } = useTheme();
  const C = getColors(mode);
  const { isRTL } = useTranslation();

  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const vehicleTypes = [
    { value: 'motorcycle', label: isRTL ? 'دراجة نارية' : 'Motorcycle', emoji: '🏍️' },
    { value: 'car', label: isRTL ? 'سيارة' : 'Car', emoji: '🚗' },
    { value: 'van', label: isRTL ? 'شاحنة صغيرة' : 'Van', emoji: '🚐' },
    { value: 'bicycle', label: isRTL ? 'دراجة هوائية' : 'Bicycle', emoji: '🚲' },
  ];

  const register = async () => {
    if (!vehicleType || !phone) {
      setError(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await deliveryPersonAPI.register({ vehicleType, licensePlate, phone });
      navigate?.('deliveryDashboard');
    } catch (e: any) {
      setError(e.message || (isRTL ? 'حدث خطأ' : 'Registration failed'));
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>  
      <BackHeader title={isRTL ? 'تسجيل كعامل توصيل' : 'Delivery Registration'} onBack={goBack} />
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={[styles.subtitle, { color: C.textSecondary }]}>
          {isRTL ? 'سجّل لتبدأ في توصيل الطلبات وكسب المال' : 'Register to start delivering orders and earning money'}
        </Text>

        {/* Vehicle Type */}
        <Text style={[styles.label, { color: C.text }]}>{isRTL ? 'نوع المركبة *' : 'Vehicle Type *'}</Text>
        <View style={styles.vehicleRow}>
          {vehicleTypes.map(vt => (
            <TouchableOpacity
              key={vt.value}
              style={[
                styles.vehicleBtn,
                { borderColor: vehicleType === vt.value ? C.primary : C.border, backgroundColor: vehicleType === vt.value ? C.primary + '15' : C.surface },
              ]}
              onPress={() => setVehicleType(vt.value)}
            >
              <Text style={styles.vehicleEmoji}>{vt.emoji}</Text>
              <Text style={[styles.vehicleLabel, { color: vehicleType === vt.value ? C.primary : C.text }]}>{vt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* License Plate */}
        <Text style={[styles.label, { color: C.text }]}>{isRTL ? 'رقم اللوحة (اختياري)' : 'License Plate (optional)'}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          value={licensePlate}
          onChangeText={setLicensePlate}
          placeholder={isRTL ? 'مثال: 12345-100-16' : 'e.g. 12345-100-16'}
          placeholderTextColor={C.textMuted}
        />

        {/* Phone */}
        <Text style={[styles.label, { color: C.text }]}>{isRTL ? 'رقم الهاتف *' : 'Phone Number *'}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
          value={phone}
          onChangeText={setPhone}
          placeholder={isRTL ? 'مثال: 0555123456' : 'e.g. 0555123456'}
          placeholderTextColor={C.textMuted}
          keyboardType="phone-pad"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: C.primary, opacity: loading ? 0.6 : 1 }]}
          onPress={register}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.btnText}>{isRTL ? 'تسجيل' : 'Register as Delivery Person'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 20, gap: 12 },
  subtitle: { fontSize: 14, marginBottom: 8, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderRadius: RADIUS.md, padding: 14, fontSize: 15, marginTop: 4 },
  vehicleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  vehicleBtn: { padding: 14, borderRadius: RADIUS.md, borderWidth: 2, alignItems: 'center', minWidth: 80, flex: 1 },
  vehicleEmoji: { fontSize: 28 },
  vehicleLabel: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  btn: { padding: 16, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  error: { color: '#ef4444', fontSize: 13, textAlign: 'center', marginTop: 4 },
});

export default DeliveryRegisterScreen;
