import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { colors, typography, spacing } from '../theme/tokens';

interface StatCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    trend?: string; // e.g. "+12%"
    trendType?: 'positive' | 'negative' | 'neutral';
    icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    subtext,
    trend,
    trendType = 'neutral',
    icon
}) => {
    return (
        <GlassCard style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
            </View>

            <View style={styles.content}>
                <Text style={styles.value}>{value}</Text>
                {trend && (
                    <View style={[
                        styles.trendBadge,
                        trendType === 'positive' ? styles.trendPos : trendType === 'negative' ? styles.trendNeg : null
                    ]}>
                        <Text style={[
                            styles.trendText,
                            trendType === 'positive' ? styles.trendTextPos : trendType === 'negative' ? styles.trendTextNeg : null
                        ]}>{trend}</Text>
                    </View>
                )}
            </View>

            {subtext && <Text style={styles.subtext}>{subtext}</Text>}
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minWidth: 140, // Ensure decent size
        marginBottom: spacing.m,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    label: {
        ...typography.caption,
        color: colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    iconContainer: {
        opacity: 0.8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: spacing.xs,
    },
    value: {
        ...typography.h2,
        color: colors.text.primary,
        marginRight: spacing.s,
    },
    subtext: {
        ...typography.caption,
        fontSize: 11,
        color: colors.text.secondary,
    },
    trendBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    trendPos: { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
    trendNeg: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
    trendText: { fontSize: 10, fontWeight: '700', color: colors.text.secondary },
    trendTextPos: { color: colors.success },
    trendTextNeg: { color: colors.error },
});
