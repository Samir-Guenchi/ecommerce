import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { paymentAPI } from '../services/api.service';

// Payment Icon
const PaymentIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 10H23"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PaymentsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getAllPayments();
      setPaymentMethods(response.paymentMethods);
    } catch (error: any) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = () => {
    Alert.alert('Add Payment Method', 'Payment method form will be available soon.');
  };

  const handleSetDefault = async (id: number) => {
    try {
      await paymentAPI.updatePayment(id, { isDefault: true });
      Alert.alert('Success', 'Payment method set as default.');
      await loadPayments();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to set default payment method.');
    }
  };

  const handleRemove = async (id: number) => {
    Alert.alert('Remove Payment', 'Are you sure you want to remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await paymentAPI.deletePayment(id);
            Alert.alert('Success', 'Payment method removed.');
            await loadPayments();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to remove payment method.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={{ marginTop: 12, fontSize: 14, color: '#666' }}>Loading payment methods...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <PaymentIcon />
        </View>
      </View>
      <Text style={styles.heading}>Payments</Text>
      <Text style={styles.subheading}>
        Manage your payment methods and transaction history.
      </Text>

      <View style={styles.formSection}>
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No payment methods</Text>
            <Text style={styles.emptyStateSubtext}>Add a payment method to get started.</Text>
          </View>
        ) : (
          paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentCard}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentType}>
                  {method.type === 'credit_card' ? 'Credit Card' : method.type === 'debit_card' ? 'Debit Card' : 'Bank Account'}
                </Text>
                {method.cardLast4 && (
                  <Text style={styles.paymentDetails}>•••• •••• •••• {method.cardLast4}</Text>
                )}
                {method.cardExpiry && (
                  <Text style={styles.paymentExpiry}>Expires {method.cardExpiry}</Text>
                )}
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <View style={styles.paymentActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <Text style={styles.actionButtonText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={() => handleRemove(method.id)}
                >
                  <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddPayment}>
        <Text style={styles.addButtonText}>+ Add Payment Method</Text>
      </TouchableOpacity>

      <Text style={styles.infoText}>
        Your payment methods are securely stored and encrypted. You can add multiple payment methods for convenience.
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
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  paymentInfo: {
    marginBottom: 12,
  },
  paymentType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  paymentDetails: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  paymentExpiry: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D32',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  removeButton: {
    borderColor: '#FFEBEE',
  },
  removeButtonText: {
    color: '#C62828',
  },
  addButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
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

export default PaymentsScreen;
