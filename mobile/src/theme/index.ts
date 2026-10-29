// src/theme/index.ts
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Responsive scale helpers ─────────────────────────────────────────────────
// Base design size: 390 × 844 (iPhone 14)
const BASE_W = 390;
const BASE_H = 844;

export const rs = (size: number) => (SCREEN_WIDTH / BASE_W) * size;
export const vs = (size: number) => (SCREEN_HEIGHT / BASE_H) * size;
export const ms = (size: number, factor = 0.5) =>
  size + (rs(size) - size) * factor;

export const SCREEN = { WIDTH: SCREEN_WIDTH, HEIGHT: SCREEN_HEIGHT };
export const IS_SMALL = SCREEN_WIDTH < 360;
export const IS_TABLET = SCREEN_WIDTH >= 768;

// ─── Colour Palette ───────────────────────────────────────────────────────────
export const colors = {
  // Base
  black: '#000000',
  white: '#FFFFFF',

  // Brand
  red: '#FF3B30',
  redDim: 'rgba(255, 59, 48, 0.15)',
  redGlow: 'rgba(255, 59, 48, 0.35)',

  // Greys (iOS-style)
  grey1: '#8E8E93',
  grey2: '#636366',
  grey3: '#48484A',
  grey4: '#3A3A3C',
  grey5: '#2C2C2E',
  grey6: '#1C1C1E',

  // Glass layers
  glass1: 'rgba(255, 255, 255, 0.06)',
  glass2: 'rgba(255, 255, 255, 0.10)',
  glass3: 'rgba(255, 255, 255, 0.14)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',

  // Semantic
  success: '#32D74B',
  warning: '#FF9F0A',
  info: '#0A84FF',

  // Gradient stops
  gradBgTop: '#0D0D0D',
  gradBgBottom: '#000000',
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
  xs: ms(4),
  sm: ms(8),
  md: ms(16),
  lg: ms(24),
  xl: ms(32),
  xxl: ms(48),
};

// ─── Border Radii ─────────────────────────────────────────────────────────────
export const radii = {
  sm: ms(8),
  md: ms(12),
  lg: ms(20),
  xl: ms(28),
  full: 9999,
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  largeTitle: { fontSize: ms(34), fontWeight: '700' as const, letterSpacing: 0.4 },
  title1:     { fontSize: ms(28), fontWeight: '700' as const, letterSpacing: 0.3 },
  title2:     { fontSize: ms(22), fontWeight: '700' as const, letterSpacing: 0.3 },
  title3:     { fontSize: ms(20), fontWeight: '600' as const },
  headline:   { fontSize: ms(17), fontWeight: '600' as const },
  body:       { fontSize: ms(17), fontWeight: '400' as const },
  callout:    { fontSize: ms(16), fontWeight: '400' as const },
  subhead:    { fontSize: ms(15), fontWeight: '400' as const },
  footnote:   { fontSize: ms(13), fontWeight: '400' as const },
  caption:    { fontSize: ms(12), fontWeight: '400' as const },
  caption2:   { fontSize: ms(11), fontWeight: '400' as const },
};

// ─── Shadow presets (platform-aware) ──────────────────────────────────────────
export const shadows = {
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4 },
    android: { elevation: 4 },
    default: {},
  }),
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12 },
    android: { elevation: 8 },
    default: {},
  }),
  red: Platform.select({
    ios: { shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 12 },
    android: { elevation: 10 },
    default: {},
  }),
};

// ─── Navigation theme ─────────────────────────────────────────────────────────
export const navTheme = {
  dark: true,
  colors: {
    primary: colors.red,
    background: colors.black,
    card: colors.grey6,
    text: colors.white,
    border: colors.glassBorder,
    notification: colors.red,
  },
};
