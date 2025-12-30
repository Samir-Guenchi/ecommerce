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

// Billing Icon
const BillingIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 2V8H20"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 13H8"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 17H8"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlanBillingScreen = () => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await subscriptionAPI.getCurrentSubscription();
      setSubscription(response.subscription);
      setPlan(response.plan);
    } catch (error: any) {
      console.error('Error loading subscription:', error);
      // Set default plan if error
      setPlan({
        id: 0,
        name: 'Free',
        price: 0,
        billingPeriod: 'monthly',
        features: ['Basic features'],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={{ marginTop: 12, fontSize: 14, color: '#666' }}>Loading plan information...</Text>
      </View>
    );
  }

  const currentPlan = {
    name: plan?.name || 'Free',
    price: plan?.price ? `$${Number(plan.price).toFixed(2)}` : '$0.00',
    period: plan?.billingPeriod === 'yearly' ? 'per year' : 'per month',
    features: Array.isArray(plan?.features) ? plan.features : (plan?.features ? [plan.features] : ['Basic features']),
    nextBilling: subscription?.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'N/A',
    status: subscription?.status || 'active',
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <BillingIcon />
        </View>
      </View>
      <Text style={styles.heading}>Plan & Billing</Text>
      <Text style={styles.subheading}>
        View your current plan and manage billing information.
      </Text>

      <View style={styles.formSection}>
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{currentPlan.name}</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>
                {currentPlan.status === 'active' ? 'Active' : currentPlan.status === 'cancelled' ? 'Cancelled' : 'Pending'}
              </Text>
            </View>
          </View>
          <View style={styles.planPrice}>
            <Text style={styles.priceAmount}>{currentPlan.price}</Text>
            <Text style={styles.pricePeriod}>{currentPlan.period}</Text>
          </View>
          <View style={styles.planFeatures}>
            {currentPlan.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureText}>✓ {feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.billingCard}>
          <Text style={styles.billingLabel}>Next Billing Date</Text>
          <Text style={styles.billingValue}>{currentPlan.nextBilling}</Text>
        </View>

        <View style={styles.billingCard}>
          <Text style={styles.billingLabel}>Payment Method</Text>
          <Text style={styles.billingValue}>•••• •••• •••• 4242</Text>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Update Payment Method</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Change Plan</Text>
      </TouchableOpacity>

      <Text style={styles.infoText}>
        You can upgrade, downgrade, or cancel your plan at any time. Changes will take effect on your next billing cycle.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 35,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    marginBottom: 8,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  planBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D32',
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  pricePeriod: {
    fontSize: 12,
    color: '#666',
  },
  planFeatures: {
    marginTop: 8,
  },
  featureItem: {
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#333',
  },
  billingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  billingLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  billingValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  linkButton: {
    marginTop: 4,
  },
  linkText: {
    fontSize: 12,
    color: '#000000',
    textDecorationLine: 'underline',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default PlanBillingScreen;
