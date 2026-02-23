import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';

interface PoliciesScreenProps {
  navigate?: (screenId: string, params?: any) => void;
  goBack?: () => void;
}

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
const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Policy-specific SVG icons (replacing emojis)
const ClipboardIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const LockDocIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ReturnIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M1 4V10H7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3.51 15C4.15839 16.8404 5.38734 18.4202 7.01166 19.5014C8.63598 20.5826 10.5677 21.1066 12.5157 20.9945C14.4637 20.8824 16.3226 20.1402 17.8121 18.8798C19.3017 17.6193 20.3413 15.909 20.7742 14.0064C21.2072 12.1037 21.0101 10.112 20.2126 8.33108C19.4152 6.55019 18.0605 5.07674 16.3528 4.13271C14.6451 3.18868 12.6769 2.82521 10.7447 3.09707C8.81245 3.36893 7.02091 4.26142 5.64 5.64L1 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const TruckIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M16 3H1V16H16V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 8H20L23 11V16H16V8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="5.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2" />
    <Circle cx="18.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2" />
  </Svg>
);
const CookieIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 14C8 14 9 15.5 12 15.5C15 15.5 16 14 16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 9H9.01" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M15 9H15.01" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M19 2L21 4L22 2L21 0L19 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 9C22 9 21 8.5 21.5 7.5C22 6.5 23 7 23 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ShieldIcon = ({ color }: { color: string }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PoliciesScreen: React.FC<PoliciesScreenProps> = ({ navigate, goBack }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);

  const POLICIES = [
    { id: '1', icon: (c: string) => <ClipboardIcon color={c} />, title: t('policies_terms'), summary: t('policies_termsSummary'), lastUpdated: '2025-01-15', accent: '#3B82F6', content: t('policies_termsContent') },
    { id: '2', icon: (c: string) => <LockDocIcon color={c} />, title: t('policies_privacy'), summary: t('policies_privacySummary'), lastUpdated: '2025-01-15', accent: '#10B981', content: t('policies_privacyContent') },
    { id: '3', icon: (c: string) => <ReturnIcon color={c} />, title: t('policies_refund'), summary: t('policies_refundSummary'), lastUpdated: '2025-01-10', accent: '#F59E0B', content: t('policies_refundContent') },
    { id: '4', icon: (c: string) => <TruckIcon color={c} />, title: t('policies_shipping'), summary: t('policies_shippingSummary'), lastUpdated: '2025-01-10', accent: '#8B5CF6', content: t('policies_shippingContent') },
    { id: '5', icon: (c: string) => <CookieIcon color={c} />, title: t('policies_cookie'), summary: t('policies_cookieSummary'), lastUpdated: '2025-01-15', accent: '#EC4899', content: t('policies_cookieContent') },
  ];

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language as any) + 1) % langs.length]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — back + title + controls in one row */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={goBack} activeOpacity={0.7}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d={isRTL ? 'M5 12H19M19 12L12 19M19 12L12 5' : 'M19 12H5M5 12L12 19M5 12L12 5'} stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: COLORS.text }]} numberOfLines={1}>{t('settings_policies')}</Text>
          <View style={[s.controls, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity style={[s.iconBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={cycleLanguage} activeOpacity={0.7}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.text }}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.iconBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} onPress={toggleTheme} activeOpacity={0.7}>
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero */}
        <View style={[s.heroCard, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '30' }]}>
          <View style={[s.heroIconWrap, { backgroundColor: COLORS.primary + '18' }]}>
            <ShieldIcon color={COLORS.primary} />
          </View>
          <Text style={[s.heroTitle, { color: COLORS.text }]}>{t('policies_title')}</Text>
          <Text style={[s.heroSub, { color: COLORS.textMuted }]}>{t('policies_subtitle')}</Text>
        </View>

        {/* Policy list */}
        <View style={{ gap: 10 }}>
          {POLICIES.map(policy => (
            <TouchableOpacity
              key={policy.id}
              style={[s.policyCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={() => setSelectedPolicy(policy)}
              activeOpacity={0.7}
            >
              <View style={[s.policyIcon, { backgroundColor: policy.accent + '15' }]}>
                {policy.icon(policy.accent)}
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={[s.policyTitle, { color: COLORS.text }]}>{policy.title}</Text>
                <Text style={[s.policySummary, { color: COLORS.textMuted }]} numberOfLines={1}>{policy.summary}</Text>
                <Text style={[s.policyDate, { color: COLORS.textMuted }]}>{t('policies_updated')} {new Date(policy.lastUpdated).toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
              </View>
              <View style={[s.chevron, { backgroundColor: policy.accent + '12' }]}>
                <Text style={[s.chevronText, { color: policy.accent }]}>{isRTL ? '‹' : '›'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[s.footerNote, { color: COLORS.textMuted }]}>{t('policies_footerNote')}</Text>
      </ScrollView>

      {/* Policy Detail Modal */}
      <Modal visible={!!selectedPolicy} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: COLORS.surface }]}>
            <View style={[s.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[s.modalIconCircle, { backgroundColor: selectedPolicy?.accent + '18' }]}>
                {selectedPolicy?.icon(selectedPolicy?.accent || COLORS.primary)}
              </View>
              <Text style={[s.modalTitle, { color: COLORS.text, flex: 1, marginLeft: 12 }]}>{selectedPolicy?.title}</Text>
              <TouchableOpacity style={[s.closeBtn, { backgroundColor: COLORS.background }]} onPress={() => setSelectedPolicy(null)}>
                <CloseIcon color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={[s.modalDate, { color: COLORS.textMuted }]}>{t('policies_lastUpdated')} {selectedPolicy?.lastUpdated}</Text>
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <Text style={[s.modalBody, { color: COLORS.text }]}>{selectedPolicy?.content}</Text>
            </ScrollView>
            <TouchableOpacity style={[s.doneBtn, { backgroundColor: selectedPolicy?.accent || COLORS.primary }]} onPress={() => setSelectedPolicy(null)}>
              <Text style={s.doneBtnText}>{t('policies_close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  controls: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  heroCard: { borderRadius: 22, borderWidth: 1, padding: 24, alignItems: 'center', marginBottom: 20 },
  heroIconWrap: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  heroSub: { fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 260 },
  policyCard: { borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center' },
  policyIcon: { width: 46, height: 46, borderRadius: 15, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  policyTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  policySummary: { fontSize: 12, marginBottom: 4, lineHeight: 18 },
  policyDate: { fontSize: 10 },
  chevron: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  chevronText: { fontSize: 20, fontWeight: '900', lineHeight: 26 },
  footerNote: { fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  modalIconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  modalDate: { fontSize: 12, marginBottom: 16 },
  modalBody: { fontSize: 14, lineHeight: 24 },
  doneBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  doneBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});

export default PoliciesScreen;
