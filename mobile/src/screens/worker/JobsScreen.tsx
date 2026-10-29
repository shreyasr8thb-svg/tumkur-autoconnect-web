// src/screens/worker/JobsScreen.tsx
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import GlassCard from '../../components/GlassCard';
import { colors, typography, spacing, ms, radii } from '../../theme';

const SAMPLE_JOBS = [
  { id: '1', title: 'CNC Machinist', company: 'Tumkur Precision Parts', location: 'Tumkur Industrial Zone', match: 92, skills: ['CNC', 'G-Code', 'Quality Control'], salary: '₹28,000/mo', urgent: true },
  { id: '2', title: 'Lathe Operator', company: 'Karnataka Auto Forge', location: 'KIADB Area, Tumkur', match: 78, skills: ['Lathe', 'Turning', 'Measurement'], salary: '₹22,000/mo', urgent: false },
  { id: '3', title: 'Welding Supervisor', company: 'AutoParts Hub Pvt Ltd', location: 'Sira Road, Tumkur', match: 65, skills: ['MIG Welding', 'TIG Welding', 'Safety'], salary: '₹35,000/mo', urgent: true },
  { id: '4', title: 'Assembly Technician', company: 'Shree Auto Components', location: 'Tumkur Phase II', match: 55, skills: ['Assembly', 'QC Inspection'], salary: '₹19,000/mo', urgent: false },
];

const MatchBadge: React.FC<{ score: number }> = ({ score }) => {
  const color =
    score >= 80 ? colors.success :
    score >= 60 ? colors.warning :
    colors.red;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: `${color}60` }]}>
      <Ionicons name="flash" size={ms(10)} color={color} />
      <Text style={[styles.badgeText, { color }]}>{score}% Match</Text>
    </View>
  );
};

const JobCard: React.FC<{ item: typeof SAMPLE_JOBS[0]; index: number }> = ({ item, index }) => {
  const animVal = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(animVal, {
      toValue: 1,
      delay: index * 80,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, []);

  const opacity = animVal;
  const translateY = animVal.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <GlassCard style={styles.card} glowColor={item.urgent ? colors.redGlow : undefined}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.company}>{item.company}</Text>
          </View>
          <MatchBadge score={item.match} />
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={ms(13)} color={colors.grey1} />
          <Text style={styles.locationText}>{item.location}</Text>
          {item.urgent && (
            <View style={styles.urgentTag}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
        </View>

        <View style={styles.skills}>
          {item.skills.map(s => (
            <View key={s} style={styles.skillChip}>
              <Text style={styles.skillText}>{s}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.salary}>{item.salary}</Text>
          <TouchableOpacity style={styles.applyBtn} activeOpacity={0.8}>
            <Text style={styles.applyBtnText}>Apply Now</Text>
            <Ionicons name="arrow-forward" size={ms(14)} color={colors.black} />
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const JobsScreen: React.FC = () => {
  return (
    <ScreenWrapper scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning 👋</Text>
          <Text style={styles.headerTitle}>Job Matches</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={ms(22)} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <GlassCard style={styles.searchCard} noPadding intensity={40}>
        <View style={styles.searchInner}>
          <Ionicons name="search-outline" size={ms(18)} color={colors.grey1} />
          <Text style={styles.searchPlaceholder}>Search jobs, skills, companies…</Text>
        </View>
      </GlassCard>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[['12', 'Applied'], ['4', 'Shortlisted'], ['92%', 'Top Match']].map(([val, label]) => (
          <GlassCard key={label} style={styles.statCard} intensity={40}>
            <Text style={styles.statVal}>{val}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </GlassCard>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recommended for You</Text>

      <FlatList
        data={SAMPLE_JOBS}
        keyExtractor={i => i.id}
        renderItem={({ item, index }) => <JobCard item={item} index={index} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: ms(120) }}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  greeting: { ...typography.footnote, color: colors.grey1 },
  headerTitle: { ...typography.title2, color: colors.white },
  filterBtn: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: colors.glass2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  searchCard: { marginBottom: spacing.md },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchPlaceholder: { ...typography.callout, color: colors.grey2 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { flex: 1, alignItems: 'center', padding: spacing.sm },
  statVal: { ...typography.title3, color: colors.red },
  statLabel: { ...typography.caption, color: colors.grey1, marginTop: 2 },
  sectionTitle: { ...typography.headline, color: colors.white, marginBottom: spacing.sm },
  card: { marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  cardHeaderLeft: { flex: 1, marginRight: spacing.sm },
  jobTitle: { ...typography.headline, color: colors.white },
  company: { ...typography.subhead, color: colors.grey1, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  badgeText: { ...typography.caption2, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  locationText: { ...typography.footnote, color: colors.grey1, flex: 1 },
  urgentTag: {
    backgroundColor: colors.redDim,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.red,
  },
  urgentText: { ...typography.caption2, color: colors.red, fontWeight: '700', letterSpacing: 0.5 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  skillChip: {
    backgroundColor: colors.glass2,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  skillText: { ...typography.caption2, color: colors.grey1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  salary: { ...typography.headline, color: colors.success, fontWeight: '700' },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.red,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  applyBtnText: { ...typography.subhead, color: colors.black, fontWeight: '700' },
});

export default JobsScreen;
