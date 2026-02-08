// Theme generator function
export const getColors = (mode: 'light' | 'dark' = 'dark') => {
  const isDark = mode === 'dark';
  
  return {
    // Official Algerie Poste Brand Colors
    // Based on the official logo: Blue (#1E3A8A) and Yellow (#FDB913)
    
    // Backgrounds
    background: isDark ? '#0A0F1E' : '#F8FAFC',
    surface: isDark ? '#131B2E' : '#FFFFFF',
    surfaceHighlight: isDark ? '#1A2438' : '#F1F5F9',
    surfaceRaised: isDark ? '#1F2A42' : '#E2E8F0',

    // Primary — Algerie Poste Blue (from logo)
    primary: '#1E3A8A',
    primaryLight: '#2563EB',
    primaryDark: '#1E40AF',
    primaryMuted: isDark ? '#1E3A8A20' : '#1E3A8A15',

    // Secondary — Algerie Poste Yellow (from logo)
    secondary: '#FDB913',
    secondaryLight: '#FCD34D',
    secondaryDark: '#F59E0B',
    secondaryMuted: isDark ? '#FDB91320' : '#FDB91315',

    // Accent
    accent: '#FDB913',
    accentLight: '#FCD34D',
    accentDark: '#F59E0B',

    // Tertiary
    tertiary: '#3B82F6',
    tertiaryLight: '#60A5FA',

    // Gradients
    gradientStart: '#1E3A8A',
    gradientMid: '#2563EB',
    gradientEnd: '#FDB913',

    // Text
    text: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? '#CBD5E1' : '#475569',
    textMuted: isDark ? '#64748B' : '#94A3B8',
    textDisabled: isDark ? '#475569' : '#CBD5E1',

    // Status
    success: '#10B981',
    error: '#EF4444',
    warning: '#FDB913',
    info: '#3B82F6',

    // Borders
    border: isDark ? '#1A2438' : '#E2E8F0',
    borderLight: isDark ? '#2A3B54' : '#CBD5E1',
    borderFocus: '#1E3A8A',

    // Glass effects
    glass: isDark ? 'rgba(19, 27, 46, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    glassBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    glassHighlight: isDark ? 'rgba(30, 58, 138, 0.15)' : 'rgba(30, 58, 138, 0.08)',

    // Extra utility
    overlay: isDark ? 'rgba(10, 15, 30, 0.9)' : 'rgba(0, 0, 0, 0.5)',
    shimmer: isDark ? '#2A3B54' : '#E2E8F0',
    
    // Semantic colors
    price: '#10B981',
    discount: '#EF4444',
    badge: '#FDB913',
    
    // Official brand colors
    apBlue: '#1E3A8A',
    apYellow: '#FDB913',
  };
};

// Default dark theme (for backward compatibility)
export const COLORS = getColors('dark');

export const SPACING = {
    xs: 4,
    s: 6,
    sm: 8,
    m: 12,
    md: 16,
    l: 20,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const TYPOGRAPHY = {
    fontSize: {
        xs: 11,
        sm: 13,
        md: 15,
        lg: 17,
        xl: 22,
        xxl: 30,
    },
    h1: {
        fontSize: 28,
        fontWeight: '700' as const,
        color: COLORS.text,
        lineHeight: 36,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 22,
        fontWeight: '600' as const,
        color: COLORS.text,
        lineHeight: 30,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 17,
        fontWeight: '600' as const,
        color: COLORS.text,
        lineHeight: 24,
    },
    body: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 21,
    },
    button: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: '#FFFFFF',
    },
    caption: {
        fontSize: 12,
        color: COLORS.textMuted,
        lineHeight: 16,
    }
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    glowGold: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 5,
    },
};

// Shared border radius tokens
export const RADIUS = {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
};
