// src/components/AnimatedTabBar.tsx
/**
 * Custom bottom tab bar:
 * - Frosted glass background via BlurView
 * - Spring-animated active pill indicator
 * - Haptic feedback on tab press
 * - Respects safe-area bottom inset
 */
import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, ms, radii, spacing, typography } from '../theme';

const TAB_HEIGHT = ms(60);

const ICON_MAP: Record<string, { active: string; inactive: string }> = {
  Jobs:      { active: 'briefcase',         inactive: 'briefcase-outline' },
  Map:       { active: 'map',               inactive: 'map-outline' },
  Profile:   { active: 'person-circle',     inactive: 'person-circle-outline' },
  Dashboard: { active: 'grid',              inactive: 'grid-outline' },
  Console:   { active: 'navigate-circle',   inactive: 'navigate-circle-outline' },
  Home:      { active: 'home',              inactive: 'home-outline' },
};

const AnimatedTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const scaleAnims = useRef(state.routes.map(() => new Animated.Value(1))).current;

  const handlePress = (route: (typeof state.routes)[0], index: number, isFocused: boolean) => {
    // Spring scale pop
    Animated.sequence([
      Animated.spring(scaleAnims[index], {
        toValue: 0.82,
        useNativeDriver: true,
        speed: 40,
        bounciness: 12,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 14,
      }),
    ]).start();

    // Haptic
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <View style={styles.tint} />
        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const { options } = descriptors[route.key];
            const label = (options.tabBarLabel as string) ?? route.name;
            const iconSet = ICON_MAP[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
            const iconName = isFocused ? iconSet.active : iconSet.inactive;

            return (
              <TouchableWithoutFeedback
                key={route.key}
                onPress={() => handlePress(route, index, isFocused)}
                accessibilityRole="button"
                accessibilityState={{ selected: isFocused }}
              >
                <Animated.View
                  style={[styles.tabItem, { transform: [{ scale: scaleAnims[index] }] }]}
                >
                  {isFocused && <View style={styles.activePill} />}

                  <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
                    <Ionicons
                      // @ts-ignore
                      name={iconName}
                      size={ms(22)}
                      color={isFocused ? colors.red : colors.grey2}
                    />
                  </View>

                  <Text
                    style={[
                      styles.label,
                      { color: isFocused ? colors.red : colors.grey2 },
                      isFocused && styles.labelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </Animated.View>
              </TouchableWithoutFeedback>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Top separator
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glassBorder,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
  },
  tabsRow: {
    flexDirection: 'row',
    height: TAB_HEIGHT,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    width: ms(36),
    height: 2,
    backgroundColor: colors.red,
    borderBottomLeftRadius: radii.full,
    borderBottomRightRadius: radii.full,
  },
  iconWrapper: {
    width: ms(40),
    height: ms(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(10),
  },
  iconWrapperActive: {
    backgroundColor: colors.redDim,
  },
  label: {
    ...typography.caption2,
    marginTop: 2,
  },
  labelActive: {
    fontWeight: '600',
  },
});

export default AnimatedTabBar;
