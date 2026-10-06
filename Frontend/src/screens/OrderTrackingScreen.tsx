/**
 * OrderTrackingScreen — Algérie Poste E-Commerce Tracking
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { orderAPI } from '../services/api.service';
import algeriaCities from '../data/algeria_cities.json';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import StatusBanner from '../components/StatusBanner';
import { useStatusMessage } from '../components/useStatusMessage';
import { PackageIcon } from '../components/ModernIcons';

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
}

const getWilayaCode = (wilayaName: string): string => {
  const city = (algeriaCities as any[]).find((c) => c.wilaya_name === wilayaName);
  return city ? city.wilaya_code : '00';
};

const BackArrow = ({ color, flip }: { color: string; flip?: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    {flip
      ? <Path d="M5 12H19M12 5L19 12L12 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      : <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    }
  </Svg>
);
const SearchIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  navigate,
  orderId,
  orderNumber: initialOrderNumber,
}) => {
  const { mode } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL, language } = useTranslation();
  const { message, showError, clear } = useStatusMessage();

  const [searchInput, setSearchInput] = useState(initialOrderNumber || '');
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber || '');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orderData, setOrderData] = useState<{
    customerName: string;
    status: string;
    storeLocation: string;
    destinationWilaya: string;
    trackingHistory: TrackingEvent[];
  } | null>(null);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const locale = language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleDateString(locale, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const fetchOrder = useCallback(async (num: string, isRefresh = false) => {
    if (!num) return;
    if (!isRefresh) setLoading(true);
    try {
      const { order } = await orderAPI.getOrderByOrderNumber(num);
      const history: TrackingEvent[] = (order.trackingHistory || []).map((e: any) => ({
        wilaya: e.wilaya || '',
        wilayaCode: e.wilayaCode || getWilayaCode(e.wilaya || ''),
        timestamp: e.timestamp || new Date().toISOString(),
        status: e.status || 'in_transit',
        description: e.description || '',
      }));
      setOrderData({
        customerName: order.user?.fullName || order.customerName || '',
        status: order.status || 'Processing',
        storeLocation: order.store?.location || '',
        destinationWilaya: order.shippingAddress?.stateProvince || '',
        trackingHistory: history,
      });
    } catch (e: any) {
      showError(t('tracking_notFound'));
      setOrderData(null);
    } finally { setLoading(false); setRefreshing(false); }
  }, [language]);

  useEffect(() => {
    if (initialOrderNumber) fetchOrder(initialOrderNumber);
  }, []);

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setOrderNumber(searchInput.trim());
    fetchOrder(searchInput.trim());
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return { bg: COLORS.success + '20', text: COLORS.success };
      case 'shipped': return { bg: COLORS.info + '20', text: COLORS.info };
      case 'processing': return { bg: COLORS.warning + '20', text: COLORS.warning };
      case 'cancelled': return { bg: COLORS.error + '20', text: COLORS.error };
      default: return { bg: COLORS.surface, text: COLORS.textSecondary };
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      delivered: t('tracking_statusDelivered'),
      shipped: t('tracking_statusShipped'),
      processing: t('tracking_statusProcessing'),
      cancelled: t('tracking_statusCancelled'),
      pending: t('tracking_statusPending'),
    };
    return map[status.toLowerCase()] || status;
  };

  /* Build wilaya path for visualization */
  const buildPath = () => {
    if (!orderData) return [];
    const { trackingHistory, storeLocation, destinationWilaya } = orderData;
    const history = trackingHistory.length > 0 ? trackingHistory : [
      {
        wilaya: storeLocation || t('tracking_storeLocation'),
        wilayaCode: getWilayaCode(storeLocation || ''),
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'arrived' as const,
        description: t('tracking_orderPlaced'),
      },
      {
        wilaya: destinationWilaya || 'Algiers',
        wilayaCode: getWilayaCode(destinationWilaya || ''),
        timestamp: new Date().toISOString(),
        status: 'in_transit' as const,
        description: t('tracking_inTransit'),
      },
    ];

    const unique = history.reduce((acc: TrackingEvent[], ev) => {
      if (!acc.find(w => w.wilaya === ev.wilaya)) acc.push(ev);
      return acc;
    }, []);

    const last = unique[unique.length - 1];
    if (last && destinationWilaya && last.wilaya !== destinationWilaya) {
      unique.push({
        wilaya: destinationWilaya,
        wilayaCode: getWilayaCode(destinationWilaya),
        timestamp: new Date().toISOString(),
        status: 'in_transit',
        description: t('tracking_finalDestination'),
      });
    }
    return unique;
  };

  const allWilayas = orderData ? buildPath() : [];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { if (orderNumber) { setRefreshing(true); fetchOrder(orderNumber, true); } }}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ── Header ── */}
        <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity
            style={[s.backBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border }, isRTL && { marginRight: 0, marginLeft: 12 }]}
            onPress={() => navigate?.('orders')}
            activeOpacity={0.7}
          >
            <BackArrow color={COLORS.text} flip={isRTL} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: COLORS.text }, isRTL && { textAlign: 'right' }]}>
            {t('tracking_title')}
          </Text>
        </View>

        <StatusBanner message={message?.text ?? null} type={message?.type ?? 'error'} onDismiss={clear} />

        {/* ── Search ── */}
        <View style={[s.searchRow, isRTL && { flexDirection: 'row-reverse' }, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <TextInput
            style={[s.searchInput, { color: COLORS.text }, isRTL && { textAlign: 'right' }]}
            placeholder={t('tracking_enterOrderNumber')}
            placeholderTextColor={COLORS.textMuted}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[s.searchBtn, { backgroundColor: COLORS.primary }]}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <SearchIcon color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ color: COLORS.textMuted, marginTop: 12, fontSize: 13 }}>{t('common_loading')}</Text>
          </View>
        ) : !orderData ? (
          <View style={[s.emptyCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <PackageIcon size={34} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={[s.emptyTitle, { color: COLORS.text }]}>{t('tracking_noOrderTitle')}</Text>
            <Text style={[s.emptyDesc, { color: COLORS.textMuted }]}>{t('tracking_noOrderDesc')}</Text>
          </View>
        ) : (
          <>
            {/* ── Order Info ── */}
            <View style={[s.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <Text style={[s.sectionTitle, { color: COLORS.text }, isRTL && { textAlign: 'right' }]}>
                {t('tracking_orderInfo')}
              </Text>
              {[
                { lbl: t('tracking_orderNumber'), val: orderNumber },
                { lbl: t('tracking_customer'), val: orderData.customerName },
                { lbl: t('tracking_status'), val: null, status: orderData.status },
              ].map((row, i) => (
                <View key={i} style={[s.infoRow, { borderBottomColor: COLORS.border }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[s.infoLbl, { color: COLORS.textMuted }]}>{row.lbl}</Text>
                  {row.status ? (
                    <View style={[s.statusBadge, { backgroundColor: getStatusColor(row.status).bg }]}>
                      <Text style={[s.statusText, { color: getStatusColor(row.status).text }]}>
                        {getStatusLabel(row.status)}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[s.infoVal, { color: COLORS.text }]}>{row.val}</Text>
                  )}
                </View>
              ))}
            </View>

            {/* ── Delivery Progress ── */}
            <View style={[s.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <Text style={[s.sectionTitle, { color: COLORS.text }, isRTL && { textAlign: 'right' }]}>
                {t('tracking_deliveryProgress')}
              </Text>
              {allWilayas.map((event, index) => {
                const isFirst = index === 0;
                const isLast = index === allWilayas.length - 1;
                const isCurrent = index === allWilayas.length - 2;
                const isCompleted = index < allWilayas.length - 2;
                const dotColor = isFirst || isCompleted ? COLORS.success : isCurrent ? COLORS.info : COLORS.border;
                const lineColor = isCompleted || isCurrent ? COLORS.success : COLORS.border;

                return (
                  <View key={`${event.wilaya}-${index}`}>
                    <View style={[s.pathItem, isRTL && { flexDirection: 'row-reverse' }]}>
                      <View style={{ alignItems: 'center', width: 40 }}>
                        <View style={[s.wilayaCircle, { backgroundColor: dotColor, borderColor: dotColor + '60' }]}>
                          <Text style={s.wilayaCode}>{event.wilayaCode}</Text>
                        </View>
                        {!isLast && (
                          <View style={[s.trackLine, { backgroundColor: lineColor }]} />
                        )}
                      </View>
                      <View style={[{ flex: 1, paddingBottom: isLast ? 0 : 20 }, isRTL ? { marginRight: 12 } : { marginLeft: 12 }]}>
                        <Text style={[s.wilayaName, { color: (isFirst || isLast || isCurrent) ? COLORS.text : COLORS.textSecondary, fontWeight: (isFirst || isLast || isCurrent) ? '700' : '500' }]}>
                          {event.wilaya}
                        </Text>
                        <Text style={[s.wilayaLabel, { color: COLORS.textMuted }]}>
                          {isFirst ? t('tracking_origin') : isCurrent ? t('tracking_currentLocation') : isLast ? t('tracking_destination') : formatDate(event.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* ── Timeline ── */}
            {orderData.trackingHistory.length > 0 && (
              <View style={[s.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                <Text style={[s.sectionTitle, { color: COLORS.text }, isRTL && { textAlign: 'right' }]}>
                  {t('tracking_trackingHistory')}
                </Text>
                {orderData.trackingHistory.map((event, index) => (
                  <View key={index} style={[s.timelineItem, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[s.timelineDot, { backgroundColor: COLORS.success }, isRTL ? { marginLeft: 12, marginRight: 0 } : {}]} />
                    <View style={{ flex: 1 }}>
                      <View style={[s.timelineHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={[s.timelineWilaya, { color: COLORS.text }]}>{event.wilaya}</Text>
                        <Text style={[s.timelineTime, { color: COLORS.textMuted }]}>{formatDate(event.timestamp)}</Text>
                      </View>
                      {event.description && (
                        <Text style={[s.timelineDesc, { color: COLORS.textSecondary }, isRTL && { textAlign: 'right' }]}>
                          {event.description}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  searchRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, marginBottom: 20, overflow: 'hidden', paddingLeft: 16 },
  searchInput: { flex: 1, height: 52, fontSize: 14, fontWeight: '500' },
  searchBtn: { width: 52, height: 52, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 18, borderWidth: 1, padding: 18, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  infoLbl: { fontSize: 13, fontWeight: '500' },
  infoVal: { fontSize: 13, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '700' },
  pathItem: { flexDirection: 'row', alignItems: 'flex-start' },
  wilayaCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  wilayaCode: { fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
  trackLine: { width: 2, flex: 1, minHeight: 20 },
  wilayaName: { fontSize: 14, marginBottom: 2 },
  wilayaLabel: { fontSize: 11, fontStyle: 'italic' },
  emptyCard: { borderRadius: 22, borderWidth: 1, padding: 36, alignItems: 'center', marginTop: 20 },
  emptyTitle: { fontSize: 17, fontWeight: '800', marginBottom: 8 },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  timelineItem: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, marginRight: 12 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  timelineWilaya: { fontSize: 14, fontWeight: '700' },
  timelineTime: { fontSize: 12 },
  timelineDesc: { fontSize: 12, lineHeight: 18 },
});

export default OrderTrackingScreen;
