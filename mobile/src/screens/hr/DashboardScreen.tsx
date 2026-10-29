// src/screens/hr/DashboardScreen.tsx
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../../components/GlassCard';
import { colors, typography, spacing, ms, radii } from '../../theme';

const KPI_DATA = [
  { label: 'Active Workers', value: '248', icon: 'people', color: colors.info, delta: '+12 today' },
  { label: 'Present Today', value: '221', icon: 'checkmark-circle', color: colors.success, delta: '89.1%' },
  { label: 'Open Positions', value: '14', icon: 'briefcase', color: colors.warning, delta: '3 urgent' },
  { label: 'Pending Approvals', value: '7', icon: 'time', color: colors.red, delta: 'Review now' },
];

const RECENT_APPS = [
  { name: 'Suresh Patil', role: 'CNC Operator', match: 94, time: '2h ago' },
  { name: 'Lakshmi Devi', role: 'Assembly Tech', match: 78, time: '4h ago' },
  { name: 'Mohammed Irfan', role: 'Welder Grade II', match: 67, time: '6h ago' },
];

const ATTENDANCE_BARS = [85, 90, 78, 95, 88, 92, 89];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const barAnims = useRef(ATTENDANCE_BARS.map(() => new Animated.Value(0))).current;

  React.useEffect(() => {
    const animations = barAnims.map((anim, i) =>
      Animated.spring(anim, {
        toValue: ATTENDANCE_BARS[i] / 100,
        delay: i * 60,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      })
    );
    Animated.stagger(50, animations).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: ms(140) }}
      >
        {/* Header */}
        <LinearGradient colors={['#180000', '#000000']} style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <View>
            <Text style={styles.greeting}>Thursday, 29 Oct</Text>
            <Text style={styles.title}>HR Dashboard</Text>
            <Text style={styles.subtitle}>KIADB Tumkur Zone · Factory ID: TZ-004</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={ms(22)} color={colors.white} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.content}>
          {/* KPI Grid */}
          <View style={styles.kpiGrid}>
            {KPI_DATA.map(kpi => (
              <GlassCard key={kpi.label} style={styles.kpiCard} intensity={55} glowColor={`${kpi.color}40`}>
                <View style={[styles.kpiIconBox, { backgroundColor: `${kpi.color}20` }]}>
                  <Ionicons name={kpi.icon as any} size={ms(20)} color={kpi.color} />
                </View>
                <Text style={styles.kpiValue}>{kpi.value}</Text>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
                <Text style={[styles.kpiDelta, { color: kpi.color }]}>{kpi.delta}</Text>
              </GlassCard>
            ))}
          </View>

          {/* Attendance chart */}
          <GlassCard style={styles.chartCard} intensity={55}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Weekly Attendance</Text>
              <Text style={styles.chartSubtitle}>This week avg: 88.1%</Text>
            </View>
            <View style={styles.barsContainer}>
              {ATTENDANCE_BARS.map((val, i) => {
                const isToday = i === 6;
                const barH = barAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
                return (
                  <View key={i} style={styles.barCol}>
                    <View style={styles.barBg}>
                      <Animated.View
                        style={[
                          styles.barFill,
                          {
                            height: barH,
                            backgroundColor: isToday ? colors.red : colors.info,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, isToday && { color: colors.red }]}>{DAYS[i]}</Text>
                    <Text style={styles.barPct}>{val}%</Text>
                  </View>
                );
              })}
            </View>
          </GlassCard>

          {/* Recent Applications */}
          <Text style={styles.sectionTitle}>Recent Applications</Text>
          {RECENT_APPS.map((app, i) => (
            <GlassCard key={i} style={styles.appCard} intensity={45}>
              <View style={styles.appRow}>
                <View style={styles.appAvatar}>
                  <Text style={styles.appInitials}>{app.name.split(' ').map(n => n[0]).join('')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appName}>{app.name}</Text>
                  <Text style={styles.appRole}>{app.role}</Text>
                </View>
                <View style={styles.appRight}>
                  <Text style={[styles.appMatch, { color: app.match >= 80 ? colors.success : colors.warning }]}>
                    {app.match}%
                  </Text>
                  <Text style={styles.appTime}>{app.time}</Text>
                </View>
              </View>
              <View style={styles.appActions}>
                <TouchableOpacity style={styles.rejectBtn}>
                  <Text style={styles.rejectBtnText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtn}>
                  <Text style={styles.acceptBtnText}>Shortlist</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}

          {/* Post Job Button */}
          <TouchableOpacity style={styles.postJobBtn} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={ms(20)} color={colors.black} />
            <Text style={styles.postJobText}>Post New Job Opening</Text>
          </TouchableOpacity>
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
  notifBtn: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: colors.glass2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  notifDot: {
    position: 'absolute',
    top: ms(8),
    right: ms(8),
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: colors.red,
    borderWidth: 1,
    borderColor: colors.black,
  },
  content: { paddingHorizontal: spacing.md, marginTop: -spacing.lg },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  kpiCard: { width: '47%', padding: spacing.sm },
  kpiIconBox: { width: ms(36), height: ms(36), borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  kpiValue: { ...typography.title2, color: colors.white },
  kpiLabel: { ...typography.caption, color: colors.grey1, marginTop: 2 },
  kpiDelta: { ...typography.caption2, fontWeight: '600', marginTop: 4 },
  chartCard: { marginBottom: spacing.md },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.md },
  sectionTitle: { ...typography.headline, color: colors.white, marginBottom: spacing.sm },
  chartSubtitle: { ...typography.caption, color: colors.grey1 },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs, height: ms(100) },
  barCol: { flex: 1, alignItems: 'center' },
  barBg: { flex: 1, width: ms(10), backgroundColor: colors.glass2, borderRadius: radii.sm, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: radii.sm },
  barLabel: { ...typography.caption2, color: colors.grey1, marginTop: 4 },
  barPct: { ...typography.caption2, color: colors.grey2, fontSize: ms(9) },
  appCard: { marginBottom: spacing.sm },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  appAvatar: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: colors.redDim,
    borderWidth: 1,
    borderColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInitials: { ...typography.subhead, color: colors.red, fontWeight: '700' },
  appName: { ...typography.subhead, color: colors.white, fontWeight: '600' },
  appRole: { ...typography.caption, color: colors.grey1, marginTop: 2 },
  appRight: { alignItems: 'flex-end' },
  appMatch: { ...typography.headline, fontWeight: '700' },
  appTime: { ...typography.caption2, color: colors.grey2, marginTop: 2 },
  appActions: { flexDirection: 'row', gap: spacing.sm },
  rejectBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.glass2,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
  },
  rejectBtnText: { ...typography.subhead, color: colors.grey1 },
  acceptBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.success,
    alignItems: 'center',
  },
  acceptBtnText: { ...typography.subhead, color: colors.black, fontWeight: '700' },
  postJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.red,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  postJobText: { ...typography.headline, color: colors.black, fontWeight: '700' },
});

export default DashboardScreen;
