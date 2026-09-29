import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { Card } from '@/components/common/Card';
import { ParentHeader } from '@/components/common/ParentHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SelectableCard } from '@/components/common/SelectableCard';
import { AGE_GROUP_ORDER, AGE_GROUPS, getAgeGroupIdForAge } from '@/config/ageGroups';
import { useChild } from '@/context/ChildContext';
import { routes } from '@/navigation/routes';
import type { AgeGroupId } from '@/types/child';
import { spacing, typography } from '@/theme';
import { formatEmotionList } from '@/utils/emotionHelpers';

export default function AgeGroupScreen() {
  const { child, updateChild } = useChild();
  const recommended = child ? getAgeGroupIdForAge(child.age) : 'early';
  const [selected, setSelected] = useState<AgeGroupId>(child?.ageGroupId ?? recommended);
  const group = AGE_GROUPS[selected];

  const confirm = async () => {
    await updateChild({ ageGroupId: selected });
    router.push(routes.learningArea);
  };

  return (
    <ScreenContainer footer={<AppButton title="Confirm age group" icon="checkmark" onPress={confirm} />}>
      <ParentHeader
        title="Age group"
        subtitle={child ? `We suggest a group based on ${child.name}’s age (${child.age}). You can change it.` : undefined}
        onBack={router.canGoBack() ? router.back : undefined}
      />

      <View style={styles.list}>
        {AGE_GROUP_ORDER.map((id) => {
          const item = AGE_GROUPS[id];
          return (
            <SelectableCard
              key={id}
              title={item.rangeLabel}
              description={`${item.label} · ${item.description}`}
              emoji={item.emoji}
              selected={selected === id}
              badge={id === recommended ? 'Recommended' : undefined}
              onPress={() => setSelected(id)}
            />
          );
        })}
      </View>

      <Card tone="muted" style={styles.summary}>
        <Text style={typography.h3}>What this changes</Text>
        <Text style={typography.bodySecondary}>• {group.answerChoiceCount} answer choices per question</Text>
        <Text style={typography.bodySecondary}>
          • Stories: {group.storyComplexity === 'simple' ? '1–2 short sentences' : group.storyComplexity === 'medium' ? 'everyday scenarios' : 'realistic social situations'}
        </Text>
        <Text style={typography.bodySecondary}>• Starts with: {formatEmotionList(group.coreEmotions)}</Text>
        <Text style={typography.bodySecondary}>
          • {group.autoSpeak ? 'Numi reads messages aloud automatically' : 'Audio available on every screen'}
        </Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  summary: {
    gap: spacing.xxs,
  },
});
