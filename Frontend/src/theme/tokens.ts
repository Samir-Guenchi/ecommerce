export const colors = {
    // Midnight Algiers Palette
    primary: '#0F172A',      // Midnight Blue (Background)
    secondary: '#1E293B',    // Slate 800 (Surface)
    accent: '#F59E0B',       // Casbah Gold (Highlights/Active)
    success: '#10B981',      // Emerald (Success/Growth)
    error: '#EF4444',        // Red (Error/Alert)
    text: {
        primary: '#F8FAFC',    // Slate 50 (High Contrast Text)
        secondary: '#94A3B8',  // Slate 400 (Subtitles)
        accent: '#FCD34D',     // Light Gold (Text Highlight)
    },
    glass: {
        background: 'rgba(30, 41, 59, 0.7)', // Semi-transparent Slate
        border: 'rgba(255, 255, 255, 0.1)',   // Subtle white border
        highlight: 'rgba(245, 158, 11, 0.1)', // Subtle Gold Glow
    }
};

export const spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
    h1: { fontSize: 32, fontWeight: '700', letterSpacing: 0.5, color: colors.text.primary },
    h2: { fontSize: 24, fontWeight: '600', letterSpacing: 0.25, color: colors.text.primary },
    h3: { fontSize: 20, fontWeight: '600', color: colors.text.primary },
    body: { fontSize: 16, fontWeight: '400', color: colors.text.secondary },
    caption: { fontSize: 13, fontWeight: '400', color: colors.text.secondary },
    button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5, color: '#0F172A' }, // Dark text on Gold button
};

export const shadows = {
    neon: {
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    glass: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    }
};

export const layout = {
    borderRadius: {
        m: 16,
        l: 24,
        round: 9999,
    },
    touchTarget: 44, // Accessibility: Minimum 44x44
};
