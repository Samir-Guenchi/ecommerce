import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getColors, SHADOWS } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import { StoreIcon, ShoppingBagIcon, PackageIcon, ChartLineIcon, SettingsIcon } from '../components/ModernIcons';

type BottomTabId = 'dashboard' | 'products' | 'orders' | 'stores' | 'userSettings';

interface BottomNavProps {
  activeTab: BottomTabId;
  onTabPress: (tab: BottomTabId) => void;
}

const TAB_CONFIG: { 
  id: BottomTabId; 
  labelKey: 'nav_dashboard' | 'nav_products' | 'nav_orders' | 'nav_stores' | 'nav_settings'; 
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> 
}[] = [
  { id: 'dashboard', labelKey: 'nav_dashboard', Icon: ChartLineIcon },
  { id: 'products', labelKey: 'nav_products', Icon: ShoppingBagIcon },
  { id: 'orders', labelKey: 'nav_orders', Icon: PackageIcon },
  { id: 'stores', labelKey: 'nav_stores', Icon: StoreIcon },
  { id: 'userSettings', labelKey: 'nav_settings', Icon: SettingsIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabPress }) => {
  const { mode } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL } = useTranslation();

  const styles = StyleSheet.create({
    bottomNav: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      backgroundColor: COLORS.surface,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      paddingBottom: 16,
      paddingTop: 12,
      ...SHADOWS.large,
    },
    navItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
      minHeight: 56,
    },
    iconWrap: {
      width: 40,
      height: 32,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapActive: {
      backgroundColor: COLORS.primary + '15',
    },
    navLabel: {
      fontSize: 11,
      color: COLORS.textMuted,
      marginTop: 4,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    navLabelActive: {
      color: COLORS.primary,
      fontWeight: '800',
    },
    activeIndicator: {
      position: 'absolute',
      top: 0,
      width: 24,
      height: 3,
      borderRadius: 2,
      backgroundColor: COLORS.primary,
    },
  });

  return (
    <View style={styles.bottomNav} accessibilityRole="tablist">
      {TAB_CONFIG.map(({ id, labelKey, Icon }) => {
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
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Icon 
                size={20} 
                color={isActive ? COLORS.primary : COLORS.textMuted} 
                strokeWidth={isActive ? 2.5 : 2}
              />
            </View>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {label}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export type { BottomTabId };
export default BottomNav;
