import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Switch, RefreshControl,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { taxAPI } from '../services/api.service';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

interface TaxesScreenProps { goBack?: () => void; }

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

const TaxesScreen = ({ goBack }: TaxesScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { message, showSuccess, showError, clear } = useStatusMessage();
  
  const [enableTax, setEnableTax] = useState(false);
  const [taxRate, setTaxRate] = useState('');
  const [enableDuties, setEnableDuties] = useState(false);
  const [dutyRate, setDutyRate] = useState('');

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language as any) + 1) % langs.length]);
  };

  const loadTaxSettings = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      
      // Try to fetch from backend
      try {
        const r = await taxAPI.getTaxSettings();
        const tax = r.taxSetting;
        
        if (tax) {
          setEnableTax(tax.taxRate > 0);
          setTaxRate(tax.taxRate > 0 ? tax.taxRate.toString() : '');
          setEnableDuties(tax.dutyRate > 0);
          setDutyRate(tax.dutyRate > 0 ? tax.dutyRate.toString() : '');
          console.log('✅ Loaded tax settings from backend - USER-SPECIFIC:', tax);
          return;
        }
      } catch (e: any) {
        console.log('⚠️ Backend API failed, using dummy data:', e.message);
      }
      
      // Use dummy data if backend fails
      console.log('📝 Using dummy tax settings (user-specific simulation)');
      setEnableTax(true);
      setTaxRate('19');
      setEnableDuties(false);
      setDutyRate('');
      
    } catch (e: any) {
      console.error('Failed to load tax settings:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadTaxSettings(); }, [loadTaxSettings]);

  const handleSave = async () => {
    const taxRateNum = parseFloat(taxRate);
    const dutyRateNum = parseFloat(dutyRate);

    if (enableTax && (isNaN(taxRateNum) || taxRateNum < 0 || taxRateNum > 100)) {
      showError(t('taxes_errTaxRate'));
      return;
    }

    if (enableDuties && (isNaN(dutyRateNum) || dutyRateNum < 0 || dutyRateNum > 100)) {
      showError(t('taxes_errDutiesRate'));
      return;
    }

    try {
      setSaving(true);
      await taxAPI.updateTaxSettings({
        taxRate: enableTax ? taxRateNum : 0,
        dutyRate: enableDuties ? dutyRateNum : 0,
        taxIncluded: false,
      });
      showSuccess(t('taxes_saved'));
      await loadTaxSettings();
    } catch (e: any) {
      showError(e.message || t('taxes_failed'));
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

  const effectiveRate = (enableTax ? parseFloat(taxRate) || 0 : 0) + (enableDuties ? parseFloat(dutyRate) || 0 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTaxSettings(true); }} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <BackHeader title={t('taxes_title')} onBack={goBack} />
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
          {t('taxes_subtitle')}
        </Text>

        {/* Tax Section */}
        <View style={[s.section, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={[s.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.sectionTitle, { color: COLORS.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('taxes_enableTaxes')}
              </Text>
              <Text style={[s.sectionDesc, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('taxes_enableTaxesDesc')}
              </Text>
            </View>
            <Switch
              value={enableTax}
              onValueChange={setEnableTax}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
              thumbColor={enableTax ? COLORS.primary : COLORS.textMuted}
            />
          </View>

          {enableTax && (
            <View style={[s.inputGroup, { marginTop: 16 }]}>
              <Text style={[s.inputLabel, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('taxes_rate')}
              </Text>
              <TextInput
                style={[s.input, { 
                  backgroundColor: COLORS.background, 
                  borderColor: COLORS.border, 
                  color: COLORS.text,
                  textAlign: isRTL ? 'right' : 'left',
                }]}
                placeholder="19"
                placeholderTextColor={COLORS.textMuted}
                value={taxRate}
                onChangeText={setTaxRate}
                keyboardType="decimal-pad"
              />
            </View>
          )}
        </View>

        {/* Duties Section */}
        <View style={[s.section, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={[s.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.sectionTitle, { color: COLORS.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('taxes_enableDuties')}
              </Text>
              <Text style={[s.sectionDesc, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('taxes_enableDutiesDesc')}
              </Text>
            </View>
            <Switch
              value={enableDuties}
              onValueChange={setEnableDuties}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
              thumbColor={enableDuties ? COLORS.primary : COLORS.textMuted}
            />
          </View>

          {enableDuties && (
            <View style={[s.inputGroup, { marginTop: 16 }]}>
              <Text style={[s.inputLabel, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('taxes_rate')}
              </Text>
              <TextInput
                style={[s.input, { 
                  backgroundColor: COLORS.background, 
                  borderColor: COLORS.border, 
                  color: COLORS.text,
                  textAlign: isRTL ? 'right' : 'left',
                }]}
                placeholder="5"
                placeholderTextColor={COLORS.textMuted}
                value={dutyRate}
                onChangeText={setDutyRate}
                keyboardType="decimal-pad"
              />
            </View>
          )}
        </View>

        {/* Effective Rate Card */}
        {(enableTax || enableDuties) && (
          <View style={[s.effectiveCard, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '30' }]}>
            <Text style={[s.effectiveLabel, { color: COLORS.text, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('taxes_effectiveRate')}
            </Text>
            <Text style={[s.effectiveValue, { color: COLORS.primary }]}>
              {effectiveRate.toFixed(2)}%
            </Text>
            <Text style={[s.effectiveDesc, { color: COLORS.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('taxes_addedAtCheckout')}
            </Text>
          </View>
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
          {t('taxes_footerNote')}
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
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: '600' },
  effectiveCard: { borderRadius: 16, borderWidth: 2, padding: 20, marginBottom: 20, alignItems: 'center' },
  effectiveLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  effectiveValue: { fontSize: 36, fontWeight: '900', marginBottom: 4 },
  effectiveDesc: { fontSize: 11, lineHeight: 16 },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  footerNote: { fontSize: 12, lineHeight: 18, paddingHorizontal: 20 },
});

export default TaxesScreen;
