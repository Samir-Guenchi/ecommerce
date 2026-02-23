/**
 * PlanBillingScreen — 2026 Redesign
 * ✦ Full i18n EN/AR/FR
 * ✦ RTL layout support
 * ✦ Dynamic dark / light theme
 * ✦ Backend: subscriptionAPI.getCurrentSubscription() + getPlans()
 * ✦ Upgrade plan via subscriptionAPI.updateSubscription()
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { subscriptionAPI } from '../services/api.service';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

interface PlanBillingScreenProps { goBack?: () => void; }

/* ─── Icons ─── */
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
const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ChevronIcon = ({ color, up }: { color: string; up?: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d={up ? 'M18 15L12 9L6 15' : 'M6 9L12 15L18 9'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ── Fallback plans used when the server returns none ── */
const FALLBACK_PLANS = [
  { id: 0, nameKey: 'billing_planFree', price: 0, period: 'month', popular: false, color: '#6B7280', gradA: '#1a1a2e', gradB: '#16213e', featureKeys: ['billing_feat1Store', 'billing_feat50Products', 'billing_featBasicAnalytics', 'billing_featEmailSupport'] },
  { id: 1, nameKey: 'billing_planStarter', price: 9.99, period: 'month', popular: false, color: '#3B82F6', gradA: '#0B4F6C', gradB: '#1A936F', featureKeys: ['billing_feat3Stores', 'billing_feat500Products', 'billing_featAdvancedAnalytics', 'billing_featPrioritySupport', 'billing_featCustomDomain'] },
  { id: 2, nameKey: 'billing_planPro', price: 29.99, period: 'month', popular: true, color: '#8B5CF6', gradA: '#4C1D95', gradB: '#6D28D9', featureKeys: ['billing_feat10Stores', 'billing_featUnlimitedProducts', 'billing_featFullAnalytics', 'billing_feat247Support', 'billing_featAPIAccess', 'billing_featTeamMembers'] },
  { id: 3, nameKey: 'billing_planEnterprise', price: 99.99, period: 'month', popular: false, color: '#F59E0B', gradA: '#78350F', gradB: '#B45309', featureKeys: ['billing_featUnlimitedStores', 'billing_featUnlimitedProducts', 'billing_featEnterpriseAnalytics', 'billing_featDedicatedManager', 'billing_featCustomIntegrations', 'billing_featSLAGuarantee'] },
];

const PlanBillingScreen = ({ goBack }: PlanBillingScreenProps) => {
  const { mode, toggleTheme } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language, setLanguage } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>(FALLBACK_PLANS);
  const [upgrading, setUpgrading] = useState<number | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const { message, showSuccess, showError, clear } = useStatusMessage();

  const cycleLanguage = () => {
    const langs: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    setLanguage(langs[(langs.indexOf(language as any) + 1) % langs.length]);
  };

  useEffect(() => {
    const load = async () => {
      try {
        /* Try to get subscription plan list from backend */
        const [subResult, plansResult] = await Promise.allSettled([
          subscriptionAPI.getCurrentSubscription(),
          subscriptionAPI.getPlans(),
        ]);

        /* If backend returns plans, use them; otherwise keep FALLBACK_PLANS */
        if (plansResult.status === 'fulfilled' && plansResult.value.plans?.length > 0) {
          setPlans(plansResult.value.plans.map((p: any, idx: number) => ({
            id: p.id ?? idx,
            nameKey: null,
            name: p.name,
            price: p.price ?? 0,
            period: p.interval ?? 'month',
            popular: p.popular ?? false,
            color: p.color ?? FALLBACK_PLANS[idx % FALLBACK_PLANS.length]?.color ?? '#6B7280',
            gradA: p.gradientStart ?? FALLBACK_PLANS[idx % FALLBACK_PLANS.length]?.gradA ?? '#1a1a2e',
            gradB: p.gradientEnd ?? FALLBACK_PLANS[idx % FALLBACK_PLANS.length]?.gradB ?? '#16213e',
            features: p.features ?? [],
            featureKeys: null,
          })));
        }

        if (subResult.status === 'fulfilled') {
          setCurrentPlan(subResult.value.plan || subResult.value.subscription);
        }
      } catch (_) { /* silent — will use fallback */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleUpgrade = async (plan: any) => {
    const planId = plan.id;
    if (planId === currentPlan?.id) { showError(t('billing_alreadyOnPlan')); return; }
    if (plan.price === 0) { showError(t('billing_cannotSelectFree')); return; }
    try {
      setUpgrading(planId);
      await subscriptionAPI.updateSubscription({ planId });

      setCurrentPlan(plan);
      setShowPlans(false);
      const planName = plan.nameKey ? t(plan.nameKey as any) : plan.name;
      showSuccess(t('billing_upgradedTo').replace('{plan}', planName));
    } catch (e: any) { showError(e.message || t('billing_upgradeFailed')); }
    finally { setUpgrading(null); }
  };

  const cp = currentPlan || FALLBACK_PLANS[0];

  const getPlanName = (plan: any) => plan.nameKey ? t(plan.nameKey as any) : (plan.name || '');
  const getPlanFeatures = (plan: any): string[] => {
    if (plan.featureKeys) return plan.featureKeys.map((k: string) => t(k as any));
    return plan.features || [];
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
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <BackHeader title={t('billing_title')} onBack={goBack} />

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

        {/* Current Plan Hero */}
        <LinearGradient colors={[cp.gradA || '#1a1a2e', cp.gradB || '#16213e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.currentCard}>
          <View style={[s.currentBadge, { borderColor: 'rgba(255,255,255,0.3)' }, isRTL && { alignSelf: 'flex-end' }]}>
            <Text style={s.currentBadgeText}>{t('billing_currentPlan')}</Text>
          </View>
          <Text style={[s.currentName, isRTL && { textAlign: 'right' }]}>{getPlanName(cp)}</Text>
          <View style={[s.priceRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={s.currentPrice}>{cp.price === 0 ? t('billing_free') : `${cp.price} DZD`}</Text>
            {cp.price > 0 && <Text style={s.currentPer}>/{t('billing_perMonth')}</Text>}
          </View>
          <View style={{ marginTop: 12, gap: 6 }}>
            {getPlanFeatures(cp).map((f: string, i: number) => (
              <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
                <CheckIcon color="rgba(255,255,255,0.8)" />
                <Text style={[{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }, isRTL && { textAlign: 'right' }]}>{f}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Toggle plans */}
        <TouchableOpacity
          style={[s.toggleBtn, { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' }, isRTL && { flexDirection: 'row-reverse' }]}
          onPress={() => setShowPlans(v => !v)} activeOpacity={0.8}
        >
          <Text style={[s.toggleBtnText, { color: COLORS.primary }]}>
            {showPlans ? t('billing_hidePlans') : t('billing_viewAllPlans')}
          </Text>
          <ChevronIcon color={COLORS.primary} up={showPlans} />
        </TouchableOpacity>

        {/* Plans grid */}
        {showPlans && (
          <View style={{ gap: 12, marginTop: 4 }}>
            {plans.map(plan => {
              const isCurrentPlan = plan.id === cp.id;
              return (
                <View key={plan.id} style={[s.planCard, { backgroundColor: COLORS.surface, borderColor: isCurrentPlan ? plan.color + '60' : COLORS.border, borderWidth: isCurrentPlan ? 2 : 1 }]}>
                  {plan.popular && (
                    <View style={[s.popularBadge, { backgroundColor: plan.color }, isRTL && { alignSelf: 'flex-end' }]}>
                      <Text style={s.popularText}>{t('billing_popular')}</Text>
                    </View>
                  )}
                  <View style={[s.planTop, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={isRTL ? { alignItems: 'flex-end' } : {}}>
                      <Text style={[s.planName, { color: COLORS.text }]}>{getPlanName(plan)}</Text>
                      <Text style={[s.planPrice, { color: plan.color }]}>
                        {plan.price === 0 ? t('billing_free') : `${plan.price} DZD/${t('billing_mo')}`}
                      </Text>
                    </View>
                    {!isCurrentPlan && (
                      <TouchableOpacity
                        style={[s.upgradeBtn, { backgroundColor: plan.color, opacity: upgrading === plan.id ? 0.7 : 1 }]}
                        onPress={() => handleUpgrade(plan)} disabled={upgrading !== null} activeOpacity={0.8}
                      >
                        {upgrading === plan.id
                          ? <ActivityIndicator color="#FFF" size="small" />
                          : <Text style={s.upgradeBtnText}>{t('billing_select')}</Text>}
                      </TouchableOpacity>
                    )}
                    {isCurrentPlan && (
                      <View style={[s.activeTag, { backgroundColor: plan.color + '20', borderColor: plan.color + '40' }]}>
                        <Text style={[s.activeTagText, { color: plan.color }]}>{t('billing_active')}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ gap: 6, marginTop: 10 }}>
                    {getPlanFeatures(plan).slice(0, 4).map((f: string, i: number) => (
                      <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <CheckIcon color={plan.color} />
                        <Text style={[s.featureText, { color: COLORS.textMuted }]}>{f}</Text>
                      </View>
                    ))}
                    {getPlanFeatures(plan).length > 4 && (
                      <Text style={[{ color: COLORS.textMuted, fontSize: 12, marginLeft: 24 }, isRTL && { textAlign: 'right', marginLeft: 0, marginRight: 24 }]}>
                        +{getPlanFeatures(plan).length - 4} {t('billing_more')}…
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text style={[s.footerNote, { color: COLORS.textMuted }]}>
          {t('billing_footerNote')}
        </Text>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  controls: { flexDirection: 'row', gap: 8 },
  ctrlBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  currentCard: { borderRadius: 22, padding: 22, marginBottom: 16 },
  currentBadge: { alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 10 },
  currentBadgeText: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  currentName: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
  currentPrice: { fontSize: 36, fontWeight: '900', color: '#FFFFFF' },
  currentPer: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  toggleBtn: { borderRadius: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, marginBottom: 16 },
  toggleBtnText: { fontSize: 14, fontWeight: '800' },
  planCard: { borderRadius: 18, padding: 16 },
  popularBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 8 },
  popularText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  planPrice: { fontSize: 15, fontWeight: '700' },
  upgradeBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  upgradeBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  activeTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  activeTagText: { fontSize: 12, fontWeight: '700' },
  featureText: { fontSize: 13, lineHeight: 20 },
  footerNote: { fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 20 },
});

export default PlanBillingScreen;
