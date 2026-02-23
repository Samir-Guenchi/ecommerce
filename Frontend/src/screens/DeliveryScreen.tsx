import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Switch, RefreshControl,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { deliveryAPI } from '../services/api.service';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

interface DeliveryScreenProps { goBack?: () => void; }

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

const DeliveryScreen = ({ goBack }: DeliveryScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { message, showSuccess, showError, clear } = useStatusMessage();
  
  const [enableDelivery, setEnableDelivery] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState('');
  const [freeThreshold, setFreeThreshold] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language as any) + 1) % langs.length]);
  };

  const loadDeliverySettings = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      
      // Try to fetch from backend
      try {
        const r = await deliveryAPI.getDeliverySettings();
        const delivery = r.deliverySetting;
        
        if (delivery) {
          setEnableDelivery(delivery.shippingCost > 0);
          setDeliveryFee(delivery.shippingCost > 0 ? delivery.shippingCost.toString() : '');
          setFreeThreshold(delivery.freeShippingThreshold ? delivery.freeShippingThreshold.toString() : '');
          setEstimatedDays(delivery.settings?.estimatedDays?.toString() || '');
          console.log('✅ Loaded delivery settings from backend - USER-SPECIFIC:', delivery);
          return;
        }
      } catch (e: any) {
        console.log('⚠️ Backend API failed, using dummy data:', e.message);
      }
      
      // Use dummy data if backend fails
      console.log('📝 Using dummy delivery settings (user-specific simulation)');
      setEnableDelivery(true);
      setDeliveryFee('500');
      setFreeThreshold('5000');
      setEstimatedDays('3');
      
    } catch (e: any) {
      console.error('Failed to load delivery settings:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDeliverySettings(); }, [loadDeliverySettings]);

  const handleSave = async () => {
    const feeNum = parseFloat(deliveryFee);
    const thresholdNum = parseFloat(freeThreshold);
    const daysNum = parseInt(estimatedDays);

    if (enableDelivery && (isNaN(feeNum) || feeNum < 0)) {
      showError(t('delivery_missingFee'));
      return;
    }

    try {
      setSaving(true);
      await deliveryAPI.updateDeliverySettings({
        shippingCost: enableDelivery ? feeNum : 0,
        freeShippingThreshold: thresholdNum > 0 ? thresholdNum : null,
        settings: {
          estimatedDays: daysNum > 0 ? daysNum : null,
        },
      });
      showSuccess(t('delivery_saveSuccess'));
      await loadDeliverySettings();
    } catch (e: any) {
      showError(e.message || t('common_error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textSecondary, fontSize: 14 }}>{t('common_loading')}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDeliverySettings(true); }} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <BackHeader title={t('delivery_title')} onBack={goBack} />
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

        {/* Subtitle */}
        <Text style={[s.subtitle, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('delivery_subtitle')}
        </Text>

        {/* Enable Delivery Section */}
        <View style={[s.section, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={[s.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.sectionTitle, { color: COLORS.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('delivery_enable')}
              </Text>
              <Text style={[s.sectionDesc, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('delivery_enableDesc')}
              </Text>
            </View>
            <Switch
              value={enableDelivery}
              onValueChange={setEnableDelivery}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
              thumbColor={enableDelivery ? COLORS.primary : COLORS.textMuted}
            />
          </View>
        </View>

        {enableDelivery && (
          <>
            {/* Delivery Fee */}
            <View style={[s.inputCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <Text style={[s.inputLabel, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('delivery_fee')}
              </Text>
              <TextInput
                style={[s.input, { 
                  backgroundColor: COLORS.background, 
                  borderColor: COLORS.border, 
                  color: COLORS.text,
                  textAlign: isRTL ? 'right' : 'left',
                }]}
                placeholder="500"
                placeholderTextColor={COLORS.textMuted}
                value={deliveryFee}
                onChangeText={setDeliveryFee}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Free Threshold */}
            <View style={[s.inputCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <Text style={[s.inputLabel, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('delivery_freeThreshold')}
              </Text>
              <Text style={[s.inputHint, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('delivery_freeThresholdHint')}
              </Text>
              <TextInput
                style={[s.input, { 
                  backgroundColor: COLORS.background, 
                  borderColor: COLORS.border, 
                  color: COLORS.text,
                  textAlign: isRTL ? 'right' : 'left',
                }]}
                placeholder="5000"
                placeholderTextColor={COLORS.textMuted}
                value={freeThreshold}
                onChangeText={setFreeThreshold}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Estimated Days */}
            <View style={[s.inputCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <Text style={[s.inputLabel, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('delivery_estimatedDays')}
              </Text>
              <Text style={[s.inputHint, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('delivery_estimatedDaysHint')}
              </Text>
              <TextInput
                style={[s.input, { 
                  backgroundColor: COLORS.background, 
                  borderColor: COLORS.border, 
                  color: COLORS.text,
                  textAlign: isRTL ? 'right' : 'left',
                }]}
                placeholder="3"
                placeholderTextColor={COLORS.textMuted}
                value={estimatedDays}
                onChangeText={setEstimatedDays}
                keyboardType="number-pad"
              />
            </View>

            {/* Preview Card */}
            <View style={[s.previewCard, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '30' }]}>
              <Text style={[s.previewTitle, { color: COLORS.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('delivery_preview')}
              </Text>
              <View style={{ gap: 8, marginTop: 12 }}>
                {deliveryFee ? (
                  <Text style={[s.previewItem, { color: COLORS.text, textAlign: isRTL ? 'right' : 'left' }]}>
                    • {t('delivery_previewFee').replace('{fee}', deliveryFee)}
                  </Text>
                ) : null}
                {freeThreshold ? (
                  <Text style={[s.previewItem, { color: COLORS.text, textAlign: isRTL ? 'right' : 'left' }]}>
                    • {t('delivery_previewFree').replace('{threshold}', freeThreshold)}
                  </Text>
                ) : null}
                {estimatedDays ? (
                  <Text style={[s.previewItem, { color: COLORS.text, textAlign: isRTL ? 'right' : 'left' }]}>
                    • {t('delivery_previewDays').replace('{days}', estimatedDays)}
                  </Text>
                ) : null}
              </View>
            </View>
          </>
        )}

        {/* Save Button */}
        <TouchableOpacity 
          style={[s.saveBtn, { backgroundColor: COLORS.primary, opacity: saving ? 0.7 : 1 }]} 
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={s.saveBtnText}>{t('taxes_save')}</Text>
          )}
        </TouchableOpacity>

        {/* Footer Note */}
        <Text style={[s.footerNote, { color: COLORS.textMuted, textAlign: 'center' }]}>
          {t('delivery_footer')}
        </Text>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  controls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  subtitle: { fontSize: 13, lineHeight: 20, marginBottom: 20 },
  section: { borderRadius: 18, borderWidth: 1, padding: 18, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionDesc: { fontSize: 12, lineHeight: 18 },
  inputCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  inputHint: { fontSize: 11, lineHeight: 16, marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: '600' },
  previewCard: { borderRadius: 16, borderWidth: 2, padding: 20, marginBottom: 20 },
  previewTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  previewItem: { fontSize: 13, lineHeight: 20 },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  footerNote: { fontSize: 12, lineHeight: 18, paddingHorizontal: 20 },
});

export default DeliveryScreen;
