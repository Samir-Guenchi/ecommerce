import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { subscriptionAPI } from '../services/api.service';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import BackHeader from '../components/BackHeader';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';

interface PlanBillingScreenProps {
  goBack?: () => void;
}

const CheckIcon = ({ color }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color || COLORS.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CrownIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M2 4L5 16H19L22 4L17 8L12 2L7 8L2 4Z" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 20H19" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const PlanBillingScreen = ({ goBack }: PlanBillingScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [showPlans, setShowPlans] = useState(false);
  const { message, showSuccess, showError, showInfo, clear } = useStatusMessage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subRes, plansRes] = await Promise.all([
        subscriptionAPI.getCurrentSubscription().catch(() => ({ subscription: null, plan: { id: 0, name: 'Free', price: 0, period: 'month', features: ['1 Store', '50 Products', 'Basic Analytics', 'Email Support'] } })),
        subscriptionAPI.getPlans().catch(() => ({ plans: [] })),
      ]);
      setSubscription(subRes.subscription);
      setCurrentPlan(subRes.plan || { id: 0, name: 'Free', price: 0, period: 'month', features: ['1 Store', '50 Products', 'Basic Analytics', 'Email Support'] });
      const defaultPlans = [
        { id: 0, name: 'Free', price: 0, period: 'month', features: ['1 Store', '50 Products', 'Basic Analytics', 'Email Support'], popular: false },
        { id: 1, name: 'Starter', price: 9.99, period: 'month', features: ['3 Stores', '500 Products', 'Advanced Analytics', 'Priority Support', 'Custom Domain'], popular: false },
        { id: 2, name: 'Professional', price: 29.99, period: 'month', features: ['10 Stores', 'Unlimited Products', 'Full Analytics Suite', '24/7 Support', 'Custom Domain', 'API Access', 'Team Members'], popular: true },
        { id: 3, name: 'Enterprise', price: 99.99, period: 'month', features: ['Unlimited Stores', 'Unlimited Products', 'Enterprise Analytics', 'Dedicated Account Manager', 'Custom Integrations', 'SLA Guarantee', 'White Label'], popular: false },
      ];
      setAvailablePlans(plansRes.plans?.length > 0 ? plansRes.plans : defaultPlans);
    } catch (error: any) {
      console.error('Error loading subscription:', error);
      setCurrentPlan({ id: 0, name: 'Free', price: 0, period: 'month', features: ['1 Store', '50 Products', 'Basic Analytics'] });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: any) => {
    if (plan.id === (currentPlan?.id || 0)) {
      showInfo('This is your current plan.');
      return;
    }
    if (plan.price === 0) {
      showInfo('You are switching to the Free plan.');
    } else {
      showInfo(`Upgrading to ${plan.name} plan - payment integration coming soon.`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading plan information...</Text>
      </View>
    );
  }

  const plan = currentPlan || { name: 'Free', price: 0, period: 'month', features: ['Basic features'] };
  const features = Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? [plan.features] : ['Basic features']);
  const isActive = !subscription || subscription?.status === 'active';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackHeader title="Plan & Billing" onBack={goBack} />
      <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

      {/* Current Plan Card */}
      <View style={styles.currentPlanCard}>
        <View style={styles.currentPlanHeader}>
          <View style={styles.crownBadge}>
            <CrownIcon />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.currentPlanLabel}>Current Plan</Text>
            <Text style={styles.currentPlanName}>{plan.name}</Text>
          </View>
          <View style={[styles.statusChip, isActive ? styles.statusActive : styles.statusInactive]}>
            <Text style={[styles.statusChipText, isActive ? styles.statusActiveText : styles.statusInactiveText]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceAmount}>${Number(plan.price || 0).toFixed(2)}</Text>
          <Text style={styles.pricePeriod}>/{plan.period || plan.billingPeriod || 'month'}</Text>
        </View>

        <View style={styles.featureList}>
          {features.map((feature: string, idx: number) => (
            <View key={idx} style={styles.featureRow}>
              <CheckIcon color={COLORS.success} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {subscription?.nextBillingDate && (
          <View style={styles.billingDateRow}>
            <Text style={styles.billingDateLabel}>Next billing</Text>
            <Text style={styles.billingDateValue}>{new Date(subscription.nextBillingDate).toLocaleDateString()}</Text>
          </View>
        )}
      </View>

      {/* Change Plan Button */}
      <TouchableOpacity style={styles.changePlanBtn} onPress={() => setShowPlans(!showPlans)}>
        <Text style={styles.changePlanText}>{showPlans ? 'Hide Plans' : 'View Available Plans'}</Text>
      </TouchableOpacity>

      {/* Available Plans */}
      {showPlans && (
        <View style={{ marginTop: SPACING.md }}>
          <Text style={styles.plansHeading}>Choose a Plan</Text>
          {availablePlans.map((p: any) => {
            const isCurrent = p.id === (currentPlan?.id || 0);
            const pFeatures = Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? [p.features] : []);
            return (
              <View key={p.id} style={[styles.planCard, isCurrent && styles.planCardCurrent, p.popular && styles.planCardPopular]}>
                {p.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}
                <View style={styles.planCardHeader}>
                  <Text style={styles.planCardName}>{p.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={styles.planCardPrice}>${Number(p.price || 0).toFixed(2)}</Text>
                    <Text style={styles.planCardPeriod}>/{p.period || 'month'}</Text>
                  </View>
                </View>
                <View style={{ marginTop: 10 }}>
                  {pFeatures.map((f: string, i: number) => (
                    <View key={i} style={styles.featureRow}>
                      <CheckIcon color={isCurrent ? COLORS.primary : COLORS.textSecondary} />
                      <Text style={[styles.featureTextSm, isCurrent && { color: COLORS.text }]}>{f}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.selectPlanBtn, isCurrent && styles.selectPlanBtnCurrent]}
                  onPress={() => handleSelectPlan(p)}
                >
                  <Text style={[styles.selectPlanText, isCurrent && styles.selectPlanTextCurrent]}>
                    {isCurrent ? 'Current Plan' : p.price > (currentPlan?.price || 0) ? 'Upgrade' : 'Downgrade'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      <Text style={styles.infoText}>
        You can upgrade, downgrade, or cancel your plan at any time. Changes take effect on your next billing cycle.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },
  content: { paddingHorizontal: SPACING.md, paddingBottom: 40, paddingTop: 48 },
  currentPlanCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg, marginBottom: SPACING.md },
  currentPlanHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  crownBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
  currentPlanLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500', textTransform: 'uppercase' as any, letterSpacing: 0.5 },
  currentPlanName: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  statusActive: { backgroundColor: COLORS.success + '20' },
  statusInactive: { backgroundColor: COLORS.error + '20' },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  statusActiveText: { color: COLORS.success },
  statusInactiveText: { color: COLORS.error },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
  priceAmount: { fontSize: 32, fontWeight: '700', color: COLORS.primary },
  pricePeriod: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 4 },
  featureList: { marginBottom: SPACING.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureText: { fontSize: 14, color: COLORS.text, marginLeft: 10, fontWeight: '500' },
  featureTextSm: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 8 },
  billingDateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  billingDateLabel: { fontSize: 12, color: COLORS.textSecondary },
  billingDateValue: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  changePlanBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  changePlanText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  plansHeading: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  planCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.md, marginBottom: 12 },
  planCardCurrent: { borderColor: COLORS.primary, borderWidth: 2 },
  planCardPopular: { borderColor: COLORS.primary },
  popularBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  popularText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  planCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planCardName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  planCardPrice: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  planCardPeriod: { fontSize: 12, color: COLORS.textSecondary },
  selectPlanBtn: { marginTop: 12, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  selectPlanBtnCurrent: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  selectPlanText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  selectPlanTextCurrent: { color: COLORS.primary },
  infoText: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 16, marginTop: SPACING.lg },
});

export default PlanBillingScreen;
