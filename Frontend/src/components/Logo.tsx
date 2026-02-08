import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../theme';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon' | 'horizontal';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 120, 
  variant = 'full',
  showTagline = false 
}) => {
  const iconSize = variant === 'icon' ? size : size * 0.6;
  
  // Use the official Algerie Poste logo
  const LogoImage = () => (
    <Image
      source={require('../../assets/AlgeriePoste.png')}
      style={{
        width: iconSize,
        height: iconSize,
        resizeMode: 'contain',
      }}
    />
  );

  if (variant === 'icon') {
    return <LogoImage />;
  }

  return (
    <View style={[styles.container, variant === 'horizontal' && styles.horizontal]}>
      <LogoImage />
      <View style={styles.textContainer}>
        <Text style={[styles.brandName, { fontSize: size * 0.16 }]}>
          ALGERIE POSTE
        </Text>
        <Text style={[styles.brandSubtitle, { fontSize: size * 0.08 }]}>
          E-COMMERCE
        </Text>
        {showTagline && (
          <Text style={[styles.tagline, { fontSize: size * 0.06 }]}>
            Trusted by 10M+ Algerians
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 2,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontWeight: '600',
    color: COLORS.secondary,
    letterSpacing: 3,
    marginTop: 2,
    textAlign: 'center',
  },
  tagline: {
    fontWeight: '500',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },
});
