import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { LearningAvatar } from '@/components/avatar/LearningAvatar';
import { AppButton } from '@/components/common/AppButton';
import { ChildHeader } from '@/components/common/ChildHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { EmotionComparison } from '@/components/emotion/EmotionComparison';
import { pickAgeText } from '@/config/ageGroups';
import { useChild } from '@/context/ChildContext';
import { getPairTip } from '@/data/coaching';
import { backInChildMode } from '@/navigation/childMode';
import { routes } from '@/navigation/routes';
import { colors, typography } from '@/theme';
import { getEmotionLabel, isEmotion } from '@/utils/emotionHelpers';

/**
 * Avatar mistake coaching: explains the difference between the emotion the
 * child chose and the expected one, side by side.
 */
export default function CoachScreen() {
  const params = useLocalSearchParams<{ expected: string; selected: string }>();
  const { ageGroup } = useChild();
  const expected = isEmotion(params.expected) ? params.expected : 'fear';
  const selected = isEmotion(params.selected) && params.selected !== expected ? params.selected : 'surprise';
  const expectedLabel = getEmotionLabel(expected, ageGroup.id);
  const selectedLabel = getEmotionLabel(selected, ageGroup.id);

  const message = `You chose ${selectedLabel}. ${selectedLabel} and ${expectedLabel} can look similar. ${pickAgeText(
    getPairTip(expected, selected),
    ageGroup.id,
  )}`;

  return (
    <ScreenContainer
      background={colors[ageGroup.childBackground]}
      header={<ChildHeader onBack={backInChildMode} title="Let’s look closer" />}
      footer={
        <>
          <AppButton
            title="Practice These Two"
            emoji="🎯"
            size="child"
            onPress={() => router.replace(routes.practice([expected, selected], 'pair'))}
          />
          <AppButton title="Back to the game" variant="ghost" size="md" onPress={backInChildMode} />
        </>
      }
    >
      <LearningAvatar message={message} mood="thinking" layout="column" size={96} />
      <Text style={[typography.childBody, styles.center]}>
        {expectedLabel} vs {selectedLabel}
      </Text>
      <EmotionComparison left={expected} right={selected} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
});
