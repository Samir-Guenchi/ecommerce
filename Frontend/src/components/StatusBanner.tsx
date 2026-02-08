import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../theme';

interface StatusBannerProps {
  message: string | null;
  type: 'success' | 'error' | 'info';
  onDismiss?: () => void;
  autoDismissMs?: number;
}

const StatusBanner: React.FC<StatusBannerProps> = ({
  message,
  type,
  onDismiss,
  autoDismissMs = 4000,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      if (autoDismissMs > 0 && onDismiss) {
        const timer = setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onDismiss());
        }, autoDismissMs);
        return () => clearTimeout(timer);
      }
    } else {
      opacity.setValue(0);
    }
  }, [message]);

  if (!message) return null;

  const bgColor =
    type === 'success'
      ? 'rgba(34,197,94,0.15)'
      : type === 'error'
      ? 'rgba(239,68,68,0.15)'
      : 'rgba(59,130,246,0.15)';

  const borderColor =
    type === 'success'
      ? COLORS.success
      : type === 'error'
      ? COLORS.error
      : COLORS.primary;

  const textColor =
    type === 'success'
      ? COLORS.success
      : type === 'error'
      ? COLORS.error
      : COLORS.primary;

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: bgColor, borderLeftColor: borderColor, opacity }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Dismiss message"
          accessibilityRole="button"
        >
          <Text style={[styles.dismiss, { color: textColor }]}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  dismiss: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    padding: 4,
  },
});

export default StatusBanner;
