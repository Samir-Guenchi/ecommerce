import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../theme';

interface NeonButtonProps {
    onPress: () => void;
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'glass';
    style?: ViewStyle;
    textStyle?: TextStyle;
    accessibilityLabel?: string;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
    onPress,
    title,
    loading = false,
    variant = 'primary',
    style,
    textStyle,
    accessibilityLabel
}) => {
    const getGradientColors = () => {
        switch (variant) {
            case 'secondary': return [COLORS.secondary, COLORS.secondaryLight];
            case 'glass': return [COLORS.glass, COLORS.surfaceHighlight];
            case 'outline': return ['transparent', 'transparent'];
            default: return [COLORS.primary, COLORS.primaryLight];
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'outline': return COLORS.primary;
            case 'glass': return COLORS.text;
            default: return COLORS.text;
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
            style={[
                styles.base,
                variant === 'outline' && styles.outline,
                variant === 'primary' && styles.primaryShadow,
                style,
                loading && { opacity: 0.7 }
            ]}
            accessibilityLabel={accessibilityLabel || title}
            accessibilityRole="button"
            accessibilityState={{ busy: loading }}
        >
            <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {loading ? (
                    <ActivityIndicator color={getTextColor()} />
                ) : (
                    <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 56,
        minWidth: 56,
    },
    primaryShadow: {
        ...SHADOWS.glow,
    },
    outline: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
    },
    text: {
        ...TYPOGRAPHY.button,
        fontSize: 16,
        fontWeight: '700',
    },
});
