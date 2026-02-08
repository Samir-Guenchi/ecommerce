import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SHADOWS } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'bordered';
  glowColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
  glowColor,
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return [styles.card, styles.elevated, glowColor && { ...SHADOWS.glow, shadowColor: glowColor }];
      case 'bordered':
        return [styles.card, styles.bordered];
      default:
        return styles.card;
    }
  };

  return (
    <View style={[getCardStyle(), style]}>
      <LinearGradient
        colors={[COLORS.glass, COLORS.surfaceHighlight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  elevated: {
    ...SHADOWS.medium,
  },
  bordered: {
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  gradient: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
});
