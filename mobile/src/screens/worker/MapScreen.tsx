// src/screens/worker/MapScreen.tsx
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../../components/GlassCard';
import { colors, typography, spacing, ms, radii, SCREEN } from '../../theme';

const TRANSPORT_STOPS = [
  { id: '1', name: 'KIADB Main Gate', time: '07:30 AM', distance: '1.2 km', status: 'next' },
  { id: '2', name: 'B.H. Road Junction', time: '07:45 AM', distance: '3.5 km', status: 'upcoming' },
  { id: '3', name: 'Tumkur Bus Stand', time: '08:00 AM', distance: '6.0 km', status: 'upcoming' },
];

const MapScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const mapHeight = SCREEN.HEIGHT * 0.52;

  return (
    <View style={styles.container}>
      {/* ── Map placeholder (replace with react-native-maps in production) ── */}
      <View style={[styles.mapArea, { height: mapHeight }]}>
        {/* Grid overlay for visual */}
        <View style={styles.mapGrid} />

        {/* Gradient overlay at bottom of map */}
        <View style={styles.mapGradient} />

        {/* Map title */}
        <View style={[styles.mapHeader, { top: insets.top + spacing.sm }]}>
          <BlurView intensity={60} tint="dark" style={styles.mapHeaderBlur}>
            <View style={styles.mapHeaderInner}>
              <View style={styles.liveIndicator} />
              <Text style={styles.mapHeaderText}>Live Route Tracker</Text>
            </View>
          </BlurView>
        </View>

        {/* Fake map marker */}
        <View style={styles.markerContainer}>
          <View style={styles.markerPulse} />
          <View style={styles.marker}>
            <Ionicons name="bus" size={ms(18)} color={colors.white} />
          </View>
        </View>

        {/* Factory marker */}
        <View style={[styles.factoryMarker, { top: mapHeight * 0.3, left: SCREEN.WIDTH * 0.65 }]}>
          <Ionicons name="business" size={ms(16)} color={colors.red} />
          <View style={styles.factoryLabel}>
            <Text style={styles.factoryLabelText}>Your Factory</Text>
          </View>
        </View>
      </View>

      {/* ── Bottom sheet ────────────────────────────────────────────── */}
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Attendance check-in card */}
        <GlassCard style={styles.checkInCard} glowColor={colors.redGlow} intensity={70}>
          <View style={styles.checkInRow}>
            <View>
              <Text style={styles.checkInLabel}>ATTENDANCE STATUS</Text>
              <Text style={styles.checkInStatus}>Not checked in yet</Text>
            </View>
            <TouchableOpacity style={styles.checkInBtn} activeOpacity={0.85}>
              <Ionicons name="finger-print" size={ms(20)} color={colors.black} />
              <Text style={styles.checkInBtnText}>Check In</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.geoRow}>
            <Ionicons name="location" size={ms(13)} color={colors.success} />
            <Text style={styles.geoText}>Within 48m of KIADB Factory · Geo-fence valid ✓</Text>
          </View>
        </GlassCard>

        {/* Transport route */}
        <Text style={styles.sectionTitle}>Your Bus Route</Text>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: ms(130) }}>
          {TRANSPORT_STOPS.map((stop, i) => (
            <View key={stop.id} style={styles.stopRow}>
              {/* Timeline line */}
              <View style={styles.timeline}>
                <View style={[styles.dot, stop.status === 'next' && styles.dotActive]} />
                {i < TRANSPORT_STOPS.length - 1 && <View style={styles.line} />}
              </View>
              <GlassCard
                style={styles.stopCard}
                intensity={40}
                glowColor={stop.status === 'next' ? colors.red : undefined}
              >
                <View style={styles.stopHeader}>
                  <Text style={styles.stopName}>{stop.name}</Text>
                  {stop.status === 'next' && (
                    <View style={styles.nextTag}>
                      <Text style={styles.nextTagText}>NEXT STOP</Text>
                    </View>
                  )}
                </View>
                <View style={styles.stopMeta}>
                  <Ionicons name="time-outline" size={ms(12)} color={colors.grey1} />
                  <Text style={styles.stopTime}>{stop.time}</Text>
                  <Ionicons name="navigate-outline" size={ms(12)} color={colors.grey1} style={{ marginLeft: spacing.sm }} />
                  <Text style={styles.stopTime}>{stop.distance}</Text>
                </View>
              </GlassCard>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  mapArea: { width: '100%', backgroundColor: '#0a1628', overflow: 'hidden' },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0,
    // Simple grid lines as a visual stand-in
    backgroundColor: 'transparent',
  },
  mapGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
  },
  mapHeader: { position: 'absolute', left: spacing.md, right: spacing.md },
  mapHeaderBlur: { borderRadius: radii.full, overflow: 'hidden' },
  mapHeaderInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, paddingHorizontal: spacing.md },
  liveIndicator: { width: ms(8), height: ms(8), borderRadius: ms(4), backgroundColor: colors.success },
  mapHeaderText: { ...typography.callout, color: colors.white, fontWeight: '600' },
  markerContainer: { position: 'absolute', top: '45%', left: '40%', alignItems: 'center' },
  markerPulse: {
    position: 'absolute',
    width: ms(50),
    height: ms(50),
    borderRadius: ms(25),
    backgroundColor: colors.redGlow,
    top: -ms(10),
    left: -ms(10),
  },
  marker: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  factoryMarker: { position: 'absolute', alignItems: 'center' },
  factoryLabel: {
    backgroundColor: colors.glass2,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    marginTop: 2,
  },
  factoryLabelText: { ...typography.caption2, color: colors.white },
  sheet: {
    flex: 1,
    backgroundColor: colors.black,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    marginTop: -radii.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.glassBorder,
  },
  handle: {
    width: ms(36),
    height: ms(4),
    backgroundColor: colors.grey3,
    borderRadius: radii.full,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  checkInCard: { marginBottom: spacing.md },
  checkInRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  checkInLabel: { ...typography.caption2, color: colors.grey1, letterSpacing: 1 },
  checkInStatus: { ...typography.headline, color: colors.white, marginTop: 2 },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.red,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkInBtnText: { ...typography.subhead, color: colors.black, fontWeight: '700' },
  geoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  geoText: { ...typography.caption2, color: colors.success, flex: 1 },
  sectionTitle: { ...typography.headline, color: colors.white, marginBottom: spacing.sm },
  stopRow: { flexDirection: 'row', marginBottom: spacing.sm, gap: spacing.sm },
  timeline: { width: ms(20), alignItems: 'center' },
  dot: {
    width: ms(12),
    height: ms(12),
    borderRadius: ms(6),
    backgroundColor: colors.grey3,
    marginTop: spacing.md,
  },
  dotActive: { backgroundColor: colors.red },
  line: { flex: 1, width: 2, backgroundColor: colors.grey4, marginTop: 2 },
  stopCard: { flex: 1 },
  stopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  stopName: { ...typography.subhead, color: colors.white, fontWeight: '600', flex: 1 },
  nextTag: {
    backgroundColor: colors.redDim,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.red,
  },
  nextTagText: { ...typography.caption2, color: colors.red, fontWeight: '700' },
  stopMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stopTime: { ...typography.caption, color: colors.grey1 },
});

export default MapScreen;
