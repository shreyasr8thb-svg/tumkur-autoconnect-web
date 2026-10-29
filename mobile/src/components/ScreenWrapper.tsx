// src/components/ScreenWrapper.tsx
/**
 * Universal screen wrapper:
 * - Gradient background
 * - Scrollable or static layout
 * - Adds bottom padding so content clears the tab bar + footer
 * - Exports a standardised AnimatedHeader
 */
import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, ms } from '../theme';

// Approx height of tab bar + footer (points)
export const BOTTOM_OFFSET = ms(120);

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** If true, content starts right under status bar (e.g. map screens) */
  fullBleed?: boolean;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  fullBleed = false,
}) => {
  const insets = useSafeAreaInsets();

  const topPad = fullBleed ? 0 : insets.top + (Platform.OS === 'android' ? spacing.sm : 0);

  return (
    <View style={StyleSheet.absoluteFill}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#0D0D0D', '#000000']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {scrollable ? (
        <ScrollView
          style={[styles.scroll, { paddingTop: topPad }, style]}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: BOTTOM_OFFSET },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          bounces
          overScrollMode="always"
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.static,
            { paddingTop: topPad, paddingBottom: BOTTOM_OFFSET },
            style,
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
  },
  static: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});

export default ScreenWrapper;
