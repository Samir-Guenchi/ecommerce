import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';

type BottomTabId = 'dashboard' | 'products' | 'orders' | 'stores' | 'userSettings';
type UserRole = 'buyer' | 'seller' | 'both' | 'admin' | 'delivery';

interface BottomNavProps {
  activeTab: BottomTabId;
  onTabPress: (tab: BottomTabId) => void;
  userRole?: UserRole;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODERN FRIENDLY ICONS - Scaled & Crisp
   ═══════════════════════════════════════════════════════════════════════════ */

const HomeIcon = ({ color, size = 21 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" fill={color + '20'} stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12H15V22" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ShoppingBagIcon = ({ color, size = 21 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 6H21" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const GridIcon = ({ color, size = 21 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="2" fill={color + '20'} stroke={color} strokeWidth="2.3" />
    <Rect x="14" y="3" width="7" height="7" rx="2" fill={color + '20'} stroke={color} strokeWidth="2.3" />
    <Rect x="14" y="14" width="7" height="7" rx="2" fill={color + '20'} stroke={color} strokeWidth="2.3" />
    <Rect x="3" y="14" width="7" height="7" rx="2" fill={color + '20'} stroke={color} strokeWidth="2.3" />
  </Svg>
);

const ReceiptIcon = ({ color, size = 21 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 2V22L6.5 20L9 22L11.5 20L14 22L16.5 20L19 22V2L16.5 4L14 2L11.5 4L9 2L6.5 4L4 2Z" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 8H16" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
    <Path d="M8 12H16" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
    <Path d="M8 16H12" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
  </Svg>
);

const UserCircleIcon = ({ color, size = 21 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2.1" />
  </Svg>
);

// Role-based tab configuration
const getBuyerTabs = () => [
  { id: 'dashboard' as BottomTabId, labelKey: 'nav_dashboard' as const, Icon: HomeIcon },
  { id: 'stores' as BottomTabId, labelKey: 'nav_stores' as const, Icon: ShoppingBagIcon },
  { id: 'orders' as BottomTabId, labelKey: 'nav_orders' as const, Icon: ReceiptIcon },
  { id: 'userSettings' as BottomTabId, labelKey: 'nav_settings' as const, Icon: UserCircleIcon },
];

const getSellerTabs = () => [
  { id: 'dashboard' as BottomTabId, labelKey: 'nav_dashboard' as const, Icon: HomeIcon },
  { id: 'products' as BottomTabId, labelKey: 'nav_products' as const, Icon: GridIcon },
  { id: 'orders' as BottomTabId, labelKey: 'nav_orders' as const, Icon: ReceiptIcon },
  { id: 'stores' as BottomTabId, labelKey: 'nav_stores' as const, Icon: ShoppingBagIcon },
  { id: 'userSettings' as BottomTabId, labelKey: 'nav_settings' as const, Icon: UserCircleIcon },
];

const getAdminTabs = () => [
  { id: 'dashboard' as BottomTabId, labelKey: 'nav_dashboard' as const, Icon: HomeIcon },
  { id: 'products' as BottomTabId, labelKey: 'nav_products' as const, Icon: GridIcon },
  { id: 'orders' as BottomTabId, labelKey: 'nav_orders' as const, Icon: ReceiptIcon },
  { id: 'stores' as BottomTabId, labelKey: 'nav_stores' as const, Icon: ShoppingBagIcon },
  { id: 'userSettings' as BottomTabId, labelKey: 'nav_settings' as const, Icon: UserCircleIcon },
];

const getDeliveryTabs = () => [
  { id: 'dashboard' as BottomTabId, labelKey: 'nav_dashboard' as const, Icon: HomeIcon },
  { id: 'orders' as BottomTabId, labelKey: 'nav_orders' as const, Icon: ReceiptIcon },
  { id: 'userSettings' as BottomTabId, labelKey: 'nav_settings' as const, Icon: UserCircleIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabPress, userRole: propUserRole }) => {
  const { mode } = useTheme();
  const COLORS = getColors(mode);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [userRole, setUserRole] = useState<UserRole>(propUserRole || 'buyer');

  useEffect(() => {
    if (!propUserRole) {
      loadUserRole();
    } else {
      setUserRole(propUserRole);
    }
  }, [propUserRole]);

  const loadUserRole = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.accountType || 'buyer');
      }
    } catch (error) {
      console.error('Failed to load user role', error);
    }
  };

  // Get tabs based on user role
  const getTabs = () => {
    if (userRole === 'admin') return getAdminTabs();
    if (userRole === 'seller' || userRole === 'both') return getSellerTabs();
    if (userRole === 'delivery') return getDeliveryTabs();
    return getBuyerTabs();
  };

  const tabs = getTabs();
  const bottomSpace = (insets.bottom > 0 ? insets.bottom : 14) + 24;

  return (
    <View 
      style={[
        styles.container, 
        { 
          bottom: bottomSpace,
        }
      ]}
      pointerEvents="box-none"
    >
      {/* Floating Navigation Bar */}
      <View style={[styles.navBar, { 
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: mode === 'dark' ? 0.35 : 0.08,
            shadowRadius: 16,
          },
          android: {
            elevation: 8,
          },
        }),
      }]}>
        {tabs.map(({ id, labelKey, Icon }) => {
          const isActive = activeTab === id;
          const label = t(labelKey);
          
          return (
            <TouchableOpacity
              key={id}
              style={styles.navItem}
              onPress={() => onTabPress(id)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={label}
            >
              {/* Active Background Pill */}
              {isActive && (
                <View style={[styles.activePill, { backgroundColor: COLORS.primary + '14' }]} />
              )}
              
              {/* Icon Container */}
              <View style={styles.iconContainer}>
                <Icon 
                  size={21} 
                  color={isActive ? COLORS.primary : COLORS.textMuted} 
                />
              </View>
              
              {/* Label */}
              <Text 
                style={[
                  styles.navLabel, 
                  { color: isActive ? COLORS.primary : COLORS.textMuted },
                  isActive && styles.navLabelActive
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {label}
              </Text>
              
              {/* Active Dot Indicator */}
              {isActive && (
                <View style={styles.activeDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 999,
  },
  navBar: {
    flexDirection: 'row',
    borderRadius: 26,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    position: 'relative',
    minHeight: 48,
  },
  activePill: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 16,
  },
  iconContainer: {
    width: 26,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    zIndex: 1,
  },
  navLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 0.1,
    textAlign: 'center',
    zIndex: 1,
    maxWidth: '100%',
  },
  navLabelActive: {
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    bottom: 1.5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FDB913',
    zIndex: 1,
  },
});

export type { BottomTabId, UserRole };
export default BottomNav;
