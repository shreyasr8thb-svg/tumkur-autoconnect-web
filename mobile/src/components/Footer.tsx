// src/components/Footer.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, ms } from '../theme';

const Footer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animated heartbeat on the ❤️
  useEffect(() => {
    const heartbeat = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.35, duration: 350, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 350, useNativeDriver: true }),
        Animated.delay(900),
      ])
    );
    heartbeat.start();
    return () => heartbeat.stop();
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.sm }]}>
      {/* Gradient-like top border */}
      <View style={styles.topBorder} />
      <View style={styles.row}>
        <Text style={styles.brand}>
          Designed & crafted by{' '}
          <Text style={styles.brandBold}>Roaring Thunders</Text>{' '}
        </Text>
        <Animated.Text style={[styles.heart, { transform: [{ scale: pulseAnim }] }]}>
          ❤️
        </Animated.Text>
      </View>
      <Text style={styles.support}>Help & Support: tumkuru.connect@gmail.com</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.95)',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  topBorder: {
    width: '60%',
    height: 1,
    backgroundColor: colors.grey4,
    marginBottom: spacing.sm,
    borderRadius: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  brand: {
    ...typography.caption,
    color: colors.grey1,
    textAlign: 'center',
  },
  brandBold: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  heart: {
    fontSize: ms(13),
    marginLeft: 3,
  },
  support: {
    ...typography.caption2,
    color: colors.red,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
});

export default Footer;
