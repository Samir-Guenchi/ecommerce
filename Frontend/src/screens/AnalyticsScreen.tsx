import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { orderAPI, productAPI, storeAPI } from '../services/api.service';

// Analytics Icon
const AnalyticsIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3V21H21"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 16L12 11L16 15L21 10"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 10H16V15H21V10Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface AnalyticsScreenProps {
  navigate?: (screenId: string) => void;
  goBack?: () => void;
  storeId?: string;
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ navigate, goBack, storeId }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrder: 0,
    period: 'Last 30 days',
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        
        // Get all orders
        const ordersResponse = await orderAPI.getAllOrders();
        let orders = ordersResponse.orders;
        
        // Filter by storeId if provided
        if (storeId) {
          orders = orders.filter((order: any) => order.storeId === parseInt(storeId, 10));
        }
        
        // Get all products
        const productsResponse = await productAPI.getAllProducts();
        let products = productsResponse.products;
        
        // Filter by storeId if provided
        if (storeId) {
          products = products.filter((product: any) => product.storeId === parseInt(storeId, 10));
        }
        
        // Calculate analytics
        const totalOrders = orders.length;
        const totalProducts = products.length;
        const totalSales = orders.reduce((sum: number, order: any) => sum + (parseFloat(order.total || 0)), 0);
        const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
        
        setAnalytics({
          totalSales,
          totalOrders,
          totalProducts,
          averageOrder,
          period: 'Last 30 days',
        });
      } catch (error: any) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [storeId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={{ marginTop: 12, fontSize: 14, color: '#666' }}>Loading analytics...</Text>
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
          <AnalyticsIcon />
        </View>
      </View>
      <Text style={styles.heading}>Analytics</Text>
      <Text style={styles.subheading}>
        View your store performance and statistics.
      </Text>

      <View style={styles.formSection}>
        <View style={styles.periodCard}>
          <Text style={styles.periodLabel}>Period</Text>
          <Text style={styles.periodValue}>{analytics.period}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Sales</Text>
          <Text style={styles.statValue}>${analytics.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Orders</Text>
          <Text style={styles.statValue}>{analytics.totalOrders}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Products</Text>
          <Text style={styles.statValue}>{analytics.totalProducts}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Average Order Value</Text>
          <Text style={styles.statValue}>${analytics.averageOrder.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>
      </View>

      <Text style={styles.infoText}>
        Analytics data is updated in real-time. Use this information to make informed business decisions.
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
  formSection: {
    marginBottom: 8,
  },
  periodCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  periodLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  periodValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default AnalyticsScreen;

