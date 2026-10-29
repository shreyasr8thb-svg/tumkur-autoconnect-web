// src/screens/worker/ProfileScreen.tsx
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../../components/GlassCard';
import { colors, typography, spacing, ms, radii, SCREEN } from '../../theme';

const SKILLS = ['CNC Machining', 'G-Code', 'Quality Control', 'Blueprint Reading', 'CAD/CAM'];
const DOCS = [
  { icon: 'document-text', label: 'Aadhaar Card', status: 'Verified', ok: true },
  { icon: 'ribbon', label: 'Skill Certificate', status: 'Uploaded', ok: true },
  { icon: 'briefcase', label: 'Resume', status: 'Not Uploaded', ok: false },
];

const STATS = [
  { label: 'Days Worked', value: '142' },
  { label: 'Attendance %', value: '96%' },
  { label: 'Applications', value: '12' },
];

const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const avatarScale = scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.82], extrapolate: 'clamp' });
  const headerOpacity = scrollY.interpolate({ inputRange: [60, 120], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      {/* Sticky mini-header (appears on scroll) */}
      <Animated.View style={[styles.stickyHeader, { top: insets.top, opacity: headerOpacity }]}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <Text style={styles.stickyTitle}>Ravi Kumar</Text>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: ms(140) }}
      >
        {/* Hero section */}
        <LinearGradient
          colors={['#1a0505', '#000000']}
          style={styles.hero}
        >
          <View style={{ height: insets.top + spacing.md }} />
          <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: avatarScale }] }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>RK</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={ms(20)} color={colors.success} />
            </View>
          </Animated.View>
          <Text style={styles.name}>Ravi Kumar</Text>
          <Text style={styles.role}>CNC Machinist · 4.2 yrs exp</Text>
          <View style={styles.locationChip}>
            <Ionicons name="location-outline" size={ms(12)} color={colors.grey1} />
            <Text style={styles.locationText}>Tumkur, Karnataka</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsRow}>
            {STATS.map(s => (
              <GlassCard key={s.label} style={styles.statCard} intensity={50}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </GlassCard>
            ))}
          </View>

          {/* Skills */}
          <GlassCard style={styles.section} intensity={50}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsWrap}>
              {SKILLS.map(skill => (
                <View key={skill} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.addSkillChip}>
                <Ionicons name="add" size={ms(14)} color={colors.red} />
                <Text style={styles.addSkillText}>Add Skill</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Documents */}
          <GlassCard style={styles.section} intensity={50}>
            <Text style={styles.sectionTitle}>Documents</Text>
            {DOCS.map(doc => (
              <View key={doc.label} style={styles.docRow}>
                <View style={[styles.docIcon, { backgroundColor: doc.ok ? `${colors.success}18` : `${colors.red}18` }]}>
                  <Ionicons
                    name={doc.icon as any}
                    size={ms(18)}
                    color={doc.ok ? colors.success : colors.red}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docLabel}>{doc.label}</Text>
                  <Text style={[styles.docStatus, { color: doc.ok ? colors.success : colors.red }]}>
                    {doc.status}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Ionicons
                    name={doc.ok ? 'eye-outline' : 'cloud-upload-outline'}
                    size={ms(20)}
                    color={colors.grey1}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </GlassCard>

          {/* Actions */}
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={ms(18)} color={colors.white} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={ms(18)} color={colors.red} />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  stickyHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    height: ms(52),
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
  },
  stickyTitle: { ...typography.headline, color: colors.white },
  hero: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  avatarWrapper: { position: 'relative', marginBottom: spacing.md },
  avatar: {
    width: ms(88),
    height: ms(88),
    borderRadius: ms(44),
    backgroundColor: colors.redDim,
    borderWidth: 3,
    borderColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { ...typography.title1, color: colors.red },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.black,
    borderRadius: ms(12),
  },
  name: { ...typography.title2, color: colors.white },
  role: { ...typography.subhead, color: colors.grey1, marginTop: 4 },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    backgroundColor: colors.glass1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  locationText: { ...typography.caption, color: colors.grey1 },
  content: { paddingHorizontal: spacing.md },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: -spacing.lg,
  },
  statCard: { flex: 1, alignItems: 'center', padding: spacing.sm },
  statValue: { ...typography.title3, color: colors.red },
  statLabel: { ...typography.caption2, color: colors.grey1, textAlign: 'center', marginTop: 2 },
  section: { marginBottom: spacing.md },
  sectionTitle: { ...typography.headline, color: colors.white, marginBottom: spacing.sm },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  skillChip: {
    backgroundColor: colors.glass2,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  skillText: { ...typography.caption, color: colors.white },
  addSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.red,
    borderStyle: 'dashed',
  },
  addSkillText: { ...typography.caption, color: colors.red },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  docIcon: {
    width: ms(40),
    height: ms(40),
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docLabel: { ...typography.subhead, color: colors.white },
  docStatus: { ...typography.caption, marginTop: 2 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.glass2,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.sm,
  },
  editBtnText: { ...typography.headline, color: colors.white },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.redDim,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.red,
  },
  logoutBtnText: { ...typography.headline, color: colors.red },
});

export default ProfileScreen;
