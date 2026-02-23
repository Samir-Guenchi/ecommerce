/**
 * DomainsScreen — 2026 Premium Redesign
 *
 * ✦ Bento-style domain cards with gradient accents
 * ✦ Modern input fields with glassmorphism
 * ✦ DNS configuration guide
 * ✦ Full i18n and dark mode support
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { storeAPI } from '../services/api.service';
import { getColors, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

const { width: W } = Dimensions.get('window');
const CARD_R = 18;

/* ══════ ICONS ══════ */
const SunIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke="#FDB913" strokeWidth="2" />
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB913" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const MoonIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const BackArrowIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19L5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const GlobeIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M2 12H22M12 2C14.5 4.5 16 8.5 16 12C16 15.5 14.5 19.5 12 22M12 2C9.5 4.5 8 8.5 8 12C8 15.5 9.5 19.5 12 22" stroke={color} strokeWidth="2" />
  </Svg>
);
const CheckCircleIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface DomainsScreenProps {
  navigate?: (screenId: string) => void;
  goBack?: () => void;
  storeId?: string;
}

const DomainsScreen: React.FC<DomainsScreenProps> = ({ navigate, goBack, storeId }) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, language, setLanguage, isRTL } = useTranslation();
  const { message, showSuccess, showError, clear } = useStatusMessage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [currentDomain, setCurrentDomain] = useState('');

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const idx = langs.indexOf(language);
    setLanguage(langs[(idx + 1) % langs.length]);
  };

  useEffect(() => {
    const loadStoreDomain = async () => {
      if (!storeId) {
        // If no storeId, try to get first store
        try {
          const response = await storeAPI.getAllStores();
          if (response.stores.length > 0) {
            const store = response.stores[0];
            setCurrentDomain(store.domain || '');
            setCustomDomain(store.domain || '');
          }
        } catch (error: any) {
          console.error('Error loading stores:', error);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await storeAPI.getStoreById(parseInt(storeId, 10));
        const store = response.store;
        setCurrentDomain(store.domain || '');
        setCustomDomain(store.domain || '');
      } catch (error: any) {
        showError(error.message || t('domains_loadError') || 'Failed to load domain.');
      } finally {
        setLoading(false);
      }
    };

    loadStoreDomain();
  }, [storeId]);

  const handleSave = async () => {
    if (!storeId) {
      showError(t('domains_storeIdError') || 'Store ID is required');
      return;
    }

    if (!customDomain) {
      showError(t('domains_enterError') || 'Please enter a domain');
      return;
    }

    try {
      setSaving(true);
      await storeAPI.updateStore(parseInt(storeId, 10), {
        domain: customDomain,
      });
      setCurrentDomain(customDomain);
      showSuccess(t('domains_saveSuccess') || 'Your domain settings have been saved. DNS configuration may take up to 48 hours.');
    } catch (error: any) {
      showError(error.message || t('domains_saveFail') || 'Failed to save domain.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textMuted, fontWeight: '600' }}>
          {t('domains_loading') || 'Loading domain...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={[styles.headerLeft, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity 
              style={[styles.backBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} 
              onPress={goBack} 
              activeOpacity={0.7}
            >
              <BackArrowIcon color={COLORS.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: COLORS.text }]}>{t('settings_domains') || 'Domains'}</Text>
              <Text style={[styles.subtitle, { color: COLORS.textMuted }]}>{t('domains_subtitle') || 'Custom domain settings'}</Text>
            </View>
          </View>
          <View style={[styles.controls, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity 
              style={[styles.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} 
              onPress={cycleLanguage} 
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.text }}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.ctrlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} 
              onPress={toggleTheme} 
              activeOpacity={0.7}
            >
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </TouchableOpacity>
          </View>
        </View>

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* ── Hero Icon ── */}
        <View style={[styles.heroIcon, { backgroundColor: COLORS.primary + '15' }]}>
          <GlobeIcon color={COLORS.primary} />
        </View>

        <Text style={[styles.description, { color: COLORS.textSecondary }]}>
          {t('domains_description') || 'Manage your domain settings and configurations. Connect a custom domain to your store.'}
        </Text>

        {/* ── Current Domain Card ── */}
        {currentDomain && (
          <View style={[styles.domainCard, { backgroundColor: COLORS.surface, borderColor: COLORS.success + '30' }]}>
            <LinearGradient
              colors={[COLORS.success + '15', COLORS.success + '05']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.domainGradient}
            />
            <View style={[styles.domainIconBadge, { backgroundColor: COLORS.success + '15' }]}>
              <CheckCircleIcon color={COLORS.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.domainLabel, { color: COLORS.textMuted }]}>
                {t('domains_current') || 'Current Domain'}
              </Text>
              <Text style={[styles.domainValue, { color: COLORS.text }]}>{currentDomain}</Text>
              <Text style={[styles.domainStatus, { color: COLORS.success }]}>
                {t('domains_active') || 'Active'}
              </Text>
            </View>
          </View>
        )}

        {/* ── Custom Domain Input ── */}
        <View style={[styles.inputCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <Text style={[styles.inputLabel, { color: COLORS.text }]}>
            {t('domains_customDomain') || 'Custom Domain'}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.text }]}
            placeholder={t('domains_placeholder') || 'example.com'}
            placeholderTextColor={COLORS.textMuted}
            value={customDomain}
            onChangeText={setCustomDomain}
            autoCapitalize="none"
            keyboardType="default"
          />
          <Text style={[styles.helpText, { color: COLORS.textMuted }]}>
            {t('domains_help') || 'Enter your custom domain name. Make sure to configure your DNS settings.'}
          </Text>
        </View>

        {/* ── Save Button ── */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: COLORS.primary }, (saving || !storeId) && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving || !storeId}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>{t('common_save') || 'Save Domain'}</Text>
          )}
        </TouchableOpacity>

        {/* ── DNS Configuration Guide ── */}
        <View style={[styles.dnsCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <LinearGradient
            colors={[COLORS.primary + '10', COLORS.primary + '03']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dnsGradient}
          />
          <Text style={[styles.dnsTitle, { color: COLORS.text }]}>
            {t('domains_dnsConfig') || 'DNS Configuration'}
          </Text>
          <Text style={[styles.dnsDesc, { color: COLORS.textSecondary }]}>
            {t('domains_dnsDesc') || 'To use a custom domain, you need to add the following DNS records:'}
          </Text>
          <View style={[styles.dnsRecord, { backgroundColor: COLORS.background }]}>
            <Text style={[styles.dnsType, { color: COLORS.primary }]}>A Record:</Text>
            <Text style={[styles.dnsValue, { color: COLORS.textSecondary }]}>@ → 192.0.2.1</Text>
          </View>
          <View style={[styles.dnsRecord, { backgroundColor: COLORS.background }]}>
            <Text style={[styles.dnsType, { color: COLORS.primary }]}>CNAME:</Text>
            <Text style={[styles.dnsValue, { color: COLORS.textSecondary }]}>www → yourstore.example.com</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginRight: 12 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  controls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  heroIcon: { width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20 },
  description: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 24 },

  domainCard: {
    borderRadius: CARD_R,
    borderWidth: 2,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  domainGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  domainIconBadge: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14, zIndex: 1 },
  domainLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, zIndex: 1 },
  domainValue: { fontSize: 15, fontWeight: '800', marginBottom: 6, zIndex: 1 },
  domainStatus: { fontSize: 11, fontWeight: '700', zIndex: 1 },

  inputCard: { borderRadius: CARD_R, borderWidth: 1, padding: 16, marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  helpText: { fontSize: 12, lineHeight: 16 },

  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  dnsCard: {
    borderRadius: CARD_R,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  dnsGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  dnsTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8, zIndex: 1 },
  dnsDesc: { fontSize: 13, lineHeight: 18, marginBottom: 14, zIndex: 1 },
  dnsRecord: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    zIndex: 1,
  },
  dnsType: { fontSize: 13, fontWeight: '700', width: 90 },
  dnsValue: { fontSize: 13, fontWeight: '600', flex: 1 },
});

export default DomainsScreen;
