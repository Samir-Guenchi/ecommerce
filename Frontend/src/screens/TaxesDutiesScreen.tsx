import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { taxAPI } from '../services/api.service';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

interface TaxesDutiesScreenProps { goBack?: () => void; }

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

const TaxesDutiesScreen = ({ goBack }: TaxesDutiesScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const { message, showSuccess, showError, clear } = useStatusMessage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState('');
  const [dutiesEnabled, setDutiesEnabled] = useState(false);
  const [dutiesRate, setDutiesRate] = useState('');

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language as any) + 1) % langs.length]);
  };

  useEffect(() => {
    taxAPI.getTaxSettings().then(r => {
      const s = r.taxSetting;
      setTaxRate(s.taxRate?.toString() || '');
      setDutiesRate(s.dutyRate?.toString() || '');
      setTaxEnabled(s.taxRate > 0);
      setDutiesEnabled(s.dutyRate > 0);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (taxEnabled && !taxRate) { showError('Please enter tax rate'); return; }
    if (dutiesEnabled && !dutiesRate) { showError('Please enter duties rate'); return; }
    try {
      setSaving(true);
      await taxAPI.updateTaxSettings({
        taxRate: taxEnabled ? (parseFloat(taxRate) || 0) : 0,
        dutyRate: dutiesEnabled ? (parseFloat(dutiesRate) || 0) : 0,
      });
      showSuccess('Tax and duties settings saved.');
    } catch (e: any) { showError(e.message || 'Failed to save tax settings.'); }
    finally { setSaving(false); }
  };

  const totalRate = (taxEnabled ? parseFloat(taxRate) || 0 : 0) + (dutiesEnabled ? parseFloat(dutiesRate) || 0 : 0);

  const TaxSection = ({ accent, enabled, onToggle, label, desc, rateVal, setRate }: {
    accent: string; enabled: boolean; onToggle: (v: boolean) => void;
    label: string; desc: string; rateVal: string; setRate: (v: string) => void;
  }) => (
    <View style={[s.sectionCard, { backgroundColor: COLORS.surface, borderColor: enabled ? accent + '40' : COLORS.border, borderWidth: enabled ? 2 : 1 }]}>
      <View style={[s.toggleRow, isRTL && { flexDirection: 'row-reverse' }]}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={[s.sectionLabel2, { color: COLORS.text }]}>{label}</Text>
          <Text style={[s.sectionDesc, { color: COLORS.textMuted }]}>{desc}</Text>
        </View>
        <Switch value={enabled} onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: accent + '70' }} thumbColor={enabled ? accent : COLORS.textMuted} />
      </View>
      {enabled && (
        <View style={[s.rateRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TextInput
            style={[s.rateInput, { backgroundColor: COLORS.background, borderColor: accent + '50', color: COLORS.text, flex: 1 }]}
            placeholder="e.g. 19" placeholderTextColor={COLORS.textMuted}
            value={rateVal} onChangeText={setRate} keyboardType="decimal-pad"
          />
          <View style={[s.rateBadge, { backgroundColor: accent + '18' }]}>
            <Text style={[s.rateBadgeText, { color: accent }]}>{parseFloat(rateVal) || 0}%</Text>
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <BackHeader title={t('settings_taxes')} onBack={goBack} />
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

        <Text style={[s.subtitle, { color: COLORS.textMuted }]}>
          Manage tax settings and duty configurations applied to your orders.
        </Text>

        <TaxSection accent="#0984E3" enabled={taxEnabled} onToggle={setTaxEnabled}
          label="Enable Taxes" desc="Apply taxes to orders based on your location"
          rateVal={taxRate} setRate={setTaxRate} />

        <TaxSection accent="#6C5CE7" enabled={dutiesEnabled} onToggle={setDutiesEnabled}
          label="Enable Duties" desc="Apply customs duties for international orders"
          rateVal={dutiesRate} setRate={setDutiesRate} />

        {(taxEnabled || dutiesEnabled) && (
          <View style={[s.previewCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
            <Text style={[s.previewTitle, { color: COLORS.textMuted }]}>Effective Total Rate</Text>
            <Text style={[s.previewRate, { color: COLORS.primary }]}>{totalRate.toFixed(1)}%</Text>
            <Text style={[s.previewSub, { color: COLORS.textMuted }]}>Added to all applicable orders at checkout</Text>
          </View>
        )}

        <TouchableOpacity style={[s.saveBtn, { backgroundColor: COLORS.primary, opacity: saving ? 0.7 : 1 }]} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.saveBtnText}>Save Settings</Text>}
        </TouchableOpacity>
        <Text style={[s.footerNote, { color: COLORS.textMuted }]}>
          Tax and duties are automatically calculated and added to order totals at checkout.
        </Text>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  controls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  subtitle: { fontSize: 13, marginBottom: 24, lineHeight: 20 },
  sectionCard: { borderRadius: 18, padding: 16, marginBottom: 14 },
  toggleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionLabel2: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionDesc: { fontSize: 12, lineHeight: 18 },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  rateInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontWeight: '700' },
  rateBadge: { width: 56, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rateBadgeText: { fontSize: 16, fontWeight: '900' },
  previewCard: { borderRadius: 18, borderWidth: 1, padding: 20, alignItems: 'center', marginBottom: 20 },
  previewTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  previewRate: { fontSize: 48, fontWeight: '900', marginBottom: 4 },
  previewSub: { fontSize: 12, textAlign: 'center' },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  footerNote: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});

export default TaxesDutiesScreen;
