export const COLORS = {
    // Official Algerie Poste Brand Colors
    // Based on the official logo: Blue (#1E3A8A) and Yellow (#FDB913)
    
    // Backgrounds — Professional dark with blue undertones
    background: '#0A0F1E',     // Deep navy background
    surface: '#131B2E',        // Card surface
    surfaceHighlight: '#1A2438', // Hover state
    surfaceRaised: '#1F2A42',  // Elevated elements

    // Primary — Algerie Poste Blue (from logo)
    primary: '#1E3A8A',        // Official AP Blue
    primaryLight: '#2563EB',   // Lighter blue for highlights
    primaryDark: '#1E40AF',    // Darker blue for depth
    primaryMuted: '#1E3A8A20', // 12% opacity

    // Secondary — Algerie Poste Yellow (from logo)
    secondary: '#FDB913',      // Official AP Yellow/Gold
    secondaryLight: '#FCD34D', // Lighter yellow
    secondaryDark: '#F59E0B',  // Darker gold
    secondaryMuted: '#FDB91320',

    // Accent — Complementary colors
    accent: '#FDB913',         // Use AP Yellow as accent
    accentLight: '#FCD34D',    // Light yellow
    accentDark: '#F59E0B',     // Deep gold

    // Tertiary — Supporting blue
    tertiary: '#3B82F6',       // Bright blue for highlights
    tertiaryLight: '#60A5FA',

    // Gradients - Official AP colors
    gradientStart: '#1E3A8A',  // AP Blue
    gradientMid: '#2563EB',    // Mid Blue
    gradientEnd: '#FDB913',    // AP Yellow

    // Text — High contrast for readability
    text: '#FFFFFF',           // Pure white for primary text
    textSecondary: '#CBD5E1',  // Light grey-blue
    textMuted: '#64748B',      // Muted grey-blue
    textDisabled: '#475569',   // Disabled state

    // Status — Clear & Professional
    success: '#10B981',        // Green for success
    error: '#EF4444',          // Red for errors
    warning: '#FDB913',        // AP Yellow for warnings
    info: '#3B82F6',           // Blue for info

    // Borders — Subtle with blue tint
    border: '#1A2438',         // Subtle
    borderLight: '#2A3B54',    // More visible
    borderFocus: '#1E3A8A',    // Focus state (AP Blue)

    // Glass effects - Professional transparency
    glass: 'rgba(19, 27, 46, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassHighlight: 'rgba(30, 58, 138, 0.15)',

    // Extra utility
    overlay: 'rgba(10, 15, 30, 0.9)',
    shimmer: '#2A3B54',
    
    // Semantic colors for e-commerce
    price: '#10B981',          // Green for prices
    discount: '#EF4444',       // Red for discounts
    badge: '#FDB913',          // AP Yellow for badges/premium
    
    // Official Algerie Poste brand colors (for reference)
    apBlue: '#1E3A8A',         // Official blue from logo
    apYellow: '#FDB913',       // Official yellow from logo
};

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
