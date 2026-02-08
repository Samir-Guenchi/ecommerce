import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { orderAPI } from '../services/api.service';
import algeriaCities from '../data/algeria_cities.json';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

// Back Arrow Icon
const BackArrowIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke={COLORS.textSecondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Tracking Event Interface
interface TrackingEvent {
  wilaya: string;
  wilayaCode: string;
  timestamp: string;
  status: 'in_transit' | 'arrived' | 'departed' | 'delivered';
  description?: string;
}

interface OrderTrackingScreenProps {
  navigate?: (screenId: string) => void;
  orderId?: string;
  orderNumber?: string;
  customerName: string;
  orderStatus?: string;
  // Mock data - in real app, this would come from API
  trackingHistory?: TrackingEvent[];
  storeLocation: string;
  destinationWilaya: string;
}

// Helper function to get wilaya code
const getWilayaCode = (wilayaName: string): string => {
  const city = algeriaCities.find((c: any) => c.wilaya_name === wilayaName);
  return city ? city.wilaya_code : '00';
};

const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  navigate,
  orderId = '#1234',
  orderNumber = '#1234',
  customerName: initialCustomerName,
  orderStatus = 'Shipped',
  trackingHistory: initialTrackingHistory,
  storeLocation: initialStoreLocation,
  destinationWilaya: initialDestinationWilaya,
}) => {
  const [customerName, setCustomerName] = useState(initialCustomerName || '');
  const [storeLocation, setStoreLocation] = useState(initialStoreLocation || '');
  const [destinationWilaya, setDestinationWilaya] = useState(initialDestinationWilaya || '');
  const [trackingHistory, setTrackingHistory] = useState<TrackingEvent[]>(initialTrackingHistory || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (orderNumber && orderNumber !== '#1234' && (!customerName || !storeLocation || !destinationWilaya)) {
        setLoading(true);
        try {
          const { order } = await orderAPI.getOrderByOrderNumber(orderNumber);
          setCustomerName(order.user.fullName);
          setStoreLocation(order.store.location || 'Store Location');
          setDestinationWilaya(order.shippingAddress.stateProvince);
          if (order.trackingHistory) {
            setTrackingHistory(order.trackingHistory);
          }
        } catch (error) {
          console.error('Failed to fetch order:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrderData();
  }, [orderNumber, customerName, storeLocation, destinationWilaya]);
  // Mock tracking history if not provided
  const defaultTrackingHistory: TrackingEvent[] = trackingHistory.length > 0 ? trackingHistory : [
    {
      wilaya: storeLocation || 'Store Location',
      wilayaCode: getWilayaCode(storeLocation || 'Algiers'),
      timestamp: '2024-01-15T08:00:00Z',
      status: 'arrived',
      description: 'Order placed',
    },
    {
      wilaya: destinationWilaya || 'Algiers',
      wilayaCode: getWilayaCode(destinationWilaya || 'Algiers'),
      timestamp: new Date().toISOString(),
      status: 'in_transit',
      description: 'In transit to destination',
    },
  ];

  const trackingData = defaultTrackingHistory;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return { bg: 'rgba(16,185,129,0.12)', text: COLORS.success };
      case 'Shipped':
        return { bg: 'rgba(56,189,248,0.12)', text: COLORS.secondary };
      case 'Processing':
        return { bg: 'rgba(245,158,11,0.12)', text: COLORS.warning };
      default:
        return { bg: COLORS.surface, text: COLORS.textSecondary };
    }
  };

  const handleBack = () => {
    if (navigate) {
      navigate('orders');
    }
  };

  // Group tracking events by wilaya (remove duplicates for visualization)
  const uniqueWilayas = trackingData.reduce((acc, event) => {
    if (!acc.find((w) => w.wilaya === event.wilaya)) {
      acc.push(event);
    }
    return acc;
  }, [] as TrackingEvent[]);

  // Add destination if not in tracking history
  const allWilayas = [...uniqueWilayas];
  const lastWilaya = allWilayas[allWilayas.length - 1];
  if (lastWilaya && lastWilaya.wilaya !== destinationWilaya) {
    allWilayas.push({
      wilaya: destinationWilaya,
      wilayaCode: '31',
      timestamp: new Date().toISOString(),
      status: 'in_transit',
      description: 'Final destination',
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <BackArrowIcon />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.heading}>Order Tracking</Text>
          <Text style={styles.orderNumber}>Order {orderNumber}</Text>
        </View>

        {/* Order Info Card */}
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Customer:</Text>
            <Text style={styles.orderInfoValue}>{customerName}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Status:</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(orderStatus).bg },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(orderStatus).text },
                ]}
              >
                {orderStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Tracking Visualization */}
        <View style={styles.trackingSection}>
          <Text style={styles.sectionTitle}>Delivery Progress</Text>

          {/* Wilaya Path Visualization */}
          <View style={styles.pathContainer}>
            {allWilayas.map((event, index) => {
              const isFirst = index === 0;
              const isLast = index === allWilayas.length - 1;
              const isCurrent = index === allWilayas.length - 2; // Second to last is current
              const isCompleted = index < allWilayas.length - 2;

              return (
                <View key={`${event.wilaya}-${index}`} style={styles.pathItem}>
                  {/* Connection Line */}
                  {!isLast && (
                    <View style={styles.connectionLine}>
                      <Svg height="40" width="2">
                        <Line
                          x1="1"
                          y1="0"
                          x2="1"
                          y2="40"
                          stroke={
                            isCompleted || isCurrent
                              ? '#4CAF50'
                              : '#E0E0E0'
                          }
                          strokeWidth="2"
                        />
                      </Svg>
                      {/* Arrow */}
                      <View
                        style={[
                          styles.arrow,
                          {
                            borderTopColor:
                              isCompleted || isCurrent
                                ? '#4CAF50'
                                : '#E0E0E0',
                          },
                        ]}
                      />
                    </View>
                  )}

                  {/* Wilaya Circle */}
                  <View
                    style={[
                      styles.wilayaCircle,
                      isFirst && styles.wilayaCircleStart,
                      isCurrent && styles.wilayaCircleCurrent,
                      isLast && styles.wilayaCircleEnd,
                      isCompleted && styles.wilayaCircleCompleted,
                    ]}
                  >
                    <Text
                      style={[
                        styles.wilayaCode,
                        (isFirst || isLast) && styles.wilayaCodeBold,
                      ]}
                    >
                      {event.wilayaCode}
                    </Text>
                  </View>

                  {/* Wilaya Name */}
                  <View style={styles.wilayaInfo}>
                    <Text
                      style={[
                        styles.wilayaName,
                        (isFirst || isLast || isCurrent) &&
                          styles.wilayaNameBold,
                      ]}
                    >
                      {event.wilaya}
                    </Text>
                    {isFirst && (
                      <Text style={styles.wilayaLabel}>Origin</Text>
                    )}
                    {isCurrent && (
                      <Text style={styles.wilayaLabel}>Current Location</Text>
                    )}
                    {isLast && (
                      <Text style={styles.wilayaLabel}>Destination</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Tracking Timeline */}
          <View style={styles.timelineSection}>
            <Text style={styles.timelineTitle}>Tracking History</Text>
            {trackingData.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineWilaya}>{event.wilaya}</Text>
                    <Text style={styles.timelineTime}>
                      {formatDate(event.timestamp)}
                    </Text>
                  </View>
                  {event.description && (
                    <Text style={styles.timelineDescription}>
                      {event.description}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  orderInfoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trackingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  pathContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
  },
  pathItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  connectionLine: {
    width: 2,
    height: 40,
    marginLeft: 19,
    marginTop: 4,
    position: 'relative',
  },
  arrow: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  wilayaCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  wilayaCircleStart: {
    backgroundColor: COLORS.success,
    borderColor: '#4CAF50',
  },
  wilayaCircleCurrent: {
    backgroundColor: COLORS.secondary,
    borderColor: '#2196F3',
  },
  wilayaCircleEnd: {
    backgroundColor: COLORS.warning,
    borderColor: '#FF9800',
  },
  wilayaCircleCompleted: {
    backgroundColor: COLORS.success,
    borderColor: '#4CAF50',
  },
  wilayaCode: {
    fontSize: 12,
    color: COLORS.background,
    fontWeight: '500',
  },
  wilayaCodeBold: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  wilayaInfo: {
    marginLeft: 12,
    flex: 1,
    paddingTop: 8,
  },
  wilayaName: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  wilayaNameBold: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text,
  },
  wilayaLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  timelineSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingLeft: 8,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineWilaya: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  timelineTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timelineDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default OrderTrackingScreen;










