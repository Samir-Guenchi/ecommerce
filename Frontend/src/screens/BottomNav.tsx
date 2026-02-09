import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { getColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';

type BottomTabId = 'dashboard' | 'products' | 'orders' | 'stores' | 'userSettings';

interface BottomNavProps {
  activeTab: BottomTabId;
  onTabPress: (tab: BottomTabId) => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODERN FRIENDLY ICONS - Consistent & Beautiful
   ═══════════════════════════════════════════════════════════════════════════ */

const HomeIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const GridIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="14" y="3" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="14" y="14" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="3" y="14" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
  </Svg>
);

const PackageIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M16.5 9.4L7.5 4.21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const StoreIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SettingsIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const TAB_CONFIG: { 
  id: BottomTabId; 
  labelKey: 'nav_dashboard' | 'nav_products' | 'nav_orders' | 'nav_stores' | 'nav_settings'; 
  Icon: React.ComponentType<{ size?: number; color: string }> 
}[] = [
  { id: 'dashboard', labelKey: 'nav_dashboard', Icon: HomeIcon },
  { id: 'products', labelKey: 'nav_products', Icon: GridIcon },
  { id: 'orders', labelKey: 'nav_orders', Icon: PackageIcon },
  { id: 'stores', labelKey: 'nav_stores', Icon: StoreIcon },
  { id: 'userSettings', labelKey: 'nav_settings', Icon: SettingsIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabPress }) => {
  const { mode } = useTheme();
  const COLORS = getColors(mode);
  const { t, isRTL } = useTranslation();

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
              {/* Active Background Pill */}
              {isActive && (
                <View style={[styles.activePill, { backgroundColor: COLORS.primary + '15' }]} />
              )}
              
              {/* Icon Container */}
              <View style={styles.iconContainer}>
                <Icon 
                  size={22} 
                  color={isActive ? COLORS.primary : COLORS.textMuted} 
                />
              </View>
              
              {/* Label */}
              <Text style={[
                styles.navLabel, 
                { color: isActive ? COLORS.primary : COLORS.textMuted },
                isActive && styles.navLabelActive
              ]}>
                {label}
              </Text>
              
              {/* Active Dot Indicator */}
              {isActive && (
                <View style={[styles.activeDot, { backgroundColor: COLORS.primary }]} />
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
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 12,
  },
  navBar: {
    flexDirection: 'row',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    bottom: 4,
    borderRadius: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    zIndex: 1,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    zIndex: 1,
  },
  navLabelActive: {
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    zIndex: 1,
  },
});

export type { BottomTabId };
export default BottomNav;
