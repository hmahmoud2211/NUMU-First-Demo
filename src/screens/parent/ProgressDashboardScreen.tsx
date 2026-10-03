import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton, type IconName } from '@/components/common/AppButton';
import { Card } from '@/components/common/Card';
import { ParentHeader } from '@/components/common/ParentHeader';
import { ProgressBar } from '@/components/common/ProgressBar';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useChild } from '@/context/ChildContext';
import { useLearning } from '@/context/LearningContext';
import { getLearningArea } from '@/data/learningAreas';
import { routes } from '@/navigation/routes';
import { colors, emotionColors, radius, spacing, typography } from '@/theme';
import type { MasteryStatus, SessionSummary } from '@/types/learning';
import { formatEmotionList, getEmotionEmoji } from '@/utils/emotionHelpers';
import { toPercent } from '@/utils/scoring';
import { BAND_SETTINGS } from '@/data/reasoningCheck';
import { EMOTION_INFO } from '@/data/emotions';

const STATUS_STYLE: Record<MasteryStatus, { label: string; color: string; background: string }> = {
  strong: { label: 'Strong', color: colors.success, background: colors.successSoft },
  developing: { label: 'Developing', color: colors.warning, background: colors.warningSoft },
  'needs-practice': { label: 'Needs practice', color: colors.attention, background: colors.attentionSoft },
  'not-started': { label: 'Not started', color: colors.textMuted, background: colors.surfaceAlt },
};

