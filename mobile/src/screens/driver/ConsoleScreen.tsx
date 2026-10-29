// src/screens/driver/ConsoleScreen.tsx
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../../components/GlassCard';
import { colors, typography, spacing, ms, radii } from '../../theme';

const STOPS = [
  { id: '1', name: 'Tumkur Bus Stand', passengers: 4, time: '06:30 AM', done: true },
  { id: '2', name: 'B.H. Road', passengers: 7, time: '06:45 AM', done: true },
  { id: '3', name: 'Sira Road Junction', passengers: 3, time: '07:00 AM', done: false, current: true },
  { id: '4', name: 'KIADB Zone Gate 1', passengers: 0, time: '07:20 AM', done: false },
  { id: '5', name: 'Factory Drop Point', passengers: 0, time: '07:30 AM', done: false },
];

const ConsoleScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [online, setOnline] = React.useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (online) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [online]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: ms(140) }}>
        {/* Header */}
        <LinearGradient colors={['#001a00', '#000000']} style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.title}>Driver Console</Text>
            <Text style={styles.subtitle}>Route R-07 · Van KA-09-AB-1234</Text>
          </View>
          {/* Online toggle */}
          <View style={styles.onlineToggle}>
            <Animated.View style={[styles.onlineDot, { transform: [{ scale: pulseAnim }], backgroundColor: online ? colors.success : colors.grey3 }]} />
            <Switch
              value={online}
              onValueChange={setOnline}
              trackColor={{ false: colors.grey4, true: `${colors.success}50` }}
              thumbColor={online ? colors.success : colors.grey2}
            />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Live stats bar */}
          <View style={styles.statsRow}>
            {[
              { icon: 'people', label: 'On Board', val: '14/18', color: colors.info },
              { icon: 'speedometer', label: 'Speed', val: '42 km/h', color: colors.warning },
              { icon: 'navigate', label: 'ETA', val: '28 min', color: colors.success },
            ].map(s => (
              <GlassCard key={s.label} style={styles.statCard} intensity={50} glowColor={`${s.color}30`}>
                <Ionicons name={s.icon as any} size={ms(18)} color={s.color} />
                <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </GlassCard>
            ))}
          </View>

          {/* SOS Button */}
          <TouchableOpacity style={styles.sosBtn} activeOpacity={0.7}>
            <Ionicons name="warning" size={ms(20)} color={colors.black} />
            <Text style={styles.sosBtnText}>SOS Emergency</Text>
          </TouchableOpacity>

          {/* Route timeline */}
          <Text style={styles.sectionTitle}>Today's Route</Text>
          {STOPS.map((stop, i) => (
            <View key={stop.id} style={styles.stopRow}>
              <View style={styles.timeline}>
                <View style={[
                  styles.dot,
                  stop.done && styles.dotDone,
                  stop.current && styles.dotCurrent,
                ]} />
                {i < STOPS.length - 1 && (
                  <View style={[styles.line, stop.done && styles.lineDone]} />
                )}
              </View>
              <GlassCard
                style={[styles.stopCard, stop.current && styles.stopCardCurrent]}
                intensity={stop.current ? 70 : 40}
                glowColor={stop.current ? colors.success : undefined}
              >
                <View style={styles.stopHeader}>
                  <View>
                    <Text style={[styles.stopName, stop.done && styles.stopNameDone]}>{stop.name}</Text>
                    <Text style={styles.stopTime}>{stop.time}</Text>
                  </View>
                  <View style={styles.stopRight}>
                    {stop.done ? (
                      <Ionicons name="checkmark-circle" size={ms(22)} color={colors.success} />
                    ) : stop.current ? (
                      <View style={styles.currentTag}>
                        <Text style={styles.currentTagText}>NOW</Text>
                      </View>
                    ) : (
                      <Text style={styles.passengerCount}>{stop.passengers} riders</Text>
                    )}
                  </View>
                </View>
                {stop.current && (
                  <TouchableOpacity style={styles.arrivedBtn} activeOpacity={0.8}>
                    <Ionicons name="checkmark" size={ms(16)} color={colors.black} />
                    <Text style={styles.arrivedBtnText}>Mark as Arrived</Text>
                  </TouchableOpacity>
                )}
              </GlassCard>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  greeting: { ...typography.footnote, color: colors.grey1 },
  title: { ...typography.title2, color: colors.white },
  subtitle: { ...typography.caption, color: colors.grey2, marginTop: 2 },
  onlineToggle: { alignItems: 'center', gap: 4 },
  onlineDot: { width: ms(10), height: ms(10), borderRadius: ms(5) },
  content: { paddingHorizontal: spacing.md, marginTop: -spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { flex: 1, alignItems: 'center', padding: spacing.sm, gap: 4 },
  statVal: { ...typography.subhead, fontWeight: '700' },
  statLabel: { ...typography.caption2, color: colors.grey1 },
  sosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.red,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  sosBtnText: { ...typography.headline, color: colors.black, fontWeight: '700' },
  sectionTitle: { ...typography.headline, color: colors.white, marginBottom: spacing.sm },
  stopRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  timeline: { width: ms(20), alignItems: 'center', paddingTop: spacing.md },
  dot: {
    width: ms(12),
    height: ms(12),
    borderRadius: ms(6),
    backgroundColor: colors.grey4,
    borderWidth: 2,
    borderColor: colors.grey3,
  },
  dotDone: { backgroundColor: colors.success, borderColor: colors.success },
  dotCurrent: { backgroundColor: colors.success, borderColor: `${colors.success}60`, borderWidth: 3 },
  line: { flex: 1, width: 2, backgroundColor: colors.grey4 },
  lineDone: { backgroundColor: colors.success },
  stopCard: { flex: 1 },
  stopCardCurrent: {},
  stopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stopName: { ...typography.subhead, color: colors.white, fontWeight: '600' },
  stopNameDone: { color: colors.grey2 },
  stopTime: { ...typography.caption, color: colors.grey1, marginTop: 2 },
  stopRight: { alignItems: 'flex-end' },
  currentTag: {
    backgroundColor: colors.success,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  currentTagText: { ...typography.caption2, color: colors.black, fontWeight: '700', letterSpacing: 0.5 },
  passengerCount: { ...typography.caption, color: colors.grey1 },
  arrivedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  arrivedBtnText: { ...typography.subhead, color: colors.black, fontWeight: '700' },
});

export default ConsoleScreen;
