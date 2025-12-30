import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';

// Back Arrow Icon
const BackArrowIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke="#000000"
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
  customerName?: string;
  orderStatus?: string;
  // Mock data - in real app, this would come from API
  trackingHistory?: TrackingEvent[];
  originWilaya?: string;
  destinationWilaya?: string;
}

const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  navigate,
  orderId = '#1234',
  orderNumber = '#1234',
  customerName = 'John Doe',
  orderStatus = 'Shipped',
  trackingHistory,
  originWilaya = 'Algiers',
  destinationWilaya = 'Oran',
}) => {
  // Mock tracking history if not provided
  const defaultTrackingHistory: TrackingEvent[] = trackingHistory || [
    {
      wilaya: 'Algiers',
      wilayaCode: '16',
      timestamp: '2024-01-15T08:00:00Z',
      status: 'arrived',
      description: 'Package picked up from store',
    },
    {
      wilaya: 'Algiers',
      wilayaCode: '16',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'departed',
      description: 'Package left Algiers sorting facility',
    },
    {
      wilaya: 'Blida',
      wilayaCode: '9',
      timestamp: '2024-01-15T14:20:00Z',
      status: 'arrived',
      description: 'Package arrived at Blida distribution center',
    },
    {
      wilaya: 'Blida',
      wilayaCode: '9',
      timestamp: '2024-01-15T16:45:00Z',
      status: 'departed',
      description: 'Package in transit to Oran',
    },
    {
      wilaya: 'Oran',
      wilayaCode: '31',
      timestamp: '2024-01-16T09:15:00Z',
      status: 'arrived',
      description: 'Package arrived at Oran delivery hub',
    },
  ];

  const [trackingData] = useState<TrackingEvent[]>(defaultTrackingHistory);

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
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'Shipped':
        return { bg: '#E3F2FD', text: '#1565C0' };
      case 'Processing':
        return { bg: '#FFF3E0', text: '#F57C00' };
      default:
        return { bg: '#F5F5F5', text: '#666' };
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
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  header: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    color: '#666',
  },
  orderInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
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
    color: '#000000',
    marginBottom: 20,
  },
  pathContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  wilayaCircleStart: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  wilayaCircleCurrent: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  wilayaCircleEnd: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  wilayaCircleCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  wilayaCode: {
    fontSize: 12,
    color: '#FFFFFF',
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
    color: '#333',
    marginBottom: 4,
  },
  wilayaNameBold: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
  },
  wilayaLabel: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  timelineSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
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
    backgroundColor: '#4CAF50',
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
    color: '#000000',
  },
  timelineTime: {
    fontSize: 12,
    color: '#666',
  },
  timelineDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});

export default OrderTrackingScreen;