function StatCard({ icon, label, value, detail }: { icon: IconName; label: string; value: string; detail?: string }) {
  return (
    <Card style={styles.stat}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={typography.caption}>{label}</Text>
      <Text style={typography.h2}>{value}</Text>
      {detail ? <Text style={typography.caption}>{detail}</Text> : null}
    </Card>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function sessionTitle(session: SessionSummary, index: number): string {
  return session.kind === 'practice' ? `Session ${index + 1} · Personalized practice` : `Session ${index + 1} · Emotion Recognition`;
}

export default function ProgressDashboardScreen() {
  const { child, ageGroup } = useChild();
  const { insights, progress } = useLearning();
  const history = progress.history;
  const goBack = () => (router.canGoBack() ? router.back() : router.replace(routes.parentHome));

  const header = <ParentHeader title="Progress" subtitle="Learning support overview" onBack={goBack} />;

  if (!child) {
    return <ScreenContainer>{header}</ScreenContainer>;
  }

  const area = getLearningArea(child.learningArea);
  const weakest = insights.emotions.find((e) => e.emotion === insights.weakEmotions[0]) ?? null;
  const topConfusion = insights.confusions[0];
  // Trend compares full game sessions only; focused practice is harder by design.
  const games = history.filter((session) => session.kind === 'game');
  const first = games[0];
  const last = games[games.length - 1];
  const change = first && last && games.length > 1 ? toPercent(last.accuracy) - toPercent(first.accuracy) : null;

  return (
    <ScreenContainer>
      {header}

      <Card style={styles.childRow}>
        <View style={styles.flex}>
          <Text style={typography.h2}>{child.name}</Text>
          <Text style={typography.bodySecondary}>
            Age {child.age} · Group {ageGroup.rangeLabel}
          </Text>
        </View>
        <View style={styles.areaChip}>
          <Text style={styles.areaText}>{area?.title ?? 'Emotion Recognition'}</Text>
        </View>
      </Card>

      {child.reasoningCheck ? (
        <Card style={[styles.reasoningCard, child.reasoningCheck.band === 'support' && styles.supportCard]}>
          <View style={styles.reasoningHeader}>
            <Text style={styles.reasoningEmoji}>🧩</Text>
            <View style={styles.flex}>
              <Text style={typography.h3}>Pre-World Reasoning Check</Text>
              <Text style={typography.bodySecondary}>
                Starting Pace: {BAND_SETTINGS[child.reasoningCheck.band]?.label ?? 'Standard'} ({child.reasoningCheck.correct}/{child.reasoningCheck.total} solved)
              </Text>
            </View>
          </View>
          {child.reasoningCheck.band === 'support' ? (
            <View style={styles.advisoryBox}>
              <Text style={[typography.label, styles.advisoryTitle]}>Parent Guidance Note</Text>
              <Text style={typography.bodySecondary}>
                {child.name}’s reasoning check suggests a gentle learning pace. NUMU has adapted the world’s activities to offer simpler choices. If you would like a comprehensive clinical evaluation, we recommend consulting a pediatrician or child development specialist.
              </Text>
            </View>
          ) : (
            <Text style={typography.caption}>
              NUMU tailored the activities in the town according to {child.name}’s check-in strengths.
            </Text>
          )}
        </Card>
      ) : null}

      {history.length === 0 ? (
        <Card tone="muted" style={styles.empty}>
          <Text style={typography.h3}>No learning yet</Text>
          <Text style={typography.bodySecondary}>
            Progress will appear here after {child.name} helps the friends in the House of Feelings in NUMU World.
          </Text>
          <AppButton title="Enter NUMU World" emoji="🌍" onPress={() => router.push(routes.world)} />
        </Card>
      ) : (
        <>
          <View style={styles.grid}>
            <StatCard icon="analytics" label="Overall Accuracy" value={`${toPercent(insights.overallAccuracy)}%`} />
            <StatCard icon="calendar" label="Sessions Completed" value={`${insights.sessionsCompleted}`} />
            <StatCard
              icon="trophy"
              label="Strongest Emotion"
              value={insights.strongest ? `${EMOTION_INFO[insights.strongest.emotion].label}` : '—'}
              detail={insights.strongest ? `${toPercent(insights.strongest.accuracy)}% correct` : undefined}
            />
            <StatCard
              icon="leaf"
              label="Needs Practice"
              value={weakest ? EMOTION_INFO[weakest.emotion].label : 'None yet'}
              detail={weakest ? `${toPercent(weakest.accuracy)}% correct` : 'Great consistency!'}
            />
          </View>

          <Card style={styles.section}>
            <Text style={typography.h3}>Emotion progress</Text>
            <Text style={typography.caption}>First-try accuracy across all sessions.</Text>
            {insights.emotions.map((item) => {
              const status = STATUS_STYLE[item.status];
              return (
                <View key={item.emotion} style={styles.emotionRow}>
                  <View style={styles.emotionHeader}>
                    <Text style={typography.body}>
                      {getEmotionEmoji(item.emotion)} {EMOTION_INFO[item.emotion].label}
                    </Text>
                    <View style={styles.emotionMeta}>
                      <View style={[styles.statusChip, { backgroundColor: status.background }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                      </View>
                      <Text style={[typography.h3, styles.percent]}>{toPercent(item.accuracy)}%</Text>
                    </View>
                  </View>
                  <ProgressBar
                    value={item.accuracy}
                    color={emotionColors[item.emotion].main}
                    accessibilityLabel={`${EMOTION_INFO[item.emotion].label} accuracy`}
                  />
                  <Text style={typography.caption}>
                    {item.correct} of {item.attempted} answered correctly on the first try
                  </Text>
                </View>
              );
            })}
          </Card>

          <Card style={styles.section}>
            <Text style={typography.h3}>Common confusions</Text>
            {insights.confusions.length === 0 ? (
              <Text style={typography.bodySecondary}>No repeated confusions so far.</Text>
            ) : (
              insights.confusions.slice(0, 3).map((confusion) => (
                <View key={`${confusion.expected}-${confusion.selected}`} style={styles.confusionRow}>
                  <Text style={[typography.body, styles.flex]}>
                    {EMOTION_INFO[confusion.expected].label} → {EMOTION_INFO[confusion.selected].label}
                  </Text>
                  <Text style={typography.label}>
                    {confusion.count} {confusion.count === 1 ? 'time' : 'times'}
                  </Text>
                </View>
              ))
            )}
            {topConfusion ? (
              <View style={styles.note}>
                <Ionicons name="bulb-outline" size={20} color={colors.primary} />
                <Text style={[typography.bodySecondary, styles.flex]}>
                  {child.name} currently finds {EMOTION_INFO[topConfusion.expected].label} and{' '}
                  {EMOTION_INFO[topConfusion.selected].label} harder to tell apart. NUMU will provide extra exercises and
                  side-by-side explanations for these emotions.
                </Text>
              </View>
            ) : null}
            {insights.weakEmotions.length > 0 ? (
              <Text style={typography.caption}>
                Areas that may need more practice: {formatEmotionList(insights.weakEmotions)}.
              </Text>
            ) : null}
          </Card>

          <Card style={styles.section}>
            <View style={styles.historyHeader}>
              <Text style={[typography.h3, styles.flex]}>Session history</Text>
              {change !== null && change > 0 ? (
                <Text style={[typography.label, { color: colors.success }]}>▲ +{change}% since first session</Text>
              ) : null}
            </View>
            {history.map((session, index) => (
              <View key={session.id} style={styles.historyRow}>
                <View style={styles.historyText}>
                  <Text style={typography.body}>{sessionTitle(session, index)}</Text>
                  <Text style={typography.caption}>
                    {formatDate(session.completedAt)} · {session.correctCount}/{session.questionCount} first-try correct
                  </Text>
                </View>
                <View style={styles.historyBar}>
                  <View style={styles.flex}>
                    <ProgressBar value={session.accuracy} color={colors.secondary} height={8} />
                  </View>
                  <Text style={[typography.h3, styles.percent]}>{toPercent(session.accuracy)}%</Text>
                </View>
              </View>
            ))}
          </Card>
        </>
      )}

      <Text style={[typography.caption, styles.center]}>
        These figures describe practice activity only. NUMU is a learning-support tool and does not provide diagnosis or
        clinical assessment.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  areaChip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  areaText: {
    ...typography.label,
    color: colors.primaryDark,
  },
  empty: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: 2,
  },
  section: {
    gap: spacing.sm,
  },
  emotionRow: {
    gap: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  emotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  emotionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusChip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  percent: {
    minWidth: 48,
    textAlign: 'right',
  },
  confusionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  note: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  historyRow: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyText: {
    gap: 2,
  },
  historyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reasoningCard: {
    gap: spacing.sm,
    borderColor: colors.border,
  },
  supportCard: {
    borderColor: colors.warning,
    borderWidth: 1.5,
    backgroundColor: colors.warningSoft,
  },
  reasoningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  reasoningEmoji: {
    fontSize: 32,
  },
  advisoryBox: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xxs,
  },
  advisoryTitle: {
    color: colors.warning,
    fontWeight: '700',
  },
});
