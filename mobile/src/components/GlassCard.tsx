// src/components/GlassCard.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radii, shadows } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderRadius?: number;
  glowColor?: string;
  noPadding?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 60,
  borderRadius = radii.lg,
  glowColor,
  noPadding = false,
}) => {
  const glowStyle = glowColor
    ? { borderColor: glowColor, borderWidth: 1 }
    : { borderColor: colors.glassBorder, borderWidth: 1 };

  return (
    <View
      style={[
        styles.outerWrapper,
        { borderRadius },
        glowStyle,
        shadows.md,
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[
          styles.blur,
          { borderRadius },
          noPadding ? {} : styles.padding,
        ]}
      >
        {/* Inner glass tint overlay */}
        <View style={[styles.tintOverlay, { borderRadius }]} />
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    overflow: 'hidden',
  },
  blur: {
    overflow: 'hidden',
  },
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.glass1,
  },
  padding: {
    padding: 16,
  },
});

export default GlassCard;
