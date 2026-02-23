/**
 * AdminBottomNav - Custom Bottom Navigation for Admin
 * Modern design matching seller/buyer navigation
 * 
 * Tabs:
 * - Dashboard: Admin overview and statistics
 * - Stores: View/manage all stores, suspend/delete with reason
 * - Sellers: Accept/decline seller requests, manage sellers
 * - Delivery: Accept/decline delivery requests, manage delivery personnel
 * - Products: View all products across platform
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';

export type AdminTabId = 'dashboard' | 'stores' | 'sellers' | 'delivery' | 'products';

interface AdminBottomNavProps {
  activeTab: AdminTabId;
  onTabPress: (tab: AdminTabId) => void;
}

/* ══════════════════════════════════════════════════
   MODERN ICONS - Matching Seller/Buyer Design
══════════════════════════════════════════════════ */
const DashboardIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="2" fill={color + '20'} stroke={color} strokeWidth="2.5" />
    <Rect x="14" y="3" width="7" height="7" rx="2" fill={color + '20'} stroke={color} strokeWidth="2.5" />
    <Rect x="14" y="14" width="7" height="7" rx="2" fill={color + '20'} stroke={color} strokeWidth="2.5" />
    <Rect x="3" y="14" width="7" height="7" rx="2" fill={color + '20'} stroke={color} strokeWidth="2.5" />
  </Svg>
);

const StoreIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" fill={color + '20'} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12H15V22" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SellerIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2.5" />
  </Svg>
);

const TruckIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 3H15V13H1V3Z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 8H19L23 12V13H15V8Z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="5.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2.5" />
    <Circle cx="18.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2.5" />
  </Svg>
);

const ProductIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 6H21" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const AdminBottomNav: React.FC<AdminBottomNavProps> = ({ activeTab, onTabPress }) => {
  const { mode } = useTheme();
  const COLORS = getColors(mode);
  const { t } = useTranslation();

  const tabs: Array<{ id: AdminTabId; icon: any; label: string }> = [
    { id: 'dashboard', icon: DashboardIcon, label: t('admin_dashboard') },
    { id: 'stores', icon: StoreIcon, label: t('admin_stores') },
    { id: 'sellers', icon: SellerIcon, label: t('admin_sellers') },
    { id: 'delivery', icon: TruckIcon, label: t('admin_delivery') },
    { id: 'products', icon: ProductIcon, label: t('nav_products') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Floating Navigation Bar */}
      <View style={[styles.navBar, { 
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
          },
          android: {
            elevation: 8,
          },
        }),
      }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconWrapper,
                isActive && { 
                  backgroundColor: COLORS.primary + '15',
                  transform: [{ scale: 1.05 }],
                }
              ]}>
                <Icon color={isActive ? COLORS.primary : COLORS.textMuted} size={22} />
              </View>
              <Text
                style={[
                  styles.label,
                  { 
                    color: isActive ? COLORS.primary : COLORS.textMuted,
                    fontWeight: isActive ? '700' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    paddingTop: 8,
  },
  navBar: {
    flexDirection: 'row',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
  },
});

export default AdminBottomNav;
